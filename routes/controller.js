const db = require(__modules+'/database');
var bodyParser = require('body-parser');
var request = require("request");
var client_id = "JoRmTB4RuwMXAerDk0Yz";
var client_secret = "MSlMuaCNgp";
var auth = require(__routes+"/auth");
var movie = require(__routes+"/movie");
var board = require(__routes+"/board");

module.exports = function(app)
{
   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({extended:true}));

   app.get("/",(req,res)=>{
        res.render("index.ejs");
   });

   //컨트롤러 분리

   /**
    * 20191210 현규
    * 케러셀용
    * streaming_cnt 순 5개 표시(연도제한없음)
    * 
    */
   app.get("/movie/getMovieCarousel", (req,res) => {
      let func = async function(){
         try
         {
            [result,fields] = await db.query("select * from movie_info where delete_yn = 'N' order by streaming_cnt desc limit 0,5;");
            console.log(result);
            res.send(result);
         }
         catch(err)
         {
            console.log(err);
            res.send(err);
         }
      }();
   });

   /**
    * 20191208 현규
    * 실시간 인기 top5
    * 현재 기준으로 인기top5를 보여줘야함
    * 네이버에서 넘어오는 pubDate가 년도만 포함되어서
    * 주차까지 분리하고싶었지만 데이터 한계상 2차가공이 필요함 -> drop결정
    * new : 올해기준으로 streaming_cnt top5 보여주기
    */
   app.get("/movie/getPopularMovieList", (req,res) => {
      //db.query("select * from movie_info where release_date = 2019 order by user_rating desc limit 0,5;", function(err, result){
      let func = async function(){
         try
         {
            [result,fields] = await db.query("select * from movie_info where release_date = 2019 and delete_yn = 'N' order by streaming_cnt desc limit 0,5;");
            console.log(result);
            res.send(result);
         }
         catch(err)
         {
            console.log(err);
            res.send(err);
         }
      }();
   });

   /**
    * 20191208 현규
    * 최신영화
    * 올해기준, 유저평점 높은 작품 5개를 보여줘야하지만
    * 현재 movie_info 테이블의 데이터의 가공이 덜 끝났으므로
    * 직접 선택한 5개만 뽑아서 보여주도록 작성
    */
   app.get("/movie/getLatestMovieList",(req,res) => {
      //db.query("select * from movie_info where release_date = 2019 order by user_rating desc limit 0,5;", function(err, result){
      let func = async function(){
         try
         {
            [result,fields] = await db.query("select * from movie_info where movie_seq in(13,57,69,67,70);");
            res.send(result);
         }
         catch (err)
         {
            console.log(err);
            res.send(err);
         }
      }();
   });

   
   /**
    * 20191209 현규
    * 히든페이지에서 영화 검색시 디비로 자동 삽입...
    * 시간관계상 중복데이터 체크는 안합니다.
    */
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

   // app.get("/insertMovie",(req,res)=>{
   //    res.render("insertMovie.ejs");
   // });
   
   /**
    * 20191210 현규
    * 영화 상세보기
    * bind된 movieSeq를 인자로 select후
    * 랜더링을 통해 그림
    */
   app.post("/getMovieView", (req,res) => {
      //console.log(req.body.movieSeq);
      //디비에서 해당 seq 영화정보 가져오기
      let func = async function(){
         try
         {
            [result,fields] = await db.query("select * from movie_info where movie_seq = ? ",[req.body.movieSeq]);
         
            //console.log(result);
            //res.render("movieView",{movieTitle : result.movie_title});
            //res.send(result);
            res.render("movieView", {
               movieImage:    result[0].image_url,
               movieTitle:    result[0].movie_title,
               movieDirector: result[0].movie_director,
               movieDesc:     result[0].movie_desc,
               userRating:    result[0].user_rating,
               releaseDate:   result[0].release_date,
               streamingCnt:  result[0].streaming_cnt    
            });
         }
         catch(err)
         {
            console.log(err);
            res.send(err);
         }
      }();
   });

   // app.get("/movieView", (req,res) => {
   //    console.log("하이");
   //    res.render("movieView.ejs");
   // });


    //컨트롤러 분리
   
   app.use('/auth',auth);

   app.use('/movie',movie);
   
   app.use('/board',board);

}
