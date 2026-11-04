import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { readInbox } from '../src/bili-inbox-worker.mjs';
import { guardedOneBotFetch } from '../src/onebot-account-guard.mjs';

const endpoint = 'http://127.0.0.1:3000/onebot/send_private_msg';

test('QQ blocks a different signed-in account before any business request', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ retcode: 0, data: { user_id: 22 } }));
  await assert.rejects(guardedOneBotFetch('11', endpoint), { code: 'QQ_ACCOUNT_MISMATCH' });
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(String(fetch.mock.calls[0].arguments[0]), 'http://127.0.0.1:3000/onebot/get_login_info');
  assert.equal(fetch.mock.calls[0].arguments[1].redirect, 'error');
});

test('QQ allows the action after a matching check', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async (url) => String(url).endsWith('get_login_info')
    ? Response.json({ retcode: 0, data: { user_id: 11 } })
    : Response.json({ retcode: 0 }));
  const response = await guardedOneBotFetch('11', endpoint, { method: 'POST' });
  assert.equal((await response.json()).retcode, 0);
  assert.equal(fetch.mock.callCount(), 2);
  assert.equal(String(fetch.mock.calls[1].arguments[0]), endpoint);
  assert.equal(fetch.mock.calls[1].arguments[1].redirect, 'error');
});

test('QQ requires a configured account and refuses non-loopback endpoints', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => assert.fail('unexpected fetch'));
  await assert.rejects(guardedOneBotFetch('', endpoint), TypeError);
  await assert.rejects(guardedOneBotFetch('11', 'https://example.invalid/action'), TypeError);
  assert.equal(fetch.mock.callCount(), 0);
});

async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'yujiang-tests-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'fixture.json');
  await fs.writeFile(file, JSON.stringify({ sessdata: 'sample', bili_jct: 'sample', buvid3: 'sample' }));
  return file;
}

test('Bilibili reads both inboxes with a timeout and returns only metadata', async (t) => {
  const credentials = await fixture(t);
  const fetch = t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ code: 0, data: { items: [{ at_time: 42, user: { mid: 11, nickname: 'example' }, item: { title: 'fixture' } }] } });
  });
  const result = await readInbox(credentials, 'both');
  assert.deepEqual(result, { ok: true, items: ['reply', 'at'].map(kind => ({ kind, t: 42, who: 'example', mid: '11' })) });
  assert.equal(fetch.mock.callCount(), 2);
});

test('Bilibili propagates an @ failure and leaves reply-only mode usable', async (t) => {
  const credentials = await fixture(t);
  t.mock.method(globalThis, 'fetch', async (url) => Response.json(url.includes('/at?')
    ? { code: -101 }
    : { code: 0, data: { items: [] } }));
  const result = await readInbox(credentials, 'both');
  assert.equal(result.code, 'BILI_LOGIN_EXPIRED');
  assert.ok(result.hint && result.error);
  assert.equal('items' in result, false);
  assert.deepEqual(await readInbox(credentials, 'reply'), { ok: true, items: [] });
});

test('Bilibili distinguishes network errors and invalid credentials', async (t) => {
  const credentials = await fixture(t);
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('offline'); });
  const result = await readInbox(credentials, 'both');
  assert.equal(result.code, 'BILI_NETWORK_ERROR');
  assert.ok(result.hint);
  const missing = await readInbox(credentials + '.missing', 'both');
  assert.equal(missing.code, 'BILI_CREDENTIALS_UNAVAILABLE');
  assert.equal(fetch.mock.callCount(), 1);
});

