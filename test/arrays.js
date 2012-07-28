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

TestCase("Kira Arrays module", {
    "testMap": function() {
        assertEquals([2, 4, 6], kira.arrays.map([1, 2, 3], function(value) {return value * 2;}));
    },

    "testFlat": function() {
        assertEquals([1, 2, 10, 3, 6], kira.arrays.flat([1, 2, 3], function(value) {return value % 2 == 0 ? [10] : [value, value * 2];}));
    },

    "testFilter": function() {
        assertEquals([1, 3], kira.arrays.filter([1, 2, 3], function(value) {return value % 2 != 0;}));
    },

    "testZip": function() {
        assertEquals([
            [1, "a"],
            [2, "b"]
        ], kira.arrays.zip([1, 2, 3], ["a", "b"]));
    },

    "testGroup": function() {
        assertEquals({1: ["a", "d"], 2: "bc"}, kira.arrays.group(["a", "bc", "d"], function(value) {return value.length;}));
    },

    "testEach": function() {
        var mapped = [];
        kira.arrays.each([1, 2, 3], function(value) {
            mapped.push(value + 2);
        });
        assertEquals([3, 4, 5], mapped);
    },

    "testAll": function() {
        assertTrue(kira.arrays.all([1, 2, 3], function(value) {return value < 4;}));
        assertFalse(kira.arrays.all([1, 2, 3], function(value) {return value < 2;}));
    },

    "testAny": function() {
        assertTrue(kira.arrays.any([1, 2, 3], function(value) {return value === 2;}));
        assertFalse(kira.arrays.any([1, 2, 3], function(value) {return value === 4;}));
    },

    "testReduce": function() {
        assertEquals([6], kira.arrays.reduce([1, 2, 3], function(result, value) {return result + value}));
        assertEquals([], kira.arrays.reduce([], function(result, value) {return result + value}));
    },

    "testFold": function() {
        assertSame(10, kira.arrays.fold([1, 2, 3], 4, function(result, value) {return result + value}));
        assertSame(4, kira.arrays.fold([], 4, function(result, value) {return result + value}));
    },

    "testFind": function() {
        assertEquals([2], kira.arrays.find([1, 2, 3], function(value) {return value > 1;}));
        assertEquals([], kira.arrays.find([1, 2, 3], function(value) {return value > 10;}));
    },

    "testIndexOf": function() {
        assertEquals([0], kira.arrays.indexOf([1, 2, 3], 1));
        assertEquals([], kira.arrays.indexOf([1, 2, 3], 5));
    },

    "testToSet": function() {
        assertEquals({1: true, 2: true, 3: true, 4: true}, kira.arrays.toSet([1, 2, 3, 3, 4]));
        assertEquals({"h": true, "e": true, "l": true, "o": true}, kira.arrays.toSet("hello"));
    }
});