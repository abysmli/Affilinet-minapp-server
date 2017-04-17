购物助手Server端
=============

###运行环境
node `v7.7.0`及以上版本
###运行
````
npm install 
node index.js
````
服务器端运行推荐[pm2](https://github.com/Unitech/pm2)

###如何生成接口文档
文档按照[apidoc](http://apidocjs.com/)规范进行编写
本地运行
```
cd $PROJECT_PATH
apidoc -i routes/ -o public/doc

```
启动服务
浏览器中打开 `http://localhost:3000/doc/index.html`即可

PS:__请勿在服务器上运行__

###图片放在哪个目录

```
public/img

```
###各个目录什么作用
* `utils`目录表示工具类
* `routes` 目录为controller相关类
* `public`目录为对外暴露静态资源目录
* `model` 目录为数据模型定义
* `config` 目录为配置文件目录

###我想改配置文件怎么改
配置文件使用方式请看[node-config](https://github.com/lorenwest/node-config)