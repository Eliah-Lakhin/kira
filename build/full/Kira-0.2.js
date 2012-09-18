/*
 Copyright 2012 Ilya Lakhin (Илья Александрович Лахин)

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */


(function() {
    var context = this;

//////////////////////////////
//       Definition         //
//////////////////////////////

    var kira = function(source) {
        if (kira.typecheck.isArray(source) || kira.typecheck.isObject(source)) {
            return new kira.Generator(source);
        } else if (kira.typecheck.isNumber(source)) {
            var left = Math.floor(source);
            var right = arguments[1] !== undefined && kira.typecheck.isNumber(arguments[1]) ? Math.ceil(arguments[1]) : left + 1;
            return new kira.Range(left, right);
        }
    };

//////////////////////////////
//        Installer         //
//////////////////////////////

    kira.installer = (function() {
        var installRegistry = {};

        var installer = {
            deploy: function(packageName, targets) {
                if (installer.install(packageName, arguments[1], arguments[2])) {
                    return installer.enable(packageName);
                } else {
                    return false;
                }
            },

            install: function(packageName, targets) {
                if (installer.isInstalled(packageName)) {
                    return false;
                }
                if (Object.prototype.toString.call(targets) !== "[object Array]") {
                    targets = [{
                        destination: arguments[1],
                        source: arguments[2],
                        safe: false
                    }];
                }
                installRegistry[packageName] = {
                    retainCount: 0,
                    targets: targets
                };
                return true;
            },

            uninstall: function(packageName) {
                if (!installer.isInstalled(packageName) || installer.isEnabled(packageName)) {
                    return false;
                }
                delete installRegistry[packageName];
                return true;
            },

            isInstalled: function(packageName) {
                return installRegistry[packageName] !== undefined;
            },

            isEnabled: function(packageName) {
                return installRegistry[packageName] !== undefined && installRegistry[packageName].retainCount > 0;
            },

            getAllPackages: function(pattern) {
                if (pattern.length > 1 && pattern.indexOf("*", pattern.length - 1) !== -1) {
                    pattern = pattern.substr(0, pattern.length - 1);
                    var result = [];
                    for (var key in installRegistry) {
                        if (installRegistry.hasOwnProperty(key) && key.indexOf(pattern, 0) === 0) {
                            result.push(key);
                        }
                    }
                    return result;
                } else {
                    return installRegistry[pattern] === undefined ? [] : [pattern];
                }
            },

            enable: function(packageName, callback) {
                if (!installer.isInstalled(packageName)) {
                    return false;
                }
                var installedPackage = installRegistry[packageName];
                if (callback !== undefined) {
                    if (installer.enable(packageName)) {
                        callback();
                        installer.disable(packageName);
                    } else {
                        installedPackage.retainCount++;
                        callback();
                        installedPackage.retainCount--;
                    }
                    return true;
                }
                if (installedPackage.retainCount > 0) {
                    return false;
                }
                installedPackage.retainCount = 1;
                for (var targetIndex = 0, targetLength = installedPackage.targets.length; targetIndex < targetLength; targetIndex++) {
                    var target = installedPackage.targets[targetIndex],
                        source = target.source,
                        destination = target.destination,
                        safe = target.safe,
                        obscuredFields = {};
                    for (var fieldKey in source) {
                        if (source.hasOwnProperty(fieldKey)) {
                            if (!safe || destination[fieldKey] === undefined) {
                                var newFieldValue = source[fieldKey];
                                obscuredFields[fieldKey] = destination[fieldKey];
                                destination[fieldKey] = newFieldValue;
                            }
                        }
                    }
                    target.obscuredFields = obscuredFields;
                }
                return true;
            },

            disable: function(packageName, callback) {
                if (!installer.isInstalled(packageName)) {
                    return false;
                }
                var installedPackage = installRegistry[packageName];
                if (callback !== undefined) {
                    if (installer.disable(packageName)) {
                        callback();
                        installer.enable(packageName);
                    } else {
                        var oldRetainCount = installedPackage.retainCount;
                        installedPackage.retainCount = 1;
                        installer.disable(packageName);
                        callback();
                        installer.enable(packageName);
                        installedPackage.retainCount = oldRetainCount;
                    }
                    return true;
                }
                if (installedPackage.retainCount !== 1) {
                    return false;
                }
                for (var targetIndex = installedPackage.targets.length - 1; targetIndex >= 0; targetIndex--) {
                    var target = installedPackage.targets[targetIndex],
                        source = target.source,
                        destination = target.destination,
                        obscuredFields = target.obscuredFields;
                    for (var fieldKey in source) {
                        if (source.hasOwnProperty(fieldKey)) {
                            destination[fieldKey] = obscuredFields[fieldKey];
                        }
                    }
                    delete target.obscuredFields;
                }
                installedPackage.retainCount = 0;
                return true;
            }
        };

        return installer;
    })();

//////////////////////////////
//         Functions        //
//////////////////////////////

    kira.functions = (function() {
        var nativeBind = Function.prototype.bind,
            arraySlice = Array.prototype.slice;

        var functions = {
            bind: function(source, context) {
                if (source.bind === nativeBind && nativeBind) {
                    return nativeBind.apply(source, arraySlice.call(arguments, 1));
                }
                var constants = arraySlice.call(arguments, 2);
                var bound = function() {
                    var targetArguments = constants.concat(arraySlice.call(arguments));
                    if (!(this instanceof bound)) {
                        return source.apply(context, targetArguments);
                    }
                    var EmptyConstructor = function() {};
                    EmptyConstructor.prototype = source.prototype;

                    var self = new EmptyConstructor();
                    var result = source.apply(self, targetArguments);
                    if (Object(result) === result) {
                        return result;
                    }
                    return self;
                };
                return bound;
            },

            unbind: function(source) {
                return function() {
                    var targetArguments = arraySlice.call(arguments);
                    targetArguments.unshift(this);
                    return source.apply(source, targetArguments);
                };
            },

            asynchronous: function(source, timeout) {
                if (timeout === undefined) {
                    timeout = 0;
                }
                return function() {
                    setTimeout(source, timeout);
                };
            },

            limit: function(source, delay) {
                var lastCall = 0;
                return function() {
                    var newCall = new Date().getTime();
                    if (newCall - lastCall >= delay) {
                        lastCall = newCall;
                        source.apply(this, arguments);
                    }
                };
            },

            cache: function(source) {
                var cache;
                var executed = false;
                return function() {
                    if (!executed) {
                        cache = source.apply(this, arguments);
                        executed = true;
                    }
                    return cache;
                };
            }
        };

        kira.installer.install("kira.functions", [
            {
                source: {
                    bind: functions.unbind(functions.bind),
                    unbind: functions.unbind(functions.unbind),
                    asynchronous: functions.unbind(functions.asynchronous),
                    limit: functions.unbind(functions.limit),
                    cache: functions.unbind(functions.cache)
                },
                destination: Function.prototype,
                safe: true
            }
        ]);

        return functions;
    })();

//////////////////////////////
//         Typecheck        //
//////////////////////////////

    kira.typecheck = {
        isArray: Array.isArray || function(candidate) {
            return Object.prototype.toString.call(candidate) === "[object Array]";
        },

        isObject: function(candidate) {
            return candidate === Object(candidate);
        },

        isArguments: function(candidate) {
            return Object.prototype.toString.call(candidate) === "[object Arguments]";
        },

        isFunction: function(candidate) {
            return Object.prototype.toString.call(candidate) === "[object Function]";
        },

        isString: function(candidate) {
            return Object.prototype.toString.call(candidate) === "[object String]";
        },

        isNumber: function(candidate) {
            return Object.prototype.toString.call(candidate) === "[object Number]";
        },

        isDate: function(candidate) {
            return Object.prototype.toString.call(candidate) === "[object Date]";
        },

        isRegExp: function(candidate) {
            return Object.prototype.toString.call(candidate) === "[object RegExp]";
        }
    };

    kira.installer.install("kira.typecheck", [
        {
            source: kira.typecheck,
            destination: context,
            safe: true
        }
    ]);

//////////////////////////////
//         Console          //
//////////////////////////////

    kira.console = (function() {
        var nativeLog = context.console.log;

        var console = {
            watch: function(message) {
                nativeLog(message);
                return message;
            },

            profile: function(block) {
                var start = new Date().getTime();
                block();
                return new Date().getTime() - start;
            }
        };

        kira.installer.install("kira.console", [
            {
                source: console,
                destination: context.console
            },
            {
                source: {
                    watch: console.watch,
                    profile: console.profile
                },
                destination: context,
                safe: true
            }
        ]);

        return console;
    })();

//////////////////////////////
//          Objects         //
//////////////////////////////

    kira.objects = (function() {
        var nativeGetOwnPropertyNames = Object.getOwnPropertyNames;

        var objects = {
            extend: function() {
                var result = {};
                for (var argumentIndex = 0, argumentLength = arguments.length; argumentIndex < argumentLength; argumentIndex++) {
                    var source = arguments[argumentIndex];
                    if (source !== undefined) {
                        for (var field in source) {
                            if (source.hasOwnProperty(field)) {
                                result[field] = source[field];
                            }
                        }
                    }
                }
                return result;
            },

            append: function(target, key, value) {
                if (value === undefined) {
                    target.push(key);
                } else {
                    target[key] = value;
                }
                return target;
            },

            keys: function(object) {
                if (nativeGetOwnPropertyNames !== undefined) {
                    return nativeGetOwnPropertyNames(object);
                } else {
                    var result = [];
                    for (var property in object) {
                        if (object.hasOwnProperty(property)) {
                            result.push(property);
                        }
                    }
                    return result;
                }
            }
        };

        kira.installer.install("kira.objects", [
            {
                source: {
                    extend: kira.functions.unbind(objects.extend),
                    keys: kira.functions.unbind(objects.keys)
                },
                destination: Object.prototype
            }
        ]);

        return objects;
    })();

//////////////////////////////
//          Arrays          //
//////////////////////////////

    kira.arrays = (function() {
        var nativeForEach = Array.prototype.forEach,
            nativeFilter = Array.prototype.filter,
            nativeMap = Array.prototype.map,
            nativeEvery = Array.prototype.every,
            nativeSome = Array.prototype.some,
            nativeReduce = Array.prototype.reduce,
            nativeIndexOf = Array.prototype.indexOf;

        var arrays = {
            map: function(array, functor) {
                if (array.map === nativeMap && nativeMap !== undefined) {
                    return nativeMap.call(array, functor);
                }
                var result = [];
                for (var index = 0, length = array.length; index < length; index++) {
                    result.push(functor(array[index]));
                }
                return result;
            },

            flat: function(array, functor) {
                var result = [];
                for (var index = 0, length = array.length; index < length; index++) {
                    var subResult = functor(array[index]);
                    for (var subResultIndex = 0, subResultLength = subResult.length; subResultIndex < subResultLength; subResultIndex++) {
                        result.push(subResult[subResultIndex]);
                    }
                }
                return result;
            },

            filter: function(array, predicate) {
                if (array.filter === nativeFilter && nativeFilter !== undefined) {
                    return nativeFilter.call(array, predicate);
                }
                var result = [];
                for (var index = 0, length = array.length; index < length; index++) {
                    var element = array[index];
                    if (predicate(element)) {
                        result.push(element);
                    }
                }
                return result;
            },

            zip: function(left, right) {
                var result = [];
                for (var index = 0, length = Math.min(left.length, right.length); index < length; index++) {
                    result.push([left[index], right[index]]);
                }
                return result;
            },

            each: function(array, step) {
                if (array.forEach === nativeForEach && nativeForEach !== undefined) {
                    return nativeForEach.call(array, step);
                }
                for (var index = 0, length = array.length; index < length; index++) {
                    step(array[index]);
                }
            },

            group: function(array, mapping) {
                var result = {};
                for (var index = 0, length = array.length; index < length; index++) {
                    var value = array[index];
                    var key = mapping(value);
                    if (result[key] === undefined) {
                        result[key] = [value];
                    } else {
                        result[key].push(value);
                    }
                }
                return result;
            },

            all: function(array, predicate) {
                if (array.every === nativeEvery && nativeEvery !== undefined) {
                    return nativeEvery.call(array, predicate);
                }
                for (var index = 0, length = array.length; index < length; index++) {
                    if (!predicate(array[index])) {
                        return false;
                    }
                }
                return true;
            },

            any: function(array, predicate) {
                if (array.some === nativeSome && nativeSome !== undefined) {
                    return nativeSome.call(array, predicate);
                }
                for (var index = 0, length = array.length; index < length; index++) {
                    if (!predicate(array[index])) {
                        return false;
                    }
                }
                return true;
            },

            reduce: function(array, folder) {
                if (array.reduce === nativeReduce && nativeReduce !== undefined) {
                    try {
                        return [nativeReduce.call(array, folder)];
                    } catch (error) {
                        if (error.type === "reduce_no_initial") {
                            return [];
                        } else {
                            throw error;
                        }
                    }
                }
                var length = array.length;
                if (length > 0) {
                    var result = array[0];
                    for (var index = 1; index < length; index++) {
                        result = folder(result, array[index]);
                    }
                    return [result];
                } else {
                    return [];
                }
            },

            fold: function(array, init, folder) {
                if (array.reduce === nativeReduce && nativeReduce !== undefined) {
                    return nativeReduce.call(array, folder, init);
                }
                for (var index = 0, length = array.length; index < length; index++) {
                    init = folder(init, array[index]);
                }
                return init;
            },

            find: function(array, predicate) {
                var result;
                return arrays.any(array, function(value) {
                    if (predicate(value)) {
                        result = value;
                        return true;
                    } else {
                        return false;
                    }
                }) ? [result] : [];
            },

            indexOf: function(array, element) {
                if (array.indexOf === nativeIndexOf && nativeIndexOf !== undefined) {
                    var result = nativeIndexOf.call(array, element);
                    return result >= 0 ? [result] : [];
                } else {
                    for (var index = 0, length = array.length; index < length; index++) {
                        if (array[index] === element) {
                            return [index];
                        }
                    }
                    return [];
                }
            },

            toSet: function(array) {
                var result = {};
                for (var index = 0, length = array.length; index < length; index++) {
                    result[array[index]] = true;
                }
                return result;
            },

            toGenerator: function(array) {
                return new kira.Generator(array);
            }
        };

        var deploymentSource = {
            flat: kira.functions.unbind(arrays.flat),
            zip: kira.functions.unbind(arrays.zip),
            each: nativeForEach,
            group: kira.functions.unbind(arrays.group),
            all: nativeEvery,
            any: nativeSome,
            reduce: kira.functions.unbind(arrays.reduce),
            fold: kira.functions.unbind(arrays.fold),
            find: kira.functions.unbind(arrays.find),
            indexOf: kira.functions.unbind(arrays.indexOf),
            toSet: kira.functions.unbind(arrays.toSet),
            toGenerator: kira.functions.unbind(arrays.toGenerator)

        };
        if (nativeMap === undefined) {
            deploymentSource.map = kira.functions.unbind(arrays.map);
        }
        if (nativeFilter === undefined) {
            deploymentSource.filter = kira.functions.unbind(arrays.filter);
        }
        if (nativeForEach === undefined) {
            deploymentSource.each = kira.functions.unbind(arrays.each);
        }
        if (nativeEvery === undefined) {
            deploymentSource.all = kira.functions.unbind(arrays.all);
        }
        if (nativeSome === undefined) {
            deploymentSource.any = kira.functions.unbind(arrays.any);
        }
        if (nativeSome === undefined) {
            deploymentSource.any = kira.functions.unbind(arrays.any);
        }

        kira.installer.install("kira.arrays", [
            {
                source: deploymentSource,
                destination: Array.prototype
            }
        ]);

        return arrays;
    })();

//////////////////////////////
//         Options          //
//////////////////////////////

    kira.options = (function() {
        var options = {
            get: function(object, key, defaultValue) {
                if (defaultValue === undefined) {
                    return kira.options.getOption(object, key);
                } else if (kira.typecheck.isFunction(defaultValue)) {
                    return kira.options.getOrElseLazy(object, key, defaultValue);
                } else {
                    return kira.options.getOrElse(object, key, defaultValue);
                }
            },

            getOption: function(object, key) {
                var result = object[key];
                return result === undefined ? [] : [result];
            },

            getOrElse: function(object, key, defaultValue) {
                var result = object[key];
                return result === undefined ? defaultValue : result;
            },

            getOrElseLazy: function(object, key, defaultValue) {
                var result = object[key];
                return result === undefined ? defaultValue() : result;
            },

            orElse: function(object, key, defaultValue) {
                if (kira.typecheck.isFunction(defaultValue)) {
                    return kira.options.orElseLazy(object, key, defaultValue);
                } else {
                    return kira.options.orElseOption(object, key, defaultValue);
                }
            },

            orElseOption: function(object, key, defaultValue) {
                var result = object[key];
                return result === undefined ? defaultValue : [result];
            },

            orElseLazy: function(object, key, defaultValue) {
                var result = object[key];
                return result === undefined ? defaultValue() : [result];
            },

            nullable: function(nullable) {
                return nullable === null || nullable === undefined ? [] : [nullable];
            }
        };

        kira.installer.install("kira.options", [
            {
                source: {
                    get: kira.functions.unbind(options.get),
                    orElse: kira.functions.unbind(options.orElse)
                },
                destination: Object.prototype
            },
            {
                source: {
                    nullable: options.nullable
                },
                destination: context,
                safe: true
            }
        ]);

        return options;
    })();

//////////////////////////////
//        Generators        //
//////////////////////////////

    kira.Generator = function(source) {
        if (source !== undefined) {
            if (kira.typecheck.isArray(source)) {
                this.iterator = function() {
                    var length = source.length;
                    var index = 0;
                    return {
                        next: function() {
                            if (index < length) {
                                return source[index++];
                            }
                        }
                    };
                };
            } else {
                this.iterator = function() {
                    var keys = kira.objects.keys(source);
                    var length = keys.length;
                    var index = 0;
                    return {
                        next: function() {
                            if (index < length) {
                                var key = keys[index++];
                                return [key, source[key]];
                            }
                        }
                    };
                };
            }
        }
    };

    kira.Generator.empty = new kira.Generator();

    kira.Generator.prototype.iterator = function() {
        return {
            next: function() {}
        };
    };

    kira.Generator.prototype.cache = function() {
        var source = this;
        var cacheGenerator;
        var result = new kira.Generator();
        result.iterator = function() {
            if (cacheGenerator === undefined) {
                var cache = [];
                var sourceIterator = source.iterator();
                return {
                    next: function() {
                        var sourceElement = sourceIterator.next();
                        if (sourceElement !== undefined) {
                            cache.push(sourceElement);
                        } else {
                            cacheGenerator = new kira.Generator(cache);
                        }
                        return sourceElement;
                    }
                };
            } else {
                return cacheGenerator.iterator();
            }
        };
        return result;
    };

    kira.Generator.prototype.map = function(functor) {
        var source = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var sourceIterator = source.iterator();
            return {
                next: function() {
                    var sourceElement = sourceIterator.next();
                    if (sourceElement !== undefined) {
                        return functor(sourceElement);
                    }
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.flat = function(functor) {
        var source = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var sourceIterator = source.iterator();
            var elementMapping;
            var subElement;
            return {
                next: function() {
                    if (subElement !== undefined) {
                        subElement = elementMapping.next();
                    }
                    if (subElement === undefined) {
                        do {
                            var sourceElement = sourceIterator.next();
                            if (sourceElement === undefined) {
                                return;
                            }
                            elementMapping = functor(sourceElement).iterator();
                            subElement = elementMapping.next();
                        } while (subElement === undefined);
                    }
                    return subElement;
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.filter = function(predicate) {
        var source = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var sourceIterator = source.iterator();
            return {
                next: function() {
                    var sourceElement;
                    do {
                        sourceElement = sourceIterator.next();
                    } while (sourceElement !== undefined && !predicate(sourceElement));
                    return sourceElement;
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.zip = function(right) {
        var left = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var leftIterator = left.iterator();
            var rightIterator = right.iterator();
            return {
                next: function() {
                    var leftElement = leftIterator.next();
                    var rightElement = rightIterator.next();
                    if (leftElement !== undefined && rightElement !== undefined) {
                        return [leftElement, rightElement];
                    }
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.drop = function(count) {
        var source = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var iterator = source.iterator();
            var dropped = false;
            return {
                next: function() {
                    if (!dropped) {
                        dropped = true;
                        for (var index = 0; index < count; index++) {
                            if (iterator.next() === undefined) {
                                return;
                            }
                        }
                    }
                    return iterator.next();
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.dropWhile = function(predicate) {
        var source = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var iterator = source.iterator();
            var dropped = false;
            return {
                next: function() {
                    while (!dropped) {
                        var element = iterator.next();
                        if (element === undefined) {
                            return;
                        }
                        dropped = !predicate(element);
                        if (dropped) {
                            return element;
                        }
                    }
                    return iterator.next();
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.limit = function(min, max) {
        var source = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var iterator = source.iterator();
            var dropped = false;
            var index;
            return {
                next: function() {
                    if (!dropped) {
                        dropped = true;
                        index = -1;
                        while (++index < min) {
                            if (iterator.next() === undefined) {
                                return;
                            }
                        }
                    }
                    if (index++ < max) {
                        return iterator.next();
                    }
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.take = function(count) {
        var source = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var iterator = source.iterator();
            var index = 0;
            return {
                next: function() {
                    if (index++ < count) {
                        return iterator.next();
                    }
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.takeWhile = function(predicate) {
        var source = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var iterator = source.iterator();
            var execution = true;
            return {
                next: function() {
                    if (execution) {
                        var element = iterator.next();
                        if (element !== undefined && (execution = predicate(element))) {
                            return element;
                        }
                    }
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.concatenate = function(right) {
        var left = this;
        var result = new kira.Generator();
        result.iterator = function() {
            var leftIterator = left.iterator();
            var rightIterator;
            return {
                next: function() {
                    if (rightIterator === undefined) {
                        var element = leftIterator.next();
                        if (element === undefined) {
                            rightIterator = right.iterator();
                            return rightIterator.next();
                        } else {
                            return element;
                        }
                    } else {
                        return rightIterator.next();
                    }
                }
            };
        };
        return result;
    };

    kira.Generator.prototype.each = function(step) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (step(element) === false) {
                break;
            }
        }
    };

    kira.Generator.prototype.all = function(predicate) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (!predicate(element)) {
                return false;
            }
        }
        return true;
    };

    kira.Generator.prototype.any = function(predicate) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (predicate(element)) {
                return true;
            }
        }
        return false;
    };

    kira.Generator.prototype.fold = function(init, folder) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            init = folder(init, element);
        }
        return init;
    };

    kira.Generator.prototype.reduce = function(folder) {
        var iterator = this.iterator();
        var result = iterator.next();
        if (result === undefined) {
            return [];
        }
        while (true) {
            var element = iterator.next();
            if (element === undefined) {
                break;
            } else {
                result = folder(result, element);
            }
        }
        return [result];
    };

    kira.Generator.prototype.find = function(predicate) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (predicate(element)) {
                return [element];
            }
        }
        return [];
    };

    kira.Generator.prototype.index = function(predicate) {
        var index = 0;
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (predicate(element)) {
                return [index];
            }
            index++;
        }
        return [];
    };

    kira.Generator.prototype.get = function(index) {
        var currentIndex = 0;
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (currentIndex === index) {
                return [element];
            }
            currentIndex++;
        }
        return [];
    };

    kira.Generator.prototype.toArray = function() {
        var result = [];
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            result.push(element);
        }
        return result;
    };

    kira.Generator.prototype.toSet = function() {
        var result = {};
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            result[element] = true;
        }
        return result;
    };

//////////////////////////////
//          Ranges          //
//////////////////////////////

    kira.Range = function(left, right) {
        this._defined = left !== undefined && right !== undefined && left <= right;
        if (this._defined) {
            this._left = left;
            this._right = right;
            this._length = right - left;
        } else {
            this._left = 0;
            this._right = 0;
            this._length = 0;
        }
    };

    kira.Range.notdefined = new kira.Range();

    kira.Range.index = new kira.Range(0, 0x10000000);

    kira.Range.prototype.isDefined = function() {
        return this._defined;
    };

    kira.Range.prototype.getLeft = function() {
        return this._left;
    };

    kira.Range.prototype.getRight = function() {
        return this._right;
    };

    kira.Range.prototype.getLength = function() {
        return this._length;
    };

    kira.Range.prototype.map = function(leftMapper, rightMapper) {
        if (this._defined) {
            return new kira.Range(leftMapper(this._left), rightMapper === undefined ? leftMapper(this._right) : rightMapper(this._right));
        } else {
            return this;
        }
    };

    kira.Range.prototype.union = function(another) {
        if (kira.typecheck.isNumber(another)) {
            return this.unionWithPoint(another);
        } else {
            return this.unionWithRange(another);
        }
    };

    kira.Range.prototype.unionWithPoint = function(point) {
        point = Math.floor(point);
        if (this._defined) {
            return new kira.Range(Math.min(point, this._left), Math.max(point + 1, this._right));
        } else {
            return new kira.Range(point, point + 1);
        }
    };

    kira.Range.prototype.unionWithRange = function(another) {
        if (this._defined && another._defined) {
            return new kira.Range(Math.min(this._left, another._left), Math.max(this._right, another._right));
        } else if (this._defined) {
            return this;
        } else {
            return another;
        }
    };

    kira.Range.prototype.inject = function(injection) {
        if (this._defined && injection._defined) {
            if (injection._right <= this._left) {
                return new kira.Range(injection._left, this._right + injection._length);
            } else if (injection._left <= this._left) {
                return new kira.Range(injection._left, injection._right + this._length);
            } else if (injection._right <= this._right) {
                return new kira.Range(injection._left, this._right + injection._length);
            } else if (injection._left <= this._right) {
                return new kira.Range(this._left, this._right + injection._length);
            } else {
                return new kira.Range(this._left, injection._right);
            }
        } else if (this._defined) {
            return this;
        } else {
            return injection;
        }
    };

    kira.Range.prototype.takeout = function(another) {
        if (this._defined && another._defined) {
            if (this._right <= another._left) {
                return this;
            } else if (another._right <= this._left) {
                return new kira.Range(this._left - another._length, this._right - another._length);
            } else if (this._left <= another._left) {
                return new kira.Range(this._left, Math.max(this._right - another._length, another._left));
            } else {
                return new kira.Range(another._right, this._right - another._left);
            }
        } else {
            return this;
        }
    };

    kira.Range.prototype.enlarge = function(pair) {
        if (this._defined) {
            return new kira.Range(this._left - pair[0], this._right + pair[1]);
        } else {
            return this;
        }
    };

    kira.Range.prototype.shift = function(offset) {
        if (this._defined) {
            return new kira.Range(this._left + offset, this._right + offset);
        } else {
            return this;
        }
    };

    kira.Range.prototype.sub = function(source) {
        if (kira.typecheck.isString(source)) {
            return this.substring(source);
        } else {
            return this.subarray(source);
        }
    };

    kira.Range.prototype.replace = function(source, replacement) {
        if (kira.typecheck.isString(source)) {
            return this.replaceString(source, replacement);
        } else {
            return this.replaceArray(source, replacement);
        }
    };

    kira.Range.prototype.substring = function(string) {
        return this._defined ? string.substring(this._left, this._right) : "";
    };

    kira.Range.prototype.replaceString = function(source, replacement) {
        return this._defined ? source.substring(0, this._left) + replacement + source.substring(this._right) : source;
    };

    kira.Range.prototype.subarray = function(array) {
        return this._defined ? array.slice(this._left, this._right) : [];
    };

    kira.Range.prototype.replaceArray = function(source, replacement) {
        var result = source.slice(0);
        if (this._defined) {
            var spliceArguments = replacement.slice(0);
            spliceArguments.unshift(this._left, this._length);
            result.splice.apply(result, spliceArguments);
        }
        return result;
    };

    kira.Range.prototype.limit = function(generator) {
        if (this._defined) {
            var min = this._left;
            var max = this._right;
            var result = new kira.Generator();
            result.iterator = function() {
                var iterator = generator.iterator();
                var dropped = false;
                var index;
                return {
                    next: function() {
                        if (!dropped) {
                            dropped = true;
                            index = -1;
                            while (++index < min) {
                                if (iterator.next() === undefined) {
                                    return;
                                }
                            }
                        }
                        if (index++ < max) {
                            return iterator.next();
                        }
                    }
                };
            };
            return result;
        } else {
            return this;
        }
    };

    kira.Range.prototype.toGenerator = function() {
        var range = this;
        if (this._defined) {
            var result = new kira.Generator();
            result.iterator = function() {
                var cursor = range._left - 1;
                return {
                    next: function() {
                        cursor++;
                        if (cursor < range._right) {
                            return cursor;
                        }
                    }
                };
            };
            return result;
        } else {
            return kira.Generator.empty;
        }
    };

    kira.Range.prototype.toReversedGenerator = function() {
        var range = this;
        if (this._defined) {
            var result = new kira.Generator();
            result.iterator = function() {
                var cursor = range._right;
                return {
                    next: function() {
                        cursor--;
                        if (cursor >= range._left) {
                            return cursor;
                        }
                    }
                };
            };
            return result;
        } else {
            return kira.Generator.empty;
        }
    };

    kira.Range.prototype.toOption = function() {
        return this._defined ? [this] : [];
    };

    kira.Range.prototype.toString = function() {
        return this._defined ? "Range(" + this._left + ", " + this._right + ")" : "Range()";
    };

//////////////////////////////
//       Deployment         //
//////////////////////////////

    (function() {
        var settings = kira.objects.extend({
            autoDeploy: false
        }, context.kira);

        kira.installer.deploy("kira", context, {kira: kira});

        kira.noConflict = function() {
            kira.installer.disable("kira");
            kira.installer.uninstall("kira");
            return kira;
        };

        var deployed = false,
            kiraModulePackages = kira.installer.getAllPackages("kira.*");

        kira.deploy = function() {
            if (!deployed) {
                deployed = true;
                kira.arrays.each(kiraModulePackages, function(packageName) {
                    kira.installer.enable(packageName);
                });
            }
        };

        kira.undeploy = function() {
            if (deployed) {
                kira.arrays.each(kiraModulePackages, function(packageName) {
                    kira.installer.disable(packageName);
                });
                deployed = false;
            }
        };

        if (settings.autoDeploy) {
            kira.deploy();
        }
    })();

})();