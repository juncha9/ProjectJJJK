var movie_test = require(__routes+"/movie_test");

module.exports = function(app)
{
    app.get("/",(req,res)=>
    {
        res.render("index.ejs");
    });

    app.use('/movie_test', movie_test);
    //컨트롤러 분리

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

