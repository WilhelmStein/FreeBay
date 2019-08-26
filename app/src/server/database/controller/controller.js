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
            (users) => {
                const query = {
                    string: "Select 1 From Admin Where User_Id = ?",
                    escape: [users[0].Id]
                }

                this.query(query, res,
                    (admins) => {

                        if (admins.length === 1)
                        {
                            users[0].admin = true
                        }

                        res.send({
                            error: false,
                            message: "OK",
                            // users[0] because there should be ONLY 1 user with those credentials
                            data: users[0]
                        });
                    })
            },
            (rows) => {
                return !(rows.length === 0)
            }
        )
    }

    admin_users(username, password, res)
    {
        this.admin_permission(username, password, res, () => {
            const query = {
                string: `Select Concat(gu.Name, ' ', gu.Surname) as Name,
                                gu.Phone, 
                                u.Username, 
                                u.Email, 
                                gu.Validated,
                                Concat(a.Street, ' ', a.Number, ', ', a.ZipCode, ' ', a.City) as Address,
                                a.Country
                            From General_User as gu, User as u, Address as a 
                            Where u.Id = gu.User_Id and gu.Address_Id = a.Id Order By gu.Validated`,
                escape: []
            }

            this.query(query, res)
        })
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

    admin_permission(username, password, res, callback)
    {
        const query = {
            string: "Select 1 From Admin, User Where User.Id = Admin.User_Id And User.Username = ? And User.Password = ?",
            escape: [username, password]
        }

        this.query(query, res, (rows) => {
            if (rows.length !== 1)
            {
                res.send({
                    error: true,
                    message: "Permission Denied",
                })

                return;
            }

            if (callback) callback();
        })
    }

    admin_validate(username, password, user_username, res)
    {

        this.admin_permission(username, password, res, () => {
            const query = {
                string: "Update General_User gu JOIN User u ON (u.Id = gu.User_Id) Set gu.Validated = 1 Where u.Username = ?",
                escape: [user_username]
            }

            this.query(query, res);
        })
    }

    admin_reject(username, password, user_username, res)
    {
        this.admin_permission(username, password, res, () => {
            const query = {
                string: `
                    Select a.Id
                    From Address as a, General_User as gu, User as u
                    Where   gu.User_Id = u.Id
                        and u.Username = ?
                        and a.Id = gu.Address_Id
                        and Not Exists (
                            Select a2.Id
                            From Address as a2, General_User as gu2
                            Where   a2.Id = gu2.Address_Id
                                and gu2.User_id != gu.User_Id
                                and a.Id = a2.Id
                        )`,
                escape: [user_username]
            }

            this.query(query, res, (rows) => {
                
                // This will be done after address has been deleted (or not)

                const delete_g_user = {
                    string: `
                        Delete
                        From General_User
                        Where General_User.User_Id = (
                            Select User.Id From User
                            Where User.Username = ?
                            )`,
                    escape: [user_username]
                }

                this.query(delete_g_user, res, () => {
                    const delete_user = {
                        string: "Delete From User Where Username = ?",
                        escape: [user_username]
                    }

                    this.query(delete_user, res, () => {
                        // If there is a row then, delete that address
                        if (rows.length)
                        {
                            const delete_address = {
                                string: "Delete From Address Where Id = ?",
                                escape: [rows[0].Id]
                            }

                            this.query(delete_address, res);
                            return;
                        }

                        res.send({
                            error: false,
                            message: "OK",
                        })
                    });
                })
            });
        });
    }

    categories(res)
    {
        const query = {
            string: `Select * From Category Order by Category.Name Asc`,
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
        let escape = [text, text]
        if (category !== '0')
        {
            escape.unshift(category);
        }

        const query = {
            string: `   SELECT  a.Id, JSON_OBJECT('Id', a.Seller_Id, 'Username', a.Username, 'Seller_Rating', a.Seller_Rating) as User, 
                                a.Name, a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, 
                                DATE_FORMAT(a.Started, "%d-%m-%Y %H:%i") as Started, DATE_FORMAT(a.Ends, "%d-%m-%Y %H:%i") as Ends,
                                a.Description, i.Images, b.Bids
                        FROM
                        (
                            SELECT  a.Id, a.Seller_Id, a.Name,  a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, 
                                    a.Started, a.Ends, a.Description, u.Username, gu.Seller_Rating
                            FROM    Auction a,
                                    User u, 
                                    General_User gu
                                    ${category !== '0' ? ", Category as c, Auction_has_Category as ahc" : ""}
                            WHERE   a.Seller_Id = u.Id AND 
                                    u.Id = gu.User_Id
                                    ${category !== '0' ? "AND ahc.Category_Id = ? AND ahc.Auction_Id = a.Id AND ahc.Category_Id = c.Id" : ""}
                                    ${text ? `
                                    AND 
                                    (
                                        MATCH(a.Name) AGAINST (? IN NATURAL LANGUAGE MODE) OR
                                        MATCH(a.Description) AGAINST (? IN NATURAL LANGUAGE MODE)
                                    )
                                    ` : ""}
                        ) as a 
                            LEFT JOIN
                            (
                                SELECT  i.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT('Id', i.Id, 'Path', i.Path)) as Images 
                                FROM    Image i, 
                                        Auction a 
                                WHERE   i.Auction_Id = a.Id 
                                GROUP BY a.Id
                            ) as i ON a.Id = i.Auction_Id 
                            LEFT JOIN 
                            (
                                SELECT  b.Auction_Id, JSON_ARRAYAGG(
                                                        JSON_OBJECT('Id', b.Id, 'Auction_Id', b.Auction_Id, 'User', 
                                                        JSON_OBJECT('Id', gu.User_Id, 'Username', u.Username, 'Seller_Rating', gu.Seller_Rating), 
                                                        'Amount', b.Amount, 'Time', b.Time)) as Bids
                                FROM    Bid b,
                                        User u,
                                        General_User gu
                                WHERE   b.User_Id = gu.User_Id AND 
                                        gu.User_Id = u.Id 
                                GROUP BY b.Auction_Id
                            ) as b ON b.Auction_Id = a.Id`,
                        
            escape: escape
        }

        this.query(query, res, (rows) => {
            
            rows = rows.map( (item) => {
                    item.User = JSON.parse(item.User);
                    item.Images = item.Images === null ? [] : JSON.parse(item.Images);
                    item.Bids = item.Bids === null ? [] : JSON.parse(item.Bids);
                    return item;
                });

                res.send({
                    error: false,
                    message: "OK",
                    data: rows
                });
        });
    }

    user(username, res)
    {
        const query = {
            string: `SELECT *
                     FROM User u,
                          General_User gu
                          LEFT JOIN
                          Address a ON gu.Address_Id = a.Id
                     WHERE u.Username=? AND gu.User_Id = u.Id`,
            escape: [username]
        };

        this.query(query, res, (rows) => {
            res.send({
                error: false,
                message: "OK",
                data: rows[0]
            });
        });
    }

    updateUser(body, res)
    {
        //console.log(body)
        const query = {
            string: `UPDATE User u, General_User gu, Address a
                     SET u.Username = ?,
                         u.Email = ?,
                         u.Password = ?,
                         gu.Name = ?,
                         gu.Surname = ?,
                         gu.Phone = ?,
                         a.Street = ?,
                         a.Number = ?,
                         a.ZipCode = ?,
                         a.Country = ?,
                         a.City = ?
                     WHERE u.Username = ? AND
                           u.Id = gu.User_Id AND
                           gu.Address_Id = a.Id`,
            escape: [body.username, body.email, body.password, body.name, body.surname, body.phone, body.street, body.number, body.zipcode, body.country, body.city, body.oldUsername]
        }

        this.query(query, res);
    }

    userAuctions(username, res)
    {
        const query = {
            string: `SELECT a.Id
                     FROM 
                        (
                            SELECT u.Id
                            FROM User u
                            WHERE u.Username = ?
                        ) as u,
                        Auction a
                     WHERE a.Seller_Id = u.Id`,
            escape: [username]
        };

        this.query(query, res, (rows) => {
            console.log(rows)
            
            res.send({
                error: false,
                message: "OK",
                data: rows
            });
        });
    }

    auction(auctionId, res)
    {
        const query = {
            
            string: `   SELECT  a.Id, JSON_OBJECT('Id', a.Seller_Id, 'Username', a.Username, 'Seller_Rating', a.Seller_Rating) as User, 
                                t.Name, t.Currently, t.First_Bid, t.Buy_Price, t.Location, t.Latitude, t.Longitude, t.Started, t.Ends,
                                t.Description,i.Images, b.Bids

                        FROM
                        (
                            SELECT  a.Id, a.Seller_Id, a.Name,  a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, 
                                    a.Started, a.Ends, a.Description, u.Username, gu.Seller_Rating
                            FROM    Auction a,
                                    User u, 
                                    General_User gu 
                            WHERE   a.Id = ? AND 
                                    a.Seller_Id = u.Id AND 
                                    u.Id = gu.User_Id
                        ) as a 
                        LEFT JOIN 
                        (
                            SELECT  i.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT('Id', i.Id, 'Path', i.Path)) as Images 
                            FROM    Image i, 
                                    Auction a 
                            WHERE   i.Auction_Id = a.Id 
                            GROUP BY a.Id
                        ) as i ON a.Id = i.Auction_Id 
                        LEFT JOIN 
                        (
                            SELECT  b.Auction_Id, JSON_ARRAYAGG(
                                                    JSON_OBJECT('Id', b.Id, 'Auction_Id', b.Auction_Id, 'User', 
                                                    JSON_OBJECT('Id', gu.User_Id, 'Username', u.Username, 'Seller_Rating', gu.Seller_Rating), 
                                                    'Amount', b.Amount, 'Time', b.Time)) as Bids
                            FROM    Bid b,
                                    User u,
                                    General_User gu
                            WHERE   b.User_Id = gu.User_Id AND 
                                    gu.User_Id = u.Id 
                            GROUP BY b.Auction_Id
                        ) as b ON b.Auction_Id = a.Id`,

            escape: [auctionId]
        }

        this.query(query, res, (rows) => {
            
            rows = rows.map( (item) => {
                    item.User = JSON.parse(item.User);
                    item.Images = item.Images === null ? [] : JSON.parse(item.Images);
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

    featured(res)
    {
        const query = {
            string: `   SELECT  c.Name, c.Id, c.Caption,
                                JSON_ARRAYAGG(JSON_OBJECT("Id", a.Id, "Name", a.Name, "User", a.User, "Images", a.Images)) as Auctions
                        FROM    Category c, 
                                Auction_has_Category ahc,
                                (
                                    SELECT t.Id, t.Name, JSON_OBJECT('Username', t.Username, 'Seller_Rating', t.Seller_Rating) as User, i.Images
                                    FROM
                                    (
                                        SELECT  a.Id, a.Name, a.Seller_Id, u.Username, gu.Seller_Rating
                                        FROM    Auction a,
                                                User u,
                                                General_User gu
                                        WHERE   a.Seller_Id = u.Id AND
                                                u.Id = gu.User_Id
                                    ) as t
                                        LEFT JOIN
                                        (
                                            SELECT  i.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT('Id', i.Id, 'Path', i.Path)) as Images 
                                            FROM    Image i, 
                                                    Auction a 
                                            WHERE   i.Auction_Id = a.Id 
                                            GROUP BY a.Id
                                        ) as i ON t.Id = i.Auction_Id 
                                ) as a
                        WHERE   c.Id = ahc.Category_Id and
                                ahc.Auction_Id = a.Id
                        GROUP BY c.Id
                        HAVING COUNT(distinct(a.Id)) > 1
                        ORDER BY count(distinct(a.Id)) Desc Limit 5
            `,
            escape: []
        }
        
        this.query(query, res, (rows) => {
            rows = rows.map( (category) => {
                category.Auctions = JSON.parse(category.Auctions)
                category.Auctions = category.Auctions.map( auction => {
                    auction.Images = auction.Images === null ? [] : auction.Images
                    return auction;
                })
                
                return category;
            });

            res.send({
                error: false,
                message: "OK",
                data: rows
            });
        });
    }

    scrapped_featured(res)
    {   // Change cost function
        const query = {
            string: `   SELECT  t.Id, JSON_OBJECT('Id', t.Seller_Id, 'Username', t.Username, 'Seller_Rating', t.Seller_Rating) as User,
                                t.Name, t.Currently, t.First_Bid, t.Buy_Price, t.Location, t.Latitude, t.Longitude,
                                t.Started, t.Ends,
                                t.Description, (Count(v.User_Id) * t.Seller_Rating) AS Cost, i.Images, b.Bids
                        FROM 
                        (
                            SELECT  a.Id, a.Seller_Id, a.Name,  a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, 
                                    a.Started, a.Ends, a.Description, u.Username, gu.Seller_Rating
                            FROM    Auction a,
                                    User u, 
                                    General_User gu
                            WHERE   a.Seller_Id = u.Id AND 
                                    u.Id = gu.User_Id
                        ) as t
                            LEFT JOIN
                            (
                                SELECT  i.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT('Id', i.Id, 'Path', i.Path)) as Images 
                                FROM    Image i, 
                                        Auction a 
                                WHERE   i.Auction_Id = a.Id 
                                GROUP BY a.Id
                            ) as i ON t.Id = i.Auction_Id 
                            LEFT JOIN
                            (
                                Views v
                            ) ON v.Auction_Id = t.Id
                            LEFT JOIN 
                            (
                                SELECT  b.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT('Id', b.Id, 'Auction_Id', b.Auction_Id, 'User', JSON_OBJECT('Id', gu.User_Id, 'Username', u.Username, 'Seller_Rating', gu.Seller_Rating), 'Amount', b.Amount, 'Time', b.Time)) as Bids
                                FROM    Bid b,
                                        User u,
                                        General_User gu
                                WHERE   b.User_Id = gu.User_Id AND gu.User_Id = u.Id GROUP BY b.Auction_Id
                            ) as b ON b.Auction_Id = t.Id
                        GROUP BY t.Id
                        ORDER BY Cost DESC
                        LIMIT 5`,
            escape: []
        }

        this.query(query, res, (rows) => {
            rows = rows.map( (item) => {
                item.User = JSON.parse(item.User);
                item.Bids = JSON.parse(item.Bids);
                item.Images = item.Images === null ? [] : JSON.parse(item.Images);
                return item;
            });

            res.send({
                error: false,
                message: "OK",
                data: rows
            });
        });
    }

    recommended(username, res)
    {
        if(username)
        {
            res.send({
                error: false,
                message: "OK",
                data: []
            })
        }
        else
        {
            const query = {
                string: `   SELECT  t.Id, JSON_OBJECT('Id', t.Seller_Id, 'Username', t.Username, 'Seller_Rating', t.Seller_Rating) as User,
                                    t.Name, t.Currently, t.First_Bid, t.Buy_Price, t.Location, t.Latitude, t.Longitude, 
                                    DATE_FORMAT(t.Started, "%d-%m-%Y %H:%i") as Started, DATE_FORMAT(t.Ends, "%d-%m-%Y %H:%i") as Ends,
                                    t.Description, Count(v.User_Id) AS Times_Viewed, i.Images
                            FROM 
                            (
                                SELECT  a.Id, a.Seller_Id, a.Name,  a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, 
                                        a.Started, a.Ends, a.Description, u.Username, gu.Seller_Rating
                                FROM    Auction a,
                                        User u, 
                                        General_User gu
                                WHERE   a.Seller_Id = u.Id AND 
                                        u.Id = gu.User_Id
                            ) as t
                                LEFT JOIN
                                (
                                    SELECT  i.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT('Id', i.Id, 'Path', i.Path)) as Images 
                                    FROM    Image i, 
                                            Auction a 
                                    WHERE   i.Auction_Id = a.Id 
                                    GROUP BY a.Id
                                ) as i ON t.Id = i.Auction_Id 
                                LEFT JOIN
                                (
                                    Views v
                                ) ON v.Auction_Id = t.Id
                            GROUP BY t.Id
                            ORDER BY Times_Viewed DESC
                            LIMIT 14`,
                escape: []
            }

            this.query(query, res, (rows) => {

                rows = rows.map( (item) => {
                    item.User = JSON.parse(item.User);
                    item.Images = item.Images === null ? [] : JSON.parse(item.Images);
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