const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src/features/graduate-information');
function load(name) {
  const source = fs.readFileSync(path.join(root, name + '.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const sandbox = { exports: {} };
  vm.runInNewContext(compiled, sandbox);
  return sandbox.exports;
}
const { filterInformationRows, informationCounts, academicFilterOptions, matchesInformationQueue, compareFirstNames, emptyFilters, noMajor } = load('model');
const { sampleInformationRows: rows } = load('sample-data');
const originalOrder = rows.map(row => row.studentNumber).join(',');
const sorted = filterInformationRows(rows, emptyFilters);
assert.equal(sorted.map(row => row.firstName).join(','), 'Alexandra,Andrea,Camille,Daniel,Gabriel,Isabella,Luis,Miguel,Sofia');
assert.equal(rows.map(row => row.studentNumber).join(','), originalOrder, 'Filtering must not mutate supplied records');
assert.ok(compareFirstNames({ ...rows[0], firstName: 'Amy', lastName: 'Zulu' }, { ...rows[0], firstName: 'Zoe', lastName: 'Adams' }) < 0);
assert.equal(filterInformationRows(rows, { ...emptyFilters, search: '  miguel   SANTOS  ' })[0].studentNumber, '20260002');
assert.equal(filterInformationRows(rows, { ...emptyFilters, search: '20260007' })[0].firstName, 'Isabella');
assert.equal(filterInformationRows(rows, { ...emptyFilters, search: 'no matching graduate' }).length, 0);
const counts = informationCounts(rows);
assert.equal(counts.all, 9);
assert.equal(counts.pending, 1, 'Unchecked and not-listed records are excluded from Pending');
assert.equal(counts.completed, 1);
for (const row of rows.filter(row => row.verification !== 'verified')) {
  assert.equal(matchesInformationQueue(row, 'all'), true);
  for (const queue of Object.keys(counts).filter(value => value !== 'all')) assert.equal(matchesInformationQueue(row, queue), false);
}
assert.equal(matchesInformationQueue(rows.find(row => row.informationStatus === 'submitted-moderator'), 'approved-qc'), false, 'Forwarded records must not remain in Approved by QC');
const engineering = filterInformationRows(rows, { ...emptyFilters, department: 'Engineering Education' });
assert.equal(engineering.length, 2);
assert.equal(informationCounts(engineering)['rejected-moderator'], 1);
assert.equal(informationCounts(engineering).completed, 0, 'Summary counts must use filtered scope');
const academic = academicFilterOptions(rows, { ...emptyFilters, department: 'Teacher Education', program: 'Bachelor of Secondary Education' });
assert.equal(academic.programs.join(','), 'Bachelor of Secondary Education');
assert.equal(academic.majors.join(','), 'English');
assert.equal(filterInformationRows(rows, { ...emptyFilters, major: noMajor }).length, 6);
assert.equal(filterInformationRows(rows, { ...emptyFilters, department: 'Teacher Education', program: 'BS Computer Science' }).length, 0);
assert.equal(informationCounts([]).all, 0);
console.log('Information workspace checks passed: sorting, search, dependent options, scoped counts, RAC eligibility, and empty results.');
