var movie_test = require(__routes+"/movie_test");

module.exports = function(app)
{
    app.get("/",(req,res)=>
    {
        res.render("index.ejs");
    });

    
    app.use('/movie_test', movie_test);
    //컨트롤러 분리
}

