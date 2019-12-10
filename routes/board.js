const db = require(__modules+'/database');
const router = require('express').Router();

//주소를 lsit로 입력 받아도 page로 이동되도록
router.get("/",(req,res)=>
{
    res.redirect('/board/page/1');
});
///////////////////////  위에다가 하고 있습니다.
router.get('/list', function(req, res, next) {
    res.redirect('/board/page/1');
});

//페이징 - 게시판을 페이지로 표시 (delete_yn='n'만 표시되도록)
router.get('/page/:page',function(req,res,next)
{
    var page = req.params.page;
    var sql = "select board_seq, board_writer, board_title, date_format(modify_date,'%Y-%m-%d %H:%i:%s') modify_date, " +
        "date_format(insert_date,'%Y-%m-%d %H:%i:%s') insert_date from board_info where delete_yn='n'";
    conn.query(sql, function (err, rows) {
        if (err) console.error("err : " + err);
        res.render('page', {title: '자유게시판', rows: rows, page:page, length:rows.length-1, page_num:10});
    });
});

router.get('/write', function(req,res,next){
    res.render('write',{title : "게시판 글쓰기"});
});

// 게시판에 글쓰기
router.post('/write', function(req,res,next){
    var user_seq = req.session.userSeq; //로그인 되어 있어야 글쓰기 버튼이 표시되기에 글쓰기에서는 로그인 체크 안함
    var board_writer = req.body.board_writer;
    var board_title = req.body.board_title;
    var board_contents = req.body.board_contents;
    var datas = [user_seq,board_writer,board_title,board_contents];

    var sql = "insert into board_info(user_seq, board_writer, board_title, board_contents, insert_date, modify_date) values(?,?,?,?,now(),now())";
    conn.query(sql,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/board/list');
    });
});

// 게시판 글읽기 (게시판 글과 댓글을 같이 표시하기 위해 게시글 쿼리 후 댓글 쿼리)
router.get('/read/:board_seq',function(req,res,next)
{
    var board_seq = req.params.board_seq;
    var board_reply_seq = req.params.board_reply_seq;
    var sql = "select board_seq, board_writer, board_title, board_contents, date_format(modify_date,'%Y-%m-%d %H:%i:%s') modify_date, " +
        "date_format(insert_date,'%Y-%m-%d %H:%i:%s') insert_date from board_info where board_seq=?";
    var reply_sql = "select board_reply_seq, board_reply_writer, board_reply_contents, date_format(insert_date,'%Y-%m-%d %H:%i:%s') insert_date " +
        "from board_reply_info where delete_yn='n' and (select board_seq from board_info where board_seq=?)";
    conn.query(sql,[board_seq], function(err,rows)
    {
        console.log(rows.length);
        conn.query(reply_sql,[board_reply_seq], function(err,rrows) //rows와 겹치지 않게 rrows로 명시
        {
            if(err) console.error(err);
            console.log(rrows.length);
            res.render('read', {title:"게시판 글읽기", row:rows[0], rrows:rrows}); //row:글정보 / rrows:댓글정보
        });
        if(err) console.error(err);
    });
});

// 게시판 글 수정(업데이트)
router.post('/update',function(req,res,next)
{
    //var user_seq = req.session.userSeq; //로그인 되어 있어야 글수정 버튼이 표시되기에 글수정에서도 로그인 체크 안함
    var board_seq = req.body.board_seq;
    var board_title = req.body.board_title;
    var board_contents = req.body.board_contents;
    var datas = [board_title,board_contents,board_seq];

    var sql = "update board_info set board_title=?, board_contents=?, modify_date=now() where board_seq=?";
    conn.query(sql,datas, function(err,result)
    {
        if(err) console.error(err);
        if(result.affectedRows == 0)
        {
            res.send("<script>alert('게시글 업데이트에 실패하였습니다.');history.back();</script>");
        }
        else
        {
            res.redirect('/board/read/'+board_seq);
        }
    });

});

// 게시판 글 삭제 (실제로 삭제하는 것은 아니고 delete_yn 정보를 'y'로 변경하여 리스트에서 'n'만 표시되도록 함)
router.post('/delete',function(req,res,next)
{
    //var user_seq = req.session.userSeq; //로그인 되어 있어야 글삭제 버튼이 표시되기에 글삭제에서도 로그인 체크 안함
    var board_seq = req.body.board_seq;
    var delete_yn = 'y';
    var datas = [board_seq,delete_yn];

    var sql = "update board_info set delete_yn='y' where board_seq=?";
    conn.query(sql,datas, function(err,result)
    {
        if(err) console.error(err);
        if(result.affectedRows == 0)
        {
            res.send("<script>alert('게시글 삭제에 실패하였습니다.');history.back();</script>");
        }
        else
        {
            res.redirect('/board/list');
        }
    });

});

router.post('/reply_write', function(req,res,next){
    var user_seq = req.session.userSeq; //로그인 되어 있어야 버튼이 표시되기에 글쓰기에서는 로그인 체크 안함
    var board_seq = req.body.board_seq;
    var board_reply_writer = req.body.board_reply_writer;
    var board_reply_contents = req.body.board_reply_contents;
    var datas = [board_seq,user_seq,board_reply_writer,board_reply_contents];

    var sql = "insert into board_reply_info(board_seq, user_seq, board_reply_writer, board_reply_contents, insert_date) values(?,?,?,?,now())";
    conn.query(sql,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/board/read/'+board_seq);
    });
});

module.exports = router;