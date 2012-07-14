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
    var Kira = {};

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

    Kira.Generator.prototype.toString = function() {
        return "Generator(" + (this._source !== undefined ? this._source : "") + ")";
    };

    Kira.emptyGenerator = new Kira.Generator();

    context.Kira = Kira;
})();