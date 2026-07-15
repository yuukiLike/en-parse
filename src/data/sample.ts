import type { PhraseRule } from "../domain/parser";

export const sampleText = `Here's what I understand: you want to shape a small stock tool for A-shares, Hong Kong stocks, and US stocks, with React as the likely web
  base and Raycast as a possible plugin surface. Current project directory is empty and not a git repo, so we are deciding product shape before
  implementation.

  D1 — What's the goal?

  Reply with one option letter. This decides whether I run this like startup diagnosis or builder brainstorming.

  ELI10: The same stock tool should be designed differently depending on why you are building it. A startup version needs proof that a specific
  person has a painful workflow. A side-project version should optimize for speed, personal usefulness, and a “whoa, I’d use that” interaction.

  Recommendation: F because your wording sounds like a personal/simple tool first, not a validated company yet.

  A) Building a startup. Note: options differ in kind, not coverage. This means we will challenge demand hard: who needs it, what they use now,
  and why they would pay or depend on it.

  B) Internal/company tool. Note: options differ in kind, not coverage. This means we optimize for sponsor approval, fast demo value, and
  maintainability inside a team.

  C) Hackathon/demo. Note: options differ in kind, not coverage. This means we optimize for visible “wow” quickly, even if the data pipeline is
  thinner.

  D) Open source/research. Note: options differ in kind, not coverage. This means we optimize for extensibility, clean APIs, and a useful
  community wedge.

  E) Learning. Note: options differ in kind, not coverage. This means we choose stack and scope to teach React, data fetching, deployment, and
  Raycast packaging cleanly.

  F) Having fun / personal side project (recommended). Note: options differ in kind, not coverage. This means we build the fastest useful
  version you personally want to check every day.

  Net: pick the real reason, not the impressive reason. The design doc will follow that choice.`;

export const phraseRules: PhraseRule[] = [
  {
    phrase: "Here's what I understand",
    color: "green",
    meaning: "我理解的是；用来复述对方需求，语气自然。",
  },
  {
    phrase: "shape a small stock tool",
    color: "red",
    meaning: "打磨/设计一个小型股票工具。shape 表示塑造产品方向。",
  },
  { phrase: "A-shares", color: "red", meaning: "A 股。" },
  { phrase: "Hong Kong stocks", color: "red", meaning: "港股。" },
  { phrase: "US stocks", color: "red", meaning: "美股。" },
  {
    phrase: "with React as the likely web base",
    color: "green",
    meaning: "with A as B：把 React 作为可能的网页基础。",
  },
  {
    phrase: "possible plugin surface",
    color: "red",
    meaning: "可能的插件承载界面/入口。",
  },
  { phrase: "project directory", color: "red", meaning: "项目目录。" },
  { phrase: "not a git repo", color: "red", meaning: "不是一个 Git 仓库。" },
  {
    phrase: "so we are deciding",
    color: "green",
    meaning: "so 引出结果：所以我们正在决定……",
  },
  { phrase: "product shape", color: "red", meaning: "产品形态/产品轮廓。" },
  {
    phrase: "before implementation",
    color: "green",
    meaning: "在实现之前；before + 名词/动名词结构。",
  },
  {
    phrase: "What's the goal",
    color: "green",
    meaning: "目标是什么；直接定位讨论目的。",
  },
  {
    phrase: "Reply with one option letter",
    color: "green",
    meaning: "用一个选项字母回答。with 表示回答的形式。",
  },
  {
    phrase: "This decides whether",
    color: "green",
    meaning: "这会决定是否/究竟……；whether 引导选择。",
  },
  { phrase: "startup diagnosis", color: "red", meaning: "创业诊断；判断需求、用户和商业假设。" },
  { phrase: "builder brainstorming", color: "red", meaning: "建造者式头脑风暴；偏向快速做东西。" },
  { phrase: "The same stock tool", color: "red", meaning: "同一个股票工具。" },
  { phrase: "designed differently", color: "green", meaning: "被设计得不同；被动结构。" },
  {
    phrase: "depending on why",
    color: "green",
    meaning: "取决于为什么……；depending on 引出条件。",
  },
  { phrase: "startup version", color: "red", meaning: "创业版/面向创业验证的版本。" },
  { phrase: "proof that", color: "green", meaning: "证明某件事；that 引导证明的内容。" },
  { phrase: "specific person", color: "red", meaning: "具体的人；强调不是泛泛用户。" },
  { phrase: "painful workflow", color: "red", meaning: "痛苦的工作流；值得被产品解决的流程。" },
  { phrase: "side-project version", color: "red", meaning: "个人副项目版本。" },
  { phrase: "optimize for", color: "red", meaning: "针对……优化；产品/工程讨论里很常用。" },
  { phrase: "personal usefulness", color: "red", meaning: "个人实用性。" },
  { phrase: "whoa, I'd use that", color: "red", meaning: "哇，我会用这个；表达直觉上的吸引力。" },
  {
    phrase: "your wording sounds like",
    color: "green",
    meaning: "你的措辞听起来像……；sound like 判断语气。",
  },
  { phrase: "validated company", color: "red", meaning: "已验证的公司/商业项目。" },
  {
    phrase: "not coverage",
    color: "green",
    meaning: "不是覆盖范围；not A, but B 的对比用法。",
  },
  { phrase: "This means", color: "green", meaning: "这意味着；用来解释前一句的后果。" },
  { phrase: "challenge demand hard", color: "red", meaning: "严格质疑需求；hard 表示力度强。" },
  { phrase: "what they use now", color: "green", meaning: "他们现在用什么；what 引导宾语从句。" },
  {
    phrase: "would pay or depend on it",
    color: "green",
    meaning: "愿意付费或依赖它；would 表示假设意愿。",
  },
  { phrase: "fast demo value", color: "red", meaning: "快速演示价值。" },
  { phrase: "maintainability inside a team", color: "red", meaning: "团队内部的可维护性。" },
  { phrase: "visible wow", color: "red", meaning: "看得见的惊艳点。" },
  { phrase: "even if", color: "green", meaning: "即使；让步结构。" },
  { phrase: "data pipeline", color: "red", meaning: "数据管线。" },
  { phrase: "clean APIs", color: "red", meaning: "清晰的 API。" },
  { phrase: "community wedge", color: "red", meaning: "社区切入点；能吸引一小群人的入口。" },
  { phrase: "data fetching", color: "red", meaning: "数据请求/获取。" },
  { phrase: "deployment", color: "red", meaning: "部署。" },
  { phrase: "Raycast packaging", color: "red", meaning: "Raycast 插件打包。" },
  { phrase: "fastest useful version", color: "red", meaning: "最快可用版本。" },
  {
    phrase: "personally want to check every day",
    color: "green",
    meaning: "你个人每天都想查看；want to + 动词原形。",
  },
  { phrase: "pick the real reason", color: "green", meaning: "选真实原因；祈使句。" },
  { phrase: "not the impressive reason", color: "green", meaning: "而不是听起来厉害的原因；对比结构。" },
  { phrase: "design doc", color: "red", meaning: "设计文档。" },
  { phrase: "will follow that choice", color: "green", meaning: "会跟随那个选择；follow 表示由它决定。" },
];

export const sampleTranslations = new Map<string, string>([
  [
    "Here's what I understand: you want to shape a small stock tool for A-shares, Hong Kong stocks, and US stocks, with React as the likely web base and Raycast as a possible plugin surface.",
    "我的理解是：你想做一个覆盖 A 股、港股和美股的小型股票工具，网页端大概率用 React，Raycast 也可能作为插件入口。",
  ],
  [
    "Current project directory is empty and not a git repo, so we are deciding product shape before implementation.",
    "当前项目目录是空的，也不是 Git 仓库，所以我们是在实现之前先确定产品形态。",
  ],
  ["D1 — What's the goal?", "D1——目标是什么？"],
  ["Reply with one option letter.", "用一个选项字母回复即可。"],
  [
    "This decides whether I run this like startup diagnosis or builder brainstorming.",
    "这会决定我是按创业诊断来推进，还是按建造者式头脑风暴来推进。",
  ],
  [
    "ELI10: The same stock tool should be designed differently depending on why you are building it.",
    "像给 10 岁孩子解释一样说：同一个股票工具，会因为你构建它的原因不同而被设计成不同形态。",
  ],
  [
    "A startup version needs proof that a specific person has a painful workflow.",
    "创业版本需要证明：某个具体的人确实有一个痛苦的工作流程。",
  ],
  [
    "A side-project version should optimize for speed, personal usefulness, and a “whoa, I’d use that” interaction.",
    "个人副项目版本应该优先优化速度、个人实用性，以及那种“哇，我会用这个”的交互感。",
  ],
  [
    "Recommendation: F because your wording sounds like a personal/simple tool first, not a validated company yet.",
    "建议选 F，因为你的措辞听起来首先像是个人/简单工具，而不是已经验证过的公司项目。",
  ],
  ["A) Building a startup.", "A）做创业项目。"],
  ["Note: options differ in kind, not coverage.", "注意：这些选项区别在类型，而不是覆盖范围。"],
  [
    "This means we will challenge demand hard: who needs it, what they use now, and why they would pay or depend on it.",
    "这意味着我们会严格质疑需求：谁需要它、他们现在用什么，以及他们为什么会付费或依赖它。",
  ],
  ["B) Internal/company tool.", "B）内部/公司工具。"],
  [
    "This means we optimize for sponsor approval, fast demo value, and maintainability inside a team.",
    "这意味着我们会优化赞助人认可、快速演示价值，以及团队内部的可维护性。",
  ],
  ["C) Hackathon/demo.", "C）黑客松/演示项目。"],
  [
    "This means we optimize for visible “wow” quickly, even if the data pipeline is thinner.",
    "这意味着我们会快速做出可见的惊艳点，即使数据管线相对单薄。",
  ],
  ["D) Open source/research.", "D）开源/研究项目。"],
  [
    "This means we optimize for extensibility, clean APIs, and a useful community wedge.",
    "这意味着我们会优化可扩展性、清晰的 API，以及有用的社区切入点。",
  ],
  ["E) Learning.", "E）学习。"],
  [
    "This means we choose stack and scope to teach React, data fetching, deployment, and Raycast packaging cleanly.",
    "这意味着我们会选择合适的技术栈和范围，清楚地学习 React、数据请求、部署和 Raycast 打包。",
  ],
  ["F) Having fun / personal side project (recommended).", "F）好玩/个人副项目（推荐）。"],
  [
    "This means we build the fastest useful version you personally want to check every day.",
    "这意味着我们会构建一个你个人每天都想查看的最快可用版本。",
  ],
  ["Net: pick the real reason, not the impressive reason.", "结论：选择真实原因，而不是听起来厉害的原因。"],
  ["The design doc will follow that choice.", "设计文档会跟随这个选择展开。"],
]);
