/* eslint-disable @typescript-eslint/no-require-imports -- Standalone checks use the existing TypeScript toolchain. */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative, context) {
  const filename = path.join(__dirname, '../src', relative);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const sandbox = { exports: {}, URLSearchParams, AbortController, Date, console,
    process: { env: {} }, ...context };
  vm.runInNewContext(outputText, sandbox, { filename });
  return sandbox.exports;
}

test('daily targets preserve retry/version data, credentials and request cancellation', async () => {
  let last;
  const api = load('features/proofreading-targets/api.ts', { fetch: async (url, init) => {
    last = { url: new URL(url, 'http://localhost'), init };
    return { ok: true, json: async () => ({ success: true }) };
  } });
  const cycle = { year: 2026, term: 'END_YEAR' }, signal = new AbortController().signal;
  await api.getMyProgress(cycle, signal);
  assert.equal(last.url.pathname, '/api/v1/admin/proofreading-targets/me');
  assert.equal(last.url.searchParams.has('date'), false); // Server owns the day boundary.
  assert.equal(last.init.signal, signal);
  for (const role of ['INFORMATION_PROOFREADER', 'INFORMATION_QC', 'PHOTO_UPLOADER', 'PHOTO_QC', 'FINAL_MODERATOR']) {
    await api.getMyProgress({ ...cycle, role }, signal);
    assert.equal(last.url.searchParams.get('role'), role);
    await api.getTargets({ ...cycle, role }, '2026-10-26', 1, '', '', signal);
    assert.equal(last.url.searchParams.get('role'), role);
    await api.getTargetSchedule({ ...cycle, role }, [1], ['2026-10-26'], signal);
    assert.equal(last.url.searchParams.get('role'), role);
    await api.saveTargets({ ...cycle, role }, [], 'Role test', 'role-key');
    assert.equal(JSON.parse(last.init.body).role, role);
  }
  await api.getTargets(cycle, '2026-10-26', 2, 'A & B', 'DAE', signal);
  assert.equal(last.url.searchParams.get('search'), 'A & B');
  assert.equal(last.url.searchParams.get('page'), '2');
  await api.getTargetSchedule(cycle, [1, 2], ['2026-10-26', '2026-10-27'], signal);
  assert.equal(last.url.searchParams.get('staffIds'), '1,2');
  const entries = [{ staffId: 1, date: '2026-10-26', count: 30, expectedVersion: 2 }];
  await api.saveTargets(cycle, entries, 'Meeting adjustment', 'retry-key');
  assert.equal(last.init.method, 'PUT');
  assert.equal(last.init.credentials, 'include');
  assert.equal(last.init.cache, 'no-store');
  assert.deepEqual(JSON.parse(last.init.body), { ...cycle, entries, reason: 'Meeting adjustment', operationId: 'retry-key' });
  await api.getTargetHistory(5, 2, signal);
  assert.equal(last.url.pathname, '/api/v1/admin/proofreading-targets/5/history');
  const stale = load('features/proofreading-targets/api.ts', { fetch: async () => ({ ok: false,
    json: async () => ({ success: false, reason: 'Refresh the target' }) }) });
  await assert.rejects(stale.saveTargets(cycle, entries, '', 'retry-key'), /Refresh the target/);
});

test('review clients send canonical paths with credentials and unchanged request bodies', async () => {
  let last;
  const context = { fetch: async (url, init) => {
    last = { url: new URL(url, 'http://localhost'), init };
    return { ok: true, status: 200, json: async () => ({ success: true }) };
  } };
  const info = load('features/graduate-information/api.ts', context);
  const photos = load('features/graduate-photos/api.ts', context);
  const rac = load('features/rac-verification/api.ts', context);
  const staff = load('features/staff-assignments/api.ts', context);
  const corrections = load('features/corrections/api.ts', context);
  const filters = { year: 2026, term: 'FIRST', page: 2, queue: 'pending', stage: 'DRAFT', verification: 'ALL', department: 'Engineering' };
  const signal = new AbortController().signal;
  async function check(action, method, pathname, body) {
    await action();
    assert.equal(last.url.pathname, '/api/v1/admin' + pathname);
    assert.equal(last.init.method || 'GET', method);
    assert.equal(last.init.credentials, 'include');
    assert.equal(last.init.cache, 'no-store');
    if (body) assert.deepEqual(JSON.parse(last.init.body), body);
  }
  await check(() => rac.getReviewCapabilities(signal), 'GET', '/capabilities');
  assert.equal(last.init.signal, signal);
  await check(() => rac.getVerificationList(filters), 'GET', '/rac/graduates');
  assert.equal(last.url.searchParams.get('department'), 'Engineering');
  await check(() => rac.getFilterOptions(filters), 'GET', '/rac/graduates/filter-options');
  await check(() => rac.getVerificationHistory(99000001, filters), 'GET', '/rac/graduates/99000001/verification-events');
  await check(() => rac.submitVerification([{ studentNumber: 99000001, version: 3 }], 'VERIFIED', filters, 'RAC 1', 'op'), 'POST', '/rac/verification-batches');
  assert.deepEqual(JSON.parse(last.init.body).expectedVersions, { 99000001: 3 });
  assert.equal(JSON.parse(last.init.body).sourceVersion, 'RAC 1');
  await check(() => staff.getStaff('Ana', 2, signal), 'GET', '/staff');
  const scope = { department: 'Engineering', course: null, major: null };
  await check(() => staff.grantDesignation(8, 'PHOTO_QC', scope), 'POST', '/assignments', { adminId: 8, capability: 'PHOTO_QC', scope });
  await check(() => staff.revokeDesignation(8), 'PATCH', '/assignments/8', { active: false });
  await check(() => info.getInformationList(filters), 'GET', '/information/reviews');
  await check(() => info.getInformationOptions(filters), 'GET', '/information/reviews/filter-options');
  await check(() => info.getInformationDetail(12), 'GET', '/information/reviews/12');
  await check(() => info.getInformationDraftHistory(12), 'GET', '/information/reviews/12/revisions');
  await check(() => info.getInformationDecisionHistory(12), 'GET', '/information/reviews/12/decision-events');
  await check(() => info.saveInformationDraft(12, 3, { firstName: 'Ana' }, 'op'), 'PATCH', '/information/reviews/12/draft');
  await check(() => info.submitInformationReview(12, 3, 8, 'op'), 'POST', '/information/reviews/12/submissions', { expectedVersion: 3, revisionId: 8, operationId: 'op' });
  await check(() => info.decideInformationQc(12, 3, 8, 'op', 'REJECT', 'Check name'), 'POST', '/information/reviews/12/qc-decisions');
  await check(() => info.decideInformationModerator(12, 3, 8, 'op', 'APPROVE', null), 'POST', '/information/reviews/12/moderator-decisions');
  await check(() => info.addInformationComment(12, 3, 8, 'op', 'Check'), 'POST', '/information/reviews/12/comments');
  await check(() => photos.getPhotoList(filters), 'GET', '/photos/reviews');
  await check(() => photos.getPhotoOptions(filters), 'GET', '/photos/reviews/filter-options');
  await check(() => photos.getPhotoDetail(12), 'GET', '/photos/reviews/12');
  await check(() => photos.getPhotoDecisionHistory(12), 'GET', '/photos/reviews/12/decision-events');
  await check(() => photos.beginPhotoUpload(12, 'THEME', 'image/jpeg', 3), 'POST', '/photos/reviews/12/uploads');
  await check(() => photos.finalizePhotoUpload(12, 8, 3), 'POST', '/photos/reviews/12/uploads/8/finalization', { expectedVersion: 3 });
  await check(() => photos.submitPhotoPair(12, 3, 8, 'op'), 'POST', '/photos/reviews/12/submissions');
  for (const role of ['qc', 'moderator']) {
    await check(() => photos.decidePhoto(12, role, 3, 8, 'op', 'APPROVE', null), 'POST', `/photos/reviews/12/${role}-decisions`);
  }
  await check(() => photos.addPhotoComment(12, 3, 8, 'op', 'Check'), 'POST', '/photos/reviews/12/comments');
  await check(() => corrections.getCorrections('PENDING', 1), 'GET', '/corrections');
  await check(() => corrections.requestCorrection(12, 3, 'Check name', 'op'), 'POST', '/tracks/12/corrections');
  await check(() => corrections.decideCorrection(8, 3, 'REJECT', 'Keep approved', 'op'), 'POST', '/corrections/8/decisions');
});

test('manual RAC checks work without a list version and retain concurrency and retry identifiers', async () => {
  let request;
  const rac = load('features/rac-verification/api.ts', {
    fetch: async (_url, init) => {
      request = JSON.parse(init.body);
      return { ok: true, json: async () => ({ success: true, results: [] }) };
    },
  });
  const rows = [{ studentNumber: 99000001, version: null }, { studentNumber: 99000002, version: 2 }];
  await rac.submitVerification(rows, 'VERIFIED', { year: 2026, term: 'END_YEAR' }, null, 'manual-batch');
  assert.deepEqual(request, {
    year: 2026, term: 'END_YEAR', studentNumbers: [99000001, 99000002], outcome: 'VERIFIED',
    expectedVersions: { 99000001: null, 99000002: 2 }, operationId: 'manual-batch',
  });
  await rac.submitVerification(rows.slice(0, 1), 'NOT_LISTED', { year: 2026, term: 'END_YEAR' }, null, 'manual-single');
  assert.equal(request.outcome, 'NOT_LISTED');
  assert.deepEqual(request.studentNumbers, [99000001]);
  assert.equal(request.operationId, 'manual-single');
});

test('RAC write errors preserve the backend explanation for staff', async () => {
  const rac = load('features/rac-verification/api.ts', {
    fetch: async () => ({ ok: false, json: async () => ({ success: false, reason: 'A record changed. Refresh before confirming.' }) }),
  });
  await assert.rejects(
    () => rac.submitVerification([{ studentNumber: 99000001, version: 2 }], 'VERIFIED', { year: 2026, term: 'END_YEAR' }, null, 'stale-record'),
    /A record changed. Refresh before confirming./,
  );
});

test('RAC confirmation is available without configuration but still respects busy and verified states', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { VerificationRecords } = load('features/rac-verification/VerificationRecords.tsx', {
    require(name) {
      if (name === '@/components/ui/button') {
        return { Button: ({ disabled, children }) => React.createElement('button', { disabled }, children) };
      }
      if (name === '@/lib/graduate-list-name') return load('lib/graduate-list-name.ts');
      return require(name);
    },
  });
  const row = { studentNumber: 99000001, firstName: 'Zoe', lastName: 'Adams',
    verification: 'UNCHECKED', version: null, sourceVersion: null };
  function render(busy, verification = 'UNCHECKED', selected = true) {
    return renderToStaticMarkup(React.createElement(VerificationRecords, {
      list: { rows: [{ ...row, verification }], sourceVersion: null },
      selected: new Set(selected ? [row.studentNumber] : []), busy,
      onToggle() {}, onSelectAll() {}, onConfirm() {}, onHistory() {},
    }));
  }
  function buttonTags(html, label) {
    return [...html.matchAll(/(<button\b[^>]*>)(.*?)<\/button>/g)]
      .filter(match => match[2].includes(label)).map(match => match[1]);
  }
  for (const label of ['Confirm on list', 'Confirm selected', 'Not on list']) {
    const enabled = buttonTags(render(false), label);
    assert.ok(enabled.length > 0, `${label} is present`);
    assert.ok(enabled.every(tag => !tag.includes('disabled')), `${label} works without a source version`);
    assert.ok(buttonTags(render(true), label).every(tag => tag.includes('disabled')), `${label} is disabled while busy`);
  }
  assert.ok(buttonTags(render(false, 'UNCHECKED', false), 'Confirm selected')[0].includes('disabled'));
  assert.equal(buttonTags(render(false, 'VERIFIED'), 'Confirm on list').length, 0);
  assert.ok(buttonTags(render(false, 'VERIFIED'), 'Confirm selected')[0].includes('disabled'));
  assert.match(render(false), /Adams, Zoe/);
});

// A small hook driver runs effects and state updates; it does not stand in for a
// browser/visual test. This checks failure/retry/abort transitions without adding
// another runtime dependency to the production app.
function masterlist(fetch) {
  const states = [], effects = [];
  let cursor = 0, queued = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], next => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
    },
    useEffect(run, deps) {
      const index = cursor++;
      if (!effects[index] || deps.some((dep, i) => !Object.is(dep, effects[index].deps[i]))) {
        effects[index]?.cleanup?.();
        effects[index] = { deps };
        queued.push(() => { effects[index].cleanup = run(); });
      }
    },
  };
  const { useMasterlist } = load('hooks/useMasterlist.ts', {
    fetch, console: { error() {} }, require(name) {
      if (name === 'react') return react;
      if (name === '@/constants/registration') return { departmentOptions: [] };
      if (name === '@/constants/studentStatus') return { ACTIVE_STUDENT_STATUS_STEPS: [] };
      throw new Error(`Unexpected hook dependency: ${name}`);
    },
  });
  return { render(enabled = true) {
    cursor = 0; queued = [];
    const result = useMasterlist(enabled);
    queued.forEach(run => run());
    return result;
  } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
test('Masterlist reports HTTP and network errors and retries only on request', async () => {
  let calls = 0;
  const hook = masterlist(async () => {
    calls++;
    if (calls === 1) return { ok: false, status: 429, headers: new Headers({ 'Retry-After': '120' }) };
    if (calls === 2) throw new Error('offline');
    return { ok: true, json: async () => ({ students: [{ id: 1 }], total_result: 1 }) };
  });
  hook.render(); await flush();
  let state = hook.render();
  assert.match(state.error, /2 minutes/); assert.equal(state.isLoading, false);
  assert.equal(calls, 1);
  state.retry(); hook.render(); await flush();
  state = hook.render(); assert.match(state.error, /connection/); assert.equal(calls, 2);
  state.retry(); hook.render(); await flush();
  state = hook.render(); assert.equal(state.error, null); assert.equal(state.students[0].id, 1); assert.equal(calls, 3);
});
test('Masterlist aborts superseded requests and keeps successful empty results distinct from failure', async () => {
  let finishOld, oldSignal;
  let calls = 0;
  const hook = masterlist(async (_url, init) => {
    calls++;
    if (calls === 1) { oldSignal = init.signal; return new Promise(resolve => { finishOld = resolve; }); }
    return { ok: true, json: async () => ({ students: [], total_result: 0 }) };
  });
  hook.render();
  hook.render().setCurrentPage(2); hook.render(); await flush();
  assert.equal(oldSignal.aborted, true);
  finishOld({ ok: false, status: 500 }); await flush();
  const state = hook.render();
  assert.equal(state.error, null); assert.equal(state.students.length, 0); assert.equal(state.isLoading, false);
});
