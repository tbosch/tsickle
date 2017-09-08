"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
var fs = require("fs");
var closure = require("google-closure-compiler");
var test_support_1 = require("./test_support");
function checkClosureCompile(jsFiles, externsFiles, done) {
    var startTime = Date.now();
    var total = jsFiles.length;
    if (!total)
        throw new Error('No JS files in ' + JSON.stringify(jsFiles));
    var CLOSURE_COMPILER_OPTS = {
        'checks_only': true,
        'jscomp_error': 'checkTypes',
        'warning_level': 'VERBOSE',
        'js': jsFiles,
        'externs': externsFiles,
        'language_in': 'ECMASCRIPT6_STRICT',
        'language_out': 'ECMASCRIPT5',
    };
    var compiler = new closure.compiler(CLOSURE_COMPILER_OPTS);
    compiler.run(function (exitCode, stdout, stderr) {
        console.log('Closure compilation:', total, 'done after', Date.now() - startTime, 'ms');
        if (exitCode !== 0) {
            done(new Error(stderr));
        }
        else {
            done();
        }
    });
}
exports.checkClosureCompile = checkClosureCompile;
describe('golden file tests', function () {
    it('generates correct Closure code', function (done) {
        var tests = test_support_1.goldenTests();
        var goldenJs = (_a = []).concat.apply(_a, __spread(tests.map(function (t) { return t.jsPaths; })));
        goldenJs.push('src/closure_externs.js');
        goldenJs.push('test_files/helpers.js');
        goldenJs.push('test_files/clutz.no_externs/some_name_space.js');
        goldenJs.push('test_files/clutz.no_externs/some_other.js');
        goldenJs.push('test_files/import_from_goog/closure_Module.js');
        goldenJs.push('test_files/import_from_goog/closure_OtherModule.js');
        var externs = tests.map(function (t) { return t.externsPath; }).filter(fs.existsSync);
        checkClosureCompile(goldenJs, externs, done);
        var _a;
    });
});

//# sourceMappingURL=e2e_test.js.map
