# 部署说明 / Deployment

> **2026-11-11：** 本文只根据仓库里已有的文件说明如何运行。它不修改代码，也不提供仓库中不存在的安装或上线步骤。
>
> **2026-11-11:** This note describes how to run what the files already contain. It does not change code, and it does not add install or release steps that are not in the repository.

## 中文

### 本仓库没有托管部署

已跟踪的文件里没有下面任何一种部署定义：

- 容器或编排文件（Dockerfile、compose）
- CI 或发布工作流（`.github/workflows`）
- 进程管理、反向代理或云托管配置
- 依赖清单之外的安装脚本（`package.json` 没有 `dependencies`）

`package.json` 把包标为 `"private": true`。这里不能按一份仓库内脚本部署到服务器。下面两节是源码里真正能执行的步骤。再后面一节只转述已有文档对本机环境的记录。

### 1. 运行测试

要求来自 `package.json` 的 `engines`：Node.js `>=22.13.0`。不需要安装 npm 依赖，也不需要 QQ、B 站或任何密钥。

在仓库根目录执行：

```sh
npm test
```

`scripts.test` 的内容是 `node --test`。`test/integrations.test.mjs` 有六个用例：它替换全局 `fetch`，并在临时文件里写入字面量 `sample` 作为 `sessdata`、`bili_jct` 和 `buvid3`。测试不访问外网。

### 2. 只读运行 B 站收件箱命令

`src/bili-inbox-worker.mjs` 在被直接执行时读取两个参数：凭据文件路径，以及 scope。

```sh
node src/bili-inbox-worker.mjs <凭据文件路径> reply
node src/bili-inbox-worker.mjs <凭据文件路径> both
```

凭据文件是调用者保存在本机的 JSON。把尖括号占位符换成自己的值，不要把填好的文件提交进 git：

```json
{
  "sessdata": "<SESSDATA>",
  "bili_jct": "<BILI_JCT>",
  "buvid3": "<BUVID3>"
}
```

源码对三个字段的要求是：非空字符串、每个字符都在 ASCII `!` 到 `~` 之间、并且不含分号。文件可以带 UTF-8 BOM。读不到文件、JSON 无法解析或字段不合格时，程序不抛给命令行，而是输出 `BILI_CREDENTIALS_UNAVAILABLE`。

`reply` 只请求「回复我的」。`both` 以及任何不是 `reply` 的 scope 会先请求「回复我的」，再请求「@我的」。成功时向 stdout 写一行 JSON：`{"ok":true,"items":[...]}`。每条只含 `kind`（`reply` 或 `at`）、`t`（`reply_time` 或 `at_time`）、`who`（昵称）和 `mid`。失败时 `process.exitCode = 1`，stdout 仍是一行 JSON：`{"ok":false,"code":"...","error":"...","hint":"..."}`，没有 `items`。任一路失败即整次失败，即使前一路已经读到条目。

程序实际请求的地址写在 `src/bili-msgfeed.mjs`：

- `https://api.bilibili.com/x/msgfeed/reply?platform=web&build=0&mobi_app=web`
- `https://api.bilibili.com/x/msgfeed/at?platform=web&build=0&mobi_app=web`

请求带 `referer: https://message.bilibili.com/`、一份写死的浏览器 User-Agent，以及由上述三个字段拼出的 Cookie。`redirect` 为 `error`。单次请求超时 8000 毫秒。源码不投稿、不发评论、不发动态。

失败码与源码中的判定：

| `code` | 源码中的条件 |
| --- | --- |
| `BILI_CREDENTIALS_UNAVAILABLE` | 凭据文件不可读或三个字段不合格 |
| `BILI_LOGIN_EXPIRED` | B 站业务码 `-101`，或 HTTP `401` |
| `BILI_UPSTREAM_LIMITED` | 业务码 `-352`、`-412`、`412`、`429`，或 HTTP `412`、`429` |
| `BILI_UPSTREAM_ERROR` | 其他有限数值业务码 |
| `BILI_NETWORK_ERROR` | 连接失败、超时，或其他没有业务码的失败 |

`error` 和 `hint` 是源码里的中文句子。登录失效时的 hint 写的是回到 SurfCore 里重新扫码；本仓库不包含 SurfCore，也不包含扫码登录。

`.gitignore` 已忽略 `*credentials*.json`、`.env`、`.env.*`、`config.local.json` 和 `*.log`。凭据文件名如果匹配 `*credentials*.json`，就不会被这个规则跟踪。其他文件名仍可能被误提交，不要把真实 JSON 放进仓库。

### 3. OneBot 账号校验怎么接

`src/onebot-account-guard.mjs` 不是服务，没有监听端口，也没有命令行。调用方使用已导出的函数：

```js
import { guardedOneBotFetch } from './src/onebot-account-guard.mjs'

await guardedOneBotFetch('<QQ_BOT_ACCOUNT_ID>', '<LOOPBACK_ONEBOT_ACTION_URL>', {
  method: 'POST',
  // headers and body are the caller's OneBot action, not stored in this repo
})
```

约束全部来自该文件：

- `<QQ_BOT_ACCOUNT_ID>` 必须是十进制数字字符串。测试用的是虚构值 `11` 和 `22`，不是真实 QQ 号。
- `<LOOPBACK_ONEBOT_ACTION_URL>` 的协议只能是 `http:` 或 `https:`，主机名只能是 `127.0.0.1` 或 `[::1]`。`localhost` 会被拒绝。URL 不能带用户名、密码或 hash。
- 程序先把 `get_login_info` 相对解析到动作 URL 上，再 POST 正文 `{}`，并设置 `content-type: application/json`。`redirect` 为 `error`，超时 4000 毫秒；调用方若传入 `signal`，会与该超时一起中止。
- 测试文件里的例子是动作 `http://127.0.0.1:3000/onebot/send_private_msg`，对应的登录检查是 `http://127.0.0.1:3000/onebot/get_login_info`。端口 `3000` 和路径只是测试数据。本仓库不配置 OneBot 端口。
- 只有 HTTP 响应成功且 `retcode === 0` 时，才会把 `data.user_id` 拿去比较；否则按空账号比较。不一致就抛出 `Error`，`code` 为 `QQ_ACCOUNT_MISMATCH`，并带中文 `hint`。抛出之后不会请求原来的动作。响应体不是 JSON 时，`response.json()` 先抛出解析错误，那个错误的 `code` 不是 `QQ_ACCOUNT_MISMATCH`。
- 登录查询和业务动作是两次请求。[open-source.md](open-source.md) 写明两次请求之间仍有时间窗口，多账号时应使用各自的 OneBot 端口，生产环境的 WebSocket 防护在 SurfCore 桥接里。源码注释只说明每次 HTTP 动作前在同一回环地址复查身份。

### 4. 文档所记录的本机环境

[operations.md](operations.md) 描述的是已经在本机运行的环境，不是本仓库可以复现的安装过程。按该文，日常检查是：

1. 打开 DeepSeek 工作台，进入 SurfCore 概览。
2. 检查 QQ 桥接和机器人账号。SnowLuma 应登录雨酱使用的机器人账号。
3. 在 **SurfCore → B站 → B站账号** 查看「回复与 @ 监听」。文中说「收件箱可读」表示最近一轮成功。
4. 语音后台按需启动。遇到语音问题时先看当前任务和后台状态，并保留现有工作台会话。

该文还写了这些边界：电脑和工作台要保持运行；每三分钟轮询一次的说法只出现在这篇运维文档里；凭据只在本地输入和保管。DeepSeek、SurfCore、SnowLuma、IndexTTS2、火山方舟 Seedream、阿里云百炼、搜索链路、WhaleMaid 和桌宠都只在 `docs/operations.md` 与 `docs/verification.md` 中被提到，目录里没有它们的程序或配置。

[verification.md](verification.md) 中的验收日期是 2026-11-03 和 2026-11-04。那些结果是文档记录。本文不把它们重新标成新的验收。

### 5. 已跟踪内容里的凭据核对

本次只阅读了当前文件和既有 git 历史，没有改写历史。三个提交的已跟踪文件中没有发现可用的密钥、令牌、私钥或真实的 B 站 Cookie。出现的只有字段名，以及测试里的占位字符串 `sample`。不要把真实的 `sessdata`、`bili_jct`、`buvid3` 或 QQ 账号写进文档、源码或提交说明。

## English

### There is no hosted deploy path in this repo

The tracked files do not define any of the following:

- a container or orchestrator file (Dockerfile, compose)
- a CI or release workflow (`.github/workflows`)
- a process manager, reverse proxy, or cloud-hosting config
- an install script beyond the manifest (`package.json` has no `dependencies`)

`package.json` sets `"private": true`. Nothing in-repo deploys this project to a server. The next two sections are the steps the source actually runs. The section after that only repeats what the existing docs say about the local machine.

### 1. Run the tests

`package.json` `engines` requires Node.js `>=22.13.0`. No npm install, QQ, Bilibili, or keys are required.

From the repository root:

```sh
npm test
```

`scripts.test` is `node --test`. `test/integrations.test.mjs` contains six cases. They replace global `fetch` and write the literal `sample` into a temporary file for `sessdata`, `bili_jct`, and `buvid3`. The tests do not use the network.

### 2. Read the Bilibili inbox once

When `src/bili-inbox-worker.mjs` is executed directly, it takes a credentials file path and a scope.

```sh
node src/bili-inbox-worker.mjs <credentials-file> reply
node src/bili-inbox-worker.mjs <credentials-file> both
```

The credentials file is local JSON owned by the caller. Replace the angle-bracket placeholders with real values, and do not commit the filled file:

```json
{
  "sessdata": "<SESSDATA>",
  "bili_jct": "<BILI_JCT>",
  "buvid3": "<BUVID3>"
}
```

The source accepts the three fields only when each is a non-empty string, every character is in ASCII `!` through `~`, and none contains a semicolon. A UTF-8 BOM is stripped. A missing file, invalid JSON, or a rejected field does not throw out of the command; it prints `BILI_CREDENTIALS_UNAVAILABLE`.

`reply` requests replies only. `both`, and any scope other than `reply`, requests replies and then @ mentions. On success, stdout is one JSON line: `{"ok":true,"items":[...]}`. Each item has only `kind` (`reply` or `at`), `t` (`reply_time` or `at_time`), `who` (nickname), and `mid`. On failure, `process.exitCode` is `1` and stdout is still one JSON line: `{"ok":false,"code":"...","error":"...","hint":"..."}`, with no `items`. One failed feed fails the whole call, even if the earlier feed returned rows.

The URLs in `src/bili-msgfeed.mjs` are:

- `https://api.bilibili.com/x/msgfeed/reply?platform=web&build=0&mobi_app=web`
- `https://api.bilibili.com/x/msgfeed/at?platform=web&build=0&mobi_app=web`

Each request sets `referer` to `https://message.bilibili.com/`, a fixed browser User-Agent, and a cookie built from the three fields above. `redirect` is `error`. The per-request timeout is 8000 ms. The source does not upload videos, post comments, or publish dynamics.

Failure codes and the conditions in source:

| `code` | Condition in source |
| --- | --- |
| `BILI_CREDENTIALS_UNAVAILABLE` | The credentials file cannot be read, or one of the three fields is rejected |
| `BILI_LOGIN_EXPIRED` | Bilibili code `-101`, or HTTP `401` |
| `BILI_UPSTREAM_LIMITED` | Bilibili code `-352`, `-412`, `412`, or `429`, or HTTP `412` or `429` |
| `BILI_UPSTREAM_ERROR` | Another finite numeric Bilibili code |
| `BILI_NETWORK_ERROR` | Connection failure, timeout, or another failure without a Bilibili code |

`error` and `hint` are Chinese sentences in the source. The login-expired hint says to scan the QR code again in SurfCore. This repository does not include SurfCore or that login flow.

`.gitignore` ignores `*credentials*.json`, `.env`, `.env.*`, `config.local.json`, and `*.log`. A credentials filename matching `*credentials*.json` is covered by that rule. A different filename can still be committed by mistake; do not put a real JSON file in the repository.

### 3. Calling the OneBot account check

`src/onebot-account-guard.mjs` is not a server. It does not listen on a port and it has no command line. Callers use the exported function:

```js
import { guardedOneBotFetch } from './src/onebot-account-guard.mjs'

await guardedOneBotFetch('<QQ_BOT_ACCOUNT_ID>', '<LOOPBACK_ONEBOT_ACTION_URL>', {
  method: 'POST',
  // headers and body are the caller's OneBot action, not stored in this repo
})
```

The constraints come from that file:

- `<QQ_BOT_ACCOUNT_ID>` must be a decimal digit string. The tests use the fictional ids `11` and `22`. They are not real QQ numbers.
- `<LOOPBACK_ONEBOT_ACTION_URL>` must use `http:` or `https:`, and the hostname must be `127.0.0.1` or `[::1]`. `localhost` is rejected. The URL must not include a username, a password, or a hash.
- The module resolves `get_login_info` relative to the action URL, POSTs the body `{}`, and sets `content-type: application/json`. `redirect` is `error`. The timeout is 4000 ms. A caller `signal` aborts together with that timeout.
- The test file uses the action `http://127.0.0.1:3000/onebot/send_private_msg`, whose login check is `http://127.0.0.1:3000/onebot/get_login_info`. Port `3000` and that path are test data. This repo does not configure an OneBot port.
- Only an HTTP success with `retcode === 0` supplies `data.user_id` for the comparison. Any other result is compared as an empty account. A mismatch throws an `Error` with `code` `QQ_ACCOUNT_MISMATCH` and a Chinese `hint`. The original action is not requested after that throw. If the body is not JSON, `response.json()` throws a parse error first; that error is not `QQ_ACCOUNT_MISMATCH`.
- The login query and the action are two requests. [open-source.md](open-source.md) says a time window remains between them, that separate OneBot ports should be used for multiple accounts, and that the production WebSocket guard lives in the SurfCore bridge. The source comment only says the identity is rechecked on the same loopback endpoint before each HTTP action.

### 4. Local environment recorded in the docs

[operations.md](operations.md) describes an environment already running on the local machine. It is not an install procedure this repository can repeat. That note's daily check is:

1. Open the DeepSeek workbench and the SurfCore overview.
2. Check the QQ bridge and the bot account. SnowLuma should be logged into the bot account used by 雨酱.
3. Under **SurfCore → B站 → B站账号**, read 「回复与 @ 监听」. The note says 「收件箱可读」 means the latest round succeeded.
4. The voice backend starts on demand. On a voice problem, check the current task and backend state, and keep the existing workbench session.

That note also states these limits: the computer and the workbench stay running; the three-minute poll is written only in that operations note; credentials are entered and kept locally. DeepSeek, SurfCore, SnowLuma, IndexTTS2, Volcengine Ark Seedream, Alibaba Cloud Bailian, the search path, WhaleMaid, and the desktop pet are named only in `docs/operations.md` and `docs/verification.md`. Their programs and config are not in this tree.

The check dates in [docs/verification.md](verification.md) are 2026-11-03 and 2026-11-04. Those are records in the docs. This file does not restate them as a new check.

### 5. Credential check of tracked content

This pass only read the current files and the existing git history. It did not rewrite history. The tracked files in the three commits do not contain a usable key, token, private key, or real Bilibili cookie. The tree has field names and the test placeholder `sample` only. Do not write a real `sessdata`, `bili_jct`, `buvid3`, or QQ account into docs, source, or commit messages.
