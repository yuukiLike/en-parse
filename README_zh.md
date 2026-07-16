# Phrase Lens

English version: [README.md](README.md)

Phrase Lens 是一个本地优先的英语学习工具。粘贴一段英文，点击“分析短语”，它会用不同颜色高亮值得记忆的短语、搭配和句子结构，并让你为每句话补充中文翻译。

- 红色：值得记忆的短语、术语和搭配。
- 绿色：语法、句子结构和逻辑连接词。

当前项目使用 `pnpm`、Vite、React、TypeScript、Mantine 和 lucide 图标。解析逻辑和资料库模型位于可复用的 domain 模块中，未来浏览器插件、Raycast 和 iOS 端可以共享同一套数据模型。

## 当前功能

- 粘贴英文，并高亮有价值的短语和句子结构。
- 保留原文中的自然段，点击任意段落即可选中并聚焦阅读。
- 使用浏览器本机英文音色朗读选中段落，支持音色、语速、暂停、继续、停止和上下段切换。
- 朗读时逐句高亮并显示进度，文本不会被发送到 Phrase Lens 服务端。
- 为每句话添加或编辑中文翻译。
- 将当前阅读会话保存到本地资料库。
- 将复制的笔记保存为可迁移的本地记忆。
- 使用浏览器本地存储维护单词本。
- 将资料库导出为 JSON、Markdown 或 CSV。
- 导入 JSON 资料库备份，并与本地数据合并。

## 产品流程

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'Inter, ui-sans-serif, system-ui','lineColor':'#94a3b8','primaryTextColor':'#17211d'}}}%%
flowchart LR
  Capture["粘贴英文"] --> Analyze["分析短语"]
  Analyze --> Read["阅读红绿高亮"]
  Read --> Translate["补充中文翻译"]
  Translate --> Save["保存到本地资料库"]
  Save --> Export["导出可迁移文件"]
  Export --> Sync["使用 iCloud Drive 迁移或备份"]

  classDef capture fill:#fff7ed,stroke:#f97316,color:#9a3412,stroke-width:2px
  classDef analyze fill:#eff6ff,stroke:#3b82f6,color:#1e3a8a,stroke-width:2px
  classDef read fill:#f0fdf4,stroke:#22c55e,color:#166534,stroke-width:2px
  classDef translate fill:#fdf2f8,stroke:#ec4899,color:#9d174d,stroke-width:2px
  classDef save fill:#ecfeff,stroke:#06b6d4,color:#155e75,stroke-width:2px
  classDef export fill:#fefce8,stroke:#eab308,color:#854d0e,stroke-width:2px
  classDef sync fill:#f1f5f9,stroke:#64748b,color:#334155,stroke-width:2px

  class Capture capture
  class Analyze analyze
  class Read read
  class Translate translate
  class Save save
  class Export export
  class Sync sync
  linkStyle default stroke:#94a3b8,stroke-width:2px
```

## 产品方向

Phrase Lens 坚持本地优先。用户的单词本、复制记忆和阅读会话默认保存在本地，并且可以导出、检查、导入和迁移。

如果需要同步，优先使用 Apple iCloud Drive 作为用户自己的文件同步层，而不是建设专有云服务。Phrase Lens 不要求账号或托管数据库才能完成核心学习流程。

详见：[docs/product-spec.md](docs/product-spec.md)

## 本地运行

```bash
pnpm install
pnpm run dev
```

打开终端输出的 Vite 地址，通常是 <http://127.0.0.1:5173/>。

## 常用命令

```bash
pnpm run dev
pnpm run typecheck
pnpm run build
```

## 项目结构

```text
src/
  components/        Mantine UI 面板
  data/              示例文本、短语规则和示例翻译
  domain/            解析器和可迁移资料库模型
  services/          浏览器存储适配器
  utils/             导出和下载工具
```

## 数据原则

翻译是可以编辑的本地数据。核心阅读和记忆流程不依赖翻译 API；用户可以在阅读面板中补充译文，并将它和短语、例句、阅读会话一起保存和迁移。语音朗读使用浏览器的 Web Speech API，默认优先选择设备本机音色，不需要 Phrase Lens 账号、API Key 或自建语音服务。
