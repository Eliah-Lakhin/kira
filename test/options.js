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

TestCase("Kira Options module", {
    "testGetOption": function() {
        assertEquals([2], kira.options.getOption([1, 2, 3], 1));
        assertEquals([], kira.options.getOption([1, 2, 3], 5));

        assertEquals([2], kira.options.get([1, 2, 3], 1));
        assertEquals([], kira.options.get([1, 2, 3], 5));
    },

    "testGetOrElse": function() {
        assertEquals(2, kira.options.getOrElse([1, 2, 3], 1, 0));
        assertEquals(0, kira.options.getOrElse([1, 2, 3], 5, 0));

        assertEquals(2, kira.options.get([1, 2, 3], 1, 0));
        assertEquals(0, kira.options.get([1, 2, 3], 5, 0));
    },

    "testGetOrElseLazy": function() {
        assertEquals(2, kira.options.getOrElseLazy([1, 2, 3], 1, function() {return 0;}));
        assertEquals(0, kira.options.getOrElseLazy([1, 2, 3], 5, function() {return 0;}));

        assertEquals(2, kira.options.get([1, 2, 3], 1, function() {return 0;}));
        assertEquals(0, kira.options.get([1, 2, 3], 5, function() {return 0;}));
    },

    "testOrElseOption": function() {
        assertEquals([2], kira.options.orElseOption([1, 2, 3], 1, [0]));
        assertEquals([0], kira.options.orElseOption([1, 2, 3], 5, [0]));

        assertEquals([2], kira.options.orElse([1, 2, 3], 1, [0]));
        assertEquals([0], kira.options.orElse([1, 2, 3], 5, [0]));
    },

    "testOrElseLazy": function() {
        assertEquals([2], kira.options.orElseLazy([1, 2, 3], 1, function() {return [0];}));
        assertEquals([0], kira.options.orElseLazy([1, 2, 3], 5, function() {return [0];}));

        assertEquals([2], kira.options.orElse([1, 2, 3], 1, function() {return [0];}));
        assertEquals([0], kira.options.orElse([1, 2, 3], 5, function() {return [0];}));
    },

    "testNullable": function() {
        assertEquals([], kira.options.nullable());
        assertEquals([], kira.options.nullable(null));
        assertEquals([123], kira.options.nullable(123));
    },

    "testDeployment": function() {
        assertUndefined(window.nullable);
        assertTrue(kira.installer.enable("kira.options"));
        assertNotUndefined(window.nullable);

        assertEquals(0, [1, 2, 3].get(5, function() {return 0;}));
        assertEquals([3], [1, 2, 3].get(2));
        assertEquals([9], [1, 2, 3].get(5).orElse(0, 9));

        assertTrue(kira.installer.disable("kira.options"));
        assertUndefined(window.nullable);
        assertNotUndefined(kira.options.nullable);
    }
});