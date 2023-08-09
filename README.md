## 初衷
[tinypng](https://tinypng.com/) 网页版，其实是挺方便的。但是他有上传图片数量的限制，比如每天只能上传 20 张，如果超过这个数量，就会断断续续的出现 `Too many files uploaded at once` 错误 。所以才决定使用 Node 来开发一个绕过数量限制的 npm 包。


## 使用方法
安装：
```bash
npm i super-tinypng -g # or yarn global add super-tinypng
```

然后，在命令行进入到你想要压缩图片的目录，执行：
```bash
super-tinypng
```

如果想要处理指定输入和输出目录：
```bash
super-tinypng  --path /your/path/to --out /your/path/to
```

## 说明
- tinypng 默认是会对用户上传数量有限制的，使用了 `X-Forwarded-For` 头绕过该限制
- ~~为了简化，不可以递归遍历文件夹~~
- ~~为了简化，不支持配置，只能压缩当前目录下的图片，并且会在当前目录下创建一个 output 目录，把压缩成功的图片放到里面~~

## 免责声明

该仓库仅用于学习，如有商业用途，请购买官方的 pro 版：https://tinify.com/checkout/web-pro

This Repo is only for study. 
