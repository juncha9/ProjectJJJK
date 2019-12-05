//require

const express = require("express");
const favicon = require('express-favicon');
const ejs = require("ejs");
const session = require("express-session");

global.__base = __dirname;
global.__routes = __dirname +'/routes';
global.__modules = __dirname +'/modules';
global.__views = __dirname + "/views";
global.__private = __dirname +'/private';
global.__public = __dirname + '/public';

var app = express();
app.set('port',process.env.PORT || 3000);
app.set('view engine','ejs');
app.use(favicon(__public + '/favicon.png'));
app.use(express.static(__public));

var router = require(__routes+"/controller") (app);
var server = app.listen(3000,function()
{
    console.log("Server is started");
})
