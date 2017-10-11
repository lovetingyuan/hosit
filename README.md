## hosit

[![Version](https://img.shields.io/npm/v/hosit.svg "version")](https://www.npmjs.com/package/hosit)
[![depend](https://david-dm.org/lovetingyuan/hosit/status.svg "dependencies")](https://david-dm.org/lovetingyuan/hosit)


>更新最新的google hosts文件，基于[racaljk/hosts](https://github.com/racaljk/hosts)，详情请查看[license](https://github.com/googlehosts/hosts/blob/master/LICENSE)

>This work is licensed under a CC BY-NC-SA 4.0 International License. https://creativecommons.org/licenses/by-nc-sa/4.0/

支持Linux, Windows及OS X 10.2+

### install
`npm install -g hosit`

### usage
* `hosit` 更新最新的`google hosts`文件
* `hosit -r, --reset` 完全清除hosts的内容（会保留`localhost`，*不建议使用*）
* `hosit -c, --clear` 去除`google hosts`部分的内容
* `hosit -a, --add <ip> <domain>` 添加一项记录
* `hosit -d, --delete <ip|domain>` 删除一项记录
* `hosit -p, --path` 打印出hosts文件的路径
* `hosit -P, --print` 打印出hosts文件的内容
* `hosit -e, --edit` 编辑hosts文件

### license
MIT
