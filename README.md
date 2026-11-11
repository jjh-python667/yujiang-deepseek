# 大肥鱼 · 雨酱

## 中文

这个仓库是一份本机部署记录。大肥鱼是运行在本机 DeepSeek 工作台上的鲸鱼娘助手「雨酱」。它把 DeepSeek 的对话和任务能力接到 QQ、B 站和桌宠，并按场景使用语音、图片、搜索和视频学习。这里记下这套个人部署、已经核对过的效果，以及从中整理出来的集成源码。

**最近核对 · 2026-11-04（北京时间）**  
QQ 桥接在线，B 站监听正常。当天用一条真实的 @ 完成了「收件箱 → 唤醒 → 原评论下回复」验收。

### 它能做什么

- **日常对话与陪伴**。DeepSeek 负责主聊天，雨酱沿用自己的称呼、语气和角色记忆。主动联系强调少打扰，忙碌时优先收敛频率，语气仍可活泼。
- **QQ**。SurfCore 通过 SnowLuma 接收和发送消息。机器人账号与主人账号分开，自动重连会核对机器人登录身份。文字、表情包、语音和生图均有接入路径。
- **B 站**。监听「回复我的」与「@我的」，结合生物钟安排学习和活动。已验证真实视频学习、字幕与关键帧分析、分享和评论回复。可按现有规则选择内容并互动。
- **语音**。快速语音适合短回复，IndexTTS2 用于更讲究表达的语音，沿用雨酱音色。模型按需启动，空闲释放资源。已有本地语音识别补充方案。
- **图片与表情**。豆包 Seedream 通过火山方舟接入生图，QQ 配有生成后发送的工作流。雨酱可以按场景选图或生图。图库也用于 B 站图文动态的预览工作流。视频生成接口单独评估。
- **学习与执行**。用搜索、字幕、公开评论和抽帧补充信息，保留可追溯的学习记录。WhaleMaid 已完成一次带独立测试的自动改码演示。
- **桌宠与形象**。基础桌宠和本地聊天已验收。QQ 与 B 站各自配有头像和简介，阶段进化留待可信安装来源恢复。
- **记忆与隐私**。角色记忆按来源管理。授权共享的 QQ 私聊内容仅以脱敏主题摘要参与 B 站侧记忆，B 站公开学习经历可进入 QQ 侧记忆。

### 怎么接起来

- **DeepSeek 工作台**承载模型、雨酱人设、会话和工具权限。
- **SurfCore**连接平台事件、角色记忆、生物钟和工作台会话。
- **SnowLuma**承担 QQ 接入，**B 站收件箱后台**负责有超时的只读轮询。
- **辅助组件**按需提供语音、豆包生图、搜索和百炼辅助能力。

这里的「学习」指分析新内容并积累可用记忆。模型本身的权重更新不在当前部署范围内。

### 本仓库收录什么

上面是这套本机部署的记录。放进本仓库的源码是两份可单独测试的 Node.js 组件，包名是 `yujiang-integration-examples`，许可证是 [MIT](LICENSE)。

| 在本仓库 | 留在本机 |
| --- | --- |
| QQ / OneBot 回环 HTTP 动作前的登录账号核对，`src/onebot-account-guard.mjs` | DeepSeek 工作台、SurfCore、SnowLuma |
| B 站「回复我的」「@我的」只读收件箱，`src/bili-inbox-worker.mjs`、`src/bili-msgfeed.mjs` | 语音、生图、搜索、百炼、桌宠及其模型 |
| 测试 `test/integrations.test.mjs` | 账号凭据、私聊原文、角色记忆、安装包和运行状态 |

用法、占位符和这两份组件在源码里的限制见 [docs/USAGE.md](docs/USAGE.md)。来源与上游许可见 [docs/open-source.md](docs/open-source.md)。

### 文档

- [组件用法](docs/USAGE.md)
- [开源组件的用法与来源](docs/open-source.md)
- [日常使用与运维](docs/operations.md)
- [验收、已知边界与待办](docs/verification.md)
- [变更记录](CHANGELOG.md)

## English

This repository is a record of a local deployment. 大肥鱼 is 雨酱, a whale-girl assistant on a local DeepSeek workbench. She connects DeepSeek's chat and task handling to QQ, Bilibili, and a desktop pet. Depending on the situation, she uses voice, images, search, and learning from videos. These pages record that personal deployment, the checks already completed, and the integration code drawn from it.

**Last check · 2026-11-04 (China Standard Time)**  
The QQ bridge was online and Bilibili listening was healthy. A real @ that day was checked from the inbox, through waking her, to a reply on the original comment.

### What it does

- **Everyday conversation and company.** DeepSeek handles the main chat. 雨酱 keeps her own forms of address, her tone, and her character memory. When she gets in touch on her own, she tries not to intrude: if someone is busy she does it less often, and her tone can still be lively.
- **QQ.** SurfCore receives and sends messages through SnowLuma. The bot account is separate from the owner's. An automatic reconnect checks that the logged-in account is the bot. Text, stickers, voice, and image generation each have a connection.
- **Bilibili.** She watches replies to her and @ mentions, and arranges learning and activity around her daily rhythm. The checks on record include learning from a real video, its subtitles and keyframes, a share, and a reply on the original comment. She can choose what to engage with under the rules already in place.
- **Voice.** The quick voice is for short replies. IndexTTS2 is for lines that need more expression, in 雨酱's own voice. The models start when needed and release their resources when idle. There is also a local speech-recognition fallback.
- **Pictures and stickers.** Doubao Seedream generates images through Volcengine Ark, and QQ has a workflow that generates an image and then sends it. 雨酱 can pick an existing picture or generate one for the situation. That image collection is also used to preview Bilibili image posts. The video-generation API is assessed on its own.
- **Learning and follow-through.** Search, subtitles, public comments, and sampled frames supply extra context, and she keeps a traceable record of what she learned. WhaleMaid completed one demonstration that edited code and came with its own tests.
- **Desktop pet and appearance.** The basic pet and local chat have been checked. QQ and Bilibili each have an avatar and a bio. The next stage of her appearance waits until a trusted install source is available again.
- **Memory and privacy.** Character memory is organized by where it came from. QQ private chats shared with permission reach the Bilibili side only as redacted topic summaries. Public things she learns on Bilibili can reach the QQ side.

### How it is connected

- The **DeepSeek workbench** holds the model, 雨酱's persona, sessions, and tool permissions.
- **SurfCore** connects platform events, character memory, her daily rhythm, and workbench sessions.
- **SnowLuma** carries the QQ connection. The **Bilibili inbox service** does read-only polling with a timeout.
- **Supporting pieces**, when needed, provide voice, Doubao image generation, search, and Bailian.

Here, learning means taking in something new and keeping memory she can use. Updating model weights is outside this deployment.

### What this repository holds

The sections above are the record of that local deployment. The source in this repository is two Node.js components that can be tested on their own. The package name is `yujiang-integration-examples`, and the license is [MIT](LICENSE).

| In this repository | Kept on the local machine |
| --- | --- |
| OneBot account check before a loopback HTTP action, `src/onebot-account-guard.mjs` | DeepSeek workbench, SurfCore, and SnowLuma |
| Read-only Bilibili inbox for replies and @ mentions, `src/bili-inbox-worker.mjs`, `src/bili-msgfeed.mjs` | Voice, image generation, search, Bailian, the desktop pet, and their models |
| Tests, `test/integrations.test.mjs` | Account credentials, private-chat text, character memory, installers, and runtime state |

Usage, placeholders, and the limits of these two components in the source are in [docs/USAGE.md](docs/USAGE.md). Origin and the upstream license are in [docs/open-source.md](docs/open-source.md).

### Docs

- [Component usage](docs/USAGE.md)
- [Open-source components, usage, and origin](docs/open-source.md)
- [Day-to-day operation](docs/operations.md)
- [Checks, known limits, and open items](docs/verification.md)
- [Changelog](CHANGELOG.md)
