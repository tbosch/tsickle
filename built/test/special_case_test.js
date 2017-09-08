"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var path = require("path");
var ts = require("typescript");
var tsickle = require("../src/tsickle");
var testSupport = require("./test_support");
describe('special cases', function () {
    function createDefaultTsickleHost(tsSources) {
        return {
            es5Mode: true,
            googmodule: false,
            convertIndexImportShorthand: true,
            transformDecorators: true,
            transformTypesToClosure: true,
            untyped: true,
            logWarning: function (diag) { },
            shouldSkipTsickleProcessing: function (fileName) { return !tsSources.has(fileName); },
            shouldIgnoreWarningsForPath: function () { return false; },
            pathToModuleName: function (context, importPath) {
                importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
                if (importPath[0] === '.')
                    importPath = path.join(path.dirname(context), importPath);
                return importPath.replace(/\/|\\/g, '.');
            },
            fileNameToModuleId: function (fileName) { return fileName.replace(/^\.\//, ''); },
        };
    }
    it.only('should produce correct .d.ts files when expanding `export *` with es2015 module syntax', function () {
        var tsSources = new Map();
        tsSources.set('a.ts', "export const x = 1;");
        tsSources.set('b.ts', "export * from './a';\n");
        var tsCompilerOptions = __assign({}, testSupport.compilerOptions, { declaration: true, module: ts.ModuleKind.ES2015 });
        var _a = testSupport.createProgramAndHost(tsSources, tsCompilerOptions), program = _a.program, tsHost = _a.host;
        var diagnostics = program.getSemanticDiagnostics();
        if (diagnostics.length) {
            throw new Error(tsickle.formatDiagnostics(diagnostics));
        }
        var tsickleHost = __assign({}, createDefaultTsickleHost(tsSources), { es5Mode: false });
        var jsSources = {};
        tsickle.emitWithTsickle(program, tsickleHost, tsHost, tsCompilerOptions, undefined, function (fileName, data) { return jsSources[fileName] = data; });
        chai_1.expect(jsSources['./b.d.ts']).to.eq("export * from './a';\n");
    });
});

//# sourceMappingURL=special_case_test.js.map
