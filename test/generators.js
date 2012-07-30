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

TestCase("Kira Generators module", {
    "testConstructor": function() {
        assertEquals(new kira.Generator([0, 1, 3, 4]).toArray(), kira([0, 1, 3, 4]).toArray());
    },

    "testEmptyGenerator": function() {
        for (var iterator = kira.Generator.empty.iterator(), element = iterator.next();
             element !== undefined;
             element = iterator.next()) {
            assertUndefined(element);
        }
    },

    "testEntryGenerator": function() {
        assertEquals([
            ["a", 1],
            ["b", 2],
            ["c", 3]
        ], kira({a: 1, b: 2, c: 3}).toArray().sort());
    },

    "testArrayGenerator": function() {
        var array = [1, 2, 3];
        var generator = new kira.Generator(array);
        var index = 0;
        for (var iterator = generator.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            assertNotUndefined(array[index]);
            assertSame(array[index], element);
            index++;
        }
    },

    "testToArray": function() {
        assertArray(new kira.Generator([0, 1, 2, 3]).drop(1).toArray());
    },

    "testMap": function() {
        assertEquals([0, 2, 4], new kira.Generator([0, 1, 2]).map(function(value) {return value * 2;}).toArray());
    },

    "testFlat": function() {
        assertEquals([0, 0, 1, 1, 4, 6], new kira.Generator([0, 1, 2, 3]).flat(function(value) {
            return value < 2 ? new kira.Generator([value, value]) : new kira.Generator([value * 2]);
        }).toArray());

        assertEquals([1, 1, 3, 3], new kira.Generator([0, 1, 2, 3]).flat(function(value) {
            return value % 2 == 0 ? new kira.Generator([]) : new kira.Generator([value, value]);
        }).toArray());
    },

    "testFilter": function() {
        assertEquals([0, 2, 4], new kira.Generator([0, 1, 2, 3, 4]).filter(function(value) {return value % 2 == 0;}).toArray());
    },

    "testZip": function() {
        assertEquals(
            [
                [0, "zero"],
                [1, "one"],
                [2, "two"]
            ],
            new kira.Generator([0, 1, 2]).zip(new kira.Generator(["zero", "one", "two"])).toArray()
        );
    },

    "testDrop": function() {
        assertEquals([1, 2, 3, 4], new kira.Generator([0, 1, 2, 3, 4]).drop(1).toArray());
        assertEquals([2, 3, 4], new kira.Generator([0, 1, 2, 3, 4]).dropWhile(function(value) {return value < 2;}).toArray());
    },

    "testTake": function() {
        assertEquals([0, 1, 2], new kira.Generator([0, 1, 2, 3, 4]).take(3).toArray());
        assertEquals([0, 1], new kira.Generator([0, 1, 2, 3, 4]).takeWhile(function(value) {return value < 2;}).toArray());
    },

    "testConcatenate": function() {
        assertEquals([0, 1, 2, 3], new kira.Generator([0, 1]).concatenate(new kira.Generator([2, 3])).toArray());
    },

    "testForEach": function() {
        var result = [];
        new kira.Generator([0, 1, 3, 4, 5]).each(function(element) {
            result.push(element);
            if (element === 4) {
                return false;
            }
        });
        assertEquals([0, 1, 3, 4], result);
    },

    "testAll": function() {
        assertTrue(kira([0, 1, 3, 4]).all(function(value) {return value < 5;}));
        assertFalse(kira([0, 1, 3, 40]).all(function(value) {return value < 5;}));
    },

    "testAny": function() {
        assertTrue(kira([0, 1, 3, 4]).any(function(value) {return value > 2;}));
        assertFalse(kira([0, 1, 3, 4]).any(function(value) {return value < -10;}));
    },

    "testFold": function() {
        assertSame(18, kira([0, 1, 3, 4]).fold(10, function(result, value) {return value + result;}));
        assertSame("dcba", kira(["a", "b", "c", "d"]).fold("", function(result, value) {return value + result;}));
    },

    "testReduce": function() {
        assertEquals([8], kira([0, 1, 3, 4]).reduce(function(result, value) {return value + result;}));
        assertEquals([], kira.Generator.empty.reduce(function(result, value) {return value + result;}));
    },

    "testFind": function() {
        assertEquals([3], kira([0, 1, 3, 4]).find(function(value) {return value > 1;}));
        assertEquals([], kira([0, 1, 3, 4]).find(function(value) {return value > 10;}));
    },

    "testIndex": function() {
        assertEquals([2], kira([0, 1, 3, 4]).index(function(value) {return value > 1;}));
        assertEquals([], kira([0, 1, 3, 4]).index(function(value) {return value > 10;}));
    },

    "testGet": function() {
        assertEquals([4], kira([0, 1, 3, 4]).get(3));
        assertEquals([], kira([0, 1, 3, 4]).get(5));
    },

    "testCachedGenerator": function() {
        var source = [0, 1, 3, 4];
        var generator = kira(source);
        var cached = kira(source).cache();
        assertEquals([0, 1, 3, 4], cached.toArray());
        source.push(5);
        assertEquals([0, 1, 3, 4], cached.toArray());
        assertEquals([0, 1, 3, 4, 5], generator.toArray());
    }
});