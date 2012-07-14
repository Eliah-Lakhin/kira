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

TestCase("Kira base features", {
    "testKiraObjectDefinition": function() {
        assertNotUndefined(Kira);
    },
    "testNoConflicts": function() {
        assertNotUndefined(Kira);
        var reference = Kira.noConflict();
        assertUndefined(Kira);
        assertNotUndefined(reference);
        Kira = reference;
    },
    "testTypeCheckers": function() {
        assertTrue(Kira.isArray([1, 2, 3]));
        assertFalse(Kira.isArray("String"));

        assertTrue(Kira.isObject({hello: "world"}));
        assertFalse(Kira.isObject(123));

        (function() {
            assertTrue(Kira.isArguments(arguments));
        })(1, 2, 3);
        assertFalse(Kira.isArguments([1, 2, 3]));

        assertTrue(Kira.isString("hello world"));
        assertFalse(Kira.isString(100500));

        assertTrue(Kira.isNumber(100.5));
        assertFalse(Kira.isNumber("hello world"));

        assertTrue(Kira.isDate(new Date()));
        assertFalse(Kira.isDate("hello world"));

        assertTrue(Kira.isRegExp(/(.*)/img));
        assertFalse(Kira.isRegExp("(.*)"));
    },
    "testEmptyGenerator": function() {
        for (var iterator = Kira.emptyGenerator.iterator(), element = iterator.next();
             element !== undefined;
             element = iterator.next()) {
            assertUndefined(element);
        }
    },
    "testArrayGenerator": function() {
        var array = [1, 2, 3];
        var generator = Kira.arrayGenerator(array);
        var index = 0;
        for (var iterator = generator.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            assertNotUndefined(array[index]);
            assertEquals(array[index], element);
            index++;
        }
    }
});