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
                    return nativeForEach(array, step);
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