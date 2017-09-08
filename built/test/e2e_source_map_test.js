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
// tslint:disable:no-unused-expression mocha .to.be.empty getters.
var chai_1 = require("chai");
var source_map_utils_1 = require("../src/source_map_utils");
var test_support_1 = require("./test_support");
describe('source maps with transformer', function () {
    it('composes source maps with tsc', function () {
        var sources = new Map();
        sources.set('input.ts', "\n      class X { field: number; }\n      let x : string = 'a string';\n      let y : string = 'another string';\n      let z : string = x + y;");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, test_support_1.sourceMapCompilerOptions).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.getSourceMapWithName('input.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'a string', { line: 3, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'another string', { line: 4, source: 'input.ts' });
    });
    it('composes sources maps with multiple input files', function () {
        var sources = new Map();
        sources.set('input1.ts', "\n        class X { field: number; }\n        let x : string = 'a string';\n        let y : string = 'another string';\n        let z : string = x + y;");
        sources.set('input2.ts', "\n        class A { field: number; }\n        let a : string = 'third string';\n        let b : string = 'fourth rate';\n        let c : string = a + b;");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.generateOutfileCompilerOptions('output.js'))).files;
        var compiledJs = files.get('output.js');
        var sourceMap = test_support_1.getSourceMapWithName('output.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'a string', { line: 3, source: 'input1.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'fourth rate', { line: 4, source: 'input2.ts' });
    });
    it('handles files in different directories', function () {
        var sources = new Map();
        sources.set('a/b/input1.ts', "\n        class X { field: number; }\n        let x : string = 'a string';\n        let y : string = 'another string';\n        let z : string = x + y;");
        sources.set('a/c/input2.ts', "\n        class A { field: number; }\n        let a : string = 'third string';\n        let b : string = 'fourth rate';\n        let c : string = a + b;");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.generateOutfileCompilerOptions('a/d/output.js'))).files;
        var compiledJs = test_support_1.findFileContentsByName('a/d/output.js', files);
        var sourceMap = test_support_1.getSourceMapWithName('a/d/output.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'a string', { line: 3, source: '../b/input1.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'fourth rate', { line: 4, source: '../c/input2.ts' });
    });
    it('handles decorators correctly', function () {
        var sources = new Map();
        sources.set('input.ts', "/** @Annotation */\n        function classAnnotation(t: any) { return t; }\n\n        @classAnnotation\n        class DecoratorTest {\n          public methodName(s: string): string { return s; }\n        }");
        var files = test_support_1.compileWithTransfromer(sources, test_support_1.sourceMapCompilerOptions).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.getSourceMapWithName('input.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'methodName', { line: 6, source: 'input.ts' });
    });
    it('composes inline sources', function () {
        var sources = new Map();
        sources.set('input.ts', "\n      class X { field: number; }\n      let x : string = 'a string';\n      let y : string = 'another string';\n      let z : string = x + y;");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.inlineSourceMapCompilerOptions)).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.extractInlineSourceMap(compiledJs);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'a string', { line: 3, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'another string', { line: 4, source: 'input.ts' });
    });
    it("doesn't blow up trying to handle a source map in a .d.ts file", function () {
        var sources = new Map();
        sources.set('input.ts', "\n      class X { field: number; }\n      let x : string = 'a string';\n      let y : string = 'another string';\n      let z : string = x + y;");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.inlineSourceMapCompilerOptions)).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.extractInlineSourceMap(compiledJs);
        var dts = files.get('input.d.ts');
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'a string', { line: 3, source: 'input.ts' });
        chai_1.expect(dts).to.contain('declare let x: string;');
    });
    function createInputWithSourceMap(overrides) {
        if (overrides === void 0) { overrides = {}; }
        var sources = new Map();
        var inputSourceMap = __assign({ 'version': 3, 'sources': ['original.ts'], 'names': [], 'mappings': 'AAAA,MAAM,EAAE,EAAE,CAAC', 'file': 'intermediate.ts', 'sourceRoot': '' }, overrides);
        var encodedSourceMap = Buffer.from(JSON.stringify(inputSourceMap), 'utf8').toString('base64');
        sources.set('intermediate.ts', "const x = 3;\n//# sourceMappingURL=data:application/json;base64," + encodedSourceMap);
        return sources;
    }
    it('handles input source maps', function () {
        var sources = createInputWithSourceMap();
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.inlineSourceMapCompilerOptions)).files;
        var compiledJs = files.get('intermediate.js');
        var sourceMap = test_support_1.extractInlineSourceMap(compiledJs);
        chai_1.expect(source_map_utils_1.getInlineSourceMapCount(compiledJs)).to.equal(1);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'x = 3', { source: 'original.ts' });
    });
    it('handles input source maps with different file names than supplied to tsc', function () {
        var sources = createInputWithSourceMap({ file: 'foo/bar/intermediate.ts' });
        var files = test_support_1.compileWithTransfromer(sources, test_support_1.sourceMapCompilerOptions).files;
        var compiledJs = files.get('intermediate.js');
        var sourceMap = test_support_1.getSourceMapWithName('intermediate.js.map', files);
        chai_1.expect(source_map_utils_1.getInlineSourceMapCount(compiledJs)).to.equal(0);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'x = 3', { line: 1, source: 'original.ts' });
    });
    it('handles input source maps with an outDir different than the rootDir', function () {
        var sources = createInputWithSourceMap({ file: 'foo/bar/intermediate.ts' });
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.generateOutfileCompilerOptions('/out/output.js'), test_support_1.inlineSourceMapCompilerOptions)).files;
        var compiledJs = test_support_1.findFileContentsByName('/out/output.js', files);
        var sourceMap = test_support_1.extractInlineSourceMap(compiledJs);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'x = 3', { source: 'original.ts' });
    });
    it('removes incoming inline sourcemaps from the sourcemap content', function () {
        // make sure that not the whole file is mapped so that
        // sources of the intermediate file are present in the sourcemap.
        var sources = createInputWithSourceMap({ 'mappings': ';', 'sources': ['intermediate.ts'] });
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.inlineSourceMapCompilerOptions)).files;
        var compiledJs = files.get('intermediate.js');
        var sourceMap = test_support_1.extractInlineSourceMap(compiledJs);
        chai_1.expect(sourceMap.sources[0]).to.eq('intermediate.ts');
        chai_1.expect(source_map_utils_1.containsInlineSourceMap(sourceMap.sourcesContent[0]))
            .to.eq(false, 'contains inline sourcemap');
    });
    it("doesn't blow up putting an inline source map in an empty file", function () {
        var sources = new Map();
        sources.set('input.ts', "");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.inlineSourceMapCompilerOptions)).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.extractInlineSourceMap(compiledJs);
        chai_1.expect(sourceMap).to.exist;
        chai_1.expect(compiledJs).to.contain("var module = {id: 'input.js'};");
    });
    it("handles mixed source mapped and non source mapped input", function () {
        var sources = createInputWithSourceMap();
        sources.set('input2.ts', "\n      class X { field: number; }\n      let y : string = 'another string';\n      let z : string = x + y;");
        var files = test_support_1.compileWithTransfromer(sources, __assign({}, test_support_1.sourceMapCompilerOptions, test_support_1.generateOutfileCompilerOptions('output.js'))).files;
        var compiledJs = files.get('output.js');
        var sourceMap = test_support_1.getSourceMapWithName('output.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'x = 3', { source: 'original.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'another string', { line: 3, source: 'input2.ts' });
    });
    it('maps at the start of lines correctly', function () {
        var sources = new Map([[
                'input.ts', "let x : number = 2;\n      x + 1;\n      let y = {z: 2};\n      y.z;"
            ]]);
        var files = test_support_1.compileWithTransfromer(sources, test_support_1.sourceMapCompilerOptions).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.getSourceMapWithName('input.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'let /** @type {number} */ x', { line: 1, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'x + 1', { line: 2, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'y.z', { line: 4, source: 'input.ts' });
    });
});

//# sourceMappingURL=e2e_source_map_test.js.map
