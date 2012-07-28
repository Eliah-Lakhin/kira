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
        assertSame([2], kira.options.getOption([1, 2, 3], 1));
        assertSame([], kira.options.getOption([1, 2, 3], 5));

        assertSame([2], kira.options.get([1, 2, 3], 1));
        assertSame([], kira.options.get([1, 2, 3], 5));
    },

    "testGetOrElse": function() {
        assertSame(2, kira.options.getOrElse([1, 2, 3], 1, 0));
        assertSame(0, kira.options.getOrElse([1, 2, 3], 5, 0));

        assertSame(2, kira.options.get([1, 2, 3], 1, 0));
        assertSame(0, kira.options.get([1, 2, 3], 5, 0));
    },

    "testGetOrElseLazy": function() {
        assertSame(2, kira.options.getOrElseLazy([1, 2, 3], 1, function() {return 0;}));
        assertSame(0, kira.options.getOrElseLazy([1, 2, 3], 5, function() {return 0;}));

        assertSame(2, kira.options.get([1, 2, 3], 1, function() {return 0;}));
        assertSame(0, kira.options.get([1, 2, 3], 5, function() {return 0;}));
    },

    "testOrElseOption": function() {
        assertSame([2], kira.options.orElseOption([1, 2, 3], 1, [0]));
        assertSame([0], kira.options.orElseOption([1, 2, 3], 5, [0]));

        assertSame([2], kira.options.orElse([1, 2, 3], 1, [0]));
        assertSame([0], kira.options.orElse([1, 2, 3], 5, [0]));
    },

    "testOrElseLazy": function() {
        assertSame([2], kira.options.orElseLazy([1, 2, 3], 1, function() {return [0];}));
        assertSame([0], kira.options.orElseLazy([1, 2, 3], 5, function() {return [0];}));

        assertSame([2], kira.options.orElse([1, 2, 3], 1, function() {return [0];}));
        assertSame([0], kira.options.orElse([1, 2, 3], 5, function() {return [0];}));
    },

    "testNullable": function() {
        assertSame([], Kira.nullable());
        assertSame([], Kira.nullable(null));
        assertSame([123], Kira.nullable(123));
    }
});