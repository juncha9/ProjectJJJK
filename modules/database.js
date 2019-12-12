var private = require(__private);
var mysql = require("mysql2/promise");
/*
    데이터베이스 쿼리 모듈입니다.

    query(arg1)
    arg1: 쿼리문
    example: [records,fields] = await (module).query("select * from Movie_info");

    query(arg1,arg2)
    arg1: 쿼리문
    arg2: 쿼리 내 ?를 매핑하는 배열
    example: (module).query('insert into DB.Movie_info(movie_name,movie_director,insert_date) values(?,?,now());',['영화이름','디렉터']);

    (module)은 불러온 명칭
*/


const pool = mysql.createPool(
{
    host: private.mysqlInfo.host,
    port: private.mysqlInfo.port,
    user: private.mysqlInfo.user,
    password: private.mysqlInfo.password,
    database: private.mysqlInfo.database,
    connectionLimit : 100,
    connectTimeout : 2000,

});

module.exports = 
{
    query: async function (queryString,placeHolder)
    {
        return new Promise(async(resolve,reject)=>
        {
            if(arguments.length === 0)
            {
                var errLog = 'Query argument error : No arguments';
                reject(errLog);
            }
            else if(arguments.length >= 3)
            {
                var errLog = 'Query argument error : arguments is too many';
                reject(errLog);
            }
            else
            {
                if(arguments.length>1)
                {
                    console.log('Query: ' + queryString +' ['+ placeHolder + ']');
                }
                else
                {
                    console.log('Query : ' + queryString);
                }
                var connect;
                try
                {
                    var result;
                    //console.log('Start DB connect');
                    connect = await pool.getConnection(async conn => conn);
                    try
                    {
                        if(arguments.length == 1)
                        {
                            //simple query
                            result = await connect.query(queryString);
                        }
                        else if(arguments.length == 2)
                        {
                            //with placeHolder
                            result = await connect.query(queryString,placeHolder);
                        }
                    }
                    catch(err)
                    {
                        connect.rollback();
                        console.log('Start rollback because on error');
                        throw err;
                    }
                    //console.log('End DB connect');
                    resolve(result);
                }
                catch(err)
                {
                    var errLog = 'DB ' + err 
                    connect.release();
                    reject(errLog);
                }
                finally
                {
                    if(connect != undefined)
                    {
                        connect.release();
                        console.log('DB connect end');
                    }
                }
            }
        })     
    }

}