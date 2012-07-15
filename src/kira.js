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
    var conflicted = this.Kira;
    var Kira = function(source) {
        if (Kira.isArray(source)) {
            return Kira.createArrayGenerator(source);
        } else if (Kira.isFunction(source)) {
            return new Kira.Generator(source);
        } else if (Kira.isNumber(source)) {
            var left = Math.floor(source);
            var right = arguments[1] !== undefined && Kira.isNumber(arguments[1]) ? Math.ceil(arguments[1]) : left + 1;
            return new Kira.Range(left, right);
        } else if (Kira.isObject(source)) {
            return new Kira.createEntryGenerator(source);
        }
    };

    Kira.noConflict = function() {
        context.Kira = conflicted;
        return Kira;
    };

    Kira.isArray = Array.isArray || function(candidate) {
        return Object.prototype.toString.call(candidate) === "[object Array]";
    };

    Kira.isObject = Array.isObject || function(candidate) {return candidate === Object(candidate);};

    var baseTypes = ["Arguments", "Function", "String", "Number", "Date", "RegExp"];
    for (var index = 0, length = baseTypes.length; index < length; index++) {
        (function() {
            var baseType = baseTypes[index];
            var gauge = "[object " + baseType + "]";
            Kira["is" + baseType] = function(candidate) {
                return Object.prototype.toString.call(candidate) === gauge;
            };
        })();
    }

    var forEach = Array.prototype.forEach,
        filter = Array.prototype.filter,
        map = Array.prototype.map,
        every = Array.prototype.every,
        some = Array.prototype.some,
        reduce = Array.prototype.reduce,
        indexOf = Array.prototype.indexOf,
        getOwnPropertyNames = Object.getOwnPropertyNames;

    Kira.map = function(array, functor) {
        if (array.map === map && map !== undefined) {
            return array.map(functor);
        }
        var result = [];
        for (var index = 0, length = array.length; index < length; index++) {
            result.push(functor(array[index]));
        }
        return result;
    };

    Kira.flat = function(array, functor) {
        var result = [];
        for (var index = 0, length = array.length; index < length; index++) {
            var subResult = functor(array[index]);
            for (var subResultIndex = 0, subResultLength = subResult.length; subResultIndex < subResultLength; subResultIndex++) {
                result.push(subResult[subResultIndex]);
            }
        }
        return result;
    };

    Kira.filter = function(array, predicate) {
        if (array.filter === filter && filter !== undefined) {
            return array.filter(predicate);
        }
        var result = [];
        for (var index = 0, length = array.length; index < length; index++) {
            var element = array[index];
            if (predicate(element)) {
                result.push(element);
            }
        }
        return result;
    };

    Kira.zip = function(left, right) {
        var result = [];
        for (var index = 0, length = Math.min(left.length, right.length); index < length; index++) {
            result.push([left[index], right[index]]);
        }
        return result;
    };

    Kira.each = function(array, step) {
        if (array.forEach === forEach && forEach !== undefined) {
            return array.forEach(step);
        }
        for (var index = 0, length = array.length; index < length; index++) {
            step(array[index]);
        }
    };

    Kira.all = function(array, predicate) {
        if (array.every === every && every !== undefined) {
            return array.every(predicate);
        }
        for (var index = 0, length = array.length; index < length; index++) {
            if (!predicate(array[index])) {
                return false;
            }
        }
        return true;
    };

    Kira.any = function(array, predicate) {
        if (array.some === some && some !== undefined) {
            return array.some(predicate);
        }
        for (var index = 0, length = array.length; index < length; index++) {
            if (!predicate(array[index])) {
                return false;
            }
        }
        return true;
    };

    Kira.reduce = function(array, folder) {
        if (array.reduce === reduce && reduce !== undefined) {
            try {
                return [array.reduce(folder)];
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
    };

    Kira.fold = function(array, init, folder) {
        if (array.reduce === reduce && reduce !== undefined) {
            return array.reduce(folder, init);
        }
        for (var index = 0, length = array.length; index < length; index++) {
            init = folder(init, array[index]);
        }
        return init;
    };

    Kira.find = function(array, predicate) {
        var result;
        return Kira.any(array, function(value) {
            if (predicate(value)) {
                result = value;
                return true;
            } else {
                return false;
            }
        }) ? [result] : [];
    };

    Kira.indexOf = function(array, element) {
        if (array.indexOf === indexOf && indexOf !== undefined) {
            var result = array.indexOf(element);
            return result >= 0 ? [result] : [];
        } else {
            for (var index = 0, length = array.length; index < length; index++) {
                if (array[index] === element) {
                    return [index];
                }
            }
            return [];
        }
    };

    Kira.get = function(array, index) {
        return index < array.length && index >= 0 ? [array[index]] : [];
    };

    Kira.getOrElse = function(array, index, defaultValue) {
        return index < array.length && index >= 0 ? array[index] : defaultValue;
    };

    Kira.getOrElseLazy = function(array, index, defaultValue) {
        return index < array.length && index >= 0 ? array[index] : defaultValue();
    };

    Kira.keys = function(object) {
        if (getOwnPropertyNames !== undefined) {
            return getOwnPropertyNames(object);
        } else {
            var result = [];
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    result.push(property);
                }
            }
            return result;
        }
    };

    Kira.Generator = function(iterator) {
        if (iterator !== undefined) {
            this.iterator = iterator;
        }
    };

    Kira.Generator.prototype.iterator = function() {
        return {
            next: function() {}
        };
    };

    Kira.Generator.prototype.toArray = function() {
        var result = [];
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            result.push(element);
        }
        return result;
    };

    Kira.Generator.prototype.cache = function() {
        return Kira.createCachedGenerator(this);
    };

    Kira.Generator.prototype.map = function(functor) {
        return Kira.createMappedGenerator(this, functor);
    };

    Kira.Generator.prototype.flat = function(functor) {
        return Kira.createFlatMappedGenerator(this, functor);
    };

    Kira.Generator.prototype.filter = function(predicate) {
        return Kira.createFilteredGenerator(this, predicate);
    };

    Kira.Generator.prototype.zip = function(right) {
        return Kira.createZippedGenerator(this, right);
    };

    Kira.Generator.prototype.drop = function(count) {
        return Kira.createDroppedGenerator(this, count);
    };

    Kira.Generator.prototype.dropWhile = function(predicate) {
        return Kira.createConditionalDroppedGenerator(this, predicate);
    };

    Kira.Generator.prototype.limit = function(min, max) {
        return Kira.limitedGenerator(this, min, max);
    };

    Kira.Generator.prototype.take = function(count) {
        return Kira.createTookGenerator(this, count);
    };

    Kira.Generator.prototype.takeWhile = function(predicate) {
        return Kira.createConditionalTookGenerator(this, predicate);
    };

    Kira.Generator.prototype.concatenate = function(right) {
        return Kira.createConcatenatedGenerator(this, right);
    };

    Kira.Generator.prototype.each = function(step) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (step(element) === false) {
                break;
            }
        }
    };

    Kira.Generator.prototype.all = function(predicate) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (!predicate(element)) {
                return false;
            }
        }
        return true;
    };

    Kira.Generator.prototype.any = function(predicate) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (predicate(element)) {
                return true;
            }
        }
        return false;
    };

    Kira.Generator.prototype.fold = function(init, folder) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            init = folder(element, init);
        }
        return init;
    };

    Kira.Generator.prototype.reduce = function(folder) {
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

    Kira.Generator.prototype.find = function(predicate) {
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (predicate(element)) {
                return [element];
            }
        }
        return [];
    };

    Kira.Generator.prototype.index = function(predicate) {
        var index = 0;
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (predicate(element)) {
                return [index];
            }
            index++;
        }
        return [];
    };

    Kira.Generator.prototype.get = function(index) {
        var currentIndex = 0;
        for (var iterator = this.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            if (currentIndex === index) {
                return [element];
            }
            currentIndex++;
        }
        return [];
    };

    Kira.Generator.prototype.toString = function() {
        return "Generator(" + (this.iterator !== undefined ? this.iterator : "") + ")";
    };

    Kira.empty = new Kira.Generator();

    Kira.createArrayGenerator = function(array) {
        return new Kira.Generator(function() {
            var length = array.length;
            var index = 0;
            return {
                next: function() {
                    if (index < length) {
                        return array[index++];
                    }
                }
            };
        });
    };

    Kira.createEntryGenerator = function(object) {
        return new Kira.Generator(function() {
            var keys = Kira.keys(object);
            var length = keys.length;
            var index = 0;
            return {
                next: function() {
                    if (index < length) {
                        var key = keys[index++];
                        return [key, object[key]];
                    }
                }
            };
        });
    };

    Kira.createMappedGenerator = function(source, functor) {
        return new Kira.Generator(function() {
            var sourceIterator = source.iterator();
            return {
                next: function() {
                    var sourceElement = sourceIterator.next();
                    if (sourceElement !== undefined) {
                        return functor(sourceElement);
                    }
                }
            };
        });
    };

    Kira.createCachedGenerator = function(source) {
        var generator;
        return new Kira.Generator(function() {
            if (generator === undefined) {
                var cache = [];
                var sourceIterator = source.iterator();
                return {
                    next: function() {
                        var sourceElement = sourceIterator.next();
                        if (sourceElement !== undefined) {
                            cache.push(sourceElement);
                        } else {
                            generator = Kira.createArrayGenerator(cache);
                        }
                        return sourceElement;
                    }
                };
            } else {
                return generator.iterator();
            }
        });
    };

    Kira.createFlatMappedGenerator = function(source, functor) {
        return new Kira.Generator(function() {
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
        });
    };

    Kira.createFilteredGenerator = function(source, predicate) {
        return new Kira.Generator(function() {
            var sourceIterator = source.iterator();
            return {
                next: function() {
                    do {
                        var sourceElement = sourceIterator.next();
                    } while (sourceElement !== undefined && !predicate(sourceElement));
                    return sourceElement;
                }
            };
        });
    };

    Kira.createZippedGenerator = function(left, right) {
        return new Kira.Generator(function() {
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
        });
    };

    Kira.createDroppedGenerator = function(source, count) {
        return new Kira.Generator(function() {
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
        });
    };

    Kira.createConditionalDroppedGenerator = function(source, predicate) {
        return new Kira.Generator(function() {
            var iterator = source.iterator();
            var dropped = false;
            return {
                next: function() {
                    while (!dropped) {
                        var element = iterator.next();
                        if (element === undefined) {
                            return;
                        }
                        if (dropped = !predicate(element)) {
                            return element;
                        }
                    }
                    return iterator.next();
                }
            };
        });
    };

    Kira.createTookGenerator = function(source, count) {
        return new Kira.Generator(function() {
            var iterator = source.iterator();
            var index = 0;
            return {
                next: function() {
                    if (index++ < count) {
                        return iterator.next();
                    }
                }
            };
        });
    };

    Kira.createConditionalTookGenerator = function(source, predicate) {
        return new Kira.Generator(function() {
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
        });
    };

    Kira.createConcatenatedGenerator = function(left, right) {
        return new Kira.Generator(function() {
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
        });
    };

    Kira.limitedGenerator = function(source, min, max) {
        return new Kira.Generator(function() {
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
        });
    };

    Kira.Range = function(left, right) {
        this._defined = left !== undefined && right !== undefined && left < right;
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

    Kira.undefinedRange = new Kira.Range();

    Kira.indexRange = new Kira.Range(0, 0x10000000);

    Kira.Range.prototype.toGenerator = function() {
        var range = this;
        return this._defined ? new Kira.Generator(function() {
            var cursor = range._left - 1;
            return {
                next: function() {
                    cursor++;
                    if (cursor < range._right) {
                        return cursor;
                    }
                }
            };
        }) : Kira.empty;
    };

    Kira.Range.prototype.toOption = function() {
        return this._defined ? [this] : [];
    };

    Kira.Range.prototype.toString = function() {
        return this._defined ? "Range(" + this._left + ", " + this._right + ")" : "Range()";
    };

    Kira.Range.prototype.isDefined = function() {
        return this._defined;
    };

    Kira.Range.prototype.getLeft = function() {
        return this._left;
    };

    Kira.Range.prototype.getRight = function() {
        return this._right;
    };

    Kira.Range.prototype.getLength = function() {
        return this._length;
    };

    Kira.Range.prototype.map = function(leftMapper, rightMapper) {
        if (this._defined) {
            return new Kira.Range(leftMapper(this._left), rightMapper === undefined ? leftMapper(this._right) : rightMapper(this._right));
        } else {
            return this;
        }
    };

    Kira.Range.prototype.unionWithPoint = function(point) {
        point = Math.floor(point);
        if (this._defined) {
            return new Kira.Range(Math.min(point, this._left), Math.max(point + 1, this._right));
        } else {
            return new Kira.Range(point, point + 1);
        }
    };

    Kira.Range.prototype.unionWithRange = function(another) {
        if (this._defined && another._defined) {
            return new Kira.Range(Math.min(this._left, another._left), Math.max(this._right, another._right));
        } else if (this._defined) {
            return this;
        } else {
            return another;
        }
    };

    Kira.Range.prototype.inject = function(injection) {
        if (this._defined && injection._defined) {
            if (this._right <= injection._left) {
                return new Kira.Range(this._left, injection._right);
            } else if (injection._right <= this._left) {
                return new Kira.Range(injection._left, this._right);
            } else if (this._left <= injection._left) {
                return new Kira.Range(this._left, this._right + injection._length);
            } else {
                return new Kira.Range(injection._left, injection._right + this._length);
            }
        } else if (this._defined) {
            return this;
        } else {
            return _defined;
        }
    };

    Kira.Range.prototype.enlarge = function(pair) {
        if (this._defined) {
            return new Kira.Range(this._left - pair[0], this._right + pair[1]);
        } else {
            return this;
        }
    };

    Kira.Range.prototype.shift = function(offset) {
        if (this._defined) {
            return new Kira.Range(this._left + offset, this._right + offset);
        } else {
            return this;
        }
    };

    Kira.Range.prototype.substring = function(string) {
        return this._defined ? string.substring(this._left, this._right) : "";
    };

    Kira.Range.prototype.replaceString = function(source, replacement) {
        return this._defined ? source.substring(0, this._left) + replacement + source.substring(this._right) : source;
    };

    Kira.Range.prototype.subarray = function(array) {
        return this._defined ? array.slice(this._left, this._right) : [];
    };

    Kira.Range.prototype.replaceArray = function(source, replacement) {
        var result = source.slice(0);
        if (this._defined) {
            var spliceArguments = replacement.slice(0);
            spliceArguments.unshift(this._left, this._length);
            result.splice.apply(result, spliceArguments);
        }
        return result;
    };

    Kira.Range.prototype.limit = function(generator) {
        return this._defined ? Kira.limitedGenerator(generator, this._left, this._right) : Kira.empty;
    };

    context.Kira = Kira;
})();