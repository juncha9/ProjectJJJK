var privateData = require(__private+'/data.json');
var mysql = require("mysql2/promise");

const sqlPool = mysql.createPool(
{
   host: privateData.mysqlInfo.host,
   port: privateData.mysqlInfo.port,
   user: privateData.mysqlInfo.user,
   password: privateData.mysqlInfo.password,
   database: privateData.mysqlInfo.database
});

module.exports = 
{
    query: async function (queryStr,placeHolder)
    {
        return new Promise(async(resolve,reject)=>
        {
            if(arguments.length === 0)
            {
                console.log('DB query argument error : No arguments');
                reject(null);
            }
            else if(arguments.length >= 3)
            {
                console.log('DB query argument error : arguments is too many');
                reject(null);
            }
            else
            {
                console.log('DB query start : ' + queryStr);
                var connect;
                try
                {
                    var result;
                    console.log('DB connect start');
                    connect = await sqlPool.getConnection(async conn => conn);
                    try
                    {
                        if(arguments.length == 1)
                        {
                            //simple query
                            result = await connect.query(queryStr);
                        }
                        else if(arguments.length == 2)
                        {
                            //with placeHolder
                            result = await connect.query(queryStr,placeHolder);
                        }
                    }
                    catch(err)
                    {
                        connect.rollback();
                        console.log('DB rollback because error');
                        throw err;
                    }
                    connect.release();
                    console.log('DB connect end');
                    resolve(result);
                }
                catch(err)
                {
                    console.log('DB Error: ' + err);
                    connect.release();
                    console.log('DB connect end');
                    reject(null);
                }
            }
        })     
    }

}