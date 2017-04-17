/**
 * Controller的路由表
 * Created by yuansc on 2017/3/8.
 */
"use strict";
const router = require('koa-router')();
const config = require('config');
const ImageController = require('./image');
const UserController = require('./user');
const CommentController = require('./comment');
const NoteController = require('./note');
const HistoryController = require('./history');
const RelationController = require('./relations');
const FavoriteController = require('./favorite');

router.post('/users/login', UserController.login);
router.get('/users/code', UserController.genQrCode);

router.post('/images/upload', ImageController.upload);
router.del('/images/del', ImageController.del);

router.post('/comments/add', CommentController.add);
router.get('/comments/list/:noteId', CommentController.list);

router.post('/notes/add', NoteController.add);
router.post('/notes/update', NoteController.update);
router.get('/notes/:uid/list', NoteController.list);
router.post('/notes/share', NoteController.share);
router.post('/notes/copy', NoteController.copy);
router.get('/notes/detail/:noteId', NoteController.detail);
router.del('/notes/delete/:noteId', NoteController.delete);
router.get('/notes/search', NoteController.search);
router.get('/notes/scan', NoteController.scan);

router.post('/favorites/add/:noteId', FavoriteController.add);
router.del('/favorites/remove/:noteId', FavoriteController.remove);
router.get('/favorites/list', FavoriteController.list);

router.get('/history/list', HistoryController.list);

router.get('/relations/list', RelationController.mine);

router.all('/msg', async function(ctx){
  console.log(ctx)
  console.log(ctx.request.body)
  console.log(ctx.request.query)
  ctx.body = 'ok'
});

module.exports = router;
