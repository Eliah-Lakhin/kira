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
        for (var iterator = Kira.empty.iterator(), element = iterator.next();
             element !== undefined;
             element = iterator.next()) {
            assertUndefined(element);
        }
    },
    "testArrayGenerator": function() {
        var array = [1, 2, 3];
        var generator = Kira.createArrayGenerator(array);
        var index = 0;
        for (var iterator = generator.iterator(), element = iterator.next(); element !== undefined; element = iterator.next()) {
            assertNotUndefined(array[index]);
            assertEquals(array[index], element);
            index++;
        }
    },
    "testGeneratorToArray": function() {
        assertArray(Kira.createArrayGenerator([0, 1, 2, 3]).drop(1).toArray());
    },
    "testGeneratorsLazyTransformations": function() {
        // map
        assertEquals(Kira.createArrayGenerator([0, 1, 2]).map(function(value) {return value * 2;}).toArray(), [0, 2, 4]);

        // flat
        assertEquals(Kira.createArrayGenerator([0, 1, 2, 3]).flat(function(value) {
            return value < 2 ? Kira.createArrayGenerator([value, value]) : Kira.createArrayGenerator([value * 2]);
        }).toArray(), [0, 0, 1, 1, 4, 6]);
        assertEquals(Kira.createArrayGenerator([0, 1, 2, 3]).flat(function(value) {
            return value % 2 == 0 ? Kira.createArrayGenerator([]) : Kira.createArrayGenerator([value, value]);
        }).toArray(), [1, 1, 3, 3]);

        // filter
        assertEquals(Kira.createArrayGenerator([0, 1, 2, 3, 4]).filter(function(value) {return value % 2 == 0;}).toArray(), [0, 2, 4]);

        // zip
        assertEquals(Kira.createArrayGenerator([0, 1, 2]).zip(Kira.createArrayGenerator(["zero", "one", "two"])).toArray(),
            [
                [0, "zero"],
                [1, "one"],
                [2, "two"]
            ]);

        // drop
        assertEquals(Kira.createArrayGenerator([0, 1, 2, 3, 4]).drop(1).toArray(), [1, 2, 3, 4]);
        assertEquals(Kira.createArrayGenerator([0, 1, 2, 3, 4]).dropWhile(function(value) {return value < 2;}).toArray(), [2, 3, 4]);

        // take
        assertEquals(Kira.createArrayGenerator([0, 1, 2, 3, 4]).take(3).toArray(), [0, 1, 2]);
        assertEquals(Kira.createArrayGenerator([0, 1, 2, 3, 4]).takeWhile(function(value) {return value < 2;}).toArray(), [0, 1]);

        // concatenate
        assertEquals(Kira.createArrayGenerator([0, 1]).concatenate(Kira.createArrayGenerator([2, 3])).toArray(), [0, 1, 2, 3]);
    },
    "testShortConstructor": function() {
        assertEquals(Kira.createArrayGenerator([0, 1, 3, 4]).toArray(), Kira([0, 1, 3, 4]).toArray());
    },
    "testGeneratorForEach": function() {
        var result = [];
        Kira.createArrayGenerator([0, 1, 3, 4, 5]).each(function(element) {
            result.push(element);
            if (element === 4) {
                return false;
            }
        });
        assertEquals(result, [0, 1, 3, 4]);
    },
    "testGeneratorsEagerTransformations": function() {
        // all
        assertTrue(Kira([0, 1, 3, 4]).all(function(value) {return value < 5;}));
        assertFalse(Kira([0, 1, 3, 40]).all(function(value) {return value < 5;}));

        // any
        assertTrue(Kira([0, 1, 3, 4]).any(function(value) {return value > 2;}));
        assertFalse(Kira([0, 1, 3, 4]).any(function(value) {return value < -10;}));

        // fold
        assertEquals(Kira([0, 1, 3, 4]).fold(10, function(value, result) {return value + result;}), 18);

        // reduce
        assertEquals(Kira([0, 1, 3, 4]).reduce(function(result, value) {return value + result;}), [8]);
        assertEquals(Kira.empty.reduce(function(result, value) {return value + result;}), []);

        // find
        assertEquals(Kira([0, 1, 3, 4]).find(function(value) {return value > 1;}), [3]);
        assertEquals(Kira([0, 1, 3, 4]).find(function(value) {return value > 10;}), []);

        // index
        assertEquals(Kira([0, 1, 3, 4]).index(function(value) {return value > 1;}), [2]);
        assertEquals(Kira([0, 1, 3, 4]).index(function(value) {return value > 10;}), []);

        // get
        assertEquals(Kira([0, 1, 3, 4]).get(3), [4]);
        assertEquals(Kira([0, 1, 3, 4]).get(5), []);
    },
    "testCachedGenerator": function() {
        var source = [0, 1, 3, 4];
        var generator = Kira(source);
        var cached = Kira(source).cache();
        assertEquals(cached.toArray(), [0, 1, 3, 4]);
        source.push(5);
        assertEquals(cached.toArray(), [0, 1, 3, 4]);
        assertEquals(generator.toArray(), [0, 1, 3, 4, 5]);
    },
    "testRangeConstructor": function() {
        assertEquals(Kira(10).toGenerator().toArray(), [10]);
        assertEquals(Kira(0, 5).toGenerator().toArray(), [0, 1, 2, 3, 4]);
        assertEquals(Kira(10, 0).toGenerator().toArray(), []);
    },
    "testRangeProperties": function() {
        assertTrue(Kira(10).isDefined());
        assertEquals(Kira(10).getLeft(), 10);
        assertEquals(Kira(10).getRight(), 11);
        assertEquals(Kira(10).getLength(), 1);

        assertTrue(Kira(5, 10).isDefined());
        assertEquals(Kira(5, 10).getLeft(), 5);
        assertEquals(Kira(5, 10).getRight(), 10);
        assertEquals(Kira(5, 10).getLength(), 5);

        assertTrue(Kira(0, 5).isDefined());
        assertEquals(Kira(0, 5).getLeft(), 0);
        assertEquals(Kira(0, 5).getRight(), 5);
        assertEquals(Kira(0, 5).getLength(), 5);

        assertFalse(Kira(5, 0).isDefined());
        assertEquals(Kira(5, 0).getLeft(), 0);
        assertEquals(Kira(5, 0).getRight(), 0);
        assertEquals(Kira(5, 0).getLength(), 0);

        assertFalse(Kira.undefinedRange.isDefined());
        assertEquals(Kira.undefinedRange.getLeft(), 0);
        assertEquals(Kira.undefinedRange.getRight(), 0);
        assertEquals(Kira.undefinedRange.getLength(), 0);
    },
    "testRangeTransformers": function() {
        assertEquals(Kira(1, 3).map(function(bound) {return bound * 2;}).toGenerator().toArray(), [2, 3, 4, 5]);
        assertEquals(Kira(1, 3).map(
            function(left) {return left + 3;},
            function(right) {return right * 2;}
        ).toGenerator().toArray(), [4, 5]);

        assertEquals(Kira(1, 3).unionWithPoint(0).toGenerator().toArray(), [0, 1, 2]);
        assertEquals(Kira(1, 3).unionWithPoint(1).toGenerator().toArray(), [1, 2]);
        assertEquals(Kira(1, 3).unionWithPoint(3).toGenerator().toArray(), [1, 2, 3]);

        assertEquals(Kira(1, 3).unionWithRange(Kira(2, 5)).toGenerator().toArray(), [1, 2, 3, 4]);
        assertEquals(Kira(1, 3).unionWithRange(Kira(3, 5)).toGenerator().toArray(), [1, 2, 3, 4]);
        assertEquals(Kira(1, 3).unionWithRange(Kira(4, 5)).toGenerator().toArray(), [1, 2, 3, 4]);
        assertEquals(Kira(1, 3).unionWithRange(Kira(1, 2)).toGenerator().toArray(), [1, 2]);

        assertEquals(Kira(1, 3).inject(Kira(1, 3)).getLength(), 4);
        assertEquals(Kira(1, 3).inject(Kira(2, 4)).getLength(), 4);
        assertEquals(Kira(1, 3).inject(Kira(0, 2)).getLength(), 4);
        assertEquals(Kira(1, 3).inject(Kira(10, 20)).getLength(), 19);

        assertEquals(Kira(1, 3).enlarge([1, 1]).toGenerator().toArray(), [0, 1, 2, 3]);
        assertEquals(Kira(1, 3).enlarge([1, 2]).toGenerator().toArray(), [0, 1, 2, 3, 4]);
        assertEquals(Kira(1, 3).enlarge([-1, -1]).toGenerator().toArray(), []);

        assertEquals(Kira(1, 3).shift(2).toGenerator().toArray(), [3, 4]);
        assertEquals(Kira(1, 3).shift(-2).toGenerator().toArray(), [-1, 0]);
    },
    "testRangeOption": function() {
        assertEquals(Kira(1, 3).toOption().length, 1);
        assertEquals(Kira(1, -3).toOption().length, 0);
    },
    "testByRangeTransformations": function() {
        assertEquals(Kira(1, 5).substring("hello world"), "ello");
        assertEquals(Kira(1, 100).substring("hello world"), "ello world");
        assertEquals(Kira(-100, 100).substring("hello world"), "hello world");
        assertEquals(Kira(50, 100).substring("hello world"), "");

        assertEquals(Kira(1, 5).replaceString("hello world", "123"), "h123 world");
        assertEquals(Kira(1, 100).replaceString("hello world", "123"), "h123");
        assertEquals(Kira(-100, 100).replaceString("hello world", "123"), "123");
        assertEquals(Kira(50, 100).replaceString("hello world", "123"), "hello world123");

        assertEquals(Kira(2, 4).subarray([0, 1, 2, 3, 4, 5]), [2, 3]);
        assertEquals(Kira(2, 100).subarray([0, 1, 2, 3, 4, 5]), [2, 3, 4, 5]);
        assertEquals(Kira(-100, 100).subarray([0, 1, 2, 3, 4, 5]), [0, 1, 2, 3, 4, 5]);
        assertEquals(Kira(50, 100).subarray([0, 1, 2, 3, 4, 5]), []);

        assertEquals(Kira(2, 4).replaceArray([0, 1, 2, 3, 4, 5], ["a", "b"]), [0, 1, "a", "b", 4, 5]);
        assertEquals(Kira(2, 100).replaceArray([0, 1, 2, 3, 4, 5], ["a", "b"]), [0, 1, "a", "b"]);
        assertEquals(Kira(-100, 100).replaceArray([0, 1, 2, 3, 4, 5], ["a", "b"]), ["a", "b"]);
        assertEquals(Kira(50, 100).replaceArray([0, 1, 2, 3, 4, 5], ["a", "b"]), [0, 1, 2, 3, 4, 5, "a", "b"]);

        assertEquals(Kira(2, 4).limit(Kira([0, 1, 2, 3, 4, 5])).toArray(), [2, 3]);
        assertEquals(Kira(2, 100).limit(Kira([0, 1, 2, 3, 4, 5])).toArray(), [2, 3, 4, 5]);
        assertEquals(Kira(-100, 100).limit(Kira([0, 1, 2, 3, 4, 5])).toArray(), [0, 1, 2, 3, 4, 5]);
        assertEquals(Kira(50, 100).limit(Kira([0, 1, 2, 3, 4, 5])).toArray(), []);
    },
    "testIndexRange": function() {
        assertEquals(Kira.indexRange.toGenerator().zip(Kira(["a", "b", "c"])).toArray(), [
            [0, "a"],
            [1, "b"],
            [2, "c"]
        ]);
    },
    "testArrayTransformers": function() {
        // map
        assertEquals(Kira.map([1, 2, 3], function(value) {return value * 2;}), [2, 4, 6]);

        // flat
        assertEquals(Kira.flat([1, 2, 3], function(value) {return value % 2 == 0 ? [10] : [value, value * 2];}), [1, 2, 10, 3, 6]);

        // filter
        assertEquals(Kira.filter([1, 2, 3], function(value) {return value % 2 != 0;}), [1, 3]);

        // zip
        assertEquals(Kira.zip([1, 2, 3], ["a", "b"]), [
            [1, "a"],
            [2, "b"]
        ]);

        // each
        var sum = 0;
        Kira.each([1, 2, 3], function(value) {
            sum += value;
        });
        assertEquals(sum, 6);

        // all
        assertTrue(Kira.all([1, 2, 3], function(value) {return value < 4;}));
        assertFalse(Kira.all([1, 2, 3], function(value) {return value < 2;}));

        // any
        assertTrue(Kira.any([1, 2, 3], function(value) {return value === 2;}));
        assertFalse(Kira.any([1, 2, 3], function(value) {return value === 4;}));

        // reduce
        assertEquals(Kira.reduce([1, 2, 3], function(result, value) {return result + value}), [6]);
        assertEquals(Kira.reduce([], function(result, value) {return result + value}), []);

        // fold
        assertEquals(Kira.fold([1, 2, 3], 4, function(result, value) {return result + value}), 10);
        assertEquals(Kira.fold([], 4, function(result, value) {return result + value}), 4);

        // find
        assertEquals(Kira.find([1, 2, 3], function(value) {return value > 1;}), [2]);
        assertEquals(Kira.find([1, 2, 3], function(value) {return value > 10;}), []);

        // indexOf
        assertEquals(Kira.indexOf([1, 2, 3], 1), [0]);
        assertEquals(Kira.indexOf([1, 2, 3], 5), []);

        // get
        assertEquals(Kira.get([1, 2, 3], 1), [2]);
        assertEquals(Kira.get([1, 2, 3], 5), []);

        // getOrElse
        assertEquals(Kira.getOrElse([1, 2, 3], 1, 0), [2]);
        assertEquals(Kira.getOrElse([1, 2, 3], 5, 0), [0]);

        // getOrElseLazy
        assertEquals(Kira.getOrElseLazy([1, 2, 3], 1, function() {return 0;}), [2]);
        assertEquals(Kira.getOrElseLazy([1, 2, 3], 5, function() {return 0;}), [0]);

        // keys
        assertEquals(Kira.keys({a: 1, b: 2, c: 3}).length, 3);
    },
    "testEntryGenerator": function() {
        assertEquals(Kira({a: 1, b: 2, c: 3}).toArray().sort(), [["a", 1], ["b", 2], ["c", 3]]);
    },
    "testMutators": function() {
        assertEquals(Kira.append([1, 2, 3], 4), [1, 2, 3, 4]);
        assertEquals(Kira.append({a: 1, b: 2, c: 3}, "d", 4), {a: 1, b: 2, c: 3, d: 4});
    }
});