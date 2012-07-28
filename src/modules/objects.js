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
//          Objects         //
//////////////////////////////

    var nativeGetOwnPropertyNames = Object.getOwnPropertyNames;

    Kira.objects = {
        extend: function() {
            var result = {};
            for (var argumentIndex = 0, argumentLength = arguments.length; argumentIndex < argumentLength; argumentIndex++) {
                var source = arguments[argumentIndex];
                for (var field in source) {
                    if (source.hasOwnProperty(field)) {
                        result[field] = source[field];
                    }
                }
            }
            return result;
        },

        append: function(target, key, value) {
            if (value === undefined) {
                target.push(key);
            } else {
                target[key] = value;
            }
            return target;
        },

        keys: function(object) {
            if (nativeGetOwnPropertyNames !== undefined) {
                return nativeGetOwnPropertyNames(object);
            } else {
                var result = [];
                for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                        result.push(property);
                    }
                }
                return result;
            }
        }
    };