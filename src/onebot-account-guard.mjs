export function requireOneBotAccount(expected, actual) {
  const actualId = typeof actual === 'number' && !Number.isSafeInteger(actual) ? '' : String(actual ?? '');
  if (String(expected) === actualId) return;
  throw Object.assign(new Error('OneBot 当前登录账号与预期账号不一致'), {
    code: 'QQ_ACCOUNT_MISMATCH',
    hint: '核对 OneBot 的机器人账号与 HTTP 端口。',
  });
}

/** Recheck the identity on the same loopback endpoint before each HTTP action. */
export async function guardedOneBotFetch(expected, url, options = {}) {
  if (!/^\d+$/.test(String(expected ?? '')) || (typeof expected === 'number' && !Number.isSafeInteger(expected))) {
    throw new TypeError('Expected OneBot account ID is required');
  }
  const action = new URL(url);
  const loopback = ['127.0.0.1', '[::1]'].includes(action.hostname);
  if (!loopback || !['http:', 'https:'].includes(action.protocol) || action.username || action.password || action.hash) {
    throw new TypeError('A loopback OneBot HTTP endpoint is required');
  }
  const loginInfo = new URL('get_login_info', action);
  const headers = new Headers(options.headers);
  headers.set('content-type', 'application/json');
  const timeout = AbortSignal.timeout(4000);
  const signal = options.signal ? AbortSignal.any([timeout, options.signal]) : timeout;
  const response = await fetch(loginInfo, { method: 'POST', headers, body: '{}', redirect: 'error', signal });
  const result = await response.json();
  requireOneBotAccount(expected, response.ok && result.retcode === 0 ? result.data?.user_id : null);
  return fetch(action, { ...options, redirect: 'error' });
}
