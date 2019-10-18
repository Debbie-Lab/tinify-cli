# @app-proto/tinify-cli

> [tinypng.com](https://tinypng.com)对`.png\.jpg`压缩的效果是极其显著的，
这里提供命令行工具批量对某个目录下`.png\.jpg`后缀图片做tinify压缩。


## Usage

```bash
# Install
yarn global add @app-proto/tinify-cli

tinify  # tinify 当前目录下所有`.png\.jpg`后缀图片
tinify --key 'YOU API KEY'  # 内置`API KEY`有使用次数限制，建议 tinypng.com/developers 申请自己的
tinify --suffix 'min' # 比如针对文件`logo.png`会生成`logo.min.png`(默认会覆盖原文件)
tinify --curl # 采用`curl --user api:YOUR_API_KEY --data-binary @filename -i https://api.tinify.com/shrink`方式进行tinify操作
```

