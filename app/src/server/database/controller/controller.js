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

    search(category, text, res)
    {
        // TODO
        res.send({
            error: false,
            message: "OK",
            data: require("../../../../public/auctions.json")
        })
        
        // const query = {
        //     string: "Select Auction.* From Auction, Auction_has_Category, Category Where Category.Id = ?",
        //     escape: [category]
        // }

        // this.query(query, res);
    }

    auction(auctionId, res)
    {
        const query = {
            
            string: 'SELECT a.Id, JSON_OBJECT(\'Id\', a.Seller_Id, \'Username\', a.Username, \'Seller_Rating\', a.Seller_Rating) as User, i.Images, b.Bids\
                    FROM (SELECT a.Id, a.Seller_Id, a.Name,  a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, \
                                 a.Started, a.Ends, a.Description, u.Username, gu.Seller_Rating\
                         FROM Auction a,\
                              User u, \
                              General_User gu \
                         WHERE a.Id = ? AND a.Seller_Id = u.Id AND u.Id = gu.User_Id) as a \
                         LEFT JOIN \
                         (SELECT i.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT(\'Id\', i.Id,\'Path\', i.Path)) as Images \
                          FROM Image i, Auction a \
                          WHERE i.Auction_Id = a.Id GROUP BY a.Id) as i ON a.Id = i.Auction_Id \
                         LEFT JOIN \
                         (SELECT b.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT(\'Id\', b.Id, \'Auction_Id\', b.Auction_Id, \'User\', JSON_OBJECT(\'Id\', gu.User_Id, \'Username\', u.Username, \'Seller_Rating\', gu.Seller_Rating), \'Amount\', b.Amount, \'Time\', b.Time)) as Bids\
                        FROM Bid b,\
                             User u,\
                             General_User gu\
                        WHERE b.User_Id = gu.User_Id AND gu.User_Id = u.Id GROUP BY b.Auction_Id) as b ON b.Auction_Id = a.Id',
            escape: [auctionId]
        }

        this.query(query, res, (rows) => {
            
            rows = rows.map( (item) => {
                    item.User = JSON.parse(item.User);
                    item.Images = JSON.parse(item.Images);
                    item.Bids = JSON.parse(item.Bids);
                    return item;
                });
                console.log(rows)
                res.send({
                    error: false,
                    message: "OK",
                    data: rows
                });
        });
    }

    featured(username, res)
    {
        if(username)
        {
            // LSH Nearest Neighbour Algorithm Here 
        }
        else
        {
            // Remember to add bids to query and place it in a function
            const query = {
                string: 'SELECT t.Id, JSON_OBJECT(\'Id\', t.Seller_Id, \'Username\', u.Username, \'Seller_Rating\', gu.Seller_Rating) as User,\
                                t.Name, t.Currently, t.First_Bid, t.Buy_Price, t.Location, t.Latitude, t.Longitude, t.Started, t.Ends,\
                                t.Description, Count(v.User_Id) AS Times_Viewed, t.Image_Id, t.Path as Path,\
                                b.Bids\
                         FROM (SELECT a.Id, a.Seller_Id, a.Name, a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude,\
                                      a.Longitude, a.Started, a.Ends, a.Description, Min(i.Id) as Image_Id, Min(i.path) as Path\
                               FROM (Auction a LEFT JOIN Image i ON a.Id = i.Auction_Id) GROUP BY a.Id ) as t \
                            LEFT JOIN \
                            (SELECT b.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT(\'Id\', b.Id, \'Auction_Id\', b.Auction_Id, \'User\', JSON_OBJECT(\'Id\', gu.User_Id, \'Username\', u.Username, \'Seller_Rating\', gu.Seller_Rating), \'Amount\', b.Amount, \'Time\', b.Time)) as Bids\
                             FROM Bid b,\
                                  User u,\
                                  General_User gu\
                             WHERE b.User_Id = gu.User_Id AND gu.User_Id = u.Id GROUP BY b.Auction_Id) as b ON b.Auction_Id = t.Id,\
                            Views v,\
                            User u,\
                            General_User gu\
                        WHERE t.Id = v.Auction_Id AND t.Seller_Id = gu.User_Id AND t.Seller_Id = u.Id\
                        GROUP BY t.Id ORDER BY Times_Viewed DESC LIMIT 5',
                escape: []
            }

            this.query(query, res, (rows) => {

                rows = rows.map( (item) => {
                    item.User = JSON.parse(item.User);
                    item.Bids = JSON.parse(item.Bids);
                    return item;
                });

                res.send({
                    error: false,
                    message: "OK",
                    data: rows
                });
            });      
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