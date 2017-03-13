var os = require('os')
var path = require('path')
var fs = require('fs')

function getHostContent(url, callback) {
  var hostFileUrl = url;
  var client = require(hostFileUrl.split(':')[0])
  client.get(hostFileUrl, function(res) {
    var statusCode = res.statusCode;
    var error;
    if (statusCode !== 200) {
      error = new Error('获取hosts文件失败. Status Code: ' + statusCode);
    }
    if (error) {
      callback(error)
      res.resume();
      return;
    }
    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', function(chunk) { rawData += chunk });
    res.on('end', function() {
      callback(null, rawData)
    });
  }).on('error', callback);
}

function getHostPath() {
  var osType = os.type()
  if (['Linux', 'Windows_NT', 'Darwin'].indexOf(osType) === -1) {
    throw new Error('不支持的系统类型')
  }
  var hostFilePath = path.resolve('/etc/hosts')
  if (osType === 'Windows_NT') {
    hostFilePath = path.resolve(process.env.SYSTEMROOT, 'System32/drivers/etc/hosts')
  }
  return hostFilePath
}

function recoverOriginalHost(clear) {
  var defaultContent = ({
  	'Linux': ['127.0.0.1 localhost', '::1 localhost localhost.localdomain'],
  	'Windows_NT': ['127.0.0.1 localhost', '::1 localhost'],
  	'Darwin': ['127.0.0.1 localhost', '255.255.255.255 broadcasthost', '::1 localhost']
  })[os.type()].join(os.EOL)
  var cachedHostPath = path.resolve(process.cwd(), 'hosts')
  var originContent = fs.readFileSync(cachedHostPath, { encoding: 'utf8' })
  var hostPath = getHostPath()
  fs.writeFileSync(hostPath, clear ? defaultContent : originContent)
}

function errorHandler(e) {
  console.log('抱歉，发生了错误：', e)
  if (e && e.code === 'EACCES') {
    console.log('请使用root权限或管理员权限执行');
  }
  if (process.env.NODE_ENV !== 'test') {
    process.exit(-1);
  }
}

function printUsage() {
  console.log(
    '  用法: hosit [options] \n\
  options: \n\
    -r    -r表示恢复原有的hosts文件 \n\
    -c    -c表示清除hosts内容（会保留locahost映射），如果您在使用本命令前未更改过hosts文件则建议使用-r选项代替-c选项\n')
}

function log(info) {
  console.log(' hosit: ' + info)
}

module.exports = function hosit() {
  try {
    var cachedHostPath = path.resolve(process.cwd(), 'hosts')
    if (!fs.existsSync(cachedHostPath)) {
      var originHostContent = fs.readFileSync(getHostPath(), { encoding: 'utf8' })
      fs.writeFileSync(cachedHostPath, originHostContent)
    }
    if (process.argv.length > 3) {
      printUsage()
    } else if (process.argv[2] === '-r') {
      recoverOriginalHost();
      log('hosts已经恢复')
    } else if (process.argv[2] === '-c') {
      recoverOriginalHost(true)
      log('hosts已经重置')
    } else if (process.argv[2]) {
      printUsage()
    } else {
      log('请稍候...')
      var url = 'https://raw.githubusercontent.com/racaljk/hosts/master/hosts'
      getHostContent(url, function(err, data) {
        if (err) return errorHandler(e)
        try {
          fs.writeFileSync(path.resolve(getHostPath()), data);
          log('hosts已经更新')
        } catch (e) {
          errorHandler(e)
        }
      });
    }
  } catch (e) {
    errorHandler(e);
  }
}
