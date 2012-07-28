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

TestCase("Kira Typecheck module", {
    "testIsArray": function() {
        assertTrue(kira.typecheck.isArray([1, 2, 3]));
        assertFalse(kira.typecheck.isArray("String"));
    },

    "testIsObject": function() {
        assertTrue(kira.typecheck.isObject({hello: "world"}));
        assertFalse(kira.typecheck.isObject(123));
    },

    "testIsArguments": function() {
        (function() {
            assertTrue(kira.typecheck.isArguments(arguments));
        })(1, 2, 3);
        assertFalse(kira.typecheck.isArguments([1, 2, 3]));
    },

    "testIsString": function() {
        assertTrue(kira.typecheck.isString("hello world"));
        assertFalse(kira.typecheck.isString(100500));
    },

    "testIsNumber": function() {
        assertTrue(kira.typecheck.isNumber(100.5));
        assertFalse(kira.typecheck.isNumber("hello world"));
    },

    "testIsDate": function() {
        assertTrue(kira.typecheck.isDate(new Date()));
        assertFalse(kira.typecheck.isDate("hello world"));
    },

    "testIsRegExp": function() {
        assertTrue(kira.typecheck.isRegExp(/(.*)/img));
        assertFalse(kira.typecheck.isRegExp("(.*)"));
    }
});