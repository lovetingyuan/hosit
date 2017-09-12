function errorHandler(e) {
  console.log('抱歉，发生了错误：', e);
  if (e && (e.code === 'EACCES' || e.code === 'EPERM')) {
    console.log('请使用root权限或管理员权限执行');
  }
  if (process.env.NODE_ENV !== 'test') {
    process.exit(-1);
  }
}

function printUsage() {
  console.log(`  用法: hosit [options]    如果忽略options, 则会更新最新的google hosts文件
  options:
    -r, --reset   表示恢复原有的hosts文件
    -c, --clear   表示清除hosts内容（会保留localhost映射），如果您在使用本命令前未更改过hosts文件则建议使用-r选项代替-c选项
    -a, --add <ip> <domain>    表示添加一项映射
    -d, --delete <ip|domain>    根据IP或者domain删除某一条记录
    -p, --path    打印出hosts所在路径
    -P, --print   打印出当前hosts的内容
    -e, --edit    编辑当前hosts文件
  `);
}

function log(info) {
  console.log(` hosit: ${info}`);
}

module.exports = {
  errorHandler,
  log,
  printUsage
};
