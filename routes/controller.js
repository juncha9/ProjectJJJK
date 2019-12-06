var movie_test = require(__routes+"/movie_test");
var auth = require(__routes+"/auth");


module.exports = function(app)
{
    app.get("/",(req,res)=>
    {
        res.render("index.ejs");
    });

    //컨트롤러 분리
    app.use('/movie_test', movie_test);
    
    app.use('/auth',auth);

}

