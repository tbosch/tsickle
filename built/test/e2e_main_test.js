"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var main_1 = require("../src/main");
var tsickle = require("../src/tsickle");
var test_support_1 = require("./test_support");
describe('toClosureJS', function () {
    it('creates externs, adds type comments and rewrites imports', function () {
        var filePaths = ['test_files/underscore/export_underscore.ts', 'test_files/underscore/underscore.ts'];
        var sources = test_support_1.readSources(filePaths);
        var files = new Map();
        var result = main_1.toClosureJS(test_support_1.compilerOptions, filePaths, { isTyped: true }, function (filePath, contents) {
            files.set(filePath, contents);
        });
        if (result.diagnostics.length || true) {
            // result.diagnostics.forEach(v => console.log(JSON.stringify(v)));
            chai_1.expect(tsickle.formatDiagnostics(result.diagnostics)).to.equal('');
        }
        chai_1.expect(tsickle.getGeneratedExterns(result.externs)).to.contain("/** @const */\nvar __NS = {};\n /** @type {number} */\n__NS.__ns1;\n");
        var underscoreDotJs = files.get('./test_files/underscore/underscore.js');
        chai_1.expect(underscoreDotJs).to.contain("goog.module('test_files.underscore.underscore')");
        chai_1.expect(underscoreDotJs).to.contain("/** @type {string} */");
        var exportUnderscoreDotJs = files.get('./test_files/underscore/export_underscore.js');
        chai_1.expect(exportUnderscoreDotJs)
            .to.contain("goog.module('test_files.underscore.export_underscore')");
    });
});

//# sourceMappingURL=e2e_main_test.js.map
