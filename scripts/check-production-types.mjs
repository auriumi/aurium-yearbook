import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const projectRoot = path.resolve(import.meta.dirname, '..');
const configPath = path.join(projectRoot, 'tsconfig.build.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
assert.equal(configFile.error, undefined, 'Production TypeScript configuration must be readable.');
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, projectRoot);
assert.deepEqual(config.errors, [], 'Production TypeScript configuration must be valid.');
assert.equal(config.options.strict, true, 'Production builds must retain strict checking.');
assert.equal(config.options.noEmit, true, 'The type checker must not emit application files.');

const includedFiles = new Set(config.fileNames.map((file) => path.resolve(file)));
const devTypes = path.join(projectRoot, '.next', 'dev', 'types');
assert.ok(fs.existsSync(path.join(devTypes, 'validator.ts')), 'Run the stale development fixture before building.');
for (const file of includedFiles) {
  assert.ok(!file.startsWith(devTypes + path.sep), `Development types were included: ${file}`);
}
for (const file of ts.sys.readDirectory(path.join(projectRoot, 'src'), ['.ts', '.tsx'])) {
  assert.ok(includedFiles.has(path.resolve(file)), `Application source was excluded: ${file}`);
}
assert.ok(includedFiles.has(path.join(projectRoot, '.next', 'types', 'validator.ts')),
  'Generated production route validation must remain included. Run the production build first.');

// Check that strict null errors still surface, without changing an application file.
const probePath = path.join(projectRoot, 'src', '__production_type_probe__.ts');
const probe = ts.createSourceFile(probePath, 'const value: string = null; export {};', ts.ScriptTarget.Latest, true);
const host = ts.createCompilerHost(config.options);
const readSource = host.getSourceFile.bind(host);
host.getSourceFile = (file, ...args) => path.resolve(file) === probePath ? probe : readSource(file, ...args);
const program = ts.createProgram([probePath], config.options, host);
assert.ok(program.getSemanticDiagnostics(probe).some((diagnostic) => diagnostic.code === 2322),
  'An invalid application type must still produce a TypeScript error.');

console.log('Production checks retain application and route types, reject invalid types, and exclude stale development types.');
