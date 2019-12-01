//require
var privateData = require("./private/data.json");
var express = require("express");
var ejs = require("ejs");
var mysql = require("mysql");
var session = require("express-session")

function SqlConnect()
{
    
    connection = mysql.createConnection(
        {
            host : privateData.mysqlInfo.host,
            user : privateData.mysqlInfo.user,
            port : privateData.mysqlInfo.port,
            password : privateData.mysqlInfo.password,
            database : privateData.mysqlInfo.database
        }
    )
    //console.log(connection)
    connection.connect((err)=>
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
