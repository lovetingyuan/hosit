process.env.DEBUG = 'hosit:*'; // enable debug
process.env.DEBUG_COLORS = true;

const {
  reset, update, add, remove, gg, hostPath, hostContent
} = require('./hosts');
const { log, errorHandler } = require('./utils');
const pkg = require('../package.json');
const opn = require('opn');
const program = require('commander');

const funcs = {
  reset,
  clear: () => {
    update();
    log('clear', 'success', 'hosts已经恢复');
  },
  add,
  delete: remove,
  update: gg,
  path: hostPath,
  print: hostContent,
  edit() {
    opn(hostPath(true));
  }
};

module.exports = function hosit() {
  program
    .version(pkg.version)
    .option('-u, --update', '更新google hosts')
    .option('-r, --reset', '完全清除hosts的内容（会保留localhost）')
    .option('-c, --clear', '去除google hosts部分的内容')
    .option('-a, --add <ip> <domain>', '添加一项记录')
    .option('-d, --delete <ip>', '删除一项记录')
    .option('-p, --path', '打印出hosts文件的路径')
    .option('-P, --print', '打印出hosts文件的内容')
    .option('-e, --edit', '编辑hosts文件')
    .parse(process.argv);
  // program.on('--help', () => {
  //   log('没有options则立即更新google hosts');
  // });
  if (process.argv.length === 2) {
    funcs.update();
  } else {
    const cmds = Object.keys(funcs);
    for (let i = 0; i < cmds.length; i++) {
      if (cmds[i] in program) {
        try {
          funcs[cmds[i]]();
        } catch (e) {
          errorHandler(e);
        }
        return;
      }
    }
  }
};
