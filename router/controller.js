var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended:false});

module.exports = function(app,db)
{
    app.get("/",(req,res)=>
    {
        res.render("index.ejs");
    });

    app.get("/movie_detail",(req,res)=>
    {
        var datas = null;
        db.query("SELECT * FROM Movie_info;", (err,rows,fields)=>
        {
            datas = rows;
            for(var i = 0; i < rows.length; i++)
            {
                console.log(rows[i].movie_name +";"+ rows[i].movie_desc);
            }
        });
        res.render("movie_detail.ejs",datas);

    }
    
    )


}