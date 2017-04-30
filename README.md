## hosit

[![Version](https://img.shields.io/npm/v/hosit.svg "version")](https://www.npmjs.com/package/hosit)
[![depend](https://david-dm.org/lovetingyuan/hosit/status.svg "dependencies")](https://david-dm.org/lovetingyuan/hosit)

>更新最新的google hosts文件，基于[racaljk/hosts](https://github.com/racaljk/hosts)，详情请查看[license](https://github.com/racaljk/hosts#license)

支持Linux, Windows及OS X 10.2+

### install
`npm install -g hosit`

### usage
* `hosit` 更新最新的google hosts文件
* `hosit -r, --reset` 恢复到未使用`hosit`命令前的hosts文件
* `hosit -c, --clear` 清除hosts文件（会保留`localhost`）
* `hosit -a, --add <ip> <domain>` 添加一项记录
* `hosit -d, --delete <ip|domain>` 删除一项记录
* `hosit -p, --path` 打印出hosts文件的路径

### license
MIT
