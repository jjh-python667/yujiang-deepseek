# 大肥鱼 · 雨酱

这个仓库是一份本机部署记录。大肥鱼是运行在本机 DeepSeek 工作台上的鲸鱼娘助手「雨酱」。它把 DeepSeek 的对话和任务能力接到 QQ、B 站和桌宠，并按场景使用语音、图片、搜索和视频学习。这里记下这套个人部署、已经核对过的效果，以及从中整理出来的集成源码。

**最近核对 · 2026-11-04（北京时间）**  
QQ 桥接在线，B 站监听正常。当天用一条真实的 @ 完成了「收件箱 → 唤醒 → 原评论下回复」验收。

## 它能做什么

- **日常对话与陪伴**。DeepSeek 负责主聊天，雨酱沿用自己的称呼、语气和角色记忆。主动联系强调少打扰，忙碌时优先收敛频率，语气仍可活泼。
- **QQ**。SurfCore 通过 SnowLuma 接收和发送消息。机器人账号与主人账号分开，自动重连会核对机器人登录身份。文字、表情包、语音和生图均有接入路径。
- **B 站**。监听「回复我的」与「@我的」，结合生物钟安排学习和活动。已验证真实视频学习、字幕与关键帧分析、分享和评论回复。可按现有规则选择内容并互动。
- **语音**。快速语音适合短回复，IndexTTS2 用于更讲究表达的语音，沿用雨酱音色。模型按需启动，空闲释放资源。已有本地语音识别补充方案。
- **图片与表情**。豆包 Seedream 通过火山方舟接入生图，QQ 配有生成后发送的工作流。雨酱可以按场景选图或生图。图库也用于 B 站图文动态的预览工作流。视频生成接口单独评估。
- **学习与执行**。用搜索、字幕、公开评论和抽帧补充信息，保留可追溯的学习记录。WhaleMaid 已完成一次带独立测试的自动改码演示。
- **桌宠与形象**。基础桌宠和本地聊天已验收。QQ 与 B 站各自配有头像和简介，阶段进化留待可信安装来源恢复。
- **记忆与隐私**。角色记忆按来源管理。授权共享的 QQ 私聊内容仅以脱敏主题摘要参与 B 站侧记忆，B 站公开学习经历可进入 QQ 侧记忆。

## 怎么接起来

- **DeepSeek 工作台**承载模型、雨酱人设、会话和工具权限。
- **SurfCore**连接平台事件、角色记忆、生物钟和工作台会话。
- **SnowLuma**承担 QQ 接入，**B 站收件箱后台**负责有超时的只读轮询。
- **辅助组件**按需提供语音、豆包生图、搜索和百炼辅助能力。

这里的「学习」指分析新内容并积累可用记忆。模型本身的权重更新不在当前部署范围内。

## What it does

This repository is a record of a local deployment. 大肥鱼 is 雨酱, a whale-girl assistant on a local DeepSeek workbench. She connects DeepSeek's conversation and task ability to QQ, Bilibili, and a desktop pet, and uses voice, images, search, and video study as the scene calls for them. The pages here record that personal deployment, checks already made, and integration source taken from it.

**Last check · 2026-11-04 (China Standard Time)**  
The QQ bridge was online and Bilibili listening was healthy. A real @ that day was checked through inbox, wake, and a reply on the original comment.

- **Everyday conversation.** DeepSeek handles the main chat. 雨酱 keeps her own form of address, tone, and character memory. Proactive contact is meant to stay light: when someone is busy she reaches out less often, and the tone can still be lively.
- **QQ.** SurfCore sends and receives through SnowLuma. The bot account is separate from the owner's account, and a reconnect checks the bot identity. Text, stickers, voice, and image generation each have a path.
- **Bilibili.** She watches 「回复我的」 and 「@我的」, and uses a circadian clock for study and activity. Recorded checks include studying a real video, subtitles and keyframes, a share, and a reply on the original comment. She can choose and respond under the existing rules.
- **Voice.** A fast voice fits short replies. IndexTTS2 is for speech that needs more expression, in 雨酱's voice. Models start on demand and release resources when idle. A local speech-recognition supplement is part of the record.
- **Images and stickers.** Doubao Seedream generates images through Volcengine Ark, and QQ has a generate-then-send flow. 雨酱 can pick or generate an image for the scene. The same library is used in a preview flow for Bilibili image posts. Video generation is evaluated on its own.
- **Study and action.** Search, subtitles, public comments, and sampled frames fill in context, and the study record can be traced. WhaleMaid finished one demonstrated code change that had its own tests.
- **Desktop pet and appearance.** The basic pet and local chat have a recorded check. QQ and Bilibili each have an avatar and a bio. Stage evolution waits until a trusted install source is available again.
- **Memory and privacy.** Character memory is kept by source. QQ private chats shared with permission enter Bilibili-side memory only as redacted topic summaries. Public Bilibili study can enter QQ-side memory.

## How it is connected

- The **DeepSeek workbench** holds the model, 雨酱's persona, sessions, and tool permissions.
- **SurfCore** connects platform events, character memory, the circadian clock, and workbench sessions.
- **SnowLuma** carries QQ. The **Bilibili inbox backend** does a timed, read-only poll.
- **Helpers**, as needed, supply voice, Doubao image generation, search, and Bailian.

「学习」 means studying new material and keeping usable memory. Updating model weights is outside this deployment.

## 本仓库收录什么 / What this repository holds

上面是这套本机部署的记录。放进本仓库的源码只有两份可单独测试的 Node.js 组件，包名是 `yujiang-integration-examples`，许可证是 [MIT](LICENSE)。

The sections above are the record of that local deployment. The source published in this repository is two Node.js components that can be tested on their own. The package name is `yujiang-integration-examples`, under the [MIT](LICENSE) license.

| 在本仓库 / In this repository | 留在本机 / Kept on the local machine |
| --- | --- |
| QQ / OneBot 回环 HTTP 动作前的登录账号核对，`src/onebot-account-guard.mjs` | DeepSeek 工作台、SurfCore、SnowLuma |
| B 站「回复我的」「@我的」只读收件箱，`src/bili-inbox-worker.mjs`、`src/bili-msgfeed.mjs` | 语音、生图、搜索、百炼、桌宠及其模型 |
| 测试 `test/integrations.test.mjs` | 账号凭据、私聊原文、角色记忆、安装包和运行状态 |

用法、占位符和这两份组件在源码里的限制见 [docs/USAGE.md](docs/USAGE.md)。来源与上游许可见 [docs/open-source.md](docs/open-source.md)。

Usage, placeholders, and the limits of these two components are in [docs/USAGE.md](docs/USAGE.md). Origin and the upstream license are in [docs/open-source.md](docs/open-source.md).

## 文档 / Docs

- [组件用法](docs/USAGE.md)
- [开源组件的用法与来源](docs/open-source.md)
- [日常使用与运维](docs/operations.md)
- [验收、已知边界与待办](docs/verification.md)
- [变更记录](CHANGELOG.md)
