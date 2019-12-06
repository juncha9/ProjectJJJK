var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended:false});
var db = require(__modules+'/database');
var router = require('express').Router();

/*
    이 파일은 라우팅 및 쿼리 동작 부분을 예시로 보여주기 위해 제작했습니다.
*/


router.get("/",(req,res)=>
{
    var fn = async function() 
    {
        try
        {
            [records,fields] = await db.query("select * from Movie_info");
            //console.log(rows);
            res.render("movie_list.ejs",records);
        }
        catch(err)
        {
            console.error(err);
            res.redirect("/");   
        }

    }();

});

router.get("/input",(req,res)=>
{
    var fn = async function()
    {
        var mName = "영화이름";
        var mDirector = "영화감독";
        var mReleaseDate = "2018-12-12";
        var mDesc = "설명";
        try
        {
            await db.query("insert into DB.Movie_info(movie_name,movie_director,release_date,movie_desc,insert_date) values(?,?,?,?,now());",[mName,mDirector,mReleaseDate,mDesc]);
            res.redirect("/movie_test");
        }
        catch(err)
        {
            console.error(err);
            res.redirect("/");
        }
        
    }();
    
});


module.exports = router;