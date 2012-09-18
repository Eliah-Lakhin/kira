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
//         Functions        //
//////////////////////////////

    kira.functions = (function() {
        var nativeBind = Function.prototype.bind,
            arraySlice = Array.prototype.slice;

        return {
            bind: function(source, context) {
                if (source.bind === nativeBind && nativeBind) {
                    return nativeBind.apply(source, arraySlice.call(arguments, 1));
                }
                var constants = arraySlice.call(arguments, 2);
                var bound = function() {
                    var targetArguments = constants.concat(arraySlice.call(arguments));
                    if (!(this instanceof bound)) {
                        return source.apply(context, targetArguments);
                    }
                    var EmptyConstructor = function() {};
                    EmptyConstructor.prototype = source.prototype;

                    var self = new EmptyConstructor();
                    var result = source.apply(self, targetArguments);
                    if (Object(result) === result) {
                        return result;
                    }
                    return self;
                };
                return bound;
            },

            unbind: function(source) {
                return function() {
                    var targetArguments = arraySlice.call(arguments);
                    targetArguments.unshift(this);
                    return source.apply(source, targetArguments);
                };
            },

            asynchronous: function(source, timeout) {
                if (timeout === undefined) {
                    timeout = 0;
                }
                return function() {
                    setTimeout(source, timeout);
                };
            },

            limit: function(source, delay) {
                var lastCall = 0;
                return function() {
                    var newCall = new Date().getTime();
                    if (newCall - lastCall >= delay) {
                        lastCall = newCall;
                        source.apply(this, arguments);
                    }
                };
            },

            cache: function(source) {
                var cache;
                var executed = false;
                return function() {
                    if (!executed) {
                        cache = source.apply(this, arguments);
                        executed = true;
                    }
                    return cache;
                };
            }
        };
    })();