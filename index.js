const os = require('os')
const path = require('path')
const fs = require('fs')

function getHostContent(url) {
  return new Promise(function(resolve, reject) {
    const githubSourceUrl = 'https://raw.githubusercontent.com/racaljk/hosts/master/hosts'
    const hostFileUrl = url || githubSourceUrl
    const client = require(hostFileUrl.split(':')[0])
    client.get(hostFileUrl, (res) => {
      const statusCode = res.statusCode;
      let error;
      if (statusCode !== 200) {
        error = new Error(`获取hosts文件失败. Status Code: ${statusCode}`);
      }
      if (error) {
        reject(error)
        res.resume();
        return;
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        resolve(rawData)
      });
    }).on('error', reject);
  })
}

function getHostPath() {
  const osType = os.type()
  if (['Linux', 'Windows_NT', 'Darwin'].indexOf(osType) === -1) {
    throw new Error('不支持的系统类型')
  }
  let hostFilePath = path.resolve('/etc/hosts')
  if (osType === 'Windows_NT') {
    hostFilePath = path.resolve(process.env.SYSTEMROOT, 'System32/drivers/etc/hosts')
  }
  return hostFilePath
}

function setFile(filePath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(path.resolve(filePath), content, err => {
      if (err)
        reject(err)
      else {
        resolve()
      }
    });
  })
}

function cacheOriginalHost() {
  const cachedHostPath = path.resolve(process.cwd(), 'hosts')
  if (!fs.existsSync(cachedHostPath)) {
    let originHostContent = fs.readFileSync(getHostPath(), { encoding: 'utf8' })
    fs.writeFileSync(cachedHostPath, originHostContent)
  }
}

function recoverOriginalHost(clear) {
  const defaultContent = ['127.0.0.1 localhost', '::1 localhost'].join(os.EOL)
  const cachedHostPath = path.resolve(process.cwd(), 'hosts')
  const originContent = fs.readFileSync(cachedHostPath, { encoding: 'utf8' })
  const hostPath = getHostPath()
  fs.writeFileSync(hostPath, clear ? defaultContent : originContent)
}

function errorHandler(e) {
  console.log('抱歉，发生了错误：', e)
  if (e && e.code === 'EACCES') {
    console.log('请使用root权限或管理员权限执行');
  }
}

function printUsage() {
  console.log(
    `  用法: hosit [options]
  options:
    -r    -r表示恢复原有的hosts文件
    -c    -c表示清除hosts内容（会保留locahost映射），如果您在使用本命令前未更改过hosts文件则建议使用-r选项代替-c选项`)
}

function log(info) {
  const { name } = require('./package.json')
  console.log(`${name}: ${info}`)
}

try {
  cacheOriginalHost()
  if (process.argv.length > 3) {
    printUsage()
  } else if (process.argv[2] === '-r') {
    recoverOriginalHost();
    log('已经恢复')
  } else if (process.argv[2] === '-c') {
    recoverOriginalHost(true)
    log('已经重置')
  } else if (process.argv[2]) {
    printUsage()
  } else {
    log('请稍候...')
    getHostContent()
      .then(data => setFile(getHostPath(), data))
      .then(() => log('已经更新'))
      .catch(errorHandler)
  }
} catch (e) {
  errorHandler(e);
}
