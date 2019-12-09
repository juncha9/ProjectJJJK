var movie_test = require(__routes+"/movie_test");
var auth = require(__routes+"/auth");
var movie = require(__routes+"/movie");

module.exports = function(app)
{
    app.get("/",(req,res)=>
    {
        res.render("index.ejs");
    });

    //컨트롤러 분리
    app.use('/movie_test', movie_test);
    
    app.use('/auth',auth);

    app.use('movie',movie);

    /**
     * jQuery ajax 방식 테스트
     */

     app.get("/test/jQueryAjaxGet",(req,res) =>{
        res.render("testGet.ejs");
     });

     app.post("/test/jQueryAjaxPost",(req,res) =>{
        res.render("testPost.ejs");
     });
}

