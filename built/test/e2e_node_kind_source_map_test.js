"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
var test_support_1 = require("./test_support");
describe('source maps each node with transformer', function () {
    it('maps import declarations correctly', function () {
        var sources = new Map();
        sources.set('exporter1.ts', "export const foo = 1;");
        sources.set('exporter2.ts', "export const bar = 2;\n      export const baz = 3;");
        sources.set('input.ts', "import * as foo from './exporter1';\n      import {bar, baz as quux} from './exporter2';\n      foo.foo;\n      bar;\n      quux;");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, test_support_1.sourceMapCompilerOptions).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.getSourceMapWithName('input.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, 'var foo', { line: 1, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "goog.require('exporter1')", { line: 1, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "var exporter2_1", { line: 2, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "goog.require('exporter2')", { line: 2, source: 'input.ts' });
    });
    it('maps export declarations correctly', function () {
        var sources = new Map();
        sources.set('exporter.ts', "export const foo = 1;");
        sources.set('input.ts', "export const x = 4;\n      const y = 'stringy';\n      export {y};\n      export {foo as bar} from './exporter';");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, test_support_1.sourceMapCompilerOptions).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.getSourceMapWithName('input.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "exports.x = 4;", { line: 1, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "exports.y = y;", { line: 3, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "exports.bar", { line: 4, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "exporter_1.foo", { line: 4, source: 'input.ts' });
    });
    it('maps element access', function () {
        var sources = new Map();
        sources.set('input.ts', "class X {\n        [propName: string]: any;\n      }\n\n      const x = new X();\n      x.foo;");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, test_support_1.sourceMapCompilerOptions).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.getSourceMapWithName('input.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "[\"foo\"];", { line: 6, source: 'input.ts' });
    });
    it('maps decorators', function () {
        var sources = new Map();
        sources.set('input.ts', "\n        /** @Annotation */\n        function classAnnotation(t: any) {\n            return t;\n        }\n\n        @classAnnotation({\n            x: 'thingy',\n        })\n        class DecoratorTest1 {\n            y: string;\n        }");
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var files = test_support_1.compileWithTransfromer(sources, test_support_1.sourceMapCompilerOptions).files;
        var compiledJs = files.get('input.js');
        var sourceMap = test_support_1.getSourceMapWithName('input.js.map', files);
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "classAnnotation, args", { line: 7, source: 'input.ts' });
        test_support_1.assertSourceMapping(compiledJs, sourceMap, "x: 'thingy'", { line: 8, source: 'input.ts' });
    });
});

//# sourceMappingURL=e2e_node_kind_source_map_test.js.map
