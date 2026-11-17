# 强化学习的数学原理 · 思维导图

赵世钰《强化学习的数学原理》十章内容的交互式复盘图谱。**单文件、离线可用**，公式由内嵌 KaTeX（含字体）渲染，不依赖任何 CDN。

**在线预览** → https://qiongjin-x.github.io/rl-mindmap/

---

## 三个视图

| 视图 | 说明 |
|---|---|
| **概要全图** | 根节点 → 十章主干 → 每章挂全部条目，一张连续画布，十章不换页。点条目看详解，点章节卡跳章节视图 |
| **章节视图** | 十章纵向卡片，每章摊开条目、要点与公式，标题可折叠 |
| **主线视图** | 前置地基（1→2→3→4）+ 三条方法论主线，桥上标注过渡动因 |

## 内容规模

- **10 章**、**74 个概念与算法**、**67 条公式**
- 覆盖：MDP 与贝尔曼方程 → 最优方程与压缩映射 → 值迭代/策略迭代 → 蒙特卡洛 → 随机近似（RM/SGD） → 时序差分（Sarsa/Expected Sarsa/n-step/Q-learning） → 函数逼近与 DQN → 策略梯度与 REINFORCE/A2C → 演员-评论家与 DPG
- 每个条目含：一句话定义、公式、推导要点、相关条目跳转

## 交互

- **点任意条目** → 右侧抽屉：KaTeX 公式、具体内容要点、可继续点击的相关条目
- 顶栏搜索（过滤 + 高亮）、缩放 50%–140%、**紧凑模式**（隐去副标题，全图压缩约一半）
- `?open=bellman_eq` 深链，可直接打开某个条目
- 打印时自动展开，可导出为一张长 PDF

## 仓库结构

```
index.html              生成好的单文件（GitHub Pages 入口，勿手改）
build/app.html          页面骨架、样式与渲染逻辑
build/data/*.js         全部内容 —— 要改内容只动这里
build/build.py          打包脚本（内联 KaTeX 与数据）
build/fetch_assets.py   下载 KaTeX 到 build/katex/（未纳入版本库）
build/smoke.js          数据完整性 + 渲染冒烟测试
build/check_tex.js      用真实 KaTeX 逐条编译公式
```

## 本地构建

```bash
python build/fetch_assets.py   # 首次：拉取 KaTeX 0.16.11
python build/build.py          # 生成 ../强化学习的数学原理_思维导图.html
node build/smoke.js            # 校验：无坏链 / 无游离节点 / 章节卡渲染
node build/check_tex.js        # 校验：67 条公式全部可编译
```

`build/data/*.js` 的数据结构：

```js
{ id:'bellman_eq', name:'贝尔曼方程', kind:'concept|algo|formula', ch:2,
  brief:'一句话', formulas:[String.raw`...`], points:['要点'], links:['相关条目 id'] }
```

---

内容为个人学习整理，推导与公式参考原书；KaTeX 依 MIT 协议分发（已内嵌，运行时无需联网）。
