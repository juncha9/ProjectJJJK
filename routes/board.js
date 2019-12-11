const db = require(__modules+'/database');
const router = require('express').Router();

//주소를 lsit로 입력 받아도 page로 이동되도록
// router.get('/board',(req,res)=>
// {
//     res.redirect('/board/page/1');
// });

//주소를 lsit로 입력 받아도 page로 이동되도록
router.get("/board",(req,res)=>
{
    res.redirect('/board/page/1');
});

//페이징 - 게시판을 페이지로 표시 (delete_yn='N'만 표시되도록)
 router.get('/page/:page',(req,res)=>
{
    var page = req.params.page;
    let fn = async function()
    {
        console.log('board_page');
        try
        {
            let sql = "select board_seq, board_writer, board_title, date_format(modify_date,'%Y-%m-%d %H:%i:%s') modify_date, " +
            "date_format(insert_date,'%Y-%m-%d %H:%i:%s') insert_date from board_info where delete_yn='N'";
            [rows,fields] = await db.query(sql);

            if(rows.length>0)
            {
                res.render('board_page', {title: '자유게시판', rows: rows, page:page, length:rows.length-1, page_num:10});    
            }
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.redirect("/");
        }
    }();
})

// 게시판 화면으로..
router.get("/write", (req,res) => {
    res.render('board_write',{title : "게시판 글쓰기"});
 });

 //게시판에 글쓰기
router.post('/write',(req,res)=>{
    let fn = async function()
    {
        console.log('board_write');
        user_seq = req.session.userSeq; //user_seq에 로그인 된 user의 userSeq 저장
        board_writer = req.session.userName; //board_writer에 로그인 된 user의 userName 저장
        board_title = req.body.board_title; //board_title에 게시판에서 작성된 제목을 저장
        board_contents = req.body.board_contents; //board_content에 게시판에서 작성된 내용을 저장
        try
        {
            let sql = "insert into board_info(user_seq, board_writer, board_title, board_contents, insert_date, modify_date) values(?,?,?,?,now(),now())";
            [result,fields] = await db.query(sql,[user_seq,board_writer,board_title,board_contents]);    
            if(result && result.serverStatus === 2)
            {
                res.redirect('/board/page/1');
            }
            else
            {
                //에러발생시는 여기로
                console.error(err);
                res.redirect("/");
            }
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.redirect("/");
        }

    }();
});

// 게시글 읽기
router.get('/read/:board_seq',(req,res)=>
{
    var board_seq = req.params.board_seq;
    var login_user = req.session.userSeq;  // 로그인된 유저 정보를 저장
    let fn = async function()
    {
        console.log('board_read');

        try
        {
            let sql = "select board_seq, board_writer, board_title, board_contents, date_format(modify_date,'%Y-%m-%d %H:%i:%s') modify_date, " +
                "date_format(insert_date,'%Y-%m-%d %H:%i:%s') insert_date from board_info where board_seq=?";
            let reply_sql = "select board_reply_seq, board_reply_writer, board_reply_contents, date_format(insert_date,'%Y-%m-%d %H:%i:%s') insert_date " +
                "from board_reply_info where delete_yn='N' and board_seq=?";
            let user_sql = "select user_seq from board_info where board_seq=?";
            
            //게시글 표시 쿼리
            [rows,fields] = await db.query(sql,[board_seq]);
            //댓글 표시 쿼리
            [rrows,fields] = await db.query(reply_sql,[board_seq]);
            //게시글을 작성한 user의 정보를 얻기 위해 유저정보 조회하여 user_info 값에 저장
            [user_info,fields] = await db.query(user_sql,[board_seq]);

            if(rows.length>0)
            {
                //row:글정보 / rrows:댓글정보  / user_info:게시글을 작성한 유저 정보  /  login_user:로그인한 유저
                res.render('board_read', {title:"게시판 글읽기", row:rows[0], rrows:rrows, user_info, login_user});
                console.log('board.js_user_info : '+user_info[0].user_seq);
                console.log('board.js_loing_user : '+login_user);
            }
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.redirect("/");
        }
    }();
})


// 게시판 글 수정(업데이트)
router.post('/update',(req,res)=>{
    let fn = async function()
    {
        console.log('board_update');
        board_seq = req.body.board_seq;
        board_title = req.body.board_title;
        board_contents = req.body.board_contents;
        try
        {
            let sql = "update board_info set board_title=?, board_contents=?, modify_date=now() where board_seq=?";
            [result,fields] = await db.query(sql,[board_title,board_contents,board_seq]);    
            if(result && result.serverStatus === 2)
            {
                res.redirect('/board/read/'+board_seq);
            }
            else
            {
                //에러발생시는 여기로
                console.error(err);
                res.redirect("/");
            }
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.redirect("/");
        }
    }();
});

// 게시판 글 삭제 (실제로 삭제하는 것은 아니고 delete_yn 정보를 'y'로 변경하여 리스트에서 'n'만 표시되도록 함)
router.post('/delete',(req,res)=>{
    let fn = async function()
    {
        console.log('board_delete');
        board_seq = req.body.board_seq;
        try
        {
            let sql = "update board_info set delete_yn='Y' where board_seq=?";
            [result,fields] = await db.query(sql,[board_seq]);    
            if(result && result.serverStatus === 2)
            {
                res.redirect('/board/page/1');
            }
            else
            {
                //에러발생시는 여기로
                console.error(err);
                res.redirect("/");
            }
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.redirect("/");
        }
    }();
});

// 댓글 작성
router.post('/reply_write',(req,res)=>{
    let fn = async function()
    {
        console.log('reply_write');
        user_seq = req.session.userSeq;
        board_seq = req.body.board_seq;
        board_reply_writer = req.session.userName;
        board_reply_contents = req.body.board_reply_contents;
        try
        {
            let sql = "insert into board_reply_info(user_seq, board_seq, board_reply_writer, board_reply_contents, insert_date) values(?,?,?,?,now())";
            [result,fields] = await db.query(sql,[user_seq,board_seq,board_reply_writer,board_reply_contents]);    
            if(result && result.serverStatus === 2)
            {
                res.redirect('/board/read/'+board_seq);
            }
            else
            {
                //에러발생시는 여기로
                console.error(err);
                res.redirect("/");
            }
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.redirect("/");
        }
    }();
});

module.exports = router;