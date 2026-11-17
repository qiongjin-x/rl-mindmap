/* 无浏览器环境下的冒烟测试：最小 DOM 桩 + 数据完整性校验。
   用法：node build/smoke.js */
'use strict';

const fs = require('fs');
const path = require('path');

/* ---------- 最小 DOM 桩 ---------- */
class CL {
  constructor(el){ this.el = el; }
  add(...c){ c.forEach(x => this.el._cls.add(x)); }
  remove(...c){ c.forEach(x => this.el._cls.delete(x)); }
  toggle(c, force){
    const has = this.el._cls.has(c);
    const on = force === undefined ? !has : !!force;
    on ? this.el._cls.add(c) : this.el._cls.delete(c);
    return on;
  }
  contains(c){ return this.el._cls.has(c); }
}

class FakeEl {
  constructor(tag){
    this.tagName = tag;
    this._cls = new Set();
    this.children = [];
    this.style = { setProperty(){} };
    this.dataset = {};
    this.classList = new CL(this);
    this._html = '';
    this.textContent = '';
    this.id = '';
    this.title = '';
    this.parentElement = null;
  }
  set className(v){ this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get className(){ return [...this._cls].join(' '); }
  set innerHTML(v){ this._html = String(v); }
  get innerHTML(){ return this._html; }
  appendChild(c){ this.children.push(c); c.parentElement = this; return c; }
  addEventListener(){}
  removeEventListener(){}
  scrollIntoView(){}
  querySelector(){ return new FakeEl('div'); }
  querySelectorAll(){ return []; }
}

const ids = [
  '#mapCanvas','#chapters','#lanes','#drawer','#scrim','#drBody','#drKind','#drTitle',
  '#drClose','#q','#hits','#zoomIn','#zoomOut','#zoomVal','#nodeCount','#subtitle','#compactBtn'
];
const nodes = {};
ids.forEach(id => { nodes[id] = new FakeEl('div'); });

global.document = {
  body: new FakeEl('body'),
  createElement: t => new FakeEl(t),
  querySelector: s => nodes[s] || new FakeEl('div'),
  querySelectorAll: () => [],
  addEventListener(){}
};
global.window = { addEventListener(){}, innerHeight: 900, scrollY: 0 };
global.location = { hash: '', search: '' };
global.history = { replaceState(){} };

/* ---------- 依次执行数据与渲染脚本 ---------- */
const src = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');
const appBlocks = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!appBlocks.length) throw new Error('app.html 中找不到 <script> 块');

const dataFiles = fs.readdirSync(path.join(__dirname, 'data')).filter(f => f.endsWith('.js')).sort();
const dataCode = dataFiles
  .map(f => fs.readFileSync(path.join(__dirname, 'data', f), 'utf8'))
  .join('\n');

const code = 'var NODES=[], CHAPTERS=[], TRACKS=[];\n'
  + dataCode + '\n' + appBlocks[appBlocks.length - 1]
  + '\n;return {NODES, CHAPTERS, TRACKS, MAP};';

const out = new Function(code)();
const checks = [];
const add = (name, ok) => checks.push([name, !!ok]);

const { NODES, CHAPTERS, TRACKS, MAP } = out;

/* ---------- 数据校验 ---------- */
add('节点总数 > 60', NODES.length > 60);
add('章节数 = 10', CHAPTERS.length === 10);
add('主线数 = 4', TRACKS.length === 4);

const seen = new Set();
let dup = null;
NODES.forEach(n => { if (seen.has(n.id)) dup = n.id; seen.add(n.id); });
add('节点 id 无重复' + (dup ? '（重复：' + dup + '）' : ''), !dup);

const badLinks = [];
NODES.forEach(n => (n.links || []).forEach(l => { if (!MAP[l]) badLinks.push(n.id + ' -> ' + l); }));
add('所有 links 指向存在' + (badLinks.length ? '（坏链：' + badLinks.slice(0,4).join(', ') + '）' : ''), badLinks.length === 0);

const placed = new Set();
const badCh = [];
CHAPTERS.forEach(c => (c.nodes || []).forEach(id => {
  if (!MAP[id]) badCh.push('ch' + c.no + '.' + id);
  else { placed.add(id); if (MAP[id].ch !== c.no) badCh.push(id + ' ch=' + MAP[id].ch + ' 但放在第' + c.no + '章'); }
}));
add('章节引用的节点都存在且章号一致' + (badCh.length ? '（问题：' + badCh.slice(0,4).join(', ') + '）' : ''), badCh.length === 0);

const unplaced = NODES.filter(n => !placed.has(n.id)).map(n => n.id);
add('无游离节点' + (unplaced.length ? '（游离：' + unplaced.slice(0,4).join(', ') + '）' : ''), unplaced.length === 0);

const badTrack = [];
TRACKS.forEach(t => t.steps.forEach(s => (s.nodes || []).forEach(id => { if (!MAP[id]) badTrack.push(t.id + '.' + id); })));
add('主线引用的节点都存在' + (badTrack.length ? '（坏：' + badTrack.slice(0,4).join(', ') + '）' : ''), badTrack.length === 0);

const thin = NODES.filter(n => !n.name || !(n.points && n.points.length));
add('每个节点都有名称与要点' + (thin.length ? '（薄：' + thin.slice(0,4).map(n=>n.id).join(', ') + '）' : ''), thin.length === 0);

const formulaCount = NODES.filter(n => n.formulas && n.formulas.length).length;
add('含公式的节点数 > 20（实际 ' + formulaCount + '）', formulaCount > 20);

/* ---------- DOM 渲染校验 ---------- */
add('章节卡渲染 = 10', nodes['#chapters'].children.length === 10);
add('主线卡渲染 = 4', nodes['#lanes'].children.length === 4);
add('导图画布已生成', nodes['#mapCanvas'].children.length === 1);
const rootKids = nodes['#mapCanvas'].children[0] && nodes['#mapCanvas'].children[0].children[1];
add('导图根节点挂了 ' + (rootKids ? rootKids.children.length : 0) + ' 个章分支', !!rootKids && rootKids.children.length === 10);

/* ---------- 输出 ---------- */
let fail = 0;
for (const [name, ok] of checks){
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name);
  if (!ok) fail++;
}
console.log('\n节点 ' + NODES.length + ' 个，含公式 ' + formulaCount + ' 个，' + (fail ? fail + ' 项失败' : '全部通过'));
process.exit(fail ? 1 : 0);
