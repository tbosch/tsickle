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
var sourceMapUtils = require("../src/source_map_utils");
var SOURCE_MAP_COMMENT = '//# sourceMappingURL=data:application/json;base64,';
describe('source map utils', function () {
    it('calculates the number of inline source maps', function () {
        var one = SOURCE_MAP_COMMENT + "foo";
        chai_1.expect(sourceMapUtils.getInlineSourceMapCount(one)).to.equal(1);
        var two = SOURCE_MAP_COMMENT + "foo\n" + SOURCE_MAP_COMMENT + "bar";
        chai_1.expect(sourceMapUtils.getInlineSourceMapCount(two)).to.equal(2);
    });
    it('extracts the last inline source map', function () {
        var foo = "" + SOURCE_MAP_COMMENT + encode('foo');
        chai_1.expect(sourceMapUtils.extractInlineSourceMap(foo)).to.equal('foo');
        var foobar = "" + SOURCE_MAP_COMMENT + encode('foo') + "\n" + SOURCE_MAP_COMMENT + encode('bar');
        chai_1.expect(sourceMapUtils.extractInlineSourceMap(foobar)).to.equal('bar');
        var foobarbaz = "" + SOURCE_MAP_COMMENT + encode('foo') + "\n" +
            ("" + SOURCE_MAP_COMMENT + encode('bar') + "\n") +
            ("" + SOURCE_MAP_COMMENT + encode('baz'));
        chai_1.expect(sourceMapUtils.extractInlineSourceMap(foobarbaz)).to.equal('baz');
    });
});
function encode(s) {
    return Buffer.from(s, 'utf8').toString('base64');
}

//# sourceMappingURL=source_map_utils_test.js.map
