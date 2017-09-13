const chalk = require('chalk');
const debug = require('debug');
const fs = require('fs');

function log(pre, type, msg) {
  if (!type && !msg) {
    return console.log(pre); // eslint-disable-line no-console
  }
  if (!msg) {
    msg = type; // eslint-disable-line no-param-reassign
    type = pre; // eslint-disable-line no-param-reassign
  }
  const color = ({
    error: 'red',
    warning: 'yellow',
    normal: 'white',
    success: 'green',
    info: 'blue',
  })[type] || 'white';
  debug(pre ? `hosit:${pre}` : '')(chalk[color](msg));
}

function errorHandler(e) {
  log('error', e);
  if (e && (e.code === 'EACCES' || e.code === 'EPERM')) {
    log('warning', '请使用root权限或管理员权限执行');
  }
  if (process.env.NODE_ENV !== 'test') {
    process.exit(-1);
  }
}

module.exports = {
  errorHandler,
  log,
  file: {
    write(path, content) { fs.writeFileSync(path, content); },
    read(path) { return fs.readFileSync(path, 'utf8'); },
    has(path) { return fs.existsSync(path); },
    append(path, content) { fs.appendFileSync(path, content); },
  }
};
