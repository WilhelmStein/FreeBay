const p = require('path');
const fs = require('fs');

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

    signup(data, res)
    {
        let query = {
            string: "Insert Into User Values ( (Select max(Id) + 1 From (Select * From User) as u), ?, ?, ? )",
            escape: [data.username, data.password, data.email]
        }

        this.query(query, res,
            (rows) => {
                query = {
                    string: "Insert Into Address Values ( (Select max(Id) + 1 From (Select * From Address) as a), ?, ?, ?, ?, ? )",
                    escape: [data.street, data.number, data.zipcode, data.country, data.city]
                }

                this.query(query, res,
                    (rows) => {
                        query = {
                            string: "Insert Into General_User Values ( (Select max(Id) From User), 0.0, 0.0, ?, ?, ?, (Select max(Id) From Address), 0 )",
                            escape: [data.name, data.surname, data.phone]
                        }

                        this.query(query, res,
                            (rows) => {
                                query = {
                                    string: "Select * From User Where Username = ?",
                                    escape: [data.username]
                                }
                                this.query(query, res,
                                    (rows) => {
                                        res.send({
                                            error: false,
                                            message: "OK",
                                            // rows[0] because there should be ONLY 1 user with those credentials
                                            data: rows[0]
                                        });
                                    }
                                )
                            }
                        )
                    }
                )
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

    username(username, res)
    {
        // Check username existence
        const query = {
            string: `Select * From User Where Username = ?`,
            escape: [username]
        }

        this.query(query, res);
    }

    email(email, res)
    {
        // Check email existence
        const query = {
            string: `Select * From User Where Email = ?`,
            escape: [email]
        }

        this.query(query, res);
    }

    featured(username, res)
    {
        if(username)
        {
            // LSH Nearest Neighbour Algorithm Here 
        }
        else
        {
            const query = {
                string: 'SELECT t.Id, t.Seller_Id, t.Name, t.Currently, t.First_Bid, t.Buy_Price, t.Location, t.Latitude, t.Longitude, t.Started, t.Ends,\
                                t.Description, Count(v.User_Id) AS Times_Viewed, t.Image_Id, t.Path as Path\
                        FROM (SELECT a.Id, a.Seller_Id, a.Name, a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, a.Started, a.Ends,\
                                     a.Description, Min(i.Id) as Image_Id, Min(i.path) as Path\
                              FROM (Auction a LEFT JOIN Image i ON a.Id = i.Auction_Id) GROUP BY a.Id ) as t,\
                             Views v\
                        WHERE t.Id = v.Auction_Id\
                        GROUP BY t.Id ORDER BY times_viewed DESC LIMIT 5',
                escape: []
            }

            this.query(query, res);

            
        }
    }

    image(path, res)
    {
        
        const fullPath = p.join(__dirname, '../images', path);
        if(fs.existsSync(fullPath))
        {
            res.sendFile(fullPath);
        }
        else
        {
            res.send({
                error: true,
                message: "Image Not Found"
            });
        }
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