var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended:false});
var connector = require(__modules+'/connector');
var router = require('express').Router();

router.get("/",(req,res)=>
{
    var fn = async function() 
    {
        [records,fields] = await connector.query("select * from Movie_info");
        //console.log(rows);
        res.render("movie_list.ejs",records);
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
        await connector.query("insert into DB.Movie_info(movie_name,movie_director,release_date,movie_desc,insert_date) values(?,?,?,?,now());",[mName,mDirector,mReleaseDate,mDesc]);
    }();
    res.redirect("/movie_test");
});


module.exports = router;