const fs = require('fs');

function write(path, content) {
  fs.writeFileSync(path, content);
}

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function has(path) {
  return fs.existsSync(path);
}

function append(path, content) {
  fs.appendFileSync(path, content);
}

module.exports = {
  write,
  read,
  has,
  append,
};
