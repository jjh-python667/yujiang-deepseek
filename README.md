> **2026-11-11 文档说明：** 本次变更只更新部署说明与文档，没有修改代码。`src/`、`test/`、`package.json`、`.gitignore` 和已有的 `LICENSE` 都保持原样。
>
> **Documentation note (2026-11-11):** This change only updates deployment notes and documentation. The code was not changed. `src/`, `test/`, `package.json`, `.gitignore`, and the existing `LICENSE` are unchanged.

# 大肥鱼 · 雨酱（yujiang-deepseek）

## 中文

### 这个仓库是什么

这是 [jjh-python667/yujiang-deepseek](https://github.com/jjh-python667/yujiang-deepseek)。`package.json` 中的包名是 `yujiang-integration-examples`，`"private": true`，`license` 为 `MIT`。仓库里有两类内容：

1. **本机部署的文字记录。** 已有文档把「大肥鱼」写成运行在本机 DeepSeek 工作台上的鲸鱼娘助手「雨酱」，并记录 QQ、B 站和桌宠相关的使用与验收。工作台、SurfCore、SnowLuma、模型权重、安装包和账号凭据都不在本仓库里。
2. **两份可单独阅读和测试的 Node.js 组件。** 源码在 `src/`，测试在 `test/`。`package.json` 的 `engines.node` 要求 `>=22.13.0`。没有声明 npm 依赖。

本仓库没有 Dockerfile、CI 工作流、托管配置或部署脚本。可以执行的步骤只写在 [docs/DEPLOY.md](docs/DEPLOY.md)。

### 仓库里的代码

| 路径 | 仓库里实际有的行为 |
| --- | --- |
| `src/onebot-account-guard.mjs` | 导出 `requireOneBotAccount(expected, actual)` 和 `guardedOneBotFetch(expected, url, options)`。动作地址必须是回环 HTTP(S)（`127.0.0.1` 或 `[::1]`）。每次动作前先向同一地址相对解析出的 `get_login_info` 发 POST。账号不一致时抛出 `QQ_ACCOUNT_MISMATCH`，不发送该动作。 |
| `src/bili-msgfeed.mjs` | 导出 `makeHeaders(cred)` 和 `pullFeed(kind, { headers, signal })`。`kind` 只能是 `reply` 或 `at`。请求公开的 B 站收件箱接口，只保留时间、昵称和 mid。 |
| `src/bili-inbox-worker.mjs` | 导出 `readInbox(credentialsFile, scope)`，也可直接用 Node 运行。只读收件箱，不发布评论或动态。 |
| `test/integrations.test.mjs` | 六个 `node:test` 用例。使用模拟的 `fetch` 和虚构凭据，不连接 QQ 或 B 站。 |

`scope` 为 `reply` 时只读「回复我的」。[docs/open-source.md](docs/open-source.md) 写的另一个取值是 `both`。源码里除 `reply` 以外的取值都会依次读「回复我的」和「@我的」。没有只读 @ 的取值。任一路失败时返回错误对象，不返回 `items`。

### 文档里记录的本机部署

下面是本仓库已有文档中的记录，不是本仓库提供的安装步骤：

- [docs/open-source.md](docs/open-source.md) 写明：生产集成还需要 DeepSeek 工作台、SurfCore、OneBot 适配器和各平台的本机配置。这里的 HTTP 账号校验与生产环境的 WebSocket 防护不是同一层；后者属于 SurfCore 桥接。
- [docs/operations.md](docs/operations.md) 的检查顺序是：打开 DeepSeek 工作台里的 SurfCore 概览；确认 QQ 桥接，且 SnowLuma 登录的是机器人账号；在 **SurfCore → B站 → B站账号** 查看「回复与 @ 监听」；语音后台按需启动。需要持续在线时，电脑和工作台保持运行。关机和系统睡眠会中断本机服务。
- 同一篇运维文档写明当前部署每三分钟轮询一次 B 站收件箱。`src/` 里没有这个间隔，也没有定时任务。本仓库的命令行程序运行一次后退出。
- [docs/verification.md](docs/verification.md) 记录截至 2026-11-04 的验收和待办，其中包括语音、图片、视频学习、记忆、桌宠，以及百炼工具调用、阶段进化、B 站主页背景和视频生成。这些条目没有对应的实现文件在本仓库中。

已有说明里的「学习」指分析内容并积累记忆，不包括更新模型权重。

### 怎样运行这里有的部分

安装 Node.js 22.13 或更新版本，在仓库根目录执行：

```sh
npm test
```

该脚本就是 `node --test`。

只读拉取一次 B 站收件箱元数据：

```sh
node src/bili-inbox-worker.mjs <凭据文件路径> <reply|both>
```

凭据是调用者自己的本地 JSON，字段名为 `sessdata`、`bili_jct`、`buvid3`。不要把真实值写入仓库。占位示例、退出码和错误码见 [docs/DEPLOY.md](docs/DEPLOY.md)。OneBot 校验没有独立命令，由调用方传入预期账号和回环地址。

### 许可证与未纳入仓库的内容

根目录已有 [MIT 许可证](LICENSE)，本次不另加许可证。版权声明包含 `Copyright (c) 2026 Derpyu520 and qq-bridge / QSH contributors` 与 `Copyright (c) 2026 jjh-python667`。[docs/open-source.md](docs/open-source.md) 写明组件整理自 [Mieksido/surfcore](https://github.com/Mieksido/surfcore) 的集成思路和本机部署修复，并保留上游 MIT 版权声明。

账号凭据、私聊原文、角色记忆、模型权重、安装包和本机运行状态由本机单独保管。`.gitignore` 忽略 `node_modules/`、`.env`、`.env.*`、`*credentials*.json`、`config.local.json` 和 `*.log`。

### 文档索引

- [部署说明](docs/DEPLOY.md)
- [开源组件的用法与来源](docs/open-source.md)
- [日常使用与运维](docs/operations.md)
- [验收、已知边界与待办](docs/verification.md)
- [变更记录](CHANGELOG.md)

## English

### What this repository is

This is [jjh-python667/yujiang-deepseek](https://github.com/jjh-python667/yujiang-deepseek). The `package.json` name is `yujiang-integration-examples`, with `"private": true` and `"license": "MIT"`. The tree contains two kinds of material:

1. **Notes about a local deployment.** The existing docs describe 大肥鱼 as the whale-girl assistant 雨酱 running on a local DeepSeek workbench, including notes on QQ, Bilibili, and a desktop pet. The workbench, SurfCore, SnowLuma, model weights, installers, and account credentials are not in this repository.
2. **Two Node.js components that can be read and tested on their own.** Source is in `src/`, tests are in `test/`. `package.json` requires Node.js `>=22.13.0`. It declares no npm dependencies.

This repository has no Dockerfile, CI workflow, hosting config, or deploy script. The commands that can actually be run are in [docs/DEPLOY.md](docs/DEPLOY.md).

### Code in this repository

| Path | Behavior present in the file |
| --- | --- |
| `src/onebot-account-guard.mjs` | Exports `requireOneBotAccount(expected, actual)` and `guardedOneBotFetch(expected, url, options)`. The action URL must be loopback HTTP(S) (`127.0.0.1` or `[::1]`). Before every action it POSTs `get_login_info`, resolved relative to that action URL. On an account mismatch it throws `QQ_ACCOUNT_MISMATCH` and does not send the action. |
| `src/bili-msgfeed.mjs` | Exports `makeHeaders(cred)` and `pullFeed(kind, { headers, signal })`. `kind` is `reply` or `at`. It calls Bilibili's public inbox API and keeps only the timestamp, nickname, and mid. |
| `src/bili-inbox-worker.mjs` | Exports `readInbox(credentialsFile, scope)` and can be executed with Node. It reads an inbox and does not publish comments or posts. |
| `test/integrations.test.mjs` | Six `node:test` cases. They mock `fetch` and use fictional credentials. They do not contact QQ or Bilibili. |

`scope` value `reply` reads replies only. [docs/open-source.md](docs/open-source.md) also names `both`. In source, every scope other than `reply` reads replies and then @ mentions. There is no @-only scope. If either feed fails, the function returns an error object and no `items`.

### Local deployment described by the docs

These are statements already written in this repository. They are not install steps shipped here:

- [docs/open-source.md](docs/open-source.md) says production use still needs a DeepSeek workbench, SurfCore, an OneBot adapter, and local platform configuration. The HTTP account check in this repo is not the production WebSocket guard; that guard belongs to the SurfCore bridge.
- [docs/operations.md](docs/operations.md) gives this check order: open the SurfCore overview in the DeepSeek workbench; confirm the QQ bridge and that SnowLuma is logged into the bot account; open **SurfCore → B站 → B站账号** and read 「回复与 @ 监听」; the voice backend starts on demand. Staying online requires the computer and the workbench to keep running. Shutdown and system sleep stop the local services.
- That operations note says the current deployment polls the Bilibili inbox every three minutes. Nothing in `src/` sets that interval or schedules a job. The command-line program in this repo runs once and exits.
- [docs/verification.md](docs/verification.md) records checks and open items as of 2026-11-04, including voice, images, video study, memory, the desktop pet, Bailian tool calls, stage evolution, the Bilibili profile background, and video generation. None of those items has an implementation file in this repository.

In the existing notes, 「学习」 means studying content and keeping memory. It does not mean updating model weights.

### How to run what is here

Install Node.js 22.13 or newer and, from the repository root, run:

```sh
npm test
```

That script is `node --test`.

Read Bilibili inbox metadata once:

```sh
node src/bili-inbox-worker.mjs <credentials-file> <reply|both>
```

The credentials file is a local JSON file supplied by the caller, with the fields `sessdata`, `bili_jct`, and `buvid3`. Do not commit real values. Placeholders, the exit code, and error codes are in [docs/DEPLOY.md](docs/DEPLOY.md). The OneBot check has no command of its own; the caller passes the expected account id and a loopback URL.

### License and what stays out of the repo

An [MIT license](LICENSE) is already at the repository root, so this update does not add another license. The copyright lines are `Copyright (c) 2026 Derpyu520 and qq-bridge / QSH contributors` and `Copyright (c) 2026 jjh-python667`. [docs/open-source.md](docs/open-source.md) says the components were extracted from the integration approach and local fixes around [Mieksido/surfcore](https://github.com/Mieksido/surfcore), keeping the upstream MIT copyright notice.

Account credentials, private-chat text, character memory, model weights, installers, and local runtime state stay on the local machine. `.gitignore` ignores `node_modules/`, `.env`, `.env.*`, `*credentials*.json`, `config.local.json`, and `*.log`.

### Docs

- [Deployment notes](docs/DEPLOY.md)
- [Open-source components, usage, and origin](docs/open-source.md)
- [Day-to-day operation](docs/operations.md)
- [Checks, limits, and open items](docs/verification.md)
- [Changelog](CHANGELOG.md)
