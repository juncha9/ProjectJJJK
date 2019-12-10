const db = require(__modules+'/database');
const router = require('express').Router();
router.get("/",(req,res)=>
{
    if(req.query.mode === 'login')
    {
        res.render("auth_login");
    }
    else if(req.query.mode === 'register')
    {
        res.render("auth_register");
    }
    else if(req.query.mode === 'logout')
    {
        let fn = async function() 
        {
            try
            {
                if(req.session && req.session.isLogin === true)
                {   
                    console.log("User logout:"+req.session.userID);
                    await req.session.destroy();
                }
                res.redirect('/');
            }
            catch(err)
            {
                console.error(err);
                res.redirect('/');
            }        
        }();
    }

    else
    {
        res.send("Error");
    }
});
router.post("/login",(req,res)=>{
    let fn = async function() 
    {
        try
        {
            let userID = req.body.userID;
            let userPassword = req.body.userPassword;
            if(!userID || !userPassword)
            {
                throw "Error : Necessary field is undefined on login";
            }
            [records,fields] = await db.query("SELECT user_seq, user_id, user_name, is_admin FROM user_info WHERE user_id=? AND user_pwd=password(?)",[userID,userPassword]);
            if(records && records.length > 0)
            {   
                
                req.session.userSeq = records[0].user_seq;
                req.session.userID = records[0].user_id;
                req.session.userName = records[0].user_name;
                req.session.isAdmin = records[0].is_admin;
                req.session.isLogin = true;
                await req.session.save();
                console.log("User login:"+req.session.userID);
                res.redirect('/');
            }
            else
            {
                console.log("login failed");
            }
        }
        catch(err)
        {
            console.error(err);
        }        
    }();

})

router.post("/check_id",(req,res)=>{
    let fn = async function()
    {
        let userID = req.body.userID;
        try
        {
            [records,fields] = await db.query("SELECT * FROM user_info WHERE user_id=?",[userID]);    
        }
        catch(err)
        {
            console.error(err);
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
    let fn = async function()
    {
        console.log("register");
        try
        {
            let userID = req.body.userID;
            let userPassword  = req.body.userPassword;
            let userName = req.body.userName;
            let userMobile = req.body.userMobile;
            let userEmail = req.body.userEmail;
            if(!userID || !userPassword || !userName)
            {
                console.log(userID);
                console.log(userPassword);
                console.log(userName);
                throw "Error : Necessary field is undefined on register";
            }
            await db.query("INSERT into user_info(user_id,user_pwd,user_name,user_mobile,user_email,insert_date) values(?,password(?),?,?,?,now());",
            [userID, userPassword, userName, userMobile?userMobile:null, userEmail?userEmail:null ]);
            res.redirect("/");
        }
        catch(err)
        {
            console.error(err);
            res.redirect("/");
        }
    }();
});


module.exports = router;