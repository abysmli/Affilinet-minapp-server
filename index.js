/**
 * 入口文件
 * Created by yuansc on 2017/3/8.
 */
"use strict";

const Koa = require('koa');
const config = require('config');
const multer = require('koa-multer');
const morgan = require('koa-morgan');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const jwt = require('koa-jwt');
const genres = require('./utils/genres');
const router = require('./routes');
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.setLevel(config.get('logLevel'));
const app = module.exports = new Koa();

app.use(morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser());
app.use(multer({dest: './public/img'}).any());
app.use(serve('./public'));
app.use(jwt({secret: config.get('jwt-secret')}).unless({path: [/qrcode/, '/msg','/users/login']}));
app.use(async (ctx, next) => {
  await next();
  logger.debug(`${ctx.method} ${ctx.url} query:${JSON.stringify(ctx.request.query)}, body:${JSON.stringify(ctx.request.body)}, response: ${JSON.stringify(ctx.body)}`)
});
app.use((ctx, next) => {
  return next().catch(err => {
    if (err.code) {
      ctx.status = 400;
      ctx.body = genres.error(err)
    } else {
      ctx.status = 500;
      ctx.body = err;
    }
  });
});

app.use(router.routes());

app.listen(config.get('port'), function () {
  console.log('sever listen on: 127.0.0.1:' + config.get('port') + '   at:' + new Date());
});
