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
    var forEach = Array.prototype.forEach,
        filter = Array.prototype.filter,
        map = Array.prototype.map,
        every = Array.prototype.every,
        some = Array.prototype.some,
        reduce = Array.prototype.reduce,
        indexOf = Array.prototype.indexOf;

    Kira.arrays = {
        map: function(array, functor) {
            if (array.map === map && map !== undefined) {
                return array.map(functor);
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
        },

        zip: function(left, right) {
            var result = [];
            for (var index = 0, length = Math.min(left.length, right.length); index < length; index++) {
                result.push([left[index], right[index]]);
            }
            return result;
        },

        each: function(array, step) {
            if (array.forEach === forEach && forEach !== undefined) {
                return array.forEach(step);
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
            if (array.every === every && every !== undefined) {
                return array.every(predicate);
            }
            for (var index = 0, length = array.length; index < length; index++) {
                if (!predicate(array[index])) {
                    return false;
                }
            }
            return true;
        },

        any: function(array, predicate) {
            if (array.some === some && some !== undefined) {
                return array.some(predicate);
            }
            for (var index = 0, length = array.length; index < length; index++) {
                if (!predicate(array[index])) {
                    return false;
                }
            }
            return true;
        },

        reduce: function(array, folder) {
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
        },

        fold: function(array, init, folder) {
            if (array.reduce === reduce && reduce !== undefined) {
                return array.reduce(folder, init);
            }
            for (var index = 0, length = array.length; index < length; index++) {
                init = folder(init, array[index]);
            }
            return init;
        },

        find: function(array, predicate) {
            var result;
            return Kira.any(array, function(value) {
                if (predicate(value)) {
                    result = value;
                    return true;
                } else {
                    return false;
                }
            }) ? [result] : [];
        },

        indexOf: function(array, element) {
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
        },

        toSet: function(array) {
            var result = {};
            for (var index = 0, length = array.length; index < length; index++) {
                result[array[index]] = true;
            }
            return result;
        }
    };
})();