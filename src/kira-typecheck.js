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

(function(Kira) {
    Kira.typecheck = {
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
})(Kira);
