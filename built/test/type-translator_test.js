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
var typeTranslator = require("../src/type-translator");
describe('isBuiltinLibDTS', function () {
    it('matches builtins', function () {
        chai_1.expect(typeTranslator.isBuiltinLibDTS('lib.d.ts')).to.equal(true);
        chai_1.expect(typeTranslator.isBuiltinLibDTS('lib.es6.d.ts')).to.equal(true);
    });
    it('doesn\'t match others', function () {
        chai_1.expect(typeTranslator.isBuiltinLibDTS('lib.ts')).to.equal(false);
        chai_1.expect(typeTranslator.isBuiltinLibDTS('libfoo.d.tts')).to.equal(false);
        chai_1.expect(typeTranslator.isBuiltinLibDTS('lib.a/b.d.tts')).to.equal(false);
    });
});

//# sourceMappingURL=type-translator_test.js.map
