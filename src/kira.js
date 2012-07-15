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
        } else if (Kira.isNumber(source)) {
            var left = Math.floor(source);
            var right = arguments[1] !== undefined && Kira.isNumber(arguments[1]) ? Math.ceil(arguments[1]) : left + 1;
            return new Kira.Range(left, right);
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

    Kira.Generator.prototype.cache = function() {
        return Kira.cachedGenerator(this);
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
                result = folder(element, result);
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
            };
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
            };
        });
    };

    Kira.cachedGenerator = function(source) {
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
                            generator = Kira.arrayGenerator(cache);
                        }
                        return sourceElement;
                    }
                };
            } else {
                return generator.iterator();
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
            };
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
            };
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
            };
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
            };
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
            };
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
            };
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
            };
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

    context.Kira = Kira;
})();