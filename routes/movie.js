const db = require(__modules+'/database');
const router = require('express').Router();
router.get("/",(req,res) =>
{
    res.redirect('/movie/list');
});
router.get("/list",(req,res)=>
{
    let fn = async function ()
    {
        try
        {
            //페이지 관련 부분 
            let page;
            if(!req.query.page)
            {
                page = 1;
            }
            else
            {
                page = req.query.page;
            }

            //보여줄 항목의 갯수
            const listCount = 10;
            
            [records,fields] = await db.query('SELECT count(*) as count FROM movie_info');
            if(!(records && records[0]))
            {
                let err = 'Something wrong';
                //에러 발생
                res.render('error',{error:err});
                return;
            }
            let totalCount = records[0].count;
            let totalPage = parseInt(totalCount/listCount); //페이지 갯수
            
            if(totalCount % listCount > 0 )
            {
                totalPage++;
            }

            //페이지 계산
            const pageCount = 10; //보여줄 페이지 갯수
            if(page > totalPage)
            {
                page = totalPage;
            }
            let startPage = (parseInt((page - 1) / pageCount) * pageCount) + 1;
            
            
            let endPage = startPage + pageCount - 1;
            

            if (endPage > totalPage) 
            {
                endPage = totalPage;
            }

            //페이지 계산

            //페이지 관련 부분 

            [movies, fields] = await db.query("SELECT * FROM movie_info LIMIT ?,?",[(page-1)*listCount,listCount]);
            if(movies && movies.length>=0)
            {
                res.render('movie_list',{page:page, startPage: startPage, endPage: endPage, movies: movies, totalPage: totalPage, isLibrary:false });
            }
            else
            {
                let err = 'Something wrong';
                //에러 발생
                res.render('error',{error:err});
                return;
            }

        }
        catch(err)
        {   
            console.log(err);
            res.render('error',{error:err});
        }
        
    }();

});

router.get('/library',(req,res)=>
{
    var userSeq = req.session.userSeq;
    if(!userSeq)
    {
        res.render('error',{error:'라이브러리는 로그인 후에 이용가능합니다.'});
        return;
    }
    let fn = async function(){
        try
        {
            //페이지 관련 전처리
            let page;
            if(!req.query.page)
            {
                page = 1;
            }
            else
            {
                page = req.query.page;
            }
            //보여줄 항목의 갯수
            const listCount = 10;
            let sql = "SELECT count(*) as count FROM DB.user_library L "+
            "INNER JOIN DB.user_info U ON L.user_seq=U.user_seq "+
            "INNER JOIN DB.movie_info M ON L.movie_seq = M.movie_seq "+
            "WHERE U.user_seq=?";
            [records,fields] = await db.query(sql,userSeq);
            if( !(records && records[0]) )
            {
                let err = 'Something wrong';
                //에러 발생
                res.render('error',{error:err});
                return;
            }
            let totalCount = records[0].count;
            let totalPage = parseInt(totalCount/listCount); //페이지 갯수

            if(totalCount % listCount > 0 )
            {
                totalPage++;
            }

            //페이지 계산
            const pageCount = 10; //보여줄 페이지 갯수
            if(page > totalPage)
            {
                page = totalPage;
            }
            let startPage = (parseInt((page - 1) / pageCount) * pageCount) + 1;
            let endPage = startPage + pageCount - 1;
            if (endPage > totalPage) 
            {
                endPage = totalPage;
            }

            console.log('page:'+page+'totalPage:'+totalPage+'totalCount:'+totalCount+'startPage:'+startPage+'endPage:'+endPage);
            //페이지 계산

            //페이지 관련 전처리
            sql = "SELECT * FROM DB.user_library L "+
            "INNER JOIN DB.user_info U ON L.user_seq=U.user_seq "+
            "INNER JOIN DB.movie_info M ON L.movie_seq = M.movie_seq "+
            "WHERE U.user_seq=? LIMIT ?,?";
            [movies, fields] = await db.query(sql,[userSeq,(page-1)*listCount,listCount]);
            if(movies && movies.length>=0)
            {
                res.render('movie_list',{page:page, startPage: startPage, endPage: endPage, movies: movies, totalPage: totalPage, isLibrary:true});
            }
            else
            {
                let err = 'Something wrong';
                //에러 발생
                res.render('error',{error:err});
                return;
            }
        }
        catch(err)
        {            
            console.log(err);
            res.render('error',{error:err});
        }
    
    }();
});


router.get('/detail',(req,res)=>
{
    if(!req.query.seq)
    {
        res.render('error',{error:'영화정보 쿼리가 존재하지 않습니다.'});
    }
    let movieSeq = req.query.seq;
    
    //db.query는 프로미즈로구현되어있기때문에 await를 사용하여 리턴받기로 한다.
    let fn = async function()
    {
        //await는 필수적으로 async 함수내에 있어야한다.
        try
        {
            let sql = 'SELECT * FROM movie_info WHERE movie_seq=?';
            [movies, movieFields] = await db.query(sql,[movieSeq]); 
            sql = "SELECT R.movie_reply_seq, R.reply_contents, R.movie_rating, DATE_FORMAT(R.insert_date,'%Y-%m-%d') AS insert_date, DATE_FORMAT(R.modify_date,'%Y-%m-%d') AS modify_date, U.user_id, U.user_seq " +
            "FROM movie_reply_info R INNER JOIN user_info U ON U.user_seq = R.user_seq " +
            "WHERE R.movie_seq=?";
            [replies, replyFields] = await db.query(sql,[movieSeq]);
            let hasMovie = false;
            if(req.session.userSeq)
            {
                let userSeq = req.session.userSeq;
                sql = "SELECT count(*) as count "+
                "FROM user_library L INNER JOIN user_info U ON L.user_seq=U.user_seq "+
                "WHERE L.user_seq=? && L.movie_seq=?";
                [records, fields] = await db.query(sql,[userSeq,movieSeq]);
                if(records && records[0].count > 0)
                {
                    hasMovie = true;
                }
            }
            //await를 사용하면 쿼리를 마치고 리턴값이 올때까지 기다린다.
            //만약 응답이없으면 timeout이 2초로 설정되있기에 2초뒤에 catch err로 전달된다.
            if(movies.length>0)
            {
                res.render('movie_detail.ejs',{movie: movies[0], replies: replies, hasMovie: hasMovie});    
            }
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.render('error',{error:err});
            
        }
    }();//마지막에 ()를 추가함으로 fn()을 실행
});

router.post('/add_reply',(req,res)=>{
    let fn = async function()
    {
        
        let userSeq = req.session.userSeq;
        let movieSeq = req.body.movieSeq;
        let replyContents = req.body.replyContents;
        let movieRating = req.body.movieRating;
        try
        {
            let sql = "INSERT INTO movie_reply_info(movie_seq,user_seq,reply_contents,movie_rating,insert_date) values(?,?,?,?,now())";
            [result] = await db.query(sql,[movieSeq,userSeq,replyContents,movieRating]);   
            if(result && result.affectedRows > 0)
            {
                res.send({result:'success'});
            }
            else
            {
                res.send({result:'affected rows:'+result.affectedRows});
            }
        }
        catch(err)
        {
            console.error(err);
            res.send({error:err});
        }

    }();
});

router.post('/delete_reply',(req,res)=>{
    let fn = async function()
    {
        let resObejct;
        let userSeq = req.session.userSeq;
        let movieReplySeq = req.body.movieReplySeq;
        try
        {
            let sql = "DELETE FROM movie_reply_info WHERE movie_reply_seq = ? AND user_seq = ?";
            [result] = await db.query(sql,[movieReplySeq,userSeq]);    
            console.log(result); 
            
            if(result && result.affectedRows > 0)
            {
                res.send({result:'success'});
            }
            else
            {
                res.send({result:'affected rows:'+result.affectedRows});               
            }
        }
        catch(err)
        {
            console.error(err);
            res.send({error:err});
        }

    }();
});

router.post('/rent_movie',(req,res)=>{
    let fn = async function()
    {
        try
        {
            let userSeq = req.session.userSeq;
            if(!userSeq)
            {
                res.send({result:'nouser'});
                return;
            }
            let movieSeq = req.body.movieSeq;
            let sql = "SELECT count(*) as count "+
            "FROM user_library L INNER JOIN user_info U ON L.user_seq=U.user_seq "+
            "WHERE L.user_seq=? && L.movie_seq=?";
            [records, fields] = await db.query(sql,[userSeq,movieSeq]);
            if(records && records[0].count > 0)
            {
                res.send({result:'overlap'});
                return;
            }
            sql = "INSERT INTO user_library(user_seq,movie_seq,insert_date) VALUES(?,?,now())";
            [result] = await db.query(sql,[userSeq,movieSeq]);
            if(result && result.affectedRows > 0)
            {
                res.send({result:'success'});
            }
            else
            {
                res.send({result:'failed, affected rows:'+result.affectedRows});
            }
        }
        catch(err)
        {
            console.log(err);
            res.send({error:err});
        }
    }();
});

router.post('/cancel_movie',(req,res)=>{
    let fn = async function()
    {
        let userSeq = req.session.userSeq;
        try
        {
            if(!userSeq)
            {
                res.send({result:'nouser'});
                return;
            }
            let movieSeq = req.body.movieSeq;
            let sql = "SELECT count(*) as count "+
            "FROM user_library L INNER JOIN user_info U ON L.user_seq=U.user_seq "+
            "WHERE L.user_seq=? && L.movie_seq=?";
            [records, fields] = await db.query(sql,[userSeq,movieSeq]);
            if(records && records[0].count <= 0)
            {
                res.send({result:'empty'});
                return;
            }
            sql = "DELETE FROM user_library WHERE user_seq=? AND movie_seq=?";
            [result] = await db.query(sql,[userSeq,movieSeq]);
            if(result && result.affectedRows > 0)
            {
                res.send({result:'success'});
            }
            else
            {
                res.send({result:'failed, affected rows:'+result.affectedRows});
            }
        }
        catch(err)
        {
            console.log(err);
            res.send({error:err});
        }
    }();
});


module.exports = router;