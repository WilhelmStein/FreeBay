class DBController
{
    constructor(sql)
    {
        this.sql = sql;
    }

    login(username, password, res)
    {
        const query = {
            string: `Select * From User Where Username = ? and Password = ?`,
            escape: [username, password]
        }

        this.query(query, res, 
            (rows) => {
                res.send({
                    error: false,
                    message: "OK",
                    // rows[0] because there should be ONLY 1 user with those credentials
                    data: rows[0]
                });
            },
            (rows) => {
                return !(rows.length === 0)
            }
        )
    }

    categories(res)
    {
        const query = {
            string: `Select * From Category`,
            escape: []
        }

        this.query(query, res);
    }

    query(query, res, callback = null, check = null)
    {
        this.sql.query(query.string, query.escape, function(err, rows)
        {
            if (err)
            {
                console.error(err);
                res.send({
                    error: true,
                    message: "Something went wrong in database retrieval. Please try again."
                });
                return;
            }

            if (check)
            {
                if (!check(rows))
                {
                    res.send({
                        error: true,
                        message: "Something went wrong in database retrieval. Please try again."
                    });
                    return;
                }
            }
            
            if (callback)
            {
                return callback(rows);
                
            }
            
            res.send({
                error: false,
                message: "OK",
                data: rows
            });
        })
    }
}

module.exports = {
    DBController: DBController
}