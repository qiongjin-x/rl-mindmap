/* 第 4–6 章：算法方法板块。内容取自「概要-3~5」与「具体内容-11~20」 */
NODES.push(
  /* ================= 第 4 章 值迭代与策略迭代 ================= */
  {
    id:'greedy', name:'greedy 策略', kind:'concept', ch:4,
    brief:'对每个状态取 q 最大的动作，概率全押给它',
    formulas:[String.raw`a^*(s)=\arg\max_a q(s,a),\qquad \pi(a|s)=1\ \text{iff}\ a=a^*(s)`],
    points:[
      'greedy 是"评估完之后的动作"，不是"探索时的动作"。',
      '它天然是确定性的、且 π(a|s) 会出现 0——这正是第九章策略梯度要求 `π>0` 时要避开的。',
      '多个动作并列最大时 greedy 不唯一，所以 π* 不唯一。'
    ],
    links:['max_reduce','vi_algorithm','eps_greedy']
  },
  {
    id:'vi_algorithm', name:'值迭代（Value Iteration）', kind:'algo', ch:4,
    brief:'直接对最优方程做不动点迭代，每轮一步',
    formulas:[String.raw`V_{k+1}(s)=\max_a q_k(s,a),\qquad k\to\infty`],
    points:[
      '① 对每个 s 估计 `V_k(s)`；② 对每个 (s,a) 算 `q_k(s,a)`。',
      '③ 对每个 s 取 greedy 动作 `a*`；④ `V_{k+1} = max_a q_k(s,a)`。',
      '`k→∞` 时 `V_k → V*`（压缩映射保证）。',
      '**它没有显式维护策略**：策略是每轮从 q 现算出来的副产品，所以叫"值迭代"。'
    ],
    links:['vi_fixed_point','pi_algorithm','q_from_v']
  },
  {
    id:'q_from_v', name:'q_k 怎么算', kind:'formula', ch:4,
    brief:'有了 V_k，q 就是"即时奖励 + γ 后继值"',
    formulas:[String.raw`q_k(s,a)=\sum_r p(r|s,a)\,r+\gamma\sum_{s'}p(s'|s,a)V_k(s')`],
    points:[
      '这一步需要**模型**：p(r|s,a) 与 p(s′|s,a) 都必须已知。',
      '第 5 章要解决的就是"没有模型时这个求和怎么办"——答案是采样。'
    ],
    links:['vi_algorithm','model_free']
  },
  {
    id:'pi_algorithm', name:'策略迭代（Policy Iteration）', kind:'algo', ch:4,
    brief:'policy evaluation 与 policy improvement 交替跑',
    formulas:[String.raw`V_{\pi_k}^{(j+1)}=r_{\pi_k}+\gamma P_{\pi_k}V_{\pi_k}^{(j)},\qquad j=0,1,2,\dots`],
    points:[
      '① 给定 π_k，估计 `V_{π_k}`（解贝尔曼方程，可用迭代）。',
      '② 用估计出的值算 q，取 greedy 得到 `π_{k+1}`。',
      '③ 回到 ① 重新评估，直到策略不再变化。',
      '初值 `V_{π_k}^{(0)}` 可以随机取；实践里常用上一轮的 V（或 q）热启动。'
    ],
    links:['optimal_policy','vi_algorithm','truncated_pi']
  },
  {
    id:'truncated_pi', name:'截断策略迭代', kind:'algo', ch:4,
    brief:'不做无穷次评估，只算有限步，就去做改进',
    points:[
      '把 `V_{π_k}^{(0)} → V_{π_k}^∞` 截成有限次迭代 `V_{π_k}^{(j)}`，j 只跑到某个 J。',
      '初值取上一轮的值（`V_{π_k}^{(0)} = V_{π_{k-1}}`）时，能保证单调性 `V^{(j+1)} ≥ V^{(j)}`。',
      '**值迭代 = J=1 的极端情形**；策略迭代 = J=∞ 的极端情形，截断策略迭代在两者之间。',
      '这就是为什么三种算法收敛曲线形状不同：越接近值迭代，前期快、后期慢。'
    ],
    links:['pi_algorithm','vi_algorithm','vi_vs_pi']
  },
  {
    id:'two_routes', name:'两种改进思路', kind:'concept', ch:4,
    brief:'先估 V 再选动作，还是先算 q 再取 max',
    points:[
      '**I. action improve**：① 算 V(s) ② 对每个 s 遍历动作 ③ 选最佳 a 得新策略 ④ 重算 V，迭代到 best policy。',
      '**II. estimate value**：① 估 `V_k(s)` ② 算 `q_k(s,a)` ③ greedy 选最佳 a ④ `V_{k+1}=max_a q_k`。',
      '两条路描述的是同一件事，只是"先有 V 还是先有 q"的顺序不同。'
    ],
    links:['vi_algorithm','pi_algorithm']
  },
  {
    id:'vi_vs_pi', name:'值迭代 vs 策略迭代', kind:'concept', ch:4,
    brief:'一个每轮一步，一个每轮跑完收敛',
    points:[
      '值迭代：用 `q_k → V_{k+1}`，每轮只走一步、开销小，但需要更多轮。',
      '策略迭代：直接算 `V_{π_{k+1}}`（评估到底），每轮更贵，但轮数更少。',
      '实践中的折中是截断策略迭代：评估几步就改进，兼顾两者。'
    ],
    links:['vi_algorithm','pi_algorithm','truncated_pi']
  },

  /* ================= 第 5 章 蒙特卡罗方法 ================= */
  {
    id:'model_free', name:'无模型（model-free）', kind:'concept', ch:5,
    brief:'没有 p(s′|s,a)、p(r|s,a)，只有数据',
    points:[
      '第四章的每一次 q 计算都要对 r 和 s′ 求和——那要求知道模型。',
      'model-free 的思路：用**样本**代替期望。`{q(s,a)}` 这样的数据本身就能顶替模型。',
      'MC 用完整回合的回报做样本，TD 用一步转移做样本——两者的差别只在于"样本有多长"。'
    ],
    links:['q_from_v','mc_basic','td_state']
  },
  {
    id:'mc_basic', name:'MC Basic', kind:'algo', ch:5,
    brief:'最朴素的蒙特卡罗：采样平均代替期望，其余照抄策略迭代',
    formulas:[String.raw`q_{\pi_k}(s,a)=\mathbb{E}[G_t\mid s_t=s,A_t=a]\approx\frac{1}{n}\sum_{i=1}^{n}g^{(i)}(s,a)`],
    points:[
      '① policy evaluation：对**所有** (s,a) 用 MC 采样求平均，得到 `q_{π_k}`。',
      '② policy improvement：`π_{k+1}(s)=argmax_π Σ_aπ(a|s)q_{π_k}(s,a)`，即 greedy。',
      '`g(s,a)` 是 `G_t` 的一个样本：从 (s,a) 出发跑完一条 episode 的折扣回报。',
      '缺点：每个 (s,a) 都要单独采样，效率极低——它只是概念原型。'
    ],
    links:['model_free','mc_es','eps_greedy']
  },
  {
    id:'mc_es', name:'MC Exploring Starts', kind:'algo', ch:5,
    brief:'让每个 (s,a) 都当过起点，一条轨迹喂多个 (s,a)',
    points:[
      '问题：只从固定的 (s,a) 出发，其他 (s,a) 永远采不到。',
      'Exploring Starts：从每个 (s,a) 都出发一次，保证覆盖。',
      '更好的是复用：一条轨迹经过的每个 (s_t,a_t) 都能贡献一个 g，不必每对单独跑。',
      '于是有了 first-visit / every-visit 两种统计口径。'
    ],
    links:['mc_basic','data_eff','eps_greedy']
  },
  {
    id:'eps_greedy', name:'ε-greedy 策略', kind:'algo', ch:5,
    brief:'以 1−ε 的概率选最优动作，ε 平摊给其他动作',
    formulas:[String.raw`\pi(a|s)=\begin{cases}1-\dfrac{|\mathcal{A}(s)|-1}{|\mathcal{A}(s)|}\varepsilon,&a=a^*\\[4pt] \dfrac{1}{|\mathcal{A}(s)|}\varepsilon,&a\ne a^*\end{cases}`],
    points:[
      '`ε∈[0,1]`，`|A(s)|` 是该状态的动作数。',
      'ε=0 退化为 greedy；ε=1 变纯随机。',
      '作用：解决"无法从每个 (s,a) 出发"的覆盖问题，把 exploration 注入策略本身。',
      '代价：用 ε-greedy 评估出来的值偏低（因为它不总走最优），这是后续 off-policy 存在的动机之一。'
    ],
    links:['mc_es','eps_decay','qlearning']
  },
  {
    id:'data_eff', name:'数据的高效利用', kind:'concept', ch:5,
    brief:'一条 episode 能同时更新多个 (s,a)',
    points:[
      '得到一条 episode 后，对其中的每个 `g(s_i,a_i)` 更新数据库：`Returns(s_t,a_t) ← Returns(s_t,a_t)+g(s_t,a_t)`。',
      '`q(s_t,a_t) = average(Returns(s_t,a_t))`：平均值就是期望的估计。',
      '拿到一条 episode 就立刻更新策略，不必等所有 (s,a) 都采满——**节约时间**。',
      '这是 MC 从"能算"走向"能用"的关键一步。'
    ],
    links:['mc_es','gpi']
  },
  {
    id:'gpi', name:'广义策略迭代（GPI）', kind:'concept', ch:5,
    brief:'策略评估不必算到底，中间值就能拿去做改进',
    points:[
      '经典策略迭代要求评估收敛；GPI 只要求"评估得差不多"就可以改进。',
      '`policy evaluation` 不再追求精确的 q/v，用中间值直接 `policy improvement`。',
      '所有现代算法（TD、Q-learning、Actor-Critic）都是 GPI 的具体形态。'
    ],
    links:['data_eff','pi_algorithm','qac']
  },
  {
    id:'eps_decay', name:'ε 的衰减', kind:'concept', ch:5,
    brief:'ε 太大结果失真，解决办法是先大后小',
    points:[
      '缺陷：ε 过大时，学到的策略被探索噪声污染，结果偏离最优。',
      '解决：ε 开始取大（充分探索），随后逐渐减小（逼近 greedy）。',
      '这是"探索—利用"在时间维度上的调度，而不是在单步上折中。'
    ],
    links:['eps_greedy','pg_explore']
  },

  /* ================= 第 6 章 随机近似 ================= */
  {
    id:'incr_mean', name:'增量式均值估计', kind:'formula', ch:6,
    brief:'不存历史，只维护一个 running average',
    formulas:[String.raw`w_{k+1}=w_k+\frac{1}{k}\big(x_k-w_k\big)`],
    points:[
      '推导：`w_{k+1}=1/k·Σ_{i=1}^k x_i = 1/k[(k−1)w_k+x_k] = w_k − 1/k(w_k−x_k)`。',
      '意义：把"重算平均"变成"旧值 + 步长×误差"，内存 O(1)。',
      '这个形式就是所有 TD 更新式的雏形：`新值 = 旧值 + α(目标 − 旧值)`。'
    ],
    links:['rm','td_state']
  },
  {
    id:'rm', name:'Robbins-Monro 算法', kind:'algo', ch:6,
    brief:'在只有带噪观测的情况下求 g(w)=0 的根',
    formulas:[String.raw`w_{k+1}=w_k-a_k\,\tilde{g}(w_k,\eta_k),\qquad \tilde{g}=g+\eta`],
    points:[
      '结构：`{w_k} → g(w) → y → +η → g̃`，我们只能看到 g̃。',
      '`g(w)=0` 的根就是目标 w*；不知道 g 的解析式，只能"看一眼、走一步"。',
      'SA（stochastic approximation）泛指这类**不需要函数形式**的随机迭代算法。'
    ],
    links:['rm_cond','incr_mean','sgd']
  },
  {
    id:'rm_cond', name:'RM 的三个收敛条件', kind:'concept', ch:6,
    brief:'梯度不退化、步长可和不可平方和、噪声零均值有界',
    points:[
      '① `0<c₁≤∇g(w)≤c₂`：梯度不能趋于 0（否则被噪声淹没），也不能爆炸（否则一步跳飞）。',
      '② `Σa_k=∞` 且 `Σa_k²<∞`：步长要趋于 0，但**不能太快**——否则走不到根。',
      '③ `E[η_k|H_k]=0`、`E[η_k²|H_k]<∞`：噪声零均值、有界。',
      '反例：取 `a_k=1/k`、`η_k=±k^{3/2}`，则 `a_k²η_k²=k`，`Σa_k²η_k²=∞`，发散——正好卡在条件 ③ 上。'
    ],
    links:['rm','rm_var']
  },
  {
    id:'rm_var', name:'RM 的变式', kind:'formula', ch:6,
    brief:'写成"保留旧值 + 随机项"的遗忘形式',
    formulas:[String.raw`w_{k+1}=(1-\alpha_k)w_k+\beta_k\eta_k`],
    points:[
      '同样收敛到 w*，条件是 `Σβ_k²<∞`、`Σα_k=∞`、`Σα_k²<∞`、`E[η]=0`、`E[η²]=C`。',
      '`(1−α_k)` 就是"遗忘因子"：老信息按比例衰减。',
      '这个形式在后面的指数加权平均、资格迹里会反复出现。'
    ],
    links:['rm','rm_cond']
  },
  {
    id:'sgd', name:'SGD / GD / BGD', kind:'algo', ch:6,
    brief:'三种拿梯度的方法：真期望、小批量平均、单样本',
    formulas:[
      String.raw`\text{GD: } w_{k+1}=w_k-\alpha_k\,\mathbb{E}[\nabla_w f(w_k,X)]`,
      String.raw`\text{BGD: } w_{k+1}=w_k-\alpha_k\frac{1}{n}\sum_{i=1}^{n}\nabla_w f(w_k,x_i)`,
      String.raw`\text{SGD: } w_{k+1}=w_k-\alpha_k\nabla_w f(w_k,x_k)`
    ],
    points:[
      '目标：`min J(w)=E[f(w,X)]`，一阶条件 `∇J(w)=0`。',
      'GD 用真实期望梯度（分布已知才做得到）；BGD 用 n 个样本平均；SGD 只用当前这一个样本。',
      'SGD 每步极便宜，但梯度是带噪的 - 于是它本质上是 RM 的一个特例。'
    ],
    links:['rm','sgd_conv','speed']
  },
  {
    id:'sgd_conv', name:'SGD 的收敛性与相对误差', kind:'concept', ch:6,
    brief:'w 离最优点远时像普通梯度下降，近时受噪声主导',
    points:[
      '把 SGD 写成 RM：`g̃ = E[∇f] + η` 且 `∇f(w_k,x_k)` 就是 g̃，于是收敛条件照搬 RM 的三条。',
      '相对误差 `δ_k = |E[∇f(w_k,X)] − ∇f(w_k,x_k)| / |E[∇f(w_k,X)]|`。',
      '用中值定理：分母 = `|E[∇²f(w̃,X)](w_k−w*)| ≥ c|w_k−w*|`，于是 `δ_k ≤ C|w_k−w*| / (c|w_k−w*|) = C/c`。',
      '结论：远离最优点时 δ 稳定（近似普通 GD）；靠近时梯度本身趋于 0，噪声占比变大。'
    ],
    links:['sgd','rm_cond']
  },
  {
    id:'speed', name:'收敛速度对比', kind:'concept', ch:6,
    brief:'BGD > MBGD > SGD，但代价完全不同',
    points:[
      '同样步数下：BGD 最快、MBGD 次之、SGD 最慢。',
      '但单步成本反过来：SGD 一步只看一个样本，BGD 要看全部。',
      '深度强化学习几乎都用 SGD/小批量：**总时间**才是真正的指标。'
    ],
    links:['sgd','dqn']
  }
);
