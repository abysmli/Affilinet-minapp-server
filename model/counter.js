/**
 * Created by yuansc on 2017/4/6.
 */
"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CounterSchema = new Schema({
  name: {type: String, require: true, index: true, unique: true},
  count: {type: Number, default: 0, min: 0}
});

mongoose.model('Counter', CounterSchema);
