//require
global.__base = __dirname;
global.__routes = __dirname +'/routes';
global.__modules = __dirname +'/modules';
global.__views = __dirname + "/views";
global.__public = __dirname + '/public' 
global.__template = __dirname + '/template';
global.__private = __dirname + '/private/data.json';
const express = require('express');
const favicon = require('express-favicon');
const ejs = require("ejs");
const session = require("express-session");

const private = require(__private);

var app = express();

app.set('port',process.env.PORT || 3000);
app.set('view engine','ejs');
app.use(favicon(__public + '/favicon.png'));
app.use(express.static(__public));
var mysqlInfo = 
app.use(session(
    {
        secret: private.session.secret,
        resave: false,
        saveUninitialized: true
    }
));

//BodyParser 사용
app.use(express.json());
//UrlEncodedParser 사용
app.use(express.urlencoded({extended:false}));

app.use((req,res,next)=>
{
    res.locals.session = req.session;
    next();
});

var router = require(__routes+"/controller") (app);



var server = app.listen(3000,function()
{
    console.log("Server is started");
})
