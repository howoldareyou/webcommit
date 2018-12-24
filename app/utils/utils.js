'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const JSONbig = require('json-bigint');

function userErr(message = '', code) {
  const err = new Error();
  err.code = 'user_error';
  err.message = message;
  if (code) err.errCode = code;
  return err;
}

function isDir(path) {
  return new Promise(resolve => {
    fs.stat(path, (err, stats) => {
      if (err) return resolve(false);
      resolve(stats.isDirectory());
    });
  });
}

function readDir(path, recursive = true, filter) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, async (err, files) => {
      if (err) {
        reject(err);
      } else {
        const children = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.charAt(0) === '.') continue;
          const filePath = path + '/' + file;
          const isdir = await isDir(filePath);
          const item = { name: file, isdir, path: filePath };
          if (isdir && recursive) {
            item.children = await readDir(filePath, recursive, filter);
          }
          if (filter && filter(item) === false) continue;
          children.push(item);
        }
        resolve(children);
      }
    });
  });
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) return reject(userErr('文件读取失败'));
      resolve(data.toString());
    });
  });
}

module.exports = {
  userErr,
  readFile,
  async readJson(path) {
    const content = await readFile(path);
    return JSONbig.parse(content);
  },
  async writeJson(path, data) {
    const tempFile = path + '.temp';
    await fse.outputFile(tempFile, JSONbig.stringify(data));
    await fse.move(tempFile, path, { overwrite: true });
  },
  sleep(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  },
  readDir,
  strToJson(str, defaultVal = null) {
    try {
      return JSONbig.parse(str);
    } catch (error) {
      return defaultVal;
    }
  },
  getType(obj) {
    const type = Object.prototype.toString.call(obj);
    return type.substring(8, type.length - 1).toLocaleLowerCase();
  },
};
