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
var ts = require("typescript");
var transformer_util_1 = require("../src/transformer_util");
var tsickle = require("../src/tsickle");
var util_1 = require("../src/util");
var testSupport = require("./test_support");
var MODULE_HEADER = "Object.defineProperty(exports, \"__esModule\", { value: true });";
describe('transformer util', function () {
    function emitWithTransform(tsSources, transform) {
        var _a = testSupport.createProgramAndHost(objectToMap(tsSources)), program = _a.program, host = _a.host;
        var diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length) {
            throw new Error(tsickle.formatDiagnostics(diagnostics));
        }
        var transformers = transformer_util_1.createCustomTransformers({ before: [transform] });
        var jsSources = {};
        program.emit(undefined, function (fileName, data) {
            jsSources[fileName] = util_1.normalizeLineEndings(data);
        }, undefined, undefined, transformers);
        return jsSources;
    }
    describe('comments', function () {
        function transformComments(context) {
            return function (sourceFile) {
                return visitNode(sourceFile);
                function visitNode(node) {
                    return transformer_util_1.visitNodeWithSynthesizedComments(context, sourceFile, node, visitNodeImpl);
                }
                function visitNodeImpl(node) {
                    visitComments(node, ts.getSyntheticLeadingComments(node));
                    visitComments(node, ts.getSyntheticTrailingComments(node));
                    return transformer_util_1.visitEachChildIgnoringTypes(node, visitNode, context);
                }
                function visitComments(node, comments) {
                    if (comments) {
                        comments.forEach(function (c) { return c.text = "<" + node.kind + ">" + c.text; });
                    }
                }
            };
        }
        it('should synthesize leading file comments', function () {
            var tsSources = {
                'a.ts': [
                    "/*fc*/",
                    "",
                    "/*sc*/",
                    "const x = 1;",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "/*<" + ts.SyntaxKind.NotEmittedStatement + ">fc*/",
                "/*<" + ts.SyntaxKind.VariableStatement + ">sc*/",
                "const x = 1;",
                "",
            ].join('\n'));
        });
        it('should synthesize trailing file comments', function () {
            var tsSources = {
                'a.ts': [
                    "const x = 1; /*sc*/",
                    "/*fc*/",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "const x = 1; /*<" + ts.SyntaxKind.VariableStatement + ">sc*/",
                "/*<" + ts.SyntaxKind.NotEmittedStatement + ">fc*/ ",
                "",
            ].join('\n'));
        });
        it('should synthesize leading block comments', function () {
            var tsSources = {
                'a.ts': [
                    "{",
                    "  /*bc*/",
                    "",
                    "  /*sc*/",
                    "  const x = 1;",
                    "}",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "{",
                "    /*<" + ts.SyntaxKind.NotEmittedStatement + ">bc*/",
                "    /*<" + ts.SyntaxKind.VariableStatement + ">sc*/",
                "    const x = 1;",
                "}",
                "",
            ].join('\n'));
        });
        it('should not treat leading statement comments as leading block comments', function () {
            var tsSources = {
                'a.ts': [
                    "{",
                    "  /*a*/",
                    "  const a = 1",
                    "  /*b*/",
                    "  const b = 2;",
                    "}",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "{",
                "    /*<" + ts.SyntaxKind.VariableStatement + ">a*/",
                "    const a = 1;",
                "    /*<" + ts.SyntaxKind.VariableStatement + ">b*/",
                "    const b = 2;",
                "}",
                "",
            ].join('\n'));
        });
        it('should synthesize trailing block comments', function () {
            var tsSources = {
                'a.ts': [
                    "{",
                    "  const x = 1;/*sc*/",
                    "  /*bc*/",
                    "}",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "{",
                "    const x = 1; /*<" + ts.SyntaxKind.VariableStatement + ">sc*/",
                "    /*<" + ts.SyntaxKind.NotEmittedStatement + ">bc*/",
                "}",
                "",
            ].join('\n'));
        });
        it('should synthesize different kinds of comments', function () {
            var tsSources = {
                'a.ts': [
                    "/*mlc*/",
                    "//slc",
                    "///tc",
                    "const x = 1;",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            // Note: tripple line comments contain typescript specific information
            // and are removed.
            chai_1.expect(jsSources['./a.js']).to.eq([
                "/*<" + ts.SyntaxKind.VariableStatement + ">mlc*/",
                "//<" + ts.SyntaxKind.VariableStatement + ">slc",
                "const x = 1;",
                "",
            ].join('\n'));
        });
        it('should synthesize leading comments', function () {
            var tsSources = {
                'a.ts': [
                    "/*sc1*/",
                    "/*sc2*/",
                    "const x = 1;",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "/*<" + ts.SyntaxKind.VariableStatement + ">sc1*/",
                "/*<" + ts.SyntaxKind.VariableStatement + ">sc2*/",
                "const x = 1;",
                "",
            ].join('\n'));
        });
        it('should synthesize trailing comments', function () {
            var tsSources = {
                'a.ts': [
                    "const x = 1; /*sc*/",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "const x = 1; /*<" + ts.SyntaxKind.VariableStatement + ">sc*/",
                "",
            ].join('\n'));
        });
        it('should separate leading and trailing comments', function () {
            var tsSources = {
                'a.ts': [
                    "/*lc1*/ const x = 1; /*tc1*/",
                    "/*lc2*/ const y = 1; /*tc2*/",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "/*<" + ts.SyntaxKind.VariableStatement + ">lc1*/ const x = 1; /*<" + ts.SyntaxKind.VariableStatement + ">tc1*/",
                "/*<" + ts.SyntaxKind.VariableStatement + ">lc2*/ const y = 1; /*<" + ts.SyntaxKind.VariableStatement + ">tc2*/",
                "",
            ].join('\n'));
        });
        it('should synthesize comments on variables', function () {
            var tsSources = { 'a.ts': "/*c*/ const /*x*/ x = 1, /*y*/ y = 1;" };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js'])
                .to.eq("/*<" + ts.SyntaxKind.VariableStatement + ">c*/ const " +
                ("/*<" + ts.SyntaxKind.VariableDeclaration + ">x*/ x = 1, ") +
                ("/*<" + ts.SyntaxKind.VariableDeclaration + ">y*/ y = 1;\n"));
        });
        it('should synthesize comments on exported variables', function () {
            var tsSources = { 'a.ts': "/*c*/export const x = 1;" };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                MODULE_HEADER,
                "/*<" + ts.SyntaxKind.VariableStatement + ">c*/ exports.x = 1;",
                "",
            ].join('\n'));
        });
        it('should synthesize comments on reexport stmts', function () {
            var tsSources = { 'a.ts': 'export const x = 1', 'b.ts': "/*c*/export {x} from './a';" };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./b.js']).to.eq([
                MODULE_HEADER,
                "/*<" + ts.SyntaxKind.ExportDeclaration + ">c*/ var a_1 = require(\"./a\");",
                "exports.x = a_1.x;",
                "",
            ].join('\n'));
        });
        it('should synthesize comments on import stmts', function () {
            var tsSources = {
                'a.ts': 'export const x = 1',
                'b.ts': "/*c*/import {x} from './a';console.log(x);"
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./b.js']).to.eq([
                MODULE_HEADER,
                "/*<" + ts.SyntaxKind.ImportDeclaration + ">c*/ const a_1 = require(\"./a\");",
                "console.log(a_1.x);",
                "",
            ].join('\n'));
        });
        it('should not synthesize comments of elided import stmts', function () {
            var tsSources = {
                'a.ts': 'export type t = number;',
                'b.ts': 'export const x = 1;',
                'c.ts': [
                    "/*t*/import {t} from './a';",
                    "/*x*/import {x} from './b';",
                    "console.log(x);",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./c.js']).to.eq([
                MODULE_HEADER,
                "/*<" + ts.SyntaxKind.ImportDeclaration + ">x*/ const b_1 = require(\"./b\");",
                "console.log(b_1.x);",
                "",
            ].join('\n'));
        });
        it('should not synthesize comments of elided reexport stmts', function () {
            var tsSources = {
                'a.ts': 'export type t = number;',
                'b.ts': 'export const x = 1;',
                'c.ts': [
                    "/*t*/export {t} from './a';",
                    "/*x*/export {x} from './b';",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./c.js']).to.eq([
                MODULE_HEADER,
                "/*<" + ts.SyntaxKind.ExportDeclaration + ">x*/ var b_1 = require(\"./b\");",
                "exports.x = b_1.x;",
                "",
            ].join('\n'));
        });
        it('should synthesize comments on properties with initializers', function () {
            var tsSources = {
                'a.ts': [
                    "class C {",
                    "  /*c1*/static p1 = true;",
                    "  /*c2*/p2 = true;",
                    "}",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "class C {",
                "    constructor() {",
                "        /*<" + ts.SyntaxKind.PropertyDeclaration + ">c2*/ this.p2 = true;",
                "    }",
                "}",
                "/*<" + ts.SyntaxKind.PropertyDeclaration + ">c1*/ C.p1 = true;",
                "",
            ].join('\n'));
        });
        it('should synthesize comments on classes', function () {
            var tsSources = {
                'a.ts': [
                    "/*c*/",
                    "class C {",
                    "  prop1 = 1;",
                    "}",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, transformComments);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "/*<" + ts.SyntaxKind.ClassDeclaration + ">c*/",
                "class C {",
                "    constructor() {",
                "        this.prop1 = 1;",
                "    }",
                "}",
                "",
            ].join('\n'));
        });
    });
    describe('synthetic nodes with filled originalNode', function () {
        function synthesizeTransform(context) {
            return function (sourceFile) {
                return visitNode(sourceFile);
                function visitNode(node) {
                    if (node.kind === ts.SyntaxKind.Identifier) {
                        var synthNode = ts.createIdentifier(node.text);
                        ts.setOriginalNode(synthNode, node);
                        ts.setTextRange(synthNode, node);
                        node = synthNode;
                    }
                    return transformer_util_1.visitEachChildIgnoringTypes(node, visitNode, context);
                }
            };
        }
        it('should not crash for synthetic property decorators', function () {
            var tsSources = {
                'a.ts': [
                    "let decorator: any",
                    "class X {",
                    "  @decorator",
                    "  private x: number;",
                    "}",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, synthesizeTransform);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "let decorator;",
                "class X {",
                "}",
                "__decorate([",
                "    decorator,",
                "    __metadata(\"design:type\", Number)",
                "], X.prototype, \"x\", void 0);",
                "",
            ].join('\n'));
        });
        it('should emit the top level variable for `module` statements', function () {
            var tsSources = {
                'a.ts': [
                    "module Reflect {",
                    "  const x = 1;",
                    "}",
                ].join('\n')
            };
            var jsSources = emitWithTransform(tsSources, synthesizeTransform);
            chai_1.expect(jsSources['./a.js']).to.eq([
                "var Reflect;",
                "(function (Reflect) {",
                "    const x = 1;",
                "})(Reflect || (Reflect = {}));",
                "",
            ].join('\n'));
        });
        it('should allow to change an export * into named exports', function () {
            function expandExportStar(context) {
                return function (sourceFile) {
                    return visitNode(sourceFile);
                    function visitNode(node) {
                        if (node.kind === ts.SyntaxKind.ExportDeclaration) {
                            var ed = node;
                            var namedExports = ts.createNamedExports([ts.createExportSpecifier('x', 'x')]);
                            return ts.updateExportDeclaration(ed, undefined, undefined, namedExports, ed.moduleSpecifier);
                        }
                        return transformer_util_1.visitEachChildIgnoringTypes(node, visitNode, context);
                    }
                };
            }
            var tsSources = { 'a.ts': "export const x = 1;", 'b.ts': "export * from './a';" };
            var jsSources = emitWithTransform(tsSources, expandExportStar);
            chai_1.expect(jsSources['./b.js']).to.eq([
                MODULE_HEADER,
                "var a_1 = require(\"./a\");",
                "exports.x = a_1.x;",
                "",
            ].join('\n'));
        });
    });
});
function objectToMap(data) {
    var entries = Object.keys(data).map(function (key) { return [key, data[key]]; });
    return new Map(entries);
}

//# sourceMappingURL=transformer_util_test.js.map
