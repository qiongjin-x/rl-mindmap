/* 第 1–3 章：基础工具板块。内容取自「概要-1~3」与「具体内容-2~12」 */
NODES.push(
  /* ================= 第 1 章 基本概念 ================= */
  {
    id:'state_action', name:'状态与动作', kind:'concept', ch:1, en:'states & actions',
    brief:'用两个集合描述"在哪儿"和"能做什么"',
    points:[
      '状态集合 `{s_i}`、动作集合 `{a_i}`，都是有限离散集合。',
      '每个状态可用的动作不同：图中 s1 只连出 a1、a2，另一个状态可能连出 a1…a5。',
      '动作决定了"图的边"：同一个状态下选不同动作，会走向不同后继。'
    ],
    links:['transition_prob','mdp']
  },
  {
    id:'transition_prob', name:'状态转移与 p(s′|s,a)', kind:'concept', ch:1, en:'state transition',
    brief:'选定动作后，环境按概率跳到下一状态',
    formulas:[String.raw`p(s'|s,a)=P(S_{t+1}=s'\mid S_t=s,\,A_t=a)`],
    points:[
      '示例：`p(s2|s1,a2)=1`，而 `p(s_i|s1,a2)=0`（i≠2）——确定性转移是概率转移的特例。',
      '也存在自环：`s1 --a1--> s1`。',
      '**"禁区"不是硬约束**：仍可进入，只是给负奖励（r_bound / r_forbid = −1），由值函数去权衡。'
    ],
    links:['state_action','reward','mdp']
  },
  {
    id:'policy', name:'策略 π(a|s)', kind:'concept', ch:1, en:'policy',
    brief:'给定状态选动作的概率分布，是要学的东西',
    formulas:[String.raw`\pi(a|s)=P(A_t=a\mid S_t=s),\qquad \sum_a\pi(a|s)=1`],
    points:[
      '确定性策略是特例：`π(a2|s1)=1`，其余动作概率为 0。',
      '本书把策略当"待求量"：前九章通过值函数间接求它，第九章直接把它参数化成 `π(a|s,θ)`。'
    ],
    links:['onoff','policy_grad_obj']
  },
  {
    id:'reward', name:'奖励 r 与 p(r|s,a)', kind:'concept', ch:1, en:'reward',
    brief:'单步的即时标量信号，决定学到的行为',
    formulas:[String.raw`p(r|s,a)=P(R_{t+1}=r\mid S_t=s,\,A_t=a)`],
    points:[
      '示例设定：`r_target = 1`，`r_bound / r_forbid = −1`，`r_other = 0`。',
      '奖励由 (s,a) 决定，也可能依赖后继 s′；它和"回报"不是一回事：奖励是单步，回报是折扣累加。',
      '奖励设计错了，策略就会学成你不想要的样子——这是工程上最容易被低估的一步。'
    ],
    links:['return','mdp']
  },
  {
    id:'trajectory', name:'轨迹 trajectory', kind:'concept', ch:1, en:'trajectory',
    brief:'state – action – reward 串成的一条线',
    points:[
      '示例：`s1 --a2/r=0--> s2 --a3/r=0--> s5 --a3/r=0--> s8 --a2/r=1--> s9`。',
      '轨迹是策略与环境交互的产物，也是蒙特卡罗方法唯一的信息来源。',
      '（具体内容-2 里这条轨迹的回报恰好为 1。）'
    ],
    links:['return','mc_basic']
  },
  {
    id:'episode', name:'回合 episode', kind:'concept', ch:1, en:'episode / trial',
    brief:'有限步的一次试验；episodic 与 continuing 两类任务',
    points:[
      'episode（或 trial）：从初始状态走到终止状态的一段有限交互。',
      'episodic tasks 有终止状态；continuing tasks 永远不结束。',
      '这个区分决定了算法能不能"等回合结束"：MC 必须等，TD 不必。'
    ],
    links:['return','mc_basic','td_state']
  },
  {
    id:'return', name:'回报 G_t', kind:'formula', ch:1, en:'return',
    brief:'一条轨迹上折扣奖励之和；单条是 return，多条平均才是值',
    formulas:[
      String.raw`G_t=R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots`,
      String.raw`G_t=R_{t+1}+\gamma G_{t+1}`
    ],
    points:[
      'return：单条轨迹的折扣累加；state value：它的期望/平均。',
      '第二行是全部贝尔曼方程的种子：把回报拆成"即时 + 折扣的未来"。'
    ],
    links:['discount','state_value']
  },
  {
    id:'discount', name:'折扣因子 γ', kind:'concept', ch:1, en:'discount',
    brief:'0 ≤ γ < 1，把无限项压成有限值，也调节 agent 的视距',
    formulas:[String.raw`1+\gamma+\gamma^2+\cdots=\frac{1}{1-\gamma}`],
    points:[
      '`γ ∈ [0,1)`：γ 越接近 1，越重视远期奖励；γ = 0 只看下一步。',
      '示例：`0·γ⁰ + γ·0 + γ²·0 + γ³·1 + γ⁴·1 + … = γ³/(1−γ)`。',
      'γ 是**设计参数**，不是学出来的：它决定"看多远"，也决定收敛速度。'
    ],
    links:['return','invariance']
  },
  {
    id:'mdp', name:'MDP 的定义', kind:'concept', ch:1, en:'Markov decision process',
    brief:'Sets / Probability / Policy 三件套，核心是 memoryless',
    points:[
      'I. Sets：`S`、`A(s)`、`R(s,a)`。',
      'II. Probability：`p(s′|s,a)`、`p(r|s,a)`。',
      'III. Policy：`π(a|s)`。',
      'Markov / memoryless：下一步只依赖当前 (s,a)，历史被压缩进当前状态——这是所有公式能写成一步递推的前提。'
    ],
    links:['state_action','transition_prob','bellman_eq']
  },
  {
    id:'onoff', name:'on-policy 与 off-policy', kind:'concept', ch:1, en:'behavior vs target policy',
    brief:'behavior policy 生成数据，target policy 才是学习目标',
    points:[
      'behavior policy：负责**生成经验样本**（可以带探索）。',
      'target policy：负责**定义学习目标**（朝着它更新）。',
      '两者一致 → on-policy；不一致 → off-policy。',
      '这条区分贯穿全书：MC 与 Sarsa 是 on-policy，Q-learning 是 off-policy。'
    ],
    links:['qlearning','sarsa','offpolicy_ac']
  },

  /* ================= 第 2 章 贝尔曼方程 ================= */
  {
    id:'state_value', name:'状态值 V_π(s)', kind:'formula', ch:2, en:'state value',
    brief:'从 s 出发、按 π 走下去，回报的期望',
    formulas:[String.raw`V_\pi(s)=\mathbb{E}\big[G_t\mid S_t=s\big]`],
    points:[
      'G_t 是随机变量（取决于轨迹），V_π 是它的期望——这就是"return"与"value"的区别。',
      '它依赖策略 π：换个策略，同一状态的值就变了。'
    ],
    links:['return','bellman_eq','action_value']
  },
  {
    id:'return_recursion', name:'回报的递归拆分', kind:'formula', ch:2,
    brief:'G_t = R_{t+1} + γG_{t+1}，贝尔曼方程的第一步',
    formulas:[String.raw`G_t=R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots=R_{t+1}+\gamma G_{t+1}`],
    points:[
      '提出 γ 后括号里正好又是"从 t+1 开始的回报"。',
      '拆项让期望可以分成两块：即时奖励的期望 + 后继状态值的期望。'
    ],
    links:['return','bellman_eq']
  },
  {
    id:'bellman_eq', name:'贝尔曼方程', kind:'formula', ch:2, en:'Bellman equation',
    brief:'给定策略下，V_π 必须满足的自洽方程',
    formulas:[String.raw`V_\pi(s)=\sum_a\pi(a|s)\Big[\sum_r p(r|s,a)\,r+\gamma\sum_{s'}p(s'|s,a)V_\pi(s')\Big]`],
    points:[
      '结构上分三块：① policy 加权（外层 Σ_aπ）② one step 即时奖励 ③ next step 后继值。',
      '推导：`V_π(s)=E[R_{t+1}+γG_{t+1}|S_t=s]`，第一项用 memoryless 化简成 `Σ_aπ(a|s)Σ_r p(r|s,a)r`，第二项化成 `Σ_{s′}V_π(s′)Σ_a p(s′|s,a)π(a|s)`。',
      '它是**线性方程**：只有 V_π 一个未知量，且对 V 是线性的 → 有闭式解。'
    ],
    links:['state_value','matrix_form','action_value']
  },
  {
    id:'matrix_form', name:'矩阵-向量形式', kind:'formula', ch:2,
    brief:'把所有状态堆成向量，V_π = r_π + γP_πV_π',
    formulas:[String.raw`V_\pi=r_\pi+\gamma P_\pi V_\pi`],
    points:[
      '`r_π(s) ≜ Σ_aπ(a|s)Σ_r p(r|s,a)r`：策略下的期望即时奖励。',
      '`P_π(s′|s) ≜ Σ_aπ(a|s)p(s′|s,a)`：策略诱导的转移矩阵，`[P_π]_{ij}=p(s_j|s_i)` 是第 i 行第 j 列。',
      '写成矩阵后，第 4 章的迭代、第 8 章的收敛都只是矩阵乘法。'
    ],
    links:['bellman_eq','iterative_solve','direct_solve']
  },
  {
    id:'iterative_solve', name:'迭代解与收敛证明', kind:'formula', ch:2,
    brief:'V_{k+1}=r_π+γP_πV_k，k→∞ 收敛到 V_π',
    formulas:[
      String.raw`V_{k+1}=r_\pi+\gamma P_\pi V_k,\qquad k\to\infty`,
      String.raw`\delta_{k+1}=\gamma P_\pi\delta_k=\cdots=\gamma^{k+1}P_\pi^{k+1}\delta_0\to 0`
    ],
    points:[
      '证明套路：令 `δ_k=V_k−V_π`，代入得 `δ_{k+1}=γP_πδ_k`，反复展开成 `γ^{k+1}P_π^{k+1}δ_0`。',
      'γ<1 且 P_π 每行和为 1 → 范数被 γ 不断压缩 → 误差归零。',
      '这个"压缩"思想在第 3 章变成压缩映射定理，是值迭代收敛的正式依据。'
    ],
    links:['matrix_form','direct_solve','contraction']
  },
  {
    id:'direct_solve', name:'直接解（矩阵求逆）', kind:'formula', ch:2,
    brief:'闭式解 V_π = (I−γP_π)^{-1} r_π，但代价是求逆',
    formulas:[String.raw`V_\pi=(I-\gamma P_\pi)^{-1}r_\pi`],
    points:[
      'n 个状态就要解 n×n 的逆，O(n³)。',
      '只在状态很少时可用；大规模（或连续状态）必须换成迭代或函数逼近。'
    ],
    links:['matrix_form','iterative_solve']
  },
  {
    id:'action_value', name:'动作值 q_π(s,a)', kind:'formula', ch:2, en:'action value',
    brief:'先固定第一步动作，之后的回报期望',
    formulas:[
      String.raw`q_\pi(s,a)=\mathbb{E}\big[G_t\mid S_t=s,\,A_t=a\big]`,
      String.raw`q_\pi(s,a)=\sum_r p(r|s,a)\,r+\gamma\sum_{s'}p(s'|s,a)V_\pi(s')`
    ],
    points:[
      '与 V 的区别只在于"第一步动作是否已给定"。',
      '第一项是 immediate reward，第二项是后继状态值的折扣和。',
      '注意：`q` 里没有 `Σ_aπ`——动作已经被固定了，这正是它能用来做 argmax 的原因。'
    ],
    links:['state_value','vq','bellman_eq']
  },
  {
    id:'vq', name:'V 与 q 的互推', kind:'formula', ch:2,
    brief:'两个量互为桥梁，全书在它们之间来回切换',
    formulas:[
      String.raw`V_\pi(s)=\sum_a\pi(a|s)\,q_\pi(s,a)`,
      String.raw`q_\pi(s,a)=\sum_r p(r|s,a)r+\gamma\sum_{s'}p(s'|s,a)V_\pi(s')`
    ],
    points:[
      '`V ← π 加权 q`：给定策略，把动作值按概率平均。',
      '`q ← 即时奖励 + γ 后继 V`：给定后继状态值，算出每个动作的价值。',
      '后面的差别全在"用哪个式子、要不要等回合结束"。'
    ],
    links:['action_value','state_value','vi_algorithm']
  },

  /* ================= 第 3 章 贝尔曼最优方程 ================= */
  {
    id:'optimal_policy', name:'最优策略 π*', kind:'concept', ch:3,
    brief:'每个状态的值都不低于其它策略，才算最优',
    formulas:[String.raw`V_{\pi^*}(s)\ge V_\pi(s),\qquad \forall s\in\mathcal{S}`],
    points:[
      '定义是"逐状态比较"，不是"总体平均更好"。',
      '改进路径：改动作 → 得到新策略 → 再评估 → 直到无法改进。',
      '这也解释了为什么策略迭代一定能收敛：每一步都在单调变好。'
    ],
    links:['boe','pi_algorithm']
  },
  {
    id:'boe', name:'贝尔曼最优方程', kind:'formula', ch:3, en:'Bellman optimality equation',
    brief:'最优策略也满足一个自洽方程，只是把 Σ 换成了 max',
    formulas:[String.raw`V(s)=\max_{\pi}\sum_a\pi(a|s)\,q(s,a),\qquad s\in\mathcal{S}`],
    points:[
      '矩阵形式：`V = max_π (r_π+γP_πV_π)`。',
      '和贝尔曼方程的唯一差别是把"对策略求加权平均"换成"对策略取最优"。',
      '代价：多了 max，方程变非线性，**不能**再用矩阵求逆，只能迭代（值迭代/策略迭代）。'
    ],
    links:['optimal_policy','max_reduce','contraction']
  },
  {
    id:'max_reduce', name:'从 max_π 化简到 max_a', kind:'formula', ch:3,
    brief:'固定的 q 下，最优策略一定把概率全押在最优动作上',
    formulas:[
      String.raw`\max_{\pi}\sum_a\pi(a|s)q(s,a)=\max_{a\in\mathcal{A}(s)}q(s,a)`,
      String.raw`\pi(a|s)=\begin{cases}1,&a=a^*\\ 0,&a\ne a^*\end{cases},\quad a^*=\arg\max_a q(s,a)`
    ],
    points:[
      '因为 Σ_aπ(a|s)=1 是单纯形上的线性函数，极值必在顶点取得。',
      '于是"优化策略"退化成了"选最大 q 的动作"——这就是 greedy 策略。',
      '这一步是值迭代能用 `V_{k+1}=max_a q_k` 的全部理由。'
    ],
    links:['boe','vi_algorithm','greedy']
  },
  {
    id:'contraction', name:'压缩映射', kind:'formula', ch:3,
    brief:'把最优方程写成 v=f(v)，这个 f 是 γ-压缩的',
    formulas:[String.raw`\|f(v_1)-f(v_2)\|\le\gamma\|v_1-v_2\|,\qquad \gamma\in(0,1)`],
    points:[
      'f 就是 `max_π(r_π+γP_πv)`：两个不同的 v 经过 f 之后距离至少缩短 γ 倍。',
      'γ<1 保证压缩，所以在 (0,1) 而不是 [0,1]。',
      '压缩性同时给出两件事：不动点唯一 + 迭代必然收敛。'
    ],
    links:['cmt','boe','iterative_solve']
  },
  {
    id:'cmt', name:'压缩映射定理', kind:'concept', ch:3, en:'contraction mapping theorem',
    brief:'压缩映射存在且只存在一个不动点，迭代必到',
    formulas:[String.raw`x^*=f(x^*),\qquad x_{k+1}=f(x_k)\ \to\ x^*`],
    points:[
      '若 f 是压缩映射，则：① 不动点存在 ② 唯一 ③ 从任意初值迭代都收敛到它。',
      '这三条正好回答了"值迭代为什么一定收敛、极限是不是唯一的最优值"。',
      '定理本身是纯数学结论，用在 RL 里只需要证明 f 是压缩的。'
    ],
    links:['contraction','vi_algorithm']
  },
  {
    id:'vi_fixed_point', name:'值迭代 = 不动点迭代', kind:'formula', ch:3,
    brief:'V_{k+1}=max_a q_k 就是 f 作用一次',
    formulas:[String.raw`V_{k+1}=\max_{\pi}\sum_a\pi(a|s)q_k(s,a)=\max_a q_k(s,a)`],
    points:[
      '把 BOE 右端看成算子 f，值迭代就是 `V_{k+1}=f(V_k)`。',
      '所以"算法收敛"不是经验，而是压缩映射定理的直接推论。',
      '截断策略迭代、策略迭代，本质上都是同一个不动点问题的不同解法。'
    ],
    links:['cmt','vi_algorithm','truncated_pi']
  },
  {
    id:'invariance', name:'最优解的不变性', kind:'concept', ch:3,
    brief:'哪些改动不改变 π*，哪些会',
    points:[
      '**γ 单调/随机变化**：会改变 π*（视距变了，最优行为可能变）。',
      '**奖励仿射变换** `r′ = ar+b`（a>0）：不改变 π*，因为所有策略被同一比例平移。',
      '**V\* 唯一，但 π\* 不一定唯一**：多个动作并列最大时，最优策略可以是一族。'
    ],
    links:['discount','optimal_policy']
  }
);
