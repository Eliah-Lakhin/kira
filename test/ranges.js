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

TestCase("Kira Ranges module", {
    "testConstructor": function() {
        assertSame(new kira.Range(0, 5).toGenerator().toArray(), kira(0, 5).toGenerator().toArray());

        assertSame([10], kira(10).toGenerator().toArray());
        assertSame([0, 1, 2, 3, 4], kira(0, 5).toGenerator().toArray());
        assertSame([], kira(10, 0).toGenerator().toArray());
    },

    "testProperties": function() {
        assertTrue(kira(10).isDefined());
        assertSame(10, kira(10).getLeft());
        assertSame(11, kira(10).getRight());
        assertSame(1, kira(10).getLength());

        assertTrue(kira(5, 10).isDefined());
        assertSame(5, kira(5, 10).getLeft());
        assertSame(10, kira(5, 10).getRight());
        assertSame(5, kira(5, 10).getLength());

        assertTrue(kira(0, 5).isDefined());
        assertSame(0, kira(0, 5).getLeft());
        assertSame(5, kira(0, 5).getRight());
        assertSame(5, kira(0, 5).getLength());

        assertFalse(kira(5, 0).isDefined());
        assertSame(0, kira(5, 0).getLeft());
        assertSame(0, kira(5, 0).getRight());
        assertSame(0, kira(5, 0).getLength());

        assertFalse(kira.Range.notdefined.isDefined());
        assertSame(0, kira.Range.notdefined.getLeft());
        assertSame(0, kira.Range.notdefined.getRight());
        assertSame(0, kira.Range.notdefined.getLength());
    },

    "testMap": function() {
        assertSame([2, 3, 4, 5], kira(1, 3).map(function(bound) {return bound * 2;}).toGenerator().toArray());
        assertSame([4, 5], kira(1, 3).map(
            function(left) {return left + 3;},
            function(right) {return right * 2;}
        ).toGenerator().toArray());
    },

    "testUnionWithPoint": function() {
        assertSame([0, 1, 2], kira(1, 3).unionWithPoint(0).toGenerator().toArray());
        assertSame([1, 2], kira(1, 3).unionWithPoint(1).toGenerator().toArray());
        assertSame([1, 2, 3], kira(1, 3).unionWithPoint(3).toGenerator().toArray());

        assertSame([0, 1, 2], kira(1, 3).union(0).toGenerator().toArray());
        assertSame([1, 2], kira(1, 3).union(1).toGenerator().toArray());
        assertSame([1, 2, 3], kira(1, 3).union(3).toGenerator().toArray());
    },

    "testUnionWithRange": function() {
        assertSame([1, 2, 3, 4], kira(1, 3).unionWithRange(kira(2, 5)).toGenerator().toArray());
        assertSame([1, 2, 3, 4], kira(1, 3).unionWithRange(kira(3, 5)).toGenerator().toArray());
        assertSame([1, 2, 3, 4], kira(1, 3).unionWithRange(kira(4, 5)).toGenerator().toArray());
        assertSame([1, 2], kira(1, 3).unionWithRange(kira(1, 2)).toGenerator().toArray());

        assertSame([1, 2, 3, 4], kira(1, 3).union(kira(2, 5)).toGenerator().toArray());
        assertSame([1, 2, 3, 4], kira(1, 3).union(kira(3, 5)).toGenerator().toArray());
        assertSame([1, 2, 3, 4], kira(1, 3).union(kira(4, 5)).toGenerator().toArray());
        assertSame([1, 2], kira(1, 3).union(kira(1, 2)).toGenerator().toArray());
    },

    "testInject": function() {
        assertSame(4, kira(1, 3).inject(kira(1, 3)).getLength());
        assertSame(4, kira(1, 3).inject(kira(2, 4)).getLength());
        assertSame(4, kira(1, 3).inject(kira(0, 2)).getLength());
        assertSame(19, kira(1, 3).inject(kira(10, 20)).getLength());
    },

    "testEnlarge": function() {
        assertSame([0, 1, 2, 3], kira(1, 3).enlarge([1, 1]).toGenerator().toArray());
        assertSame([0, 1, 2, 3, 4], kira(1, 3).enlarge([1, 2]).toGenerator().toArray());
        assertSame([], kira(1, 3).enlarge([-1, -1]).toGenerator().toArray());
    },

    "testShift": function() {
        assertSame([3, 4], kira(1, 3).shift(2).toGenerator().toArray());
        assertSame([-1, 0], kira(1, 3).shift(-2).toGenerator().toArray());
    },

    "testToOption": function() {
        assertSame(1, kira(1, 3).toOption().length);
        assertSame(0, kira(1, -3).toOption().length);
    },

    "testSubstring": function() {
        assertSame("ello", kira(1, 5).substring("hello world"));
        assertSame("ello world", kira(1, 100).substring("hello world"));
        assertSame("hello world", kira(-100, 100).substring("hello world"));
        assertSame("", kira(50, 100).substring("hello world"));

        assertSame("ello", kira(1, 5).sub("hello world"));
        assertSame("ello world", kira(1, 100).sub("hello world"));
        assertSame("hello world", kira(-100, 100).sub("hello world"));
        assertSame("", kira(50, 100).sub("hello world"));
    },

    "testReplaceString": function() {
        assertSame("h123 world", kira(1, 5).replaceString("hello world", "123"));
        assertSame("h123", kira(1, 100).replaceString("hello world", "123"));
        assertSame("123", kira(-100, 100).replaceString("hello world", "123"));
        assertSame("hello world123", kira(50, 100).replaceString("hello world", "123"));

        assertSame("h123 world", kira(1, 5).replace("hello world", "123"));
        assertSame("h123", kira(1, 100).replace("hello world", "123"));
        assertSame("123", kira(-100, 100).replace("hello world", "123"));
        assertSame("hello world123", kira(50, 100).replace("hello world", "123"));
    },

    "testSubarray": function() {
        assertSame([2, 3], kira(2, 4).subarray([0, 1, 2, 3, 4, 5]));
        assertSame([2, 3, 4, 5], kira(2, 100).subarray([0, 1, 2, 3, 4, 5]));
        assertSame([0, 1, 2, 3, 4, 5], kira(-100, 100).subarray([0, 1, 2, 3, 4, 5]));
        assertSame([], kira(50, 100).subarray([0, 1, 2, 3, 4, 5]));

        assertSame([2, 3], kira(2, 4).sub([0, 1, 2, 3, 4, 5]));
        assertSame([2, 3, 4, 5], kira(2, 100).sub([0, 1, 2, 3, 4, 5]));
        assertSame([0, 1, 2, 3, 4, 5], kira(-100, 100).sub([0, 1, 2, 3, 4, 5]));
        assertSame([], kira(50, 100).sub([0, 1, 2, 3, 4, 5]));
    },

    "testReplaceArray": function() {
        assertSame([0, 1, "a", "b", 4, 5], kira(2, 4).replaceArray([0, 1, 2, 3, 4, 5], ["a", "b"]));
        assertSame([0, 1, "a", "b"], kira(2, 100).replaceArray([0, 1, 2, 3, 4, 5], ["a", "b"]));
        assertSame(["a", "b"], kira(-100, 100).replaceArray([0, 1, 2, 3, 4, 5], ["a", "b"]));
        assertSame([0, 1, 2, 3, 4, 5, "a", "b"], kira(50, 100).replaceArray([0, 1, 2, 3, 4, 5], ["a", "b"]));

        assertSame([0, 1, "a", "b", 4, 5], kira(2, 4).replace([0, 1, 2, 3, 4, 5], ["a", "b"]));
        assertSame([0, 1, "a", "b"], kira(2, 100).replace([0, 1, 2, 3, 4, 5], ["a", "b"]));
        assertSame(["a", "b"], kira(-100, 100).replace([0, 1, 2, 3, 4, 5], ["a", "b"]));
        assertSame([0, 1, 2, 3, 4, 5, "a", "b"], kira(50, 100).replace([0, 1, 2, 3, 4, 5], ["a", "b"]));
    },

    "testLimit": function() {
        assertSame([2, 3], kira(2, 4).limit(kira([0, 1, 2, 3, 4, 5])).toArray());
        assertSame([2, 3, 4, 5], kira(2, 100).limit(kira([0, 1, 2, 3, 4, 5])).toArray());
        assertSame([0, 1, 2, 3, 4, 5], kira(-100, 100).limit(kira([0, 1, 2, 3, 4, 5])).toArray());
        assertSame([], kira(50, 100).limit(kira([0, 1, 2, 3, 4, 5])).toArray());
    },

    "testIndex": function() {
        assertSame(
            [
                [0, "a"],
                [1, "b"],
                [2, "c"]
            ],
            kira.Range.index.toGenerator().zip(kira(["a", "b", "c"])).toArray()
        );
    },

    "testToSet": function() {
        assertSame({1: true, 2: true, 3: true, 4: true}, kira([1, 2, 3, 3, 4]).toSet());
    }
});