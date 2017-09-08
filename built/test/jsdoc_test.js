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
var jsdoc = require("../src/jsdoc");
describe('jsdoc.parse', function () {
    it('does not get non-jsdoc values', function () {
        var source = '/* ordinary comment */';
        chai_1.expect(jsdoc.parse(source)).to.equal(null);
    });
    it('grabs plain text from jsdoc', function () {
        var source = '/** jsdoc comment */';
        chai_1.expect(jsdoc.parse(source)).to.deep.equal({ tags: [{ tagName: '', text: 'jsdoc comment' }] });
    });
    it('gathers @tags from jsdoc', function () {
        var source = "/**\n  * @param foo\n  * @param bar multiple\n  *    line comment\n  * @return foobar\n  * @nosideeffects\n  */";
        chai_1.expect(jsdoc.parse(source)).to.deep.equal({
            tags: [
                { tagName: 'param', parameterName: 'foo' },
                { tagName: 'param', parameterName: 'bar', text: 'multiple\n   line comment' },
                { tagName: 'return', text: 'foobar' },
                { tagName: 'nosideeffects' },
            ]
        });
    });
    it('warns on type annotations in parameters', function () {
        var source = "/**\n  * @param {string} foo\n*/";
        chai_1.expect(jsdoc.parse(source)).to.deep.equal({
            tags: [],
            warnings: [
                'the type annotation on @param is redundant with its TypeScript type, remove the {...} part'
            ]
        });
    });
    it('warns on @type annotations', function () {
        var source = "/** @type {string} foo */";
        chai_1.expect(jsdoc.parse(source)).to.deep.equal({
            tags: [],
            warnings: ['@type annotations are redundant with TypeScript equivalents']
        });
    });
    it('allows @suppress annotations', function () {
        var source = "/** @suppress {checkTypes} I hate types */";
        chai_1.expect(jsdoc.parse(source)).to.deep.equal({
            tags: [{ tagName: 'suppress', type: 'checkTypes', text: ' I hate types' }]
        });
        var malformed = "/** @suppress malformed */";
        chai_1.expect(jsdoc.parse(malformed)).to.deep.equal({
            tags: [{ tagName: 'suppress', text: 'malformed' }],
            warnings: ['malformed @suppress tag: "malformed"'],
        });
    });
});
describe('jsdoc.toString', function () {
    it('filters duplicated @deprecated tags', function () {
        chai_1.expect(jsdoc.toString([
            { tagName: 'deprecated' }, { tagName: 'param', parameterName: 'hello', text: 'world' },
            { tagName: 'deprecated' }
        ])).to.equal("/**\n * @deprecated\n * @param hello world\n */\n");
    });
});

//# sourceMappingURL=jsdoc_test.js.map
