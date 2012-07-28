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

Kira.Range = function(left, right) {
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

Kira.Range.notdefined = new Kira.Range();

Kira.Range.index = new Kira.Range(0, 0x10000000);

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
        return injection;
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

Kira.Range.prototype.toGenerator = function() {
    var range = this;
    if (this._defined) {
        var result = new Kira.Generator();
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
        return Kira.Generator.empty;
    }
};

Kira.Range.prototype.toOption = function() {
    return this._defined ? [this] : [];
};

Kira.Range.prototype.toString = function() {
    return this._defined ? "Range(" + this._left + ", " + this._right + ")" : "Range()";
};