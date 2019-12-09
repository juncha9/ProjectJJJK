const db = require(__modules+'/database');
const router = require('express').Router();
router.get("/list",(req,res)=>
{

    db.query("select count(*) as totalCount from movie_info")

    res.render('movie_list')


});

router.get('/detail',(req,res)=>
{
    var movieSeq = req.query.seq;
    var sql = 'select * from movie_info where movie_seq=?';
    //db.query는 프로미즈로구현되어있기때문에 await를 사용하여 리턴받기로 한다.
    console.log(movieSeq);
    let fn = async function()
    {
        //await는 필수적으로 async 함수내에 있어야한다.
        try
        {
            [records, fields] = await db.query(sql,[movieSeq]); 
            //await를 사용하면 쿼리를 마치고 리턴값이 올때까지 기다린다.
            //만약 응답이없으면 timeout이 2초로 설정되있기에 2초뒤에 catch err로 전달된다.
            for(var i = 0; i<records.length; i++)
            {
                console.log(records[i]); //콘솔로 한번 출력하여 결과값 확인
            }
            res.render('movie_detail',{title:'상세페이지',rows:records});
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.redirect("/");
        }
    }();//마지막에 ()를 추가함으로 fn()을 실행
})




module.exports = router;