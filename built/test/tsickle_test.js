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
describe.only('emitWithTsickle', function () {
    function emitWithTsickle(tsSources, tsConfigOverride, tsickleHostOverride, customTransformers) {
        if (tsConfigOverride === void 0) { tsConfigOverride = {}; }
        if (tsickleHostOverride === void 0) { tsickleHostOverride = {}; }
        var tsCompilerOptions = __assign({}, testSupport.compilerOptions, tsConfigOverride);
        var tsSourcesMap = objectToMap(tsSources);
        var _a = testSupport.createProgramAndHost(tsSourcesMap, tsCompilerOptions), program = _a.program, tsHost = _a.host;
        var diagnostics = program.getSemanticDiagnostics();
        if (diagnostics.length) {
            throw new Error(tsickle.formatDiagnostics(diagnostics));
        }
        var tsickleHost = __assign({ es5Mode: true, googmodule: false, convertIndexImportShorthand: true, transformDecorators: true, transformTypesToClosure: true, untyped: true, logWarning: function (diag) { }, shouldSkipTsickleProcessing: function (fileName) { return !tsSourcesMap.has(fileName); }, shouldIgnoreWarningsForPath: function () { return false; }, pathToModuleName: function (context, importPath) {
                importPath = importPath.replace(/(\.d)?\.[tj]s$/, '');
                if (importPath[0] === '.')
                    importPath = path.join(path.dirname(context), importPath);
                return importPath.replace(/\/|\\/g, '.');
            }, fileNameToModuleId: function (fileName) { return fileName.replace(/^\.\//, ''); } }, tsickleHostOverride);
        var jsSources = {};
        tsickle.emitWithTsickle(program, tsickleHost, tsHost, tsCompilerOptions, /* sourceFile */ undefined, function (fileName, data) { return jsSources[fileName] = data; }, /* cancellationToken */ undefined, /* emitOnlyDtsFiles */ undefined, customTransformers);
        return jsSources;
    }
    it('should run custom transformers for files with skipTsickleProcessing', function () {
        function transformValue(context) {
            return function (sourceFile) {
                return visitNode(sourceFile);
                function visitNode(node) {
                    if (node.kind === ts.SyntaxKind.NumericLiteral) {
                        return ts.createLiteral(2);
                    }
                    return ts.visitEachChild(node, visitNode, context);
                }
            };
        }
        var tsSources = {
            'a.ts': "export const x = 1;",
        };
        var jsSources = emitWithTsickle(tsSources, undefined, {
            shouldSkipTsickleProcessing: function () { return true; },
        }, {
            beforeTs: [transformValue]
        });
        chai_1.expect(jsSources['./a.js']).to.contain('exports.x = 2;');
    });
    describe('regressions', function () {
        it('should produce correct .d.ts files when expanding `export *` with es2015 module syntax', function () {
            var tsSources = {
                'a.ts': "export const x = 1;",
                'b.ts': "export * from './a';\n"
            };
            var jsSources = emitWithTsickle(tsSources, {
                declaration: true,
                module: ts.ModuleKind.ES2015,
            }, {
                es5Mode: false,
                googmodule: false
            });
            chai_1.expect(jsSources['./b.d.ts']).to.eq("export * from './a';\n");
        });
    });
});
function objectToMap(data) {
    var entries = Object.keys(data).map(function (key) { return [key, data[key]]; });
    return new Map(entries);
}

//# sourceMappingURL=tsickle_test.js.map
