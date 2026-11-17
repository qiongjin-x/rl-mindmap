/* 第 7–8 章：增量式与函数逼近。内容取自「概要-6~7」与「具体内容-21~27」 */
NODES.push(
  /* ================= 第 7 章 时序差分 ================= */
  {
    id:'td_state', name:'TD 估计状态值', kind:'algo', ch:7,
    brief:'每走一步就更新一次，不必等回合结束',
    formulas:[String.raw`V_{t+1}(s_t)=V_t(s_t)-\alpha_t(s_t)\Big[V_t(s_t)-\big(r_{t+1}+\gamma V_t(s_{t+1})\big)\Big]`],
    points:[
      '只需要 `{(s_t, r_{t+1}, s_{t+1})}`，**不需要模型**，也不需要跑完回合。',
      '只更新当前状态 `s_t`，其余状态不变：`V_{t+1}(s)=V_t(s), s≠s_t`。',
      '和 MC 的对偶：MC 用真实回报 g_t 当目标，TD 用"一步奖励 + 自举"当目标。'
    ],
    links:['td_target','td_error','mc_basic','sarsa']
  },
  {
    id:'td_target', name:'TD target 与 TD error', kind:'formula', ch:7,
    brief:'用一步自举去近似 V_π，差值就是 TD error',
    formulas:[
      String.raw`\bar{v}_t=r_{t+1}+\gamma V_t(s_{t+1})`,
      String.raw`\delta_t=V_t(s_t)-\bar{v}_t`
    ],
    points:[
      'TD target `v̄_t` 是"对 V_π 的一次估计"：它包含真实奖励 r_{t+1} 和当前估计 V_t(s_{t+1})。',
      'TD error `δ_t` 衡量"现在的估计"与"一步目标"的差距，衡量的是 V_π 与 V_t 的距离。',
      '`δ_t` 在第十章又以 advantage 的形式出现——同一个量换了名字。'
    ],
    links:['td_state','td_error','ac_td']
  },
  {
    id:'td_error', name:'为什么 TD 能收敛', kind:'concept', ch:7,
    brief:'把贝尔曼方程写成求根问题，再交给 RM',
    formulas:[String.raw`g(V(s))=V(s)-\mathbb{E}\big[R+\gamma V_\pi(S')\mid S=s\big]=0`],
    points:[
      '贝尔曼方程 `V_π(s)=E[R+γV_π(S′)|S=s]` 移项就是"某个函数 = 0"。',
      '把期望换成样本 `(r_k, s′_k)`，得到带噪观测 `g̃ = V(s) − (r_k+γV_k(s′_k))`。',
      '套用 RM 的更新式就得到 TD：`V_{k+1}(s)=V_k(s)−α_k·g̃`。',
      '所以 TD 的收敛性不是新定理，而是第 6 章 RM 的直接应用。'
    ],
    links:['td_state','rm','td_target']
  },
  {
    id:'sarsa', name:'Sarsa', kind:'algo', ch:7,
    brief:'把 TD 从状态值搬到动作值：需要五元组',
    formulas:[String.raw`q_{t+1}(s_t,a_t)=q_t(s_t,a_t)-\alpha_t\Big[q_t(s_t,a_t)-\big(r_{t+1}+\gamma q_t(s_{t+1},a_{t+1})\big)\Big]`],
    points:[
      '需要 `{s_t, a_t, r_{t+1}, s_{t+1}, a_{t+1}}`——名字 Sarsa 就是这五个量的首字母。',
      '`a_{t+1}` 必须是**策略真的会选**的动作，所以它是 **on-policy**：采样与评估用同一个 π。',
      '收敛目标是 `q_π`，不是 `q*`；要拿到最优策略，还得让 π 逐步 greedy 化（例如 ε 衰减）。'
    ],
    links:['td_state','expected_sarsa','qlearning','onoff']
  },
  {
    id:'expected_sarsa', name:'Expected Sarsa', kind:'algo', ch:7,
    brief:'把 a_{t+1} 换成对下一状态所有动作的期望，去掉一次采样',
    formulas:[String.raw`q_{t+1}(s_t,a_t)=q_t+\alpha_t\Big[r_{t+1}+\gamma\sum_a\pi(a|s_{t+1})q_t(s_{t+1},a)-q_t(s_t,a_t)\Big]`],
    points:[
      '不需要 `a_{t+1}`，只需要 `{s_t,a_t,r_{t+1},s_{t+1}}`。',
      '因为对 a 求了期望，方差比 Sarsa 小（少了一个随机源）。',
      '它依然用 π 做加权，所以仍是 on-policy；但结构上已经很像 Q-learning。'
    ],
    links:['sarsa','qlearning']
  },
  {
    id:'nstep_sarsa', name:'n-step Sarsa', kind:'formula', ch:7,
    brief:'用 n 步真实奖励 + 自举收尾，在 MC 与 TD 之间连续调节',
    formulas:[String.raw`G_t^{(n)}=R_{t+1}+\gamma R_{t+2}+\cdots+\gamma^{n}q_\pi(S_{t+n},A_{t+n})`],
    points:[
      'n=1 就是 Sarsa；n→∞ 就退化成 MC。',
      '需要 `{s_t,a_t,r_{t+1},…,r_{t+n},s_{t+n},a_{t+n}}`。',
      'n 越大偏差越小、方差越大——这是一条可以被显式调参的谱。'
    ],
    links:['sarsa','td_state','mc_basic']
  },
  {
    id:'qlearning', name:'Q-learning', kind:'algo', ch:7,
    brief:'直接把 target 换成 max，绕过行为策略',
    formulas:[String.raw`q_{t+1}(s_t,a_t)=q_t+\alpha_t\Big[r_{t+1}+\gamma\max_a q_t(s_{t+1},a)-q_t(s_t,a_t)\Big]`],
    points:[
      '目标值 `q*(s,a)=E[R_{t+1}+γmax_a q(S_{t+1},a)|S_t=s,A_t=a]` 是对**最优**动作值的估计。',
      '更新式里的 max 和"你用什么策略采样"无关 → 天然 **off-policy**。',
      '好处：可以用探索性策略采样，同时学最优策略；坏处：max 带来过估计（第八章 DQN 要处理的问题之一）。'
    ],
    links:['sarsa','onoff','dqn']
  },

  /* ================= 第 8 章 值函数逼近 ================= */
  {
    id:'fa_motivation', name:'为什么要函数逼近', kind:'concept', ch:8,
    brief:'表格法一个状态存一个数，状态一多就存不下',
    points:[
      '表格法：每个状态一格，内存 O(|S|)；连续状态直接失效。',
      '函数逼近：只存参数 w，`V̂(s,w)` 按需算出来——**省内存**。',
      '更重要的是**泛化**：见过的状态能帮到没见过的状态。'
    ],
    links:['linear_fa','semi_grad']
  },
  {
    id:'linear_fa', name:'线性函数逼近', kind:'formula', ch:8,
    brief:'V̂(s,w)=φ(s)ᵀw，对参数线性，梯度就是特征',
    formulas:[String.raw`\hat{v}(s,w)=\phi^\top(s)w`],
    points:[
      'w 是参数向量，φ(s) 是手工设计的特征向量。',
      '示例：`V̂(s,w)=as+b=[s,1][a;b]ᵀ=φᵀ(s)w`，就是一条直线。',
      '对 w 线性 → `∇_w V̂ = φ(s)`，更新式能写得非常干净。',
      '缺点：线性模型难以逼近曲面，需要"投影"；特征选得好不好直接决定上限。'
    ],
    links:['fa_motivation','obj_stationary','semi_grad']
  },
  {
    id:'obj_stationary', name:'目标函数与平稳分布', kind:'formula', ch:8,
    brief:'状态不是均匀访问的，误差要按 d_π(s) 加权',
    formulas:[
      String.raw`J(w)=\mathbb{E}\big[(V_\pi(S)-\hat{v}(S,w))^2\big]`,
      String.raw`J(w)=\sum_{s\in\mathcal{S}}d_\pi(s)\big(V_\pi(s)-\hat{v}(s,w)\big)^2`
    ],
    points:[
      '`d_π(s)` 是策略 π 下的**平稳分布**（on-policy 时状态访问频率）。',
      '它满足 `d_πᵀ = d_πᵀP_π`，即"按 π 走一步之后，分布不变"。',
      '为什么加权：在 MC/TD 里，样本来自实际轨迹，频繁访问的状态自然权重大。'
    ],
    links:['linear_fa','semi_grad']
  },
  {
    id:'semi_grad', name:'半梯度更新', kind:'formula', ch:8,
    brief:'真梯度求不到，就用"把目标当常数"的近似梯度',
    formulas:[String.raw`w_{t+1}=w_t+\alpha_t\big(V_\pi(s_t)-\hat{v}(s_t,w_t)\big)\nabla_w\hat{v}(s_t,w_t)`],
    points:[
      '严格求导：`∇_w J = −2E[(V_π−V̂)·∇_w V̂]`，正负号被吸收进 α。',
      '难点是 `V_π(s_t)` 未知，必须用估计替代（MC 用 g_t，TD 用 r+γV̂）。',
      '一旦目标里也含 w，真正求导要加一项；把它当常数就是**半梯度**，简单但不再严格下降。'
    ],
    links:['mc_fa','td_fa','linear_fa']
  },
  {
    id:'mc_fa', name:'MC + 函数逼近', kind:'algo', ch:8,
    brief:'用整条轨迹的回报 g_t 当目标',
    formulas:[String.raw`w_{t+1}=w_t+\alpha_t\big(g_t-\hat{v}(s_t,w_t)\big)\nabla_w\hat{v}(s_t,w_t)`],
    points:[
      '`g_t` 是从 s_t 出发一条 episode 的总回报。',
      '无偏（g_t 就是 V_π 的样本），但方差大，且必须等回合结束。',
      '只适合 episodic 任务。'
    ],
    links:['semi_grad','td_fa','episode']
  },
  {
    id:'td_fa', name:'TD + 函数逼近', kind:'algo', ch:8,
    brief:'用一步自举替代 g_t，方差小、可在线',
    formulas:[String.raw`w_{t+1}=w_t+\alpha_t\big[r_{t+1}+\gamma\hat{v}(s_{t+1},w_t)-\hat{v}(s_t,w_t)\big]\nabla_w\hat{v}(s_t,w_t)`],
    points:[
      '目标 `r_{t+1}+γV̂(s_{t+1},w_t)` 里含 w_t，但求导时按常数处理 → 半梯度。',
      '方差远小于 MC，可以在线更新；代价是有偏。',
      '这是第八章的主干，也是 DQN 的直接前身。'
    ],
    links:['semi_grad','mc_fa','dqn']
  },
  {
    id:'sarsa_q_fa', name:'Sarsa / Q-learning + 函数逼近', kind:'algo', ch:8,
    brief:'把 q 也参数化成 q̂(s,a,w)',
    formulas:[String.raw`w_{t+1}=w_t+\alpha_t\big[r_{t+1}+\gamma\max_{a}\hat{q}(s_{t+1},a,w_t)-\hat{q}(s_t,a_t,w_t)\big]\nabla_w\hat{q}(s_t,a_t,w_t)`],
    points:[
      'Sarsa 版：把 max 换成 `q̂(s_{t+1},a_{t+1},w_t)`，需要真实采到的 a_{t+1}。',
      'Q-learning 版：对下一状态所有动作取 max（如公式）。',
      '判别标准还是那一条：目标里有没有用"策略实际采样到的动作"。'
    ],
    links:['qlearning','sarsa','dqn']
  },
  {
    id:'dqn', name:'Deep Q-Learning（DQN）', kind:'algo', ch:8,
    brief:'用神经网络当 q̂，把"回归到 TD target"写成平方损失',
    formulas:[
      String.raw`J(w)=\mathbb{E}\Big[\big(R+\gamma\max_{a}\hat{q}(S',a,w)-\hat{q}(S,A,w)\big)^2\Big]`,
      String.raw`\nabla_wJ=\mathbb{E}\Big[\big(R+\gamma\max_{a}\hat{q}(S',a,w)-\hat{q}(S,A,w)\big)\nabla_w\hat{q}(S,A,w)\Big]`
    ],
    points:[
      '把 `y=R+γmax_a q̂(S′,a,w)` 当**常数**，对 `q̂(S,A,w)` 求导，就得到上面第二行（2 被吸收进 α）。',
      '网络输入 (s,a)，输出一个标量 q̂。',
      '如果 target 里的 w 也随梯度动，就是"自己追自己"，训练会震荡——所以要目标网络。'
    ],
    links:['td_fa','tricks','speed']
  },
  {
    id:'tricks', name:'目标网络 + 经验回放', kind:'concept', ch:8,
    brief:'DQN 能训起来靠的两个工程技巧',
    points:[
      '**目标网络**：另存一份 `w_T`，隔一段时间才用当前 w 覆盖它；求导时用 `q̂(S′,a,w_T)`，让 target 暂时不动。',
      '**经验回放**：把 `(s,a,r,s′)` 存进 buffer `B={(s,a,r,s′)}`，均匀随机取用。',
      '回放的两个好处：① 接近 i.i.d.，打破样本的时间相关性 ② 提高数据利用率（一条数据能反复用）。',
      '这也是 off-policy 的直接结果：数据不必来自当前策略，才能攒起来反复用。'
    ],
    links:['dqn','onoff']
  }
);
