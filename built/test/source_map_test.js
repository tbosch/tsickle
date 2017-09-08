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
var source_map_1 = require("source-map");
var source_map_utils_1 = require("../src/source_map_utils");
var tsickle_1 = require("../src/tsickle");
var test_support_1 = require("./test_support");
describe('source maps', function () {
    it('generates a source map', function () {
        var sources = new Map();
        sources.set('input.ts', "\n      class X { field: number; }\n      class Y { field2: string; }");
        var program = test_support_1.createProgram(sources);
        var sourceMapper = new source_map_utils_1.DefaultSourceMapper('input.ts');
        var annotated = tsickle_1.annotate(program.getTypeChecker(), program.getSourceFile('input.ts'), { pathToModuleName: function () { return 'input'; } }, undefined, undefined, sourceMapper);
        var rawMap = sourceMapper.sourceMap.toJSON();
        var consumer = new source_map_1.SourceMapConsumer(rawMap);
        var lines = annotated.output.split('\n');
        // Uncomment to debug contents:
        // lines.forEach((v, i) => console.log(i + 1, v));
        // Find class X and class Y in the output to make the test robust against code changes.
        var firstClassLine = lines.findIndex(function (l) { return l.indexOf('class X') !== -1; }) + 1;
        var secondClassLine = lines.findIndex(function (l) { return l.indexOf('class Y') !== -1; }) + 1;
        chai_1.expect(consumer.originalPositionFor({ line: firstClassLine, column: 20 }).line)
            .to.equal(2, 'first class definition');
        chai_1.expect(consumer.originalPositionFor({ line: secondClassLine, column: 20 }).line)
            .to.equal(3, 'second class definition');
    });
});

//# sourceMappingURL=source_map_test.js.map
