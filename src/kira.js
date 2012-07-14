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
            return Kira.arrayGenerator(source);
        } else if (Kira.isFunction(source)) {
            return new Kira.Generator(source);
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

    Kira.Generator.prototype.map = function(functor) {
        return Kira.mappedGenerator(this, functor);
    };

    Kira.Generator.prototype.flat = function(functor) {
        return Kira.flatMappedGenerator(this, functor);
    };

    Kira.Generator.prototype.filter = function(predicate) {
        return Kira.filteredGenerator(this, predicate);
    };

    Kira.Generator.prototype.zip = function(right) {
        return Kira.zippedGenerator(this, right);
    };

    Kira.Generator.prototype.drop = function(count) {
        return Kira.droppedGenerator(this, count);
    };

    Kira.Generator.prototype.dropWhile = function(predicate) {
        return Kira.conditionalDroppedGenerator(this, predicate);
    };

    Kira.Generator.prototype.take = function(count) {
        return Kira.tookGenerator(this, count);
    };

    Kira.Generator.prototype.takeWhile = function(predicate) {
        return Kira.conditionalTookGenerator(this, predicate);
    };

    Kira.Generator.prototype.concatenate = function(right) {
        return Kira.concatenatedGenerator(this, right);
    };

    Kira.Generator.prototype.toString = function() {
        return "Generator(" + (this.iterator !== undefined ? this.iterator : "") + ")";
    };

    Kira.empty = new Kira.Generator();

    Kira.arrayGenerator = function(array) {
        return new Kira.Generator(function() {
            var length = array.length;
            var index = 0;
            return {
                next: function() {
                    if (index < length) {
                        return array[index++];
                    }
                }
            }
        });
    };

    Kira.mappedGenerator = function(source, functor) {
        return new Kira.Generator(function() {
            var sourceIterator = source.iterator();
            return {
                next: function() {
                    var sourceElement = sourceIterator.next();
                    if (sourceElement !== undefined) {
                        return functor(sourceElement);
                    }
                }
            }
        });
    };

    Kira.flatMappedGenerator = function(source, functor) {
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
            }
        });
    };

    Kira.filteredGenerator = function(source, predicate) {
        return new Kira.Generator(function() {
            var sourceIterator = source.iterator();
            return {
                next: function() {
                    do {
                        var sourceElement = sourceIterator.next();
                    } while (sourceElement !== undefined && !predicate(sourceElement));
                    return sourceElement;
                }
            }
        });
    };

    Kira.zippedGenerator = function(left, right) {
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
            }
        });
    };

    Kira.droppedGenerator = function(source, count) {
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
            }
        });
    };

    Kira.conditionalDroppedGenerator = function(source, predicate) {
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
            }
        });
    };

    Kira.tookGenerator = function(source, count) {
        return new Kira.Generator(function() {
            var iterator = source.iterator();
            var index = 0;
            return {
                next: function() {
                    if (index++ < count) {
                        return iterator.next();
                    }
                }
            }
        });
    };

    Kira.conditionalTookGenerator = function(source, predicate) {
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
            }
        });
    };

    Kira.concatenatedGenerator = function(left, right) {
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
            }
        });
    };

    context.Kira = Kira;
})();