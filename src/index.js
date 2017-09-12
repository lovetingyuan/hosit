const {
  reset, update, add, remove, gg, hostPath, hostContent
} = require('./hosts');
const { log, errorHandler, printUsage } = require('./utils');
const pkg = require('../package.json');
const opn = require('opn');

const handlers = {};
const funcs = {
  reset,
  clear: () => {
    update();
    log('hosts已经恢复');
  },
  add,
  delete: remove,
  version() {
    console.log(`v${pkg.version}`);
  },
  path: hostPath,
  'print|P': hostContent,
  help: printUsage,
  edit() {
    opn(hostPath(true));
  }
};
Object.keys(funcs).forEach((key) => {
  const [name, short = name[0]] = key.split('|');
  handlers[name] = funcs[key];
  handlers[short] = funcs[key];
});

module.exports = function hosit() {
  if (process.argv.length === 2) {
    log('请稍候...');
    gg();
  } else {
    const arg = process.argv[2];
    const err = (name) => {
      log(`未知选项：${name}`);
      printUsage();
    };
    if (arg[0] === '-') {
      const name = arg[1] === '-' ? arg.substr(2) : arg.substr(1);
      if (typeof handlers[name] !== 'function') {
        err(arg);
      } else {
        try {
          handlers[name]();
        } catch (e) {
          errorHandler(e);
        }
      }
    } else {
      err(arg);
    }
  }
};
