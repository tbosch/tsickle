"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-unused-expression mocha .to.be.empty getters.
var chai_1 = require("chai");
var source_map_1 = require("source-map");
var decorator_annotator_1 = require("../src/decorator-annotator");
var source_map_utils_1 = require("../src/source_map_utils");
var tsickle = require("../src/tsickle");
var testSupport = require("./test_support");
var testCaseFileName = 'testcase.ts';
function sources(sourceText) {
    var sources = new Map([
        [testCaseFileName, sourceText],
        ['bar.d.ts', 'declare module "bar" { export class BarService {} }']
    ]);
    return sources;
}
function verifyCompiles(sourceText) {
    // This throws an exception on error.
    testSupport.createProgram(sources(sourceText));
}
describe('decorator-annotator', function () {
    function translate(sourceText, allowErrors) {
        if (allowErrors === void 0) { allowErrors = false; }
        var program = testSupport.createProgram(sources(sourceText));
        var sourceMapper = new source_map_utils_1.DefaultSourceMapper(testCaseFileName);
        var _a = decorator_annotator_1.convertDecorators(program.getTypeChecker(), program.getSourceFile(testCaseFileName), sourceMapper), output = _a.output, diagnostics = _a.diagnostics;
        if (!allowErrors)
            chai_1.expect(diagnostics).to.be.empty;
        verifyCompiles(output);
        return { output: output, diagnostics: diagnostics, sourceMap: sourceMapper.sourceMap };
    }
    function expectUnchanged(sourceText) {
        chai_1.expect(translate(sourceText).output).to.equal(sourceText);
    }
    it('generates a source map', function () {
        var _a = translate("\n/** @Annotation */ let Test1: Function;\n@Test1\nexport class Foo {\n}\nlet X = 'a string';"), output = _a.output, sourceMap = _a.sourceMap;
        var rawMap = sourceMap.toJSON();
        var consumer = new source_map_1.SourceMapConsumer(rawMap);
        var lines = output.split('\n');
        var stringXLine = lines.findIndex(function (l) { return l.indexOf('a string') !== -1; }) + 1;
        chai_1.expect(consumer.originalPositionFor({ line: stringXLine, column: 10 }).line)
            .to.equal(6, 'string X definition');
    });
    describe('class decorator rewriter', function () {
        it('leaves plain classes alone', function () {
            expectUnchanged("class Foo {}");
        });
        it('leaves un-marked decorators alone', function () {
            expectUnchanged("\n          let Decor: Function;\n          @Decor class Foo {\n            constructor(@Decor p: number) {}\n            @Decor m(): void {}\n          }");
        });
        it('transforms decorated classes', function () {
            chai_1.expect(translate("\n/** @Annotation */ let Test1: Function;\n/** @Annotation */ let Test2: Function;\nlet param: any;\n@Test1\n@Test2(param)\nclass Foo {\n  field: string;\n}").output).to.equal("\n/** @Annotation */ let Test1: Function;\n/** @Annotation */ let Test2: Function;\nlet param: any;\n\n\nclass Foo {\n  field: string;\nstatic decorators: {type: Function, args?: any[]}[] = [\n{ type: Test1 },\n{ type: Test2, args: [param, ] },\n];\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n];\n}");
        });
        it('transforms decorated classes with function expression annotation declaration', function () {
            chai_1.expect(translate("\n/** @Annotation */ function Test() {};\n@Test\nclass Foo {\n  field: string;\n}").output).to.equal("\n/** @Annotation */ function Test() {};\n\nclass Foo {\n  field: string;\nstatic decorators: {type: Function, args?: any[]}[] = [\n{ type: Test },\n];\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n];\n}");
        });
        it('transforms decorated classes with an exported annotation declaration', function () {
            chai_1.expect(translate("\n/** @Annotation */ export let Test: Function;\n@Test\nclass Foo {\n  field: string;\n}").output).to.equal("\n/** @Annotation */ export let Test: Function;\n\nclass Foo {\n  field: string;\nstatic decorators: {type: Function, args?: any[]}[] = [\n{ type: Test },\n];\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n];\n}");
        });
        it('accepts various complicated decorators', function () {
            chai_1.expect(translate("\n/** @Annotation */ let Test1: Function;\n/** @Annotation */ let Test2: Function;\n/** @Annotation */ let Test3: Function;\n/** @Annotation */ function Test4<T>(param: any): ClassDecorator { return null; }\nlet param: any;\n@Test1({name: 'percentPipe'}, class ZZZ {})\n@Test2\n@Test3()\n@Test4<string>(param)\nclass Foo {\n}").output).to.equal("\n/** @Annotation */ let Test1: Function;\n/** @Annotation */ let Test2: Function;\n/** @Annotation */ let Test3: Function;\n/** @Annotation */ function Test4<T>(param: any): ClassDecorator { return null; }\nlet param: any;\n\n\n\n\nclass Foo {\nstatic decorators: {type: Function, args?: any[]}[] = [\n{ type: Test1, args: [{name: 'percentPipe'}, class ZZZ {}, ] },\n{ type: Test2 },\n{ type: Test3 },\n{ type: Test4, args: [param, ] },\n];\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n];\n}");
        });
        it("doesn't eat 'export'", function () {
            chai_1.expect(translate("\n/** @Annotation */ let Test1: Function;\n@Test1\nexport class Foo {\n}").output).to.equal("\n/** @Annotation */ let Test1: Function;\n\nexport class Foo {\nstatic decorators: {type: Function, args?: any[]}[] = [\n{ type: Test1 },\n];\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n];\n}");
        });
        it("handles nested classes", function () {
            chai_1.expect(translate("\n/** @Annotation */ let Test1: Function;\n/** @Annotation */ let Test2: Function;\n@Test1\nexport class Foo {\n  foo() {\n    @Test2\n    class Bar {\n    }\n  }\n}").output).to.equal("\n/** @Annotation */ let Test1: Function;\n/** @Annotation */ let Test2: Function;\n\nexport class Foo {\n  foo() {\n    \n    class Bar {\n    static decorators: {type: Function, args?: any[]}[] = [\n{ type: Test2 },\n];\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n];\n}\n  }\nstatic decorators: {type: Function, args?: any[]}[] = [\n{ type: Test1 },\n];\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n];\n}");
        });
    });
    describe('ctor decorator rewriter', function () {
        it('ignores ctors that have no applicable injects', function () {
            expectUnchanged("\nimport {BarService} from 'bar';\nclass Foo {\n  constructor(bar: BarService, num: number) {\n  }\n}");
        });
        it('transforms injected ctors', function () {
            chai_1.expect(translate("\n/** @Annotation */ let Inject: Function;\nenum AnEnum { ONE, TWO, };\nabstract class AbstractService {}\nclass Foo {\n  constructor(@Inject bar: AbstractService, @Inject('enum') num: AnEnum) {\n  }\n}").output).to.equal("\n/** @Annotation */ let Inject: Function;\nenum AnEnum { ONE, TWO, };\nabstract class AbstractService {}\nclass Foo {\n  constructor( bar: AbstractService,  num: AnEnum) {\n  }\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n{type: AbstractService, decorators: [{ type: Inject }, ]},\n{type: AnEnum, decorators: [{ type: Inject, args: ['enum', ] }, ]},\n];\n}");
        });
        it('stores non annotated parameters if the class has at least one decorator', function () {
            chai_1.expect(translate("\nimport {BarService} from 'bar';\n/** @Annotation */ let Test1: Function;\n@Test1()\nclass Foo {\n  constructor(bar: BarService, num: number) {\n  }\n}").output).to.equal("\nimport {BarService} from 'bar';\n/** @Annotation */ let Test1: Function;\n\nclass Foo {\n  constructor(bar: BarService, num: number) {\n  }\nstatic decorators: {type: Function, args?: any[]}[] = [\n{ type: Test1 },\n];\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n{type: BarService, },\nnull,\n];\n}");
        });
        it('handles complex ctor parameters', function () {
            chai_1.expect(translate("\nimport * as bar from 'bar';\n/** @Annotation */ let Inject: Function;\nlet param: any;\nclass Foo {\n  constructor(@Inject(param) x: bar.BarService, {a, b}, defArg = 3, optional?: bar.BarService) {\n  }\n}").output).to.equal("\nimport * as bar from 'bar';\n/** @Annotation */ let Inject: Function;\nlet param: any;\nclass Foo {\n  constructor( x: bar.BarService, {a, b}, defArg = 3, optional?: bar.BarService) {\n  }\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n{type: bar.BarService, decorators: [{ type: Inject, args: [param, ] }, ]},\nnull,\nnull,\n{type: bar.BarService, },\n];\n}");
        });
        it('includes decorators for primitive type ctor parameters', function () {
            chai_1.expect(translate("\n/** @Annotation */ let Inject: Function;\nlet APP_ID: any;\nclass ViewUtils {\n  constructor(@Inject(APP_ID) private _appId: string) {}\n}").output).to.equal("\n/** @Annotation */ let Inject: Function;\nlet APP_ID: any;\nclass ViewUtils {\n  constructor( private _appId: string) {}\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n{type: undefined, decorators: [{ type: Inject, args: [APP_ID, ] }, ]},\n];\n}");
        });
        it('strips generic type arguments', function () {
            chai_1.expect(translate("\n/** @Annotation */ let Inject: Function;\nclass Foo {\n  constructor(@Inject typed: Promise<string>) {\n  }\n}").output).to.equal("\n/** @Annotation */ let Inject: Function;\nclass Foo {\n  constructor( typed: Promise<string>) {\n  }\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n{type: Promise, decorators: [{ type: Inject }, ]},\n];\n}");
        });
        it('avoids using interfaces as values', function () {
            chai_1.expect(translate("\n/** @Annotation */ let Inject: Function = null;\nclass Class {}\ninterface Iface {}\nclass Foo {\n  constructor(@Inject aClass: Class, @Inject aIface: Iface) {}\n}").output).to.equal("\n/** @Annotation */ let Inject: Function = null;\nclass Class {}\ninterface Iface {}\nclass Foo {\n  constructor( aClass: Class,  aIface: Iface) {}\n/** @nocollapse */\nstatic ctorParameters: () => ({type: any, decorators?: {type: Function, args?: any[]}[]}|null)[] = () => [\n{type: Class, decorators: [{ type: Inject }, ]},\n{type: undefined, decorators: [{ type: Inject }, ]},\n];\n}");
        });
    });
    describe('method decorator rewriter', function () {
        it('leaves ordinary methods alone', function () {
            expectUnchanged("\nclass Foo {\n  bar() {}\n}");
        });
        it('gathers decorators from methods', function () {
            chai_1.expect(translate("\n/** @Annotation */ let Test1: Function;\nclass Foo {\n  @Test1('somename')\n  bar() {}\n}").output).to.equal("\n/** @Annotation */ let Test1: Function;\nclass Foo {\n  \n  bar() {}\nstatic propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {\n\"bar\": [{ type: Test1, args: ['somename', ] },],\n};\n}");
        });
        it('gathers decorators from fields and setters', function () {
            chai_1.expect(translate("\n/** @Annotation */ let PropDecorator: Function;\nclass ClassWithDecorators {\n  @PropDecorator(\"p1\") @PropDecorator(\"p2\") a;\n  b;\n\n  @PropDecorator(\"p3\")\n  set c(value) {}\n}").output).to.equal("\n/** @Annotation */ let PropDecorator: Function;\nclass ClassWithDecorators {\n    a;\n  b;\n\n  \n  set c(value) {}\nstatic propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {\n\"a\": [{ type: PropDecorator, args: [\"p1\", ] },{ type: PropDecorator, args: [\"p2\", ] },],\n\"c\": [{ type: PropDecorator, args: [\"p3\", ] },],\n};\n}");
        });
        it('errors on weird class members', function () {
            var diagnostics = translate("\n/** @Annotation */ let Test1: Function;\nlet param: any;\nclass Foo {\n  @Test1('somename')\n  [param]() {}\n}", true /* allow errors */).diagnostics;
            chai_1.expect(tsickle.formatDiagnostics(diagnostics))
                .to.equal('Error at testcase.ts:5:3: cannot process decorators on strangely named method');
        });
        it('avoids mangling code relying on ASI', function () {
            chai_1.expect(translate("\n/** @Annotation */ let PropDecorator: Function;\nclass Foo {\n  missingSemi = () => {}\n  @PropDecorator other: number;\n}").output).to.equal("\n/** @Annotation */ let PropDecorator: Function;\nclass Foo {\n  missingSemi = () => {}\n   other: number;\nstatic propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {\n\"other\": [{ type: PropDecorator },],\n};\n}");
        });
    });
});

//# sourceMappingURL=decorator-annotator_test.js.map
