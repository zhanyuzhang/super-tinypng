# 使用方法
安装：
```bash
npm i super-tinypng -g # or yarn global add super-tinypng
```

然后，在命令行进入到你想要压缩图片的目录，执行：
```bash
super-tinypng
```

# 说明
- tinypng 默认是会对用户上传数量有限制的，使用了 `X-Forwarded-For` 头绕过该限制
- 为了简化，不可以递归遍历文件夹
- 为了简化，不支持配置，只能压缩当前目录下的图片，并且会在当前目录下创建一个 output 目录，把压缩成功的图片放到里面
