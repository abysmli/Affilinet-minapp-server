/**
 * Created by yuansc on 2017/3/12.
 */
"use strict";
const constants = module.exports = {};

//笔记状态，用数字表示状态方便扩展
constants.NOTE_STATE_PRIVATE = 10;
constants.NOTE_STATE_OPEN = 20;
constants.NOTE_STATE_DELETE = -10;

//用户状态，用数字表示方便扩展
constants.USRE_STATE_NORMAL = 20;
constants.USER_STATE_SEED = 25;
constants.USER_STATE_VIP = 30;

constants.RECORD_TYPE_VIEW = 'view';
constants.RECORD_TYPE_SEARCH = 'search';
constants.RECORD_TYPE_SCAN = 'scan';