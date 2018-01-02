const path = require('path');
const os = require('os');
const request = require('request');
const _ = require('lodash');
const async = require('async');

/**
 * get latest google host file content from network
 * @param {function} callback
 */
function getHostContent(callback) {
  async.tryEach(
    _.map([
      'https://raw.githubusercontent.com/googlehosts/hosts/master/hosts-files/hosts',
      'https://coding.net/u/scaffrey/p/hosts/git/raw/master/hosts-files/hosts'
    ], url => (cb) => {
      request(url, (err, res, data) => cb(err, data));
    }),
    callback
  );
}

/**
 * 获取hosts文件所在的路径
 */
function getHostPath() {
  const osType = os.type();
  if (['Linux', 'Windows_NT', 'Darwin'].indexOf(osType) === -1) {
    throw new Error(`不支持的系统类型: ${osType}`);
  }
  let hostFilePath = path.resolve('/etc/hosts');
  if (osType === 'Windows_NT') {
    hostFilePath = path.resolve(process.env.SYSTEMROOT, 'System32/drivers/etc/hosts');
  }
  return hostFilePath;
}

module.exports = {
  getHostPath: _.memoize(getHostPath),
  getHostContent
};
