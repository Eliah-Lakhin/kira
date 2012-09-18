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

TestCase("Kira Functions module", {
    "testBind": function() {
        assertEquals(
            "bar12",
            kira.functions.bind(
                function(x, y) {return this.foo + x + y},
                {foo: "bar"}
            )(1, 2)
        );
    },

    "testUnbind": function() {
        var foo = {
            baz: "Baz",
            bar: kira.functions.unbind(function(self, x, y) {
                return self.baz + x + y;
            })
        };
        assertEquals("Baz12", foo.bar(1, 2));
    }
});