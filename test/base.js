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

TestCase("Kira Base module", {
    "testDefinition": function() {
        assertNotUndefined(kira);
    },

    "testNoConflict": function() {
        assertNotUndefined(kira);
        var reference = kira.noConflict();
        assertUndefined(kira);
        assertNotUndefined(reference);
        kira = reference;
    },

    "testDeployment": function() {
        assertUndefined([].group);
        kira.deploy();
        assertNotUndefined([].group);
        kira.undeploy();
        assertUndefined([].group);
    }
});