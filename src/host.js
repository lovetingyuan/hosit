const request = require('request');

/**
 * get latest google host file content from network
 * @param {function} callback
 */
function getHostContent(callback) {
  const hostsSrc = 'https://raw.githubusercontent.com/racaljk/hosts/master/hosts';
  const hostsSrc2 = 'https://coding.net/u/scaffrey/p/hosts/git/raw/master/hosts';
  request(hostsSrc, (err, res, data) => {
    if (!err) return callback(null, data);
    request(hostsSrc2, (err2, res2, data2) => (err2 ? callback(err2) : callback(null, data2)));
  });
}

const path = require('path');
const os = require('os');
/**
 * 获取hosts文件所在的路径
 */

function getHostPath() {
  let hostPath;
  return function _getHostPath() {
    if (hostPath) return hostPath;
    const osType = os.type();
    if (['Linux', 'Windows_NT', 'Darwin'].indexOf(osType) === -1) {
      throw new Error(`不支持的系统类型: ${osType}`);
    }
    let hostFilePath = path.resolve('/etc/hosts');
    if (osType === 'Windows_NT') {
      hostFilePath = path.resolve(process.env.SYSTEMROOT, 'System32/drivers/etc/hosts');
    }
    hostPath = hostFilePath;
    return hostPath;
  };
}

module.exports = {
  getHostPath: getHostPath(),
  getHostContent
};
