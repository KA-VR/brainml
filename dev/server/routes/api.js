'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

// import apiController from '../controllers/apiController';

var router = new _express.Router();

router.route('/think').get(function (req, res) {
  return res.send('Hi');
});

exports.default = router;