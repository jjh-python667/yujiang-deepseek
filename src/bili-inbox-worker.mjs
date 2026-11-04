import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { makeHeaders, pullFeed } from './bili-msgfeed.mjs'

const failure = (code, error, hint) => ({ ok: false, code, error, hint })

export async function readInbox(credentialsFile, scope) {
  let cred
  try { cred = JSON.parse(fs.readFileSync(credentialsFile, 'utf8').replace(/^\uFEFF/, '')) } catch {}
  if (!['sessdata', 'bili_jct', 'buvid3'].every((key) => typeof cred?.[key] === 'string' && /^[!-~]+$/.test(cred[key]) && !cred[key].includes(';'))) {
    return failure('BILI_CREDENTIALS_UNAVAILABLE', '雨酱的登录凭据缺失或无法读取', '在 SurfCore → B站 → B站账号扫码登录雨酱账号。')
  }
  const headers = makeHeaders(cred)
  const items = []
  for (const kind of scope === 'reply' ? ['reply'] : ['reply', 'at']) {
    const label = kind === 'at' ? '@我的' : '回复我的'
    try {
      const result = await pullFeed(kind, { headers, signal: AbortSignal.timeout(8000) })
      items.push(...result.items)
    } catch (cause) {
      if (cause.biliCode === -101 || cause.httpStatus === 401) {
        return failure('BILI_LOGIN_EXPIRED', label + '：B站要求重新登录', '在 SurfCore → B站 → B站账号重新扫码登录雨酱账号。')
      }
      if ([-352, -412, 412, 429].includes(cause.biliCode) || [412, 429].includes(cause.httpStatus)) {
        return failure('BILI_UPSTREAM_LIMITED', label + '：B站暂时限制请求', '等下一轮自动重试。如果持续失败，在 B站网页检查是否有安全验证。')
      }
      if (Number.isFinite(cause.biliCode)) {
        return failure('BILI_UPSTREAM_ERROR', label + '：B站接口返回错误 ' + cause.biliCode, '等下一轮自动重试。')
      }
      return failure('BILI_NETWORK_ERROR', label + '：网络连接失败或超时', '检查本机能否打开 B站，监听会在下一轮自动重试。')
    }
  }
  return { ok: true, items }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await readInbox(process.argv[2], process.argv[3])
  if (!result.ok) process.exitCode = 1
  process.stdout.write(JSON.stringify(result) + '\n')
}
