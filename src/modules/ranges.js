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
            if (this._right <= injection._left) {
                return new kira.Range(this._left, injection._right);
            } else if (injection._right <= this._left) {
                return new kira.Range(injection._left, this._right);
            } else if (this._left <= injection._left) {
                return new kira.Range(this._left, this._right + injection._length);
            } else {
                return new kira.Range(injection._left, injection._right + this._length);
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