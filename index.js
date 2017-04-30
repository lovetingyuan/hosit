var os = require('os')
var path = require('path')
var fs = require('fs')
var readline = require('readline')

var hostPath

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
    res.on('end', function() { callback(null, rawData) });
  }).on('error', callback);
}

function getHostPath() {
  if (hostPath) return hostPath
  var osType = os.type()
  if (['Linux', 'Windows_NT', 'Darwin'].indexOf(osType) === -1) {
    throw new Error('不支持的系统类型')
  }
  var hostFilePath = path.resolve('/etc/hosts')
  if (osType === 'Windows_NT') {
    hostFilePath = path.resolve(process.env.SYSTEMROOT, 'System32/drivers/etc/hosts')
  }
  hostPath = hostFilePath
  return hostPath
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
  if (e && (e.code === 'EACCES' || e.code === 'EPERM')) {
    console.log('请使用root权限或管理员权限执行');
  }
  if (process.env.NODE_ENV !== 'test') {
    process.exit(-1);
  }
}
var funcs = {
  reset: function() {
    // return log('reset')
    recoverOriginalHost();
    log('hosts已经恢复')
  },
  clear: function() {
    // return log('clear')
    recoverOriginalHost(true)
    log('hosts已经重置')
  },
  add: function() {
    // return log('add')
    var ip = checkIpDomain('ip', process.argv[3]),
      domain = checkIpDomain('domain', process.argv[4])
    if (!ip || !domain) {
      log('IP或域名不合法...')
    } else {
      fs.appendFileSync(getHostPath(), os.EOL + ip + ' ' + domain + os.EOL)
      log('已经添加记录：' + ip + ' ' + domain)
    }
  },
  delete: function() {
    var content = fs.readFileSync(getHostPath(), {
      encoding: 'utf8'
    })
    var ipDomain = checkIpDomain('ip', process.argv[3])
    if (!ipDomain) {
      ipDomain = checkIpDomain('domain', process.argv[3])
      if (!ipDomain) {
        return log('记录：' + (process.argv[3] || '') + '不合法')
      }
    }
    var bingo
    var result = content.split(os.EOL).map(function(line) {
      var item = line.match(/^([0-9.]+)\s+([a-zA-Z0-9.-]+)$/) || []
      var ip = item[1],
        domain = item[2]
      if (ip === ipDomain || domain === ipDomain) {
        bingo = true
        return ''
      }
      return line
    }).join(os.EOL)
    fs.writeFileSync(getHostPath(), result)
    bingo ? log('删除记录：' + ipDomain + '成功') : log('记录：' + ipDomain + '不存在')
  },
  version: function() {
    return log('version')
    log('v' + require('./package.json').version)
  },
  path: function() {
    log('路径：' + getHostPath())
  },
  help: printUsage
}


function checkArg() {
  var arg = process.argv[2]
  var wordArgs = Object.keys(funcs)
  var charArgs = wordArgs.map(function(arg) {
    return arg[0]
  })
  var wordRegs = new RegExp('^--(' + wordArgs.join('|') + ')$')
  var charRegs = new RegExp('^-(' + charArgs.join('|') + ')$')
  if (charRegs.test(arg)) {
    var option = arg.substr(1)
    for (var i = 0; i < wordArgs.length; i++) {
      if (option === wordArgs[i][0]) {
        return wordArgs[i]
      }
    }
  } else if (wordRegs.test(arg)) {
    return arg.substr(2)
  }
}

function printUsage() {
  console.log(
    '  用法: hosit [options] \n\
  options: \n\
    -r, --reset    表示恢复原有的hosts文件 \n\
    -c, --clear    表示清除hosts内容（会保留localhost映射），如果您在使用本命令前未更改过hosts文件则建议使用-r选项代替-c选项\n\
    -a, --add <ip> <domain>    表示添加一项映射 \n\
    -d, --delete <ip|domain>    根据IP或者domain删除某一条记录 \n\
    -p, --path    打印出hosts所在路径 \n\
    当前hosts文件路径为： ' + getHostPath())
}

function log(info) {
  console.log(' hosit: ' + info)
}

function checkIpDomain(type, value) {
  if (!value) return
  value = value.trim().toLowerCase()
  var regs = {
    ip: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/,
    domain: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  }
  if (regs[type] && regs[type].test(value)) return value
}

module.exports = function hosit() {
  try {
    var cachedHostPath = path.resolve(process.cwd(), 'hosts')
    if (!fs.existsSync(cachedHostPath)) {
      var originHostContent = fs.readFileSync(getHostPath(), { encoding: 'utf8' })
      fs.writeFileSync(cachedHostPath, originHostContent)
    }
    if (process.argv.length === 2) {
      log('请稍候...')
      var url = 'https://raw.githubusercontent.com/racaljk/hosts/master/hosts'
      getHostContent(url, function(err, data) {
        if (err) return errorHandler(e)
        try {
          fs.writeFileSync(path.resolve(getHostPath()), data);
          log('hosts已经更新!')
        } catch (e) {
          errorHandler(e)
        }
      });
    } else {
      var option = checkArg()
      if (!option) return printUsage()
      if (typeof funcs[option] === 'function') return funcs[option]()
      log('抱歉，发生了错误')
    }
  } catch (e) {
    errorHandler(e);
  }
}
