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
        assertEquals({a: 1, b: 2}, kira.objects.extend({a: 1, b: 2}, {}));
        assertEquals({a: 1, b: 2, c: 3}, kira.objects.extend({a: 1, b: 2}, {c: 3}));
        assertEquals({a: 1, b: 3, c: 3}, kira.objects.extend({a: 1, b: 2}, {b: 3, c: 3}));
        assertEquals({b: 3, c: 4}, kira.objects.extend({}, {b: 3, c: 4}));
    },

    "testAppend": function() {
        assertEquals([1, 2, 3, 4], kira.objects.append([1, 2, 3], 4));
        assertEquals({a: 1, b: 2, c: 3, d: 4}, kira.objects.append({a: 1, b: 2, c: 3}, "d", 4));
    },

    "testKeys": function() {
        assertEquals(3, kira.objects.keys({a: 1, b: 2, c: 3}).length);
    },

    "testDeployment": function() {
        assertUndefined([].extend);
        assertTrue(kira.installer.enable("kira.objects"));
        assertNotUndefined([].extend);

        assertEquals({a: 1, b: 2, c: 3}, {a: 1, b: 2}.extend({c: 3}));

        assertTrue(kira.installer.disable("kira.objects"));
        assertUndefined([].extend);
        assertNotUndefined(kira.objects.extend);
    }
});