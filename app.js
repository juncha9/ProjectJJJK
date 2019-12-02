//require
var privateData = require("./private/data.json");
var express = require("express");
var ejs = require("ejs");

var session = require("express-session")
var db;

async function Init()
{
    //DB 접속
    db = await sqlPool.getConnection(async (conn) => conn);
}

async function SqlConnect()
{
    
    //console.log(connection)
    db.connect((err)=>
    {
        if(err)
        {
            console.error('Error on connect DB ' + err.stack);
            return;
        }
        else
        {
            console.log("DB is connected");
        }
    });
    

}
 
SqlConnect();

var app = express();
app.use(express.static(__dirname + '/public'));


var router = require("./router/controller") (app);


var server = app.listen(3000,function()
{
    console.log("Server is started");
})




/*

*/
