/* 章节与主线的组织方式。章节顺序、配色、主线桥接语取自「概要」与「章节脉络图」 */

CHAPTERS.push(
  { no:1, title:'基本概念', en:'Basic concepts', color:'#2563a8',
    note:'状态 · 动作 · 奖励 · 回报 · MDP（你笔记上标了"不重要"，但后面全靠这套语言）',
    nodes:['state_action','transition_prob','policy','reward','trajectory','episode','return','discount','mdp','onoff'] },

  { no:2, title:'贝尔曼方程', en:'Bellman equation', color:'#0f766e',
    note:'给定策略下值函数的自洽方程：V = r + γPV',
    nodes:['state_value','return_recursion','bellman_eq','matrix_form','iterative_solve','direct_solve','action_value','vq'] },

  { no:3, title:'贝尔曼最优方程', en:'Bellman optimality equation', color:'#5b4bab',
    note:'把 Σ 换成 max，得到非线性方程与压缩映射',
    nodes:['optimal_policy','boe','max_reduce','contraction','cmt','vi_fixed_point','invariance'] },

  { no:4, title:'值迭代和策略迭代', en:'Value & policy iteration', color:'#a16207',
    note:'需要模型：直接对最优方程做数值迭代',
    nodes:['greedy','vi_algorithm','q_from_v','pi_algorithm','truncated_pi','two_routes','vi_vs_pi'] },

  { no:5, title:'蒙特卡罗方法', en:'Monte Carlo learning', color:'#b91c1c',
    note:'不需要模型：用数据 {q(s,a)} 代替期望',
    nodes:['model_free','mc_basic','mc_es','eps_greedy','data_eff','gpi','eps_decay'] },

  { no:6, title:'随机近似算法', en:'Stochastic approximation', color:'#4d7c0f',
    note:'工具章：RM 与 SGD 给增量式更新提供收敛依据',
    nodes:['incr_mean','rm','rm_cond','rm_var','sgd','sgd_conv','speed'] },

  { no:7, title:'时序差分方法', en:'Temporal-difference learning', color:'#7e22ce',
    note:'自举 + 增量：每步一更新，不必等回合结束',
    nodes:['td_state','td_target','td_error','sarsa','expected_sarsa','nstep_sarsa','qlearning'] },

  { no:8, title:'值函数方法', en:'Value function approximation', color:'#0369a1',
    note:'表格法 → 函数法：只存参数 w，还能泛化',
    nodes:['fa_motivation','linear_fa','obj_stationary','semi_grad','mc_fa','td_fa','sarsa_q_fa','dqn','tricks'] },

  { no:9, title:'策略梯度方法', en:'Policy gradient methods', color:'#c2410c',
    note:'基于值 → 基于策略：直接对 θ 做梯度上升',
    nodes:['softmax','policy_grad_obj','pg_theorem','reinforce','pg_td','pg_variant','pg_explore'] },

  { no:10, title:'演员-评论家方法', en:'Actor-critic methods', color:'#9f1239',
    note:'值 + 策略的合流：actor 决定动作，critic 打分',
    nodes:['qac','a2c','ac_td','offpolicy_ac','dpg'] }
);

TRACKS.push(
  {
    id:'T0', name:'前置地基 · 基础工具板块', color:'#475569',
    note:'第 1–3 章不做算法，只把"值"和"值的方程"定义清楚；第四章才有东西可迭代。',
    steps:[
      { ch:1, label:'把交互写成 MDP', nodes:['mdp','return','discount'] },
      { bridge:'定义 → 方程' },
      { ch:2, label:'给定策略的自洽方程', nodes:['bellman_eq','matrix_form','iterative_solve'] },
      { bridge:'评价 → 优化' },
      { ch:3, label:'最优性条件', nodes:['boe','contraction','cmt'] },
      { bridge:'解不出 → 迭代' },
      { ch:4, label:'算法第一次落地', nodes:['vi_algorithm','pi_algorithm'] }
    ]
  },
  {
    id:'T1', name:'主线一 · 从有模型到无模型', color:'#0369a1',
    note:'p(r|s,a) 拿不到时，"对 r、s′ 求和"只能换成"采样再平均"。',
    steps:[
      { ch:4, label:'需要模型', nodes:['vi_algorithm','q_from_v'] },
      { bridge:'需要模型 → 不需要模型' },
      { ch:5, label:'非增量式：跑完一条再平均', nodes:['mc_basic','mc_es','data_eff'] },
      { bridge:'非增量式 → 增量式' },
      { ch:7, label:'增量式：每步用 TD 误差更新', nodes:['td_state','sarsa','qlearning'] }
    ]
  },
  {
    id:'T2', name:'主线二 · 估计工具与表示能力', color:'#0f766e',
    note:'一边是"怎么保证收敛"（RM/SGD），一边是"怎么装得下"（线性 → 神经网络）。',
    steps:[
      { ch:6, label:'收敛工具', nodes:['rm','rm_cond','sgd'] },
      { bridge:'工具 → 应用' },
      { ch:7, label:'TD 就是 RM 的特例', nodes:['td_error','td_target'] },
      { bridge:'表格法 → 函数法' },
      { ch:8, label:'参数化 + 神经网络', nodes:['linear_fa','semi_grad','dqn','tricks'] }
    ]
  },
  {
    id:'T3', name:'主线三 · 从值到策略', color:'#9f1239',
    note:'先学值再取 argmax，最后干脆绕开 argmax 直接学策略——第十章把两条路合起来。',
    steps:[
      { ch:8, label:'基于值的', nodes:['sarsa_q_fa','dqn'] },
      { bridge:'基于值的 → 基于策略的' },
      { ch:9, label:'基于策略的：∇lnπ·q', nodes:['pg_theorem','reinforce','pg_variant'] },
      { bridge:'基于值的 + 基于策略的' },
      { ch:10, label:'演员-评论家', nodes:['qac','a2c','dpg'] }
    ]
  }
);
