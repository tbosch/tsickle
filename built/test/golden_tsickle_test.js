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
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var fs = require("fs");
var path = require("path");
var ts = require("typescript");
var tsickle = require("../src/tsickle");
var util_1 = require("../src/util");
var testSupport = require("./test_support");
var TEST_FILTER = process.env.TEST_FILTER ? new RegExp(process.env.TEST_FILTER) : null;
// If true, update all the golden .js files to be whatever tsickle
// produces from the .ts source. Do not change this code but run as:
//     UPDATE_GOLDENS=y gulp test
var UPDATE_GOLDENS = !!process.env.UPDATE_GOLDENS;
function readGolden(path) {
    var golden = null;
    try {
        golden = fs.readFileSync(path, 'utf-8');
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            return null;
        }
        else {
            throw e;
        }
    }
    return golden;
}
/**
 * compareAgainstGoldens compares a test output against the content in a golden
 * path, updating the content of the golden when UPDATE_GOLDENS is true.
 *
 * @param output The expected output, where the empty string indicates
 *    the file is expected to exist and be empty, while null indicates
 *    the file is expected to not exist.  (This subtlety is used for
 *    externs files, where the majority of tests are not expected to
 *    produce one.)
 */
function compareAgainstGolden(output, path) {
    var golden = null;
    try {
        golden = fs.readFileSync(path, 'utf-8');
    }
    catch (e) {
        if (e.code === 'ENOENT' && (UPDATE_GOLDENS || output === null)) {
            // A missing file is acceptable if we're updating goldens or
            // if we're expected to produce no output.
        }
        else {
            throw e;
        }
    }
    // Make sure we have proper line endings when testing on Windows.
    if (golden != null)
        golden = util_1.normalizeLineEndings(golden);
    if (output != null)
        output = util_1.normalizeLineEndings(output);
    if (UPDATE_GOLDENS && output !== golden) {
        console.log('Updating golden file for', path);
        if (output !== null) {
            fs.writeFileSync(path, output, { encoding: 'utf-8' });
        }
        else {
            // The desired golden state is for there to be no output file.
            // Ensure no file exists.
            try {
                fs.unlinkSync(path);
            }
            catch (e) {
                // ignore.
            }
        }
    }
    else {
        chai_1.expect(output).to.equal(golden, "" + path);
    }
}
// Only run golden tests if we filter for a specific one.
var testFn = TEST_FILTER ? describe.only : describe;
testFn('golden tests with transformer', function () {
    testSupport.goldenTests().forEach(function (test) {
        if (TEST_FILTER && !TEST_FILTER.exec(test.name)) {
            it.skip(test.name);
            return;
        }
        var emitDeclarations = true;
        if (test.name === 'fields') {
            emitDeclarations = false;
        }
        it(test.name, function () {
            // Read all the inputs into a map, and create a ts.Program from them.
            var tsSources = new Map();
            try {
                for (var _a = __values(test.tsFiles), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var tsFile = _b.value;
                    var tsPath = path.join(test.path, tsFile);
                    var tsSource = fs.readFileSync(tsPath, 'utf-8');
                    tsSource = util_1.normalizeLineEndings(tsSource);
                    tsSources.set(tsPath, tsSource);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var tsCompilerOptions = __assign({}, testSupport.compilerOptions, { 
                // Test that creating declarations does not throw
                declaration: emitDeclarations });
            var _d = testSupport.createProgramAndHost(tsSources, tsCompilerOptions), program = _d.program, tsHost = _d.host;
            {
                var diagnostics_1 = ts.getPreEmitDiagnostics(program);
                if (diagnostics_1.length) {
                    throw new Error(tsickle.formatDiagnostics(diagnostics_1));
                }
            }
            var allDiagnostics = [];
            var diagnosticsByFile = new Map();
            var transformerHost = {
                es5Mode: true,
                prelude: '',
                googmodule: true,
                // See test_files/jsdoc_types/nevertyped.ts.
                typeBlackListPaths: new Set(['test_files/jsdoc_types/nevertyped.ts']),
                convertIndexImportShorthand: true,
                transformDecorators: true,
                transformTypesToClosure: true,
                untyped: /\.untyped\b/.test(test.name),
                logWarning: function (diag) {
                    allDiagnostics.push(diag);
                    var diags = diagnosticsByFile.get(diag.file.fileName);
                    if (!diags) {
                        diags = [];
                        diagnosticsByFile.set(diag.file.fileName, diags);
                    }
                    diags.push(diag);
                },
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
            var jsSources = {};
            var _e = tsickle.emitWithTsickle(program, transformerHost, tsHost, tsCompilerOptions, undefined, function (fileName, data) {
                if (!fileName.endsWith('.d.ts')) {
                    // Don't check .d.ts files, we are only interested to test
                    // that we don't throw when we generate them.
                    jsSources[fileName] = data;
                }
            }), diagnostics = _e.diagnostics, externs = _e.externs;
            allDiagnostics.push.apply(allDiagnostics, __spread(diagnostics));
            var allExterns = null;
            if (!test.name.endsWith('.no_externs')) {
                try {
                    for (var _f = __values(util_1.toArray(tsSources.keys())), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var tsPath = _g.value;
                        if (externs[tsPath]) {
                            if (!allExterns)
                                allExterns = tsickle.EXTERNS_HEADER;
                            allExterns += externs[tsPath];
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_h = _f.return)) _h.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            compareAgainstGolden(allExterns, test.externsPath);
            Object.keys(jsSources).forEach(function (jsPath) {
                var tsPath = jsPath.replace(/\.js$/, '.ts').replace(/^\.\//, '');
                var diags = diagnosticsByFile.get(tsPath);
                diagnosticsByFile.delete(tsPath);
                var out = jsSources[jsPath];
                if (diags) {
                    out = tsickle.formatDiagnostics(diags).split('\n').map(function (line) { return "// " + line + "\n"; }).join('') +
                        out;
                }
                compareAgainstGolden(out, jsPath);
            });
            var dtsDiags = [];
            if (diagnosticsByFile.size) {
                try {
                    for (var _j = __values(diagnosticsByFile.entries()), _k = _j.next(); !_k.done; _k = _j.next()) {
                        var _l = __read(_k.value, 2), path_1 = _l[0], diags = _l[1];
                        if (path_1.endsWith('.d.ts')) {
                            dtsDiags.push.apply(dtsDiags, __spread(diags));
                            continue;
                        }
                        chai_1.expect(tsickle.formatDiagnostics(diags))
                            .to.equal('', "unhandled diagnostics for " + path_1);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_k && !_k.done && (_m = _j.return)) _m.call(_j);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            if (dtsDiags.length) {
                compareAgainstGolden(tsickle.formatDiagnostics(dtsDiags), path.join(test.path, 'dtsdiagnostics.txt'));
            }
            var e_1, _c, e_2, _h, e_3, _m;
        });
    });
});

//# sourceMappingURL=golden_tsickle_test.js.map
