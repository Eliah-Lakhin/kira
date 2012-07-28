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

TestCase("Kira Object module", {
    "testExtend": function() {
        assertSame({a: 1, b: 2}, kira.objects.extend({a: 1, b: 2}, {}));
        assertSame({a: 1, b: 2, c: 3}, kira.objects.extend({a: 1, b: 2}, {c: 3}));
        assertSame({a: 1, b: 3, c: 3}, kira.objects.extend({a: 1, b: 2}, {b: 3, c: 3}));
        assertSame({b: 3, c: 4}, kira.objects.extend({}, {b: 3, c: 4}));
    },

    "testAppend": function() {
        assertSame([1, 2, 3, 4], kira.objects.append([1, 2, 3], 4));
        assertSame({a: 1, b: 2, c: 3, d: 4}, kira.objects.append({a: 1, b: 2, c: 3}, "d", 4));
    },

    "testKeys": function() {
        assertSame(3, kira.objects.keys({a: 1, b: 2, c: 3}).length);
    }
});