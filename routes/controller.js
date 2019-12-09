var movie_test = require(__routes+"/movie_test");
const db = require(__modules+'/database');
var bodyParser = require('body-parser');
var request = require("request");
var client_id = "JoRmTB4RuwMXAerDk0Yz";
var client_secret = "MSlMuaCNgp";


module.exports = function(app)
{
   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({extended:true}));

    app.get("/",(req,res)=>
    {
        res.render("index.ejs");
    });

    app.use('/movie_test', movie_test);
    //컨트롤러 분리 

    app.get("/insertMovie",(req,res)=>{
       res.render("insertMovie.ejs");
    });

   //20191209 현규
   //히든페이지에서 영화 검색시 디비로 자동 삽입...
   //시간관계상 중복데이터 체크는 안합니다.
   app.get("/hidden/searchMovieForInsert",(req,res) =>{
      console.log(req.query.query);
      var api_url = 'https://openapi.naver.com/v1/search/movie?query=' + encodeURI(req.query.query); // json 결과
      //var api_url = 'https://openapi.naver.com/v1/search/blog.xml?query=' + encodeURI(req.query.query); // xml 결과
      var request = require('request');
      var options = {
         url: api_url,
         headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
      };
       request.get(options, function (error, response, body) {
         if (!error && response.statusCode == 200) {
            res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            console.log(res);
            console.log(typeof(res));
            res.end(body);
         } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
         }
      });
   });

   /**
    * 20191209 현규
    * 히든페이지 통해서 이쪽으로 접근하면
    * 네이버 api를 통해 받은 결과값을 db에 insert합니다.
    */
   app.get("/hidden/insertMovie", (req,res) => {
      let fn = async function(){
         try{
            await db.query("insert into movie_info(movie_name, movie_director, release_date, image_url, user_rating, insert_date) values (?,?,?,?,?,sysdate());",
               [((req.query.title).replace("<b>","")).replace("</b>",""), req.query.director, req.query.pubDate, req.query.image, req.query.userRating]);
         }catch(err){
            console.log(err);
            //res.redirect("/insertMovie");
         }
      }();

      console.log(res);
      res.end();
   });
}

