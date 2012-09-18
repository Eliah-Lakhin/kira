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

TestCase("Kira Installer module", {
    "testBaseFeatures": function() {
        var customMath = {
            sin: function() {
                return "custom sine";
            }
        };
        assertTrue(kira.installer.install("test.custom.sin", Math, customMath));
        assertFalse(kira.installer.install("test.custom.sin", Math, customMath));

        assertNotEquals("custom sine", Math.sin(Math.PI / 2));
        assertEquals(1, Math.sin(Math.PI / 2));

        assertTrue(kira.installer.enable("test.custom.sin"));
        assertTrue(kira.installer.disable("test.custom.sin"));
        assertFalse(kira.installer.disable("test.custom.sin"));
        assertFalse(kira.installer.isEnabled("test.custom.sin"));

        kira.installer.enable("test.custom.sin", function() {
            assertTrue(kira.installer.isEnabled("test.custom.sin"));
            assertEquals("custom sine", Math.sin(Math.PI / 2));
        });
        assertFalse(kira.installer.isEnabled("test.custom.sin"));
        assertEquals(1, Math.sin(Math.PI / 2));

        assertTrue(kira.installer.uninstall("test.custom.sin"));
        assertFalse(kira.installer.uninstall("test.custom.sin"));
        assertFalse(kira.installer.enable("test.custom.sin"));
    },

    "testMultiPackage": function() {
        var customMath = {
            sin: function() {
                return "custom sine";
            }
        };
        assertTrue(kira.installer.install("test.custom.sin", Math, customMath));
        kira.arrays.each(kira.installer.getAllPackages("test.*"), function(packageName) {
            assertTrue(kira.installer.uninstall(packageName));
        });
        assertFalse(kira.installer.uninstall("test.custom.sin"));
    }
});