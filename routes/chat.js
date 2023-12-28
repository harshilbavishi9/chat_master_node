const express = require('express');
const routes = express.Router();
const chatController = require('../controller/chatController');

routes.post('/add_chat', chatController.AddChat);

module.exports = routes;