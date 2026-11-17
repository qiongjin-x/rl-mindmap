/* 第 9–10 章：策略类方法。内容取自「概要-8~9」与「具体内容-28~34」 */
NODES.push(
  /* ================= 第 9 章 策略梯度 ================= */
  {
    id:'softmax', name:'策略参数化（softmax）', kind:'formula', ch:9,
    brief:'把策略写成 θ 的函数，保证每个动作概率都为正',
    formulas:[String.raw`\pi(a|s,\theta)=\frac{e^{h(s,a,\theta)}}{\sum_{a'}e^{h(s,a',\theta)}}`],
    points:[
      '结构：`s → [θ] → π(a1|s,θ), π(a2|s,θ), …`，输出一层 softmax。',
      '为什么必须 `π(a|s,θ)>0`：策略梯度的公式里有 `∇ln π`，π=0 就取不了对数。**greedy 不满足这个要求**。',
      'softmax 天然规避：`z_i=e^{x_i}/Σe^{x_j} ∈ (0,1)`。'
    ],
    links:['pg_theorem','pg_variant','greedy']
  },
  {
    id:'policy_grad_obj', name:'目标函数 J(θ)', kind:'formula', ch:9,
    brief:'三条等价的优化目标，选哪条取决于怎么定义状态分布',
    formulas:[
      String.raw`\bar{V}_\pi=\sum_{s\in\mathcal{S}}d(s)V_\pi(s)=\mathbb{E}[V_\pi(s)]`,
      String.raw`J(\theta)=\mathbb{E}\Big[\sum_{t=0}^{\infty}\gamma^tR_{t+1}\Big]=\bar{V}_\pi`
    ],
    points:[
      '`d` 与 `V_π` 无关时（如 `d_0(s)=1/|S|` 均匀分布）：直接用，`d` 是人为指定的初始分布。',
      '`d` 与 `V_π` 有关时：`d_π(s)` 是平稳分布，满足 `d_πᵀP_π=d_πᵀ`。',
      '另一条路线是平均奖励 `r̄_π=Σ_s d_π(s)r_π(s)`，与 `V̄_π` 只差常数倍：`r̄_π=(1−γ)V̄_π`。'
    ],
    links:['softmax','pg_theorem','obj_stationary']
  },
  {
    id:'pg_theorem', name:'策略梯度定理', kind:'formula', ch:9,
    brief:'对 π 求梯度，会变成一个"对数导数 × q"的期望',
    formulas:[
      String.raw`\nabla_\theta J(\theta)=\sum_{s}d(s)\sum_{a}\nabla_\theta\pi(a|s)q_\pi(s,a)`,
      String.raw`\nabla_\theta J(\theta)=\mathbb{E}\big[\nabla_\theta\ln\pi(A|S,\theta)\,q_\pi(S,A)\big]`
    ],
    points:[
      '关键恒等式：`∇_θπ(a|s) = π(a|s)∇_θln π(a|s)`。',
      '于是 `Σ_s d(s)Σ_a π(a|s)[·]` 正好凑成对 (S,A) 的期望（`S~η`，`A~π(·|S,θ)`）。',
      '代价：期望里的 `q_π` 还是未知的——第九章剩下的工作全在想"怎么估这个 q"。'
    ],
    links:['policy_grad_obj','reinforce','pg_td']
  },
  {
    id:'reinforce', name:'REINFORCE（MC 版）', kind:'algo', ch:9,
    brief:'用采样到的 q_t 代替真 q_π，就是最原始的策略梯度',
    formulas:[String.raw`\theta_{t+1}=\theta_t+\alpha_t\nabla_\theta\ln\pi(a_t|s_t,\theta_t)\,q_t(s_t,a_t)`],
    points:[
      '`q_t(s_t,a_t)` 用 MC 采样值：从 s_t 到回合结束的折扣回报。',
      '无偏、但方差大，且必须等回合结束。',
      '算法：采样一条轨迹 `{s_0,a_0,r_1,…,s_{T-1},a_{T-1},r_T}`，对每个 t 更新一次。'
    ],
    links:['pg_theorem','pg_td','mc_basic']
  },
  {
    id:'pg_td', name:'TD 版策略梯度', kind:'formula', ch:9,
    brief:'把 MC 的 q_t 换成一阶自举，方差立刻降下来',
    formulas:[String.raw`\theta_{t+1}=\theta_t+\alpha_t\nabla_\theta\ln\pi(a_t|s_t,\theta_t)\big(r_{t+1}+\gamma q_t(s_{t+1},a_{t+1})\big)`],
    points:[
      '结构上和 Sarsa 一模一样，只是把"更新 q"换成"更新 θ"。',
      '好处：可以在线更新，不必等回合结束。',
      '这个形式直接引出第十章：把 `q_t` 也当成要学的东西。'
    ],
    links:['reinforce','qac','sarsa']
  },
  {
    id:'pg_variant', name:'权重变式：q/π', kind:'formula', ch:9,
    brief:'把 ∇lnπ 换成 ∇π/π，看清"奖励高、概率低"的动作被推得更狠',
    formulas:[String.raw`\theta_{t+1}=\theta_t+\alpha_t\frac{q_t(s_t,a_t)}{\pi(a_t|s_t,\theta_t)}\nabla_\theta\pi(a_t|s_t,\theta_t)`],
    points:[
      '与标准式的唯一差别：`∇lnπ = ∇π/π`，分母的 π 让小概率动作获得更大步长。',
      'q 越大 → 越往"增大该动作概率"的方向走；π 越小 → 同样的 q 给出的步子越大。',
      '两者合起来就是"鼓励高价值 + 低概率"的动作，天然带着 exploration。'
    ],
    links:['softmax','pg_explore','pg_theorem']
  },
  {
    id:'pg_explore', name:'探索与利用', kind:'concept', ch:9,
    brief:'策略梯度自带探索，因为 π 永远为正',
    points:[
      '因为 `π(a|s,θ)>0`，每个动作都有非零概率被采到——不会彻底"锁死"在某条路上。',
      '`q/π` 的权重结构让"高价值但还没被发掘"的动作获得更大更新。',
      '这就是 policy-based 方法相对 value-based 的一个结构性优势：探索是内建的。'
    ],
    links:['eps_greedy','eps_decay','pg_variant']
  },

  /* ================= 第 10 章 演员-评论家 ================= */
  {
    id:'qac', name:'QAC（最基本的 AC）', kind:'algo', ch:10,
    brief:'critic 学 q̂，actor 拿 q̂ 当"真 q"去更新策略',
    formulas:[String.raw`w_{t+1}=w_t+\alpha_w\big[r_{t+1}+\gamma\hat{q}(s_{t+1},a_{t+1},w_t)-\hat{q}(s_t,a_t,w_t)\big]\nabla_w\hat{q}(s_t,a_t,w_t)`],
    points:[
      '两步交替：① critic 用 Sarsa 更新 `q̂(·,w)` ② actor 用 `∇lnπ·q̂` 更新 θ。',
      '名字来源：actor 决定动作（policy update），critic 评价动作（policy evaluation / value estimate）。',
      '`θ` 的更新把 `q_π` 换成 `q̂(s_t,a_t,w_{t+1})`——先用新 w 再更新 θ。'
    ],
    links:['pg_td','a2c','ac_td']
  },
  {
    id:'a2c', name:'A2C：引入 baseline', kind:'algo', ch:10,
    brief:'减去一个只依赖 s 的 b(s)，期望不变、方差下降',
    formulas:[
      String.raw`\nabla_\theta J(\theta)=\mathbb{E}\big[\nabla_\theta\ln\pi(A|S,\theta)\,(q_\pi(S,A)-b(S))\big]`
    ],
    points:[
      '为什么可以减：`Σ_a∇_θπ(a|s)=0`，所以 `E[∇lnπ·b(S)] = b(S)·Σ_a∇π = 0`，减掉它不改变期望。',
      '最优 baseline：`b*(s)=E[‖∇lnπ‖²q]/E[‖∇lnπ‖²]`。',
      '常用近似：`b(s)=E_{a~π}[q(s,a)]=V_π(s)`——这就是"优势函数" A = q − V。'
    ],
    links:['qac','ac_td','td_error']
  },
  {
    id:'ac_td', name:'用 TD error 当优势', kind:'formula', ch:10,
    brief:'b(s)=V_π 之后，q−V 正好是 TD error，只需一个 V 网络',
    formulas:[String.raw`\delta_t=r_{t+1}+\gamma V(s_{t+1},w_t)-V(s_t,w_t)`],
    points:[
      '`θ_{t+1}=θ_t+α_θ∇_θlnπ(a_t|s_t,θ_t)δ_t`，`w_{t+1}=w_t+α_wδ_t∇_wV(s_t,w_t)`。',
      '好处：不用维护 q 网络，一个 V 网络就够，critic 的负担小一半。',
      '也可写成 `θ_{t+1}=θ_t+α(δ_t/π)∇_θπ`，和第九章的权重变式对应。',
      '注意：这里的 δ 与第七章的 TD error 是同一个量，只是用途从"更新值"变成了"给策略打分"。'
    ],
    links:['a2c','td_target','qac']
  },
  {
    id:'offpolicy_ac', name:'off-policy + 重要性采样', kind:'algo', ch:10,
    brief:'用 behavior 策略采样，用重要性权重换成 target 策略的期望',
    formulas:[
      String.raw`\theta_{t+1}=\theta_t+\alpha_\theta\frac{\pi(a_t|s_t,\theta_t)}{\beta(a_t|s_t)}\delta_t\nabla_\theta\ln\pi(a_t|s_t,\theta_t)`
    ],
    points:[
      '恒等式：`E_{x~p0}[x]=Σp0(x)x=Σp1(x)(p0/p1)x=E_{x~p1}[g(x)]`，权重就是 `p0/p1`。',
      '于是可以用任意 `β` 采样，只要乘上比值 π/β 就还是 π 的期望。',
      '好处：解除了"必须用目标策略采样"的约束（不必强制探索）。',
      '代价：比值方差的累积会让方差爆炸——这是 off-policy 策略梯度的老问题。'
    ],
    links:['onoff','ac_td','dpg']
  },
  {
    id:'dpg', name:'DPG（确定性策略梯度）', kind:'algo', ch:10,
    brief:'策略输出一个确定动作，适用于连续/无穷动作空间',
    formulas:[
      String.raw`\nabla_\theta J(\theta)=\mathbb{E}_{s\sim\rho_\mu}\big[\nabla_\theta\mu(s)\,\nabla_a q_\mu(s,a)\big]`,
      String.raw`\theta_{t+1}=\theta_t+\alpha_\theta\nabla_\theta\mu(s_t,\theta_t)\,\nabla_a q(s_t,a,w_{t+1})\big|_{a=\mu(s_t)}`
    ],
    points:[
      '结构：`s → [θ] → a = μ(s,θ)`，输出的是动作本身，不是分布。',
      '链式法则：先求 q 对动作的梯度（往哪个方向改动作更好），再反传到 θ（让网络输出那个动作）。',
      'critic 的 TD error：`δ_t=r_{t+1}+γq(s_{t+1},μ(s_{t+1},θ_t),w_t)−q(s_t,a_t,w_t)`。',
      '为什么需要它：动作连续时，`max_a q` 无法枚举，必须对动作求梯度。'
    ],
    links:['offpolicy_ac','qac','dqn']
  }
);
