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
var cliSupport = require("../src/cli_support");
var es5processor = require("../src/es5processor");
describe('convertCommonJsToGoogModule', function () {
    function processES5(fileName, content, isES5, prelude) {
        if (isES5 === void 0) { isES5 = true; }
        if (prelude === void 0) { prelude = ''; }
        var host = {
            fileNameToModuleId: function (fn) { return fn; },
            pathToModuleName: cliSupport.pathToModuleName,
            es5Mode: isES5,
            prelude: prelude,
        };
        return es5processor.processES5(host, fileName, content);
    }
    function expectCommonJs(fileName, content, isES5, prelude) {
        if (isES5 === void 0) { isES5 = true; }
        if (prelude === void 0) { prelude = ''; }
        return chai_1.expect(processES5(fileName, content, isES5, prelude).output);
    }
    it('adds a goog.module call', function () {
        // NB: no line break added below.
        expectCommonJs('a.js', "console.log('hello');")
            .to.equal("goog.module('a');var module = module || {id: 'a.js'};console.log('hello');");
    });
    it('adds a goog.module call for ES6 mode', function () {
        // NB: no line break added below.
        expectCommonJs('a.js', "console.log('hello');", false)
            .to.equal("goog.module('a'); exports = {}; var module = {id: 'a.js'};console.log('hello');");
    });
    it('adds a goog.module call to empty files', function () {
        expectCommonJs('a.js', "").to.equal("goog.module('a');var module = module || {id: 'a.js'};");
    });
    it('adds a goog.module call to empty-looking files', function () {
        expectCommonJs('a.js', "// empty")
            .to.equal("goog.module('a');var module = module || {id: 'a.js'};// empty");
    });
    it('strips use strict directives', function () {
        // NB: no line break added below.
        expectCommonJs('a.js', "\"use strict\";\nconsole.log('hello');")
            .to.equal("goog.module('a');var module = module || {id: 'a.js'};\nconsole.log('hello');");
    });
    it('converts require calls', function () {
        expectCommonJs('a.js', "var r = require('req/mod');")
            .to.equal("goog.module('a');var module = module || {id: 'a.js'};" +
            "var r = goog.require('req.mod');");
    });
    it('converts require calls without assignments on first line', function () {
        expectCommonJs('a.js', "require('req/mod');")
            .to.equal("goog.module('a');var module = module || {id: 'a.js'};" +
            "var tsickle_module_0_ = goog.require('req.mod');");
    });
    it('converts require calls without assignments on a new line', function () {
        expectCommonJs('a.js', "\nrequire('req/mod');\nrequire('other');").to.equal("goog.module('a');var module = module || {id: 'a.js'};\nvar tsickle_module_0_ = goog.require('req.mod');\nvar tsickle_module_1_ = goog.require('other');");
    });
    it('converts require calls without assignments after comments', function () {
        expectCommonJs('a.js', "\n// Comment\nrequire('req/mod');").to.equal("goog.module('a');var module = module || {id: 'a.js'};\n// Comment\nvar tsickle_module_0_ = goog.require('req.mod');");
    });
    it('converts const require calls', function () {
        expectCommonJs('a.js', "const r = require('req/mod');")
            .to.equal("goog.module('a');var module = module || {id: 'a.js'};" +
            "var r = goog.require('req.mod');");
    });
    describe('ES5 export *', function () {
        it('converts export * statements', function () {
            expectCommonJs('a.js', "__export(require('req/mod'));")
                .to.equal("goog.module('a');var module = module || {id: 'a.js'};var tsickle_module_0_ = goog.require('req.mod');__export(tsickle_module_0_);");
        });
        it('uses correct module name with subsequent exports', function () {
            expectCommonJs('a.js', "__export(require('req/mod'));\nvar mod2 = require('req/mod');")
                .to.equal("goog.module('a');var module = module || {id: 'a.js'};var tsickle_module_0_ = goog.require('req.mod');__export(tsickle_module_0_);\nvar mod2 = tsickle_module_0_;");
        });
        it('reuses an existing imported variable name', function () {
            expectCommonJs('a.js', "var mod = require('req/mod');\n__export(require('req/mod'));")
                .to.equal("goog.module('a');var module = module || {id: 'a.js'};var mod = goog.require('req.mod');\n__export(mod);");
        });
    });
    it('resolves relative module URIs', function () {
        // See below for more fine-grained unit tests.
        expectCommonJs('a/b.js', "var r = require('./req/mod');")
            .to.equal("goog.module('a.b');var module = module || {id: 'a/b.js'};var r = goog.require('a.req.mod');");
    });
    it('avoids mangling module names in goog: imports', function () {
        expectCommonJs('a/b.js', "\nvar goog_use_Foo_1 = require('goog:foo_bar.baz');")
            .to.equal("goog.module('a.b');var module = module || {id: 'a/b.js'};\nvar goog_use_Foo_1 = goog.require('foo_bar.baz');");
    });
    it('resolves default goog: module imports', function () {
        expectCommonJs('a/b.js', "\nvar goog_use_Foo_1 = require('goog:use.Foo');\nconsole.log(goog_use_Foo_1.default);")
            .to.equal("goog.module('a.b');var module = module || {id: 'a/b.js'};\nvar goog_use_Foo_1 = goog.require('use.Foo');\nconsole.log(goog_use_Foo_1        );");
        // NB: the whitespace above matches the .default part, so that
        // source maps are not impacted.
    });
    it('leaves single .default accesses alone', function () {
        // This is a repro for a bug when no goog: symbols are found.
        expectCommonJs('a/b.js', "\nconsole.log(this.default);\nconsole.log(foo.bar.default);")
            .to.equal("goog.module('a.b');var module = module || {id: 'a/b.js'};\nconsole.log(this.default);\nconsole.log(foo.bar.default);");
    });
    it('inserts the module after "use strict"', function () {
        expectCommonJs('a/b.js', "/**\n* docstring here\n*/\n\"use strict\";\nvar foo = bar;\n").to.equal("goog.module('a.b');var module = module || {id: 'a/b.js'};/**\n* docstring here\n*/\n\nvar foo = bar;\n");
    });
    it('deduplicates module imports', function () {
        expectCommonJs('a/b.js', "var foo_1 = require('goog:foo');\nvar foo_2 = require('goog:foo');\nfoo_1.A, foo_2.B, foo_2.default, foo_3.default;\n")
            .to.equal("goog.module('a.b');var module = module || {id: 'a/b.js'};var foo_1 = goog.require('foo');\nvar foo_2 = foo_1;\nfoo_1.A, foo_2.B, foo_2        , foo_3.default;\n");
    });
    it('gathers referenced modules', function () {
        var referencedModules = processES5('a/b', "\nrequire('../foo/bare_require');\nvar googRequire = require('goog:foo.bar');\nvar es6RelativeRequire = require('./relative');\nvar es6NonRelativeRequire = require('non/relative');\n__export(require('./export_star');\n").referencedModules;
        return chai_1.expect(referencedModules).to.deep.equal([
            'foo.bare_require',
            'foo.bar',
            'a.relative',
            'non.relative',
            'a.export_star',
        ]);
    });
    it('inserts a prelude', function () {
        expectCommonJs('a.js', "console.log('hello');", false, "goog.require('tshelpers');")
            .to.equal("goog.module('a');goog.require('tshelpers'); " +
            "exports = {}; var module = {id: 'a.js'};" +
            "console.log('hello');");
    });
});

//# sourceMappingURL=es5processor_test.js.map
