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

//////////////////////////////
//        Installer         //
//////////////////////////////

    kira.installer = (function() {
        var installRegistry = {};

        var installer = {
            deploy: function(packageName, targets) {
                if (installer.install(packageName, arguments[1], arguments[2])) {
                    return installer.enable(packageName);
                } else {
                    return false;
                }
            },

            install: function(packageName, targets) {
                if (installer.isInstalled(packageName)) {
                    return false;
                }
                if (Object.prototype.toString.call(targets) !== "[object Array]") {
                    targets = [{
                        destination: arguments[1],
                        source: arguments[2],
                        safe: false
                    }];
                }
                installRegistry[packageName] = {
                    retainCount: 0,
                    targets: targets
                };
                return true;
            },

            uninstall: function(packageName) {
                if (!installer.isInstalled(packageName) || installer.isEnabled(packageName)) {
                    return false;
                }
                delete installRegistry[packageName];
                return true;
            },

            isInstalled: function(packageName) {
                return installRegistry[packageName] !== undefined;
            },

            isEnabled: function(packageName) {
                return installRegistry[packageName] !== undefined && installRegistry[packageName].retainCount > 0;
            },

            getAllPackages: function(pattern) {
                if (pattern.length > 1 && pattern.indexOf("*", pattern.length - 1) !== -1) {
                    pattern = pattern.substr(0, pattern.length - 1);
                    var result = [];
                    for (var key in installRegistry) {
                        if (installRegistry.hasOwnProperty(key) && key.indexOf(pattern, 0) === 0) {
                            result.push(key);
                        }
                    }
                    return result;
                } else {
                    return installRegistry[pattern] === undefined ? [] : [pattern];
                }
            },

            enable: function(packageName, callback) {
                if (!installer.isInstalled(packageName)) {
                    return false;
                }
                var installedPackage = installRegistry[packageName];
                if (callback !== undefined) {
                    if (installer.enable(packageName)) {
                        callback();
                        installer.disable(packageName);
                    } else {
                        installedPackage.retainCount++;
                        callback();
                        installedPackage.retainCount--;
                    }
                    return true;
                }
                if (installedPackage.retainCount > 0) {
                    return false;
                }
                installedPackage.retainCount = 1;
                for (var targetIndex = 0, targetLength = installedPackage.targets.length; targetIndex < targetLength; targetIndex++) {
                    var target = installedPackage.targets[targetIndex],
                        source = target.source,
                        destination = target.destination,
                        safe = target.safe,
                        obscuredFields = {};
                    for (var fieldKey in source) {
                        if (source.hasOwnProperty(fieldKey)) {
                            if (!safe || destination[fieldKey] === undefined) {
                                var newFieldValue = source[fieldKey];
                                obscuredFields[fieldKey] = destination[fieldKey];
                                destination[fieldKey] = newFieldValue;
                            }
                        }
                    }
                    target.obscuredFields = obscuredFields;
                }
                return true;
            },

            disable: function(packageName, callback) {
                if (!installer.isInstalled(packageName)) {
                    return false;
                }
                var installedPackage = installRegistry[packageName];
                if (callback !== undefined) {
                    if (installer.disable(packageName)) {
                        callback();
                        installer.enable(packageName);
                    } else {
                        var oldRetainCount = installedPackage.retainCount;
                        installedPackage.retainCount = 1;
                        installer.disable(packageName);
                        callback();
                        installer.enable(packageName);
                        installedPackage.retainCount = oldRetainCount;
                    }
                    return true;
                }
                if (installedPackage.retainCount !== 1) {
                    return false;
                }
                for (var targetIndex = installedPackage.targets.length - 1; targetIndex >= 0; targetIndex--) {
                    var target = installedPackage.targets[targetIndex],
                        source = target.source,
                        destination = target.destination,
                        obscuredFields = target.obscuredFields;
                    for (var fieldKey in source) {
                        if (source.hasOwnProperty(fieldKey)) {
                            destination[fieldKey] = obscuredFields[fieldKey];
                        }
                    }
                    delete target.obscuredFields;
                }
                installedPackage.retainCount = 0;
                return true;
            }
        };

        return installer;
    })();