const cp = require('child_process');

exports.fromFile = fromFile;
exports.global = global;
exports.local = local;

function fromFile(path) {
  return new GitConfig('--file "' + path + '"');
}

function global() {
  return new GitConfig('--global');
}

function local() {
  return new GitConfig('--local');
}

function GitConfig(fileOptions) {
  this.add = add;
  this.get = get;
  this.getNamesMatching = getNamesMatching;
  this.getValueMatching = getValueMatching;
  this.removeSection = removeSection;
  this.set = set;

  function add(name, value) {
    return run('--add ' + name + ' "' + value + '"');
  }

  function exec(command, options) {
    return new Promise((resolve, reject) => {
      return cp.exec(command, options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  function get(name) {
    return run(name);
  }

  function getNamesMatching(regex) {
    return run('--name-only --get-regexp ' + regex.source);
  }

  function getValueMatching(name, regex) {
    return run('--get ' + name + ' ' + regex.source);
  }

  function removeSection(name) {
    return run('--remove-section ' + name);
  }

  function run(args) {
    return exec('git config ' + fileOptions + ' ' + args)
      .then(stdout => stdout.trim().split('\n'))
      .catch(() => []);
  }

  function set(name, value) {
    return run(name + ' "' + value + '"');
  }
}
