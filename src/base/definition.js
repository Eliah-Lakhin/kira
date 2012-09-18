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
//       Definition         //
//////////////////////////////

    var kira = function(source) {
        if (kira.typecheck.isArray(source) || kira.typecheck.isObject(source)) {
            return new kira.Generator(source);
        } else if (kira.typecheck.isNumber(source)) {
            var left = Math.floor(source);
            var right = arguments[1] !== undefined && kira.typecheck.isNumber(arguments[1]) ? Math.ceil(arguments[1]) : left + 1;
            return new kira.Range(left, right);
        }
    };