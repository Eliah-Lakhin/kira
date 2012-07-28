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
            init = folder(element, init);
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