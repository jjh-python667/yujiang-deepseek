# 开源代码

本仓库按 MIT 许可发布两项从本机部署整理出来的 Node.js 集成组件。生产集成还需要 DeepSeek 工作台、SurfCore、OneBot 适配器和各平台的本机配置。这里提供独立可读、可测试的实现。

## 运行测试

安装 Node.js 22.13 或更新版本。克隆后在仓库根目录运行：

```sh
npm test
```

测试只使用模拟 HTTP 和虚构账号，不需要配置凭据或运行 QQ、B 站。

## QQ / OneBot 账号校验

[src/onebot-account-guard.mjs](../src/onebot-account-guard.mjs) 暴露 `guardedOneBotFetch(expected, url, options)`。传入机器人的预期账号、回环 HTTP 动作地址，以及正常的 fetch 请求选项。程序先查询同一适配器的登录身份。账号不符时抛出 `QQ_ACCOUNT_MISMATCH`，拦住后续动作。

这个实现用于 HTTP。登录查询和业务动作是两个请求，中间仍有时间窗口。多账号部署应使用独立的 OneBot 端口。生产环境的 WS 防护属于 SurfCore 桥接集成层。

## B 站收件箱

[src/bili-inbox-worker.mjs](../src/bili-inbox-worker.mjs) 暴露 `readInbox(credentialsFile, scope)`。`scope` 为 `reply` 或 `both`，分别读取回复，或同时读取回复和 @。需要调用者提供本机 JSON 文件，字段为 `sessdata`、`bili_jct` 和 `buvid3`。

命令行模式接收凭据文件路径和 scope。程序只读取收件箱元数据，不发布评论或动态。任一路失败会返回带错误码和提示的对象。调用方仅在成功后推进自己的处理位置，并按配置间隔重试。

## 来源与授权

从 [Mieksido/surfcore](https://github.com/Mieksido/surfcore) 的集成思路和本机部署修复提取，保留 [上游 MIT 版权声明](https://github.com/Mieksido/surfcore/blob/main/LICENSE)。许可证见仓库根目录 [LICENSE](../LICENSE)。生产账号数据、模型权重、声音和图片素材、第三方运行时均由各自来源管理。
