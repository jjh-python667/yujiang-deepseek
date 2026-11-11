# 用法 / Usage

需要 Node.js 22.13 或更新（`package.json` 的 `engines`）。没有 npm 依赖。下面是仓库里两份组件的用法。本机工作台的日常检查见 [operations.md](operations.md)。

Node.js 22.13 or newer (`engines` in `package.json`). No npm dependencies. Below is how to use the two components in this repo. Day-to-day checks for the local workbench are in [operations.md](operations.md).

## 测试 / Tests

```sh
npm test
```

脚本是 `node --test`。测试替换 `fetch`，凭据使用字面量 `sample`，不连接 QQ 或 B 站。

The script is `node --test`. Tests replace `fetch`, use the literal `sample` as credentials, and do not contact QQ or Bilibili.

## OneBot 账号校验 / OneBot account check

`src/onebot-account-guard.mjs` 导出 `guardedOneBotFetch(expected, url, options)`。它在回环 HTTP 动作发出前核对登录账号，自己不监听端口。

- `expected` 填 `<QQ_BOT_ACCOUNT_ID>`，必须是十进制数字。
- `url` 只能是 `http:` 或 `https:`，主机名只能是 `127.0.0.1` 或 `[::1]`，不能带用户名、密码或 hash。
- 先对动作地址相对解析出 `get_login_info`，POST `{}`，超时 4000 毫秒。只有响应成功且 `retcode === 0` 时才比较 `data.user_id`。
- 不一致时抛出 `QQ_ACCOUNT_MISMATCH`，该动作不会发出。

`guardedOneBotFetch` checks the account before a loopback HTTP action and does not listen on a port. `expected` is a decimal `<QQ_BOT_ACCOUNT_ID>`. The URL must be `http:` or `https:` on `127.0.0.1` or `[::1]`, with no username, password, or hash. The `get_login_info` POST times out at 4000 ms and reads `data.user_id` only after success with `retcode === 0`.

## B 站收件箱 / Bilibili inbox

`src/bili-inbox-worker.mjs` 导出 `readInbox(credentialsFile, scope)`，只读收件箱元数据。请求在 `src/bili-msgfeed.mjs`。

```sh
node src/bili-inbox-worker.mjs <凭据文件> reply
node src/bili-inbox-worker.mjs <凭据文件> both
```

```json
{
  "sessdata": "<SESSDATA>",
  "bili_jct": "<BILI_JCT>",
  "buvid3": "<BUVID3>"
}
```

- 三个字段都必须是非空字符串，字符在 ASCII `!` 到 `~`，且不含分号。
- `reply` 只读「回复我的」。`both` 以及任何其他 scope 会先读回复，再读「@我的」。
- 每条只有 `kind`、`t`、`who`、`mid`。单次请求超时 8000 毫秒。
- 失败时没有 `items`。命令行退出码为 1。
- `BILI_CREDENTIALS_UNAVAILABLE`：凭据读不到或不合格。
- `BILI_LOGIN_EXPIRED`：`biliCode === -101`，或 HTTP 401。
- `BILI_UPSTREAM_LIMITED`：`biliCode` 为 `-352`、`-412`、`412`、`429`，或 HTTP 412、429。
- `BILI_UPSTREAM_ERROR`：`biliCode` 是其他有限数值。
- `BILI_NETWORK_ERROR`：`biliCode` 不是有限数值。源码里的说明是连接失败或超时。

不要提交真实 JSON。`.gitignore` 包含 `*credentials*.json`、`.env`、`.env.*`、`config.local.json` 和 `*.log`。

`readInbox` only reads metadata. `reply` reads replies only; every other scope, including `both`, reads replies and then @ mentions. The timeout is 8000 ms. Failure leaves out `items` and the command exits 1. The codes above are the conditions in the source.
