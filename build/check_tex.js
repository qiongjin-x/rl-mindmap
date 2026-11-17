/* 用真实 KaTeX 逐条编译所有公式，抓 LaTeX 语法错误。用法：node build/check_tex.js */
'use strict';
const fs = require('fs');
const path = require('path');

const katex = require('./katex/katex.min.js');

const dir = path.join(__dirname, 'data');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const code = 'var NODES=[], CHAPTERS=[], TRACKS=[];\n'
  + files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n')
  + '\n;return NODES;';
const NODES = new Function(code)();

let bad = 0, total = 0;
for (const n of NODES){
  (n.formulas || []).forEach((f, i) => {
    total++;
    try {
      katex.renderToString(f, { displayMode: true, throwOnError: true, strict: false });
    } catch (e) {
      bad++;
      console.log('FAIL  ' + n.id + ' [' + i + ']  ' + (e && e.message ? e.message.split('\n')[0] : e));
      console.log('      ' + f.slice(0, 120));
    }
  });
}
console.log('\n共 ' + total + ' 条公式，' + (bad ? bad + ' 条编译失败' : '全部通过'));
process.exit(bad ? 1 : 0);
