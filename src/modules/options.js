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
//         Options          //
//////////////////////////////

    kira.options = (function() {
        var options = {
            get: function(object, key, defaultValue) {
                if (defaultValue === undefined) {
                    return kira.options.getOption(object, key);
                } else if (kira.typecheck.isFunction(defaultValue)) {
                    return kira.options.getOrElseLazy(object, key, defaultValue);
                } else {
                    return kira.options.getOrElse(object, key, defaultValue);
                }
            },

            getOption: function(object, key) {
                var result = object[key];
                return result === undefined ? [] : [result];
            },

            getOrElse: function(object, key, defaultValue) {
                var result = object[key];
                return result === undefined ? defaultValue : result;
            },

            getOrElseLazy: function(object, key, defaultValue) {
                var result = object[key];
                return result === undefined ? defaultValue() : result;
            },

            orElse: function(object, key, defaultValue) {
                if (kira.typecheck.isFunction(defaultValue)) {
                    return kira.options.orElseLazy(object, key, defaultValue);
                } else {
                    return kira.options.orElseOption(object, key, defaultValue);
                }
            },

            orElseOption: function(object, key, defaultValue) {
                var result = object[key];
                return result === undefined ? defaultValue : [result];
            },

            orElseLazy: function(object, key, defaultValue) {
                var result = object[key];
                return result === undefined ? defaultValue() : [result];
            },

            nullable: function(nullable) {
                return nullable === null || nullable === undefined ? [] : [nullable];
            }
        };

        kira.installer.install("kira.options", [
            {
                source: {
                    get: kira.functions.unbind(options.get),
                    orElse: kira.functions.unbind(options.orElse)
                },
                destination: Object.prototype
            },
            {
                source: {
                    nullable: options.nullable
                },
                destination: context,
                safe: true
            }
        ]);

        return options;
    })();