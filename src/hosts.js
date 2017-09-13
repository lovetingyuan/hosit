/* global HOSIT_GOOGLE_START:false, HOSIT_GOOGLE_END:false */

const os = require('os');
const isIp = require('is-ip');
const { getHostPath, getHostContent } = require('./host');
const {
  file: { read, write, append },
  log, errorHandler
} = require('./utils');

CONST(
  HOSIT_GOOGLE_START,
  HOSIT_GOOGLE_END
);

function reset() {
  const defaultContent = ({
    Linux: ['127.0.0.1 localhost', '::1 localhost localhost.localdomain'],
    Windows_NT: ['127.0.0.1 localhost', '::1 localhost'],
    Darwin: ['127.0.0.1 localhost', '255.255.255.255 broadcasthost', '::1 localhost']
  })[os.type()].join(os.EOL);
  write(getHostPath(), defaultContent);
  log('reset', 'success', 'hosts已经完全清除');
}

function add() {
  const ip = process.argv[3];
  const domain = process.argv[4];
  if (!isIp(ip)) return log('add', 'error', `${ip} 不合法`);
  if (!domain) return log('add', 'error', '必须指定域名');
  if (!/^((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/.test(domain)) {
    log('add', 'warning', `域名：${domain}可能不合法`);
  }
  append(getHostPath(), `${os.EOL}${ip} ${domain}`);
  log('add', 'success', `已经添加记录：${ip} ${domain}`);
}

function remove() {
  const ipOrDomain = process.argv[3];
  if (!ipOrDomain) return log('delete', 'error', '必须输入要删除的IP或者域名');
  const hosts = read(getHostPath()).split(os.EOL);
  write(getHostPath(), hosts.filter(line => line.indexOf(ipOrDomain) === -1).join(os.EOL));
  log('delete', 'success', `已经删除：${ipOrDomain}`);
}

function update(content = os.EOL) {
  const hosts = read(getHostPath());
  if (hosts.indexOf('# HOSIT_GOOGLE_START') >= 0 && hosts.indexOf('# HOSIT_GOOGLE_END') > 0) {
    const ggReg = new RegExp(`(# ${HOSIT_GOOGLE_START})[\\s\\S]*(# ${HOSIT_GOOGLE_END})`);
    write(getHostPath(), hosts.replace(ggReg, `$1${content}$2`));
  } else {
    const str = `${os.EOL}# ${HOSIT_GOOGLE_START}${content}# ${HOSIT_GOOGLE_END}${os.EOL}`;
    append(getHostPath(), str);
  }
}

function gg() {
  log('update', 'info', '请稍候...');
  getHostContent((err, data) => {
    if (err) return errorHandler(err);
    try {
      const ggHosts = data.replace(/\n/g, os.EOL);
      update(`${os.EOL}${ggHosts}${os.EOL}`);
      log('update', 'success', 'hosts文件已经更新!');
      process.exit(0);
    } catch (e) {
      errorHandler(e);
    }
  });
}

module.exports = {
  reset,
  add,
  remove,
  update,
  gg,
  hostPath(get) {
    if (get) return getHostPath();
    log('path', 'success', getHostPath());
  },
  hostContent() {
    log(read(getHostPath()));
  }
};
