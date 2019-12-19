const db = require(__modules+'/database');
const router = require('express').Router();
router.get("/",(req,res)=>
{
    /*
        회원 시스템
        모드에 따라 분리
    */
    if(req.query.mode === 'login')
    {
        //로그인
        if(req.session.userSeq)
        {
            res.render('error',{error:'이미 로그인되어 있습니다.'});
            return;
        }
        res.render("auth_login");

    }
    else if(req.query.mode === 'register')
    {
        //회원가입
        if(req.session.userSeq)
        {
            res.render('error',{error:'이미 로그인되어 있습니다.'});
            return;
        }
        res.render("auth_register");
    }
    else if(req.query.mode === 'update')
    {
        //회원정보 수정
        let userSeq = req.session.userSeq;
        if(!userSeq)
        {
            res.render('redirect',{reason:'회원정보수정은 로그인 후 이용가능합니다.',link:'/auth?mode=login'});
            return;
        }
        let fn = async function()
        {
            try
            {
                [records,fields] = await db.query("SELECT user_id, user_name, user_mobile, user_email FROM user_info WHERE user_seq=?",[userSeq]);
                if(records && records.length>0)
                {
                    res.render('auth_update',{user:records[0],chPassword:false});
                }
                else
                {
                    res.render('error',{error:'유저가 없습니다.'});
                }
            }
            catch (err)
            {
                console.log(err);
                res.render('error',{error:err});
            }
        }();
    }
    else if(req.query.mode === 'chpass')
    {
        //비밀번호 변경
        let userSeq = req.session.userSeq;
        if(!userSeq)
        {
            res.render('redirect',{reason:'비밀번호수정은 로그인 후 이용가능합니다.',link:'/auth?mode=login'});
            return;
        }
        let fn = async function()
        {
            try
            {
                [records,fields] = await db.query("SELECT user_id FROM user_info WHERE user_seq=?",[userSeq]);
                if(records && records.length>0)
                {
                    res.render('auth_update',{user:records[0],chPassword:true});
                }
                else
                {
                    res.render('error',{error:'유저가 없습니다.'});
                }
            }
            catch (err)
            {
                console.log(err);
                res.render('error',{error:err});
            }
        }();
    }

    else if(req.query.mode === 'logout')
    {
        //로그아웃
        let fn = async function() 
        {
            try
            {
                if(req.session && req.session.isLogin === true)
                {   
                    console.log("User logout:"+req.session.userID);
                    await req.session.destroy();
                }
                res.render('redirect',{reason:'로그아웃 되었습니다.',link:'/'})
            }
            catch(err)
            {
                console.log(err);
                res.render('error',{error:err});
            }        
        }();
    }

    else
    {
        res.send("Error",);
    }
});
router.post("/login",(req,res)=>{
    //로그인 전송 후 쿼리비교 시퀀스
    let fn = async function() 
    {
        try
        {
            let userID = req.body.userID;
            let userPassword = req.body.userPassword;
            if(!userID || !userPassword)
            {
                let err = "로그인 실패 : 필요한 필드가 없습니다.";
                res.render('error',{error:err});
                return;
            }
            [records,fields] = await db.query("SELECT user_seq, user_id, user_name, is_admin FROM user_info WHERE user_id=? AND user_pwd=password(?)",[userID,userPassword]);
            
            if(records && records.length > 0)
            {   
                //로그인 성공시 세션 생성
                req.session.userSeq = records[0].user_seq;
                req.session.userID = records[0].user_id;
                req.session.userName = records[0].user_name;
                req.session.isAdmin = records[0].is_admin;
                req.session.isLogin = true;
                await req.session.save();
                console.log("User login:"+req.session.userID);
                res.render('redirect',{reason:'로그인 되었습니다.',link:'/'});
            }
            else
            {
                let err = "로그인 실패";
                res.render('error',{error:err});

            }
        }
        catch(err)
        {
            console.log(err);
            res.render('error',{error:err});
        }        
    }();

})

router.post("/check_id",(req,res)=>{
    //아이디 중복검사
    let fn = async function()
    {
        let userID = req.body.userID;
        try
        {
            [records,fields] = await db.query("SELECT * FROM user_info WHERE user_id=?",[userID]);    
        }
        catch(err)
        {
            console.log(err);
            res.render('error',{error:err});
        }
        if(records && records.length <= 0)
        {
            res.send({result:true});
        }
        else
        {
            res.send({result:false});
        }
    }();
});

router.post("/register",(req,res)=>
{
    //회원가입 전송 시퀀스
    let fn = async function()
    {
        try
        {
            let userID = req.body.userID;
            let userPassword  = req.body.userPassword;
            let userName = req.body.userName;
            let userMobile = req.body.userMobile;
            let userEmail = req.body.userEmail;
            if(!userID || !userPassword || !userName)
            {
                let err = "회원가입 실패 : 필요한 필드가 없습니다.";
                res.render('error',{error:err});
                return;
            }
            [result] = await db.query("INSERT into user_info(user_id,user_pwd,user_name,user_mobile,user_email,insert_date) values(?,password(?),?,?,?,now());",
            [userID, userPassword, userName, userMobile?userMobile:null, userEmail?userEmail:null ]);
            if(result && result.affectedRows>0)
            {
                res.render('redirect',{reason:'회원가입 감사합니다!',link:'/'});
            }
            else
            {
                res.render('error',{error:'회원가입 실패'});
            }
           
        }
        catch(err)
        {
            console.log(err);
            res.render('error',{error:err});
        }
    }();
});

router.post("/update",(req,res)=>{
    //회원정보 수정 시퀀스
    let userSeq = req.session.userSeq;
    let curPassword = req.body.curPassword;
    let userName = req.body.userName;
    let userMobile = req.body.userMobile;
    let userEmail = req.body.userEmail;
    
    let fn = async function()
    {
        try
        {
            [records, fields] = await db.query("SELECT * FROM user_info WHERE user_seq=? AND user_pwd=password(?)",[userSeq,curPassword]);
            if(!(records && records.length>0))
            {
                //데이터가 없다!?
                res.send({result:'diffpass'});
                return;
            }
            [result] = await db.query("UPDATE user_info SET user_name=?, user_mobile=?, user_email=? WHERE user_seq=?",[userName,userMobile,userEmail,userSeq]);
            if(result && result.affectedRows>0)
            {
                res.send({result:'success'});
            }
            else
            {
                res.send({result:'failed, affectedRows:'+result.affectedRows});
            }
        }
        catch(err)
        {
            console.log(err);
            res.render('error',{error:err});
        }
    }();
    
});

router.post("/chpass",(req,res)=>{
    //비밀번호 변경 시퀀스
    let userSeq = req.session.userSeq;
    let curPassword = req.body.curPassword;
    let userPassword = req.body.userPassword;
    
    let fn = async function()
    {
        try
        {
            [records, fields] = await db.query("SELECT user_pwd FROM user_info WHERE user_seq=? AND user_pwd=password(?)",[userSeq,curPassword]);
            if(!(records && records.length>0))
            {
                //데이터가 없다!?
                res.send({result:'diffpass'});
                return;
            }
            [result] = await db.query("UPDATE user_info SET user_pwd=password(?) WHERE user_seq=?",[userPassword,userSeq]);
            if(result && result.affectedRows>0)
            {
                res.send({result:'success'});
            }
            else
            {
                res.send({result:'failed, affectedRows:'+result.affectedRows});
            }
            
        }
        catch(err)
        {
            console.log(err);
            res.send({error:err})
        }
    }();
    
});
module.exports = router;