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
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var fs = require("fs");
var glob = require("glob");
var path = require("path");
var ts = require("typescript");
var cliSupport = require("../src/cli_support");
var es5processor = require("../src/es5processor");
var source_map_utils_1 = require("../src/source_map_utils");
var tsickle = require("../src/tsickle");
var util_1 = require("../src/util");
/** Base compiler options to be customized and exposed. */
var baseCompilerOptions = {
    target: ts.ScriptTarget.ES2015,
    // Disable searching for @types typings. This prevents TS from looking
    // around for a node_modules directory.
    types: [],
    skipDefaultLibCheck: true,
    experimentalDecorators: true,
    module: ts.ModuleKind.CommonJS,
    strictNullChecks: true,
    noImplicitUseStrict: true,
};
/** The TypeScript compiler options used by the test suite. */
exports.compilerOptions = __assign({}, baseCompilerOptions, { emitDecoratorMetadata: true, noEmitHelpers: true, jsx: ts.JsxEmit.React, 
    // Flags below are needed to make sure source paths are correctly set on write calls.
    rootDir: path.resolve(process.cwd()), outDir: '.' });
/**
 * Basic compiler options for source map tests. Compose with
 * generateOutfileCompilerOptions() or inlineSourceMapCompilerOptions to
 * customize the options.
 */
exports.sourceMapCompilerOptions = __assign({}, baseCompilerOptions, { inlineSources: true, declaration: true, sourceMap: true });
/**
 * Compose with sourceMapCompiler options if you want to specify an outFile.
 *
 * Controls the name of the file produced by the compiler.  If there's more
 * than one input file, they'll all be concatenated together in the outFile
 */
function generateOutfileCompilerOptions(outFile) {
    return {
        outFile: outFile,
        module: ts.ModuleKind.None,
    };
}
exports.generateOutfileCompilerOptions = generateOutfileCompilerOptions;
/**
 * Compose with sourceMapCompilerOptions if you want inline source maps,
 * instead of different files.
 */
exports.inlineSourceMapCompilerOptions = {
    inlineSourceMap: true,
    sourceMap: false,
};
var _a = (function () {
    var host = ts.createCompilerHost(baseCompilerOptions);
    var fn = host.getDefaultLibFileName(baseCompilerOptions);
    var p = ts.getDefaultLibFilePath(baseCompilerOptions);
    return {
        // Normalize path to fix mixed/wrong directory separators on Windows.
        cachedLibPath: path.normalize(p),
        cachedLib: host.getSourceFile(fn, baseCompilerOptions.target),
    };
})(), cachedLibPath = _a.cachedLibPath, cachedLib = _a.cachedLib;
/** Creates a ts.Program from a set of input files. */
function createProgram(sources, tsCompilerOptions) {
    if (tsCompilerOptions === void 0) { tsCompilerOptions = exports.compilerOptions; }
    return createProgramAndHost(sources, tsCompilerOptions).program;
}
exports.createProgram = createProgram;
function createSourceCachingHost(sources, tsCompilerOptions) {
    if (tsCompilerOptions === void 0) { tsCompilerOptions = exports.compilerOptions; }
    var host = ts.createCompilerHost(tsCompilerOptions);
    host.getSourceFile = function (fileName, languageVersion, onError) {
        // Normalize path to fix wrong directory separators on Windows which
        // would break the equality check.
        fileName = path.normalize(fileName);
        if (fileName === cachedLibPath)
            return cachedLib;
        if (path.isAbsolute(fileName))
            fileName = path.relative(process.cwd(), fileName);
        var contents = sources.get(fileName);
        if (contents !== undefined) {
            return ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
        }
        throw new Error('unexpected file read of ' + fileName + ' not in ' + util_1.toArray(sources.keys()));
    };
    var originalFileExists = host.fileExists;
    host.fileExists = function (fileName) {
        if (path.isAbsolute(fileName))
            fileName = path.relative(process.cwd(), fileName);
        if (sources.has(fileName)) {
            return true;
        }
        return originalFileExists.call(host, fileName);
    };
    return host;
}
exports.createSourceCachingHost = createSourceCachingHost;
function createProgramAndHost(sources, tsCompilerOptions) {
    if (tsCompilerOptions === void 0) { tsCompilerOptions = exports.compilerOptions; }
    var host = createSourceCachingHost(sources);
    var program = ts.createProgram(util_1.toArray(sources.keys()), tsCompilerOptions, host);
    return { program: program, host: host };
}
exports.createProgramAndHost = createProgramAndHost;
/** Emits transpiled output with tsickle postprocessing.  Throws an exception on errors. */
function emit(program) {
    var transformed = {};
    var diagnostics = program.emit(undefined, function (fileName, data) {
        var host = {
            fileNameToModuleId: function (fn) { return fn.replace(/^\.\//, ''); },
            pathToModuleName: cliSupport.pathToModuleName,
            es5Mode: true,
            prelude: '',
        };
        transformed[fileName] = es5processor.processES5(host, fileName, data).output;
    }).diagnostics;
    if (diagnostics.length > 0) {
        throw new Error(tsickle.formatDiagnostics(diagnostics));
    }
    return transformed;
}
exports.emit = emit;
var GoldenFileTest = (function () {
    function GoldenFileTest(path, tsFiles) {
        this.path = path;
        this.tsFiles = tsFiles;
    }
    Object.defineProperty(GoldenFileTest.prototype, "name", {
        get: function () {
            return path.basename(this.path);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoldenFileTest.prototype, "externsPath", {
        get: function () {
            return path.join(this.path, 'externs.js');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoldenFileTest.prototype, "tsPaths", {
        get: function () {
            var _this = this;
            return this.tsFiles.map(function (f) { return path.join(_this.path, f); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoldenFileTest.prototype, "jsPaths", {
        get: function () {
            var _this = this;
            return this.tsFiles.filter(function (f) { return !/\.d\.ts/.test(f); })
                .map(function (f) { return path.join(_this.path, GoldenFileTest.tsPathToJs(f)); });
        },
        enumerable: true,
        configurable: true
    });
    GoldenFileTest.tsPathToJs = function (tsPath) {
        return tsPath.replace(/\.tsx?$/, '.js');
    };
    return GoldenFileTest;
}());
exports.GoldenFileTest = GoldenFileTest;
function goldenTests() {
    var basePath = path.join(__dirname, '..', '..', 'test_files');
    var testNames = fs.readdirSync(basePath);
    var testDirs = testNames.map(function (testName) { return path.join(basePath, testName); })
        .filter(function (testDir) { return fs.statSync(testDir).isDirectory(); });
    var tests = testDirs.map(function (testDir) {
        testDir = path.relative(process.cwd(), testDir);
        var tsPaths = glob.sync(path.join(testDir, '**/*.ts'));
        tsPaths = tsPaths.concat(glob.sync(path.join(testDir, '*.tsx')));
        tsPaths = tsPaths.filter(function (p) { return !p.match(/\.tsickle\./) && !p.match(/\.decorated\./); });
        var tsFiles = tsPaths.map(function (f) { return path.relative(testDir, f); });
        return new GoldenFileTest(testDir, tsFiles);
    });
    return tests;
}
exports.goldenTests = goldenTests;
/**
 * Reads the files from the file system and returns a map from filePaths to
 * file contents.
 */
function readSources(filePaths) {
    var sources = new Map();
    try {
        for (var filePaths_1 = __values(filePaths), filePaths_1_1 = filePaths_1.next(); !filePaths_1_1.done; filePaths_1_1 = filePaths_1.next()) {
            var filePath = filePaths_1_1.value;
            sources.set(filePath, fs.readFileSync(filePath, { encoding: 'utf8' }));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (filePaths_1_1 && !filePaths_1_1.done && (_a = filePaths_1.return)) _a.call(filePaths_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return sources;
    var e_1, _a;
}
exports.readSources = readSources;
function getLineAndColumn(source, token) {
    var lines = source.split('\n');
    var line = lines.findIndex(function (l) { return l.indexOf(token) !== -1; }) + 1;
    if (line === 0) {
        throw new Error("Couldn't find token '" + token + "' in source");
    }
    var column = lines[line - 1].indexOf(token);
    return { line: line, column: column };
}
function assertSourceMapping(compiledJs, sourceMap, sourceSnippet, expectedPosition) {
    var _a = getLineAndColumn(compiledJs, sourceSnippet), line = _a.line, column = _a.column;
    var originalPosition = sourceMap.originalPositionFor({ line: line, column: column });
    if (expectedPosition.line) {
        chai_1.expect(originalPosition.line).to.equal(expectedPosition.line);
    }
    if (expectedPosition.column) {
        chai_1.expect(originalPosition.column).to.equal(expectedPosition.column);
    }
    if (expectedPosition.source) {
        chai_1.expect(originalPosition.source).to.equal(expectedPosition.source);
    }
}
exports.assertSourceMapping = assertSourceMapping;
function extractInlineSourceMap(source) {
    var inlineSourceMapRegex = new RegExp('//# sourceMappingURL=data:application/json;base64,(.*)$', 'mg');
    var previousResult = null;
    var result = null;
    // We want to extract the last source map in the source file
    // since that's probably the most recent one added.  We keep
    // matching against the source until we don't get a result,
    // then we use the previous result.
    do {
        previousResult = result;
        result = inlineSourceMapRegex.exec(source);
    } while (result !== null);
    var base64EncodedMap = previousResult[1];
    var sourceMapJson = Buffer.from(base64EncodedMap, 'base64').toString('utf8');
    return source_map_utils_1.sourceMapTextToConsumer(sourceMapJson);
}
exports.extractInlineSourceMap = extractInlineSourceMap;
function findFileContentsByName(filename, files) {
    var filePaths = util_1.toArray(files.keys());
    try {
        for (var filePaths_2 = __values(filePaths), filePaths_2_1 = filePaths_2.next(); !filePaths_2_1.done; filePaths_2_1 = filePaths_2.next()) {
            var filepath = filePaths_2_1.value;
            if (path.parse(filepath).base === path.parse(filename).base) {
                return files.get(filepath);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (filePaths_2_1 && !filePaths_2_1.done && (_a = filePaths_2.return)) _a.call(filePaths_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    chai_1.assert(undefined, "Couldn't find file " + filename + " in files: " + JSON.stringify(filePaths));
    throw new Error('Unreachable');
    var e_2, _a;
}
exports.findFileContentsByName = findFileContentsByName;
function getSourceMapWithName(filename, files) {
    return source_map_utils_1.sourceMapTextToConsumer(findFileContentsByName(filename, files));
}
exports.getSourceMapWithName = getSourceMapWithName;
/**
 * Compiles with the transformer 'emitWithTsickle()', performing both decorator
 * downleveling and closurization.
 */
function compileWithTransfromer(sources, compilerOptions) {
    var fileNames = util_1.toArray(sources.keys());
    var tsHost = createSourceCachingHost(sources, compilerOptions);
    var program = ts.createProgram(fileNames, compilerOptions, tsHost);
    chai_1.expect(ts.getPreEmitDiagnostics(program))
        .lengthOf(0, tsickle.formatDiagnostics(ts.getPreEmitDiagnostics(program)));
    var transformerHost = {
        shouldSkipTsickleProcessing: function (filePath) { return !sources.has(filePath); },
        pathToModuleName: cliSupport.pathToModuleName,
        shouldIgnoreWarningsForPath: function (filePath) { return false; },
        fileNameToModuleId: function (filePath) { return filePath; },
        transformDecorators: true,
        transformTypesToClosure: true,
        googmodule: true,
        es5Mode: false,
        untyped: false,
    };
    var files = new Map();
    var _a = tsickle.emitWithTsickle(program, transformerHost, tsHost, compilerOptions, undefined, function (path, contents) {
        files.set(path, contents);
    }), diagnostics = _a.diagnostics, externs = _a.externs;
    // tslint:disable-next-line:no-unused-expression
    chai_1.expect(diagnostics, tsickle.formatDiagnostics(diagnostics)).to.be.empty;
    return { files: files, externs: externs };
}
exports.compileWithTransfromer = compileWithTransfromer;

//# sourceMappingURL=test_support.js.map
