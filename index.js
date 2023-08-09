#!/usr/bin/env node

/** 
 * 
 * 参考： https://segmentfault.com/a/1190000015467084
 * 优化：通过 X-Forwarded-For 添加了动态随机伪IP，绕过 tinypng 的上传数量限制
 * 
 *  */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
// 获取命令行参数
const args = process.argv;
const helpText=`super-tinypng 图片压缩命令行工具 - 处理输入目录中的图片并将压缩后的图片保存到指定的输出目录。

用法:
  super-tinypng [选项]

选项:
  --path <路径>    指定输入目录的路径。默认值为当前目录。
  --out <路径>     指定输出目录的路径。默认值为输入目录下的 "output" 目录。

其他选项:
  --help          显示帮助信息并退出。
  --version       显示工具版本信息并退出。

示例用法:
  1. 使用默认参数运行工具:
     super-tinypng

  2. 指定输入目录并将结果保存在默认的输出目录:
     super-tinypng --path /path/to/input

  3. 指定输入目录和输出目录的路径:
     super-tinypng --path /path/to/input --out /path/to/output

注意:
  - 输入目录中的文件将会被处理，处理结果将保存到输出目录中。
  - 如果输出目录不存在，工具将尝试创建它。`;

const helpIndex = args.indexOf('--help');

if (helpIndex !== -1) {
  console.log(helpText);
  return
}

if (args.includes("--version")){
  console.log('1.0.1')
  return
}

// 查找 "--path" 参数并获取其值
const pathIndex = args.indexOf('--path');
let root = process.cwd();

if (pathIndex !== -1 && pathIndex + 1 < args.length) {
  root = args[pathIndex + 1];
  if (!fs.existsSync(root)) {
    throw new Error( root + " 目录不存在")
  }
}


const exts = ['.jpg', '.png'];
const max = 5200000; // 5MB == 5242848.754299136

const options = {
  method: 'POST',
  hostname: 'tinypng.com',
  path: '/backend/opt/shrink',
  headers: {
    rejectUnauthorized: false,
    'Postman-Token': Date.now(),
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
  }
};

fileList(root);

// 生成随机IP， 赋值给 X-Forwarded-For
function getRandomIP() {
  return Array.from(Array(4)).map(() => parseInt(Math.random() * 255)).join('.')
}

// 获取文件列表
function fileList(folder) {
  fs.readdir(folder, (err, files) => {
    if (err) console.error(err);
    files.forEach(file => {
      const filePath = path.join(folder, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error(err);
        if (stats.isDirectory()) {
          fileList(filePath);
        } else if (
          // 必须是文件，小于5MB，后缀 jpg||png
          stats.size <= max &&
          stats.isFile() &&
          exts.includes(path.extname(file))
        ) {
          // 通过 X-Forwarded-For 头部伪造客户端IP
          options.headers['X-Forwarded-For'] = getRandomIP();
          fileUpload(filePath);
        }
      });
    });
  });
}

// 异步API,压缩图片
// {"error":"Bad request","message":"Request is invalid"}
// {"input": { "size": 887, "type": "image/png" },"output": { "size": 785, "type": "image/png", "width": 81, "height": 81, "ratio": 0.885, "url": "https://tinypng.com/web/output/7aztz90nq5p9545zch8gjzqg5ubdatd6" }}
function fileUpload(img) {
  var req = https.request(options, function(res) {
    res.on('data', buf => {
      let obj = JSON.parse(buf.toString());
      if (obj.error) {
        console.log(`[${img}]：压缩失败！报错：${obj.message}`);
      } else {
        fileUpdate(img, obj);
      }
    });
  });

  req.write(fs.readFileSync(img), 'binary');
  req.on('error', e => {
    console.error(e);
  });
  req.end();
}

// 该方法被循环调用,请求图片数据
function fileUpdate(imgpath, obj) {
  const outputPathIndex = args.indexOf('--out');
  let outputDir =path.join(root, 'output');

  if (outputPathIndex !== -1 && outputPathIndex + 1 < args.length) {
    outputDir = args[outputPathIndex + 1];
  }
  imgpath = path.join(outputDir, imgpath.replace(root, ''));
  const imgdir = path.dirname(imgpath);

  
  if (!fs.existsSync(imgdir)) {
    fs.mkdirSync(imgdir, { recursive: true });
  }

  let options = new URL(obj.output.url);
  let req = https.request(options, res => {
    let body = '';
    res.setEncoding('binary');
    res.on('data', function(data) {
      body += data;
    });

    res.on('end', function() {
      console.log("imgpath:" + imgpath)
      fs.writeFile(imgpath, body, 'binary', err => {
        if (err) return console.error(err);
        console.log(
          `[${imgpath}] \n 压缩成功，原始大小-${obj.input.size}，压缩大小-${
            obj.output.size
          }，优化比例-${obj.output.ratio}`
        );
      });
    });
  });
  req.on('error', e => {
    console.error(e);
  });
  req.end();
}


