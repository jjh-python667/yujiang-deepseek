# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

本文件记录本仓库的显著变更，格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。本仓库的 `package.json` 没有版本号，因此条目标题使用日期，不另编版本号。

## [Unreleased]

## [2026-11-11]

Documentation only. No application code, configuration, or license file was modified. Git history was not rewritten.

只更新文档。没有修改程序代码、配置或许可证，也没有改写 git 历史。

未改动的路径：`src/`、`test/`、`package.json`、`.gitignore`、`LICENSE`、`docs/open-source.md`、`docs/operations.md`、`docs/verification.md`。

### Added

- 新增 [docs/DEPLOY.md](docs/DEPLOY.md)。内容限于本仓库已有的测试命令、B 站只读命令行、OneBot 库函数约束，以及运维文档里已经写下的本机环境。凭据示例只有 `<SESSDATA>`、`<BILI_JCT>`、`<BUVID3>` 和 `<QQ_BOT_ACCOUNT_ID>` 这类占位符。
- Added [docs/DEPLOY.md](docs/DEPLOY.md). It covers the in-repo test command, the read-only Bilibili command, the OneBot helper's constraints, and the local environment already described by the operations notes. Credential examples are placeholders such as `<SESSDATA>`, `<BILI_JCT>`, `<BUVID3>`, and `<QQ_BOT_ACCOUNT_ID>`.
- 新增本变更记录。
- Added this changelog.

### Changed

- 重写 [README.md](README.md) 为中英双语：说明仓库里实际有的文件、文档所记录的本机部署，以及这里能执行的命令。文首标明 2026-11-11 的变更只更新部署说明与文档，没有修改代码。
- Rewrote [README.md](README.md) in Chinese and English. It describes the files that are actually here, the local deployment recorded in the existing docs, and the commands that can be run. The top of the file states that the 2026-11-11 change updates deployment notes and documentation only and does not change code.
