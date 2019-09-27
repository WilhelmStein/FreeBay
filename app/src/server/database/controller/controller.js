const p = require('path');
const fs = require('fs');
const mysql = require('mysql');

class DBController
{
    constructor(connectionOptions, options)
    {
        this.connectionOptions = connectionOptions;

        this.onError = (err) => {
            console.error(err);
        }

        this.onSuccess = (queries, data) => {
            console.log(`Successfully executed ${queries.length} queries.`);
        }

        this.sql = null;
    }

    connect()
    {
        this.sql = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'freebay',
            multipleStatements: true
        })
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

    signup(data, res)
    {
        this.sql.beginTransaction(err => {

            if (err) 
            {
                console.error(err);
                return;
            }

            const query = {
                string: "Insert Into User (Username, Password, Email) Values ( ?, ?, ? )",
                escape: [data.username, data.password, data.email]
            }

            this.query(query, res, (result) => {
    
                const userInsertId = result.insertId;
                const query = {
                    string: "Insert Into Address Values ( ?, ?, ?, ?, ?, ? )",
                    escape: [userInsertId, data.street, data.number, data.zipcode, data.country, data.city]
                }

                this.query(query, res, (result) => {

                    const addressInsertId = result.insertId;
                    const query = {
                        string: "Insert Into General_User Values (?, 0.0, 0.0, ?, ?, ?, ?, 0 )",
                        escape: [userInsertId, data.name, data.surname, data.phone, addressInsertId]
                    }

                    this.query(query, res, (result) => {

                        const query = {
                            string: "Select * From User Where Username = ?",
                            escape: [data.username]
                        }

                        this.query(query, res, (rows) => {
                            res.send({
                                error: false,
                                message: "OK",
                                // rows[0] because there should be ONLY 1 user with those credentials
                                data: rows[0]
                            });

                            this.sql.commit(err => {if (err) console.error(err)});
                        }, null, true)
                    }, null, true)
                }, null, true)
            }, null, true)
        })

        
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

    admin_auctions(username, password, res)
    {
        this.admin_permission(username, password, res, () => {
            const query = {
                string: `   SELECT  a.Id, JSON_OBJECT('Id', a.Seller_Id, 'Username', a.Username, 'Seller_Rating', a.Seller_Rating) as User, 
                                    a.Name, a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, 
                                    a.Started, a.Ends,
                                    a.Description, b.Bids
                            FROM
                            (
                                SELECT  a.Id, a.Seller_Id, a.Name,  a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, 
                                        a.Started, a.Ends, a.Description, u.Username, gu.Seller_Rating
                                FROM    Auction a,
                                        User u, 
                                        General_User gu
                                WHERE   a.Seller_Id = u.Id AND 
                                        u.Id = gu.User_Id
                            ) as a
                                LEFT JOIN 
                                (
                                    SELECT  b.Auction_Id, JSON_ARRAYAGG(
                                                            JSON_OBJECT('Id', b.Id, 'Auction_Id', b.Auction_Id, 'User', 
                                                            JSON_OBJECT('Id', gu.User_Id, 'Username', u.Username, 'Bidder_Rating', gu.Bidder_Rating), 
                                                            'Amount', b.Amount, 'Time', b.Time)) as Bids
                                    FROM    Bid b,
                                            User u,
                                            General_User gu
                                    WHERE   b.User_Id = gu.User_Id AND 
                                            gu.User_Id = u.Id 
                                    GROUP BY b.Auction_Id
                                ) as b ON b.Auction_Id = a.Id`,
                            
                escape: []
            }
    
            this.query(query, res, (rows) => {
                
                rows = rows.map( (item) => {
                        item.User = JSON.parse(item.User);
                        item.Bids = item.Bids === null ? [] : JSON.parse(item.Bids);
                        return item;
                    });
    
                    res.send({
                        error: false,
                        message: "OK",
                        data: rows
                    });
            });
        })
    }

    user_permission(username, password, res, callback)
    {
        const query = {
            string: "Select 1 From User Where Username = ? And Password = ?",
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
            string: `Select Id From User Where Username = ?`,
            escape: [username]
        }

        this.query(query, res);
    }

    usernames(username, password, res)
    {
        this.user_permission(username, password, res, () => {
            const query = {
                string: "Select u.Username From User as u, General_User as gu Where u.Id = gu.User_Id",
                escape: []
            }

            this.query(query, res);
        });
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

    publicUserDetails(username, res)
    {
        const query = {
            string: `SELECT u.Id, u.Username, gu.Seller_Rating
                     FROM User u
                          JOIN
                          General_User gu ON u.Username = ? AND u.Id = gu.User_Id`,
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

    getUser(username, password, res)
    {

        this.user_permission(username, password, res, () => {

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
        })
    }

    updateUser(body, res)
    {
        this.user_permission(body.oldUsername, body.oldPassword, res, () => {
            let string = `UPDATE 
            (
                (
                    User u 
                    JOIN
                    General_User gu ON u.Username = ? AND u.Id = gu.User_Id
                )
                LEFT JOIN 
                Address a ON a.Id = gu.Address_Id
            )
            SET `;

            let escape = [body.oldUsername];

            if(body.username)
            {
                string += `u.Username = ?,`
                escape.push(body.username);
            }

            if(body.email)
            {
                string += `u.Email = ?,`;
                escape.push(body.email);
            }

            if(body.password)
            {
                string += `u.Password = ?,`;
                escape.push(body.password);
            }

            if(body.name)
            {
                string += `gu.Name = ?,`;
                escape.push(body.name);
            }

            if(body.surname)
            {
                string += `gu.Surname = ?,`;
                escape.push(body.surname);
            }

            if(body.phone)
            {
                string += `gu.Phone = ?,`;
                escape.push(body.phone);
            }

            if(body.street)
            {
                string += `a.Street = ?,`;
                escape.push(body.street);
            }

            if(body.number)
            {
                string += `a.Number = ?,`;
                escape.push(body.number);
            }

            if(body.zipcode)
            {
                string += `a.ZipCode = ?,`;
                escape.push(body.zipcode);
            }

            if(body.country)
            {
                string += `a.Country = ?,`;
                escape.push(body.country);
            }

            if(body.city)
            {
                string += `a.City = ?,`;
                escape.push(body.city);
            }

            string = string.slice(0, -1);

            const query = {
                string: string,
                escape: escape
            }

            this.query(query, res, (err, rows) => {

                res.send({
                    error: false,
                    message: "OK",
                    data: true
                });
            });
        });
    }

    userAuctions(username, res)
    {
        const query = {
            string: `SELECT a.Id, a.Name, a.Name, a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude,
                            a.Started, a.Ends, a.Description, JSON_ARRAYAGG(JSON_OBJECT('Id', i.Id, 'Path', i.Path)) as Images
                     FROM 
                        (
                            SELECT u.Id
                            FROM User u
                            WHERE u.Username = ?
                        ) as u
                        LEFT JOIN
                        Auction a ON a.Seller_Id = u.Id
                        LEFT JOIN
                        Image i ON i.Auction_Id = a.Id
                     GROUP BY a.Id
                     ORDER BY Ends DESC`,
            escape: [username]
        };

        this.query(query, res, (rows) => {

            if(rows.length !== 0 && rows[0].Id === null)
                rows = [];
            
            rows = rows.map((item) => {
                let parsedImages = JSON.parse(item.Images);
                item.Images = parsedImages[0].Id === null ? [] : parsedImages
                return item;
            });

            res.send({
                error: false,
                message: "OK",
                data: rows
            });
        });
    }

    userWatchedAuctions(username, password, res)
    {
        const query = {
            string: `SELECT a.Id, a.Name, a.Name, a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude,
                            a.Started, a.Ends, a.Description, JSON_ARRAYAGG(JSON_OBJECT('Id', i.Id, 'Path', i.Path)) as Images
                     FROM 
                        (
                            SELECT u.Id
                            FROM User u
                            WHERE u.Username = ?
                        ) as u
                        LEFT JOIN
                        Bid b ON b.User_Id = u.Id
                        LEFT JOIN
                        Auction a ON a.Id = b.Auction_Id
                        LEFT JOIN
                        Image i ON i.Auction_Id = a.Id
                     GROUP BY a.Id
                     ORDER BY Ends DESC`,
            escape: [username]
        };

        this.query(query, res, (rows) => {

            if(rows.length !== 0 && rows[0].Id === null)
                rows = [];
            
            rows = rows.map((item) => {
                let parsedImages = JSON.parse(item.Images);
                item.Images = parsedImages[0].Id === null ? [] : parsedImages
                return item;
            });

            res.send({
                error: false,
                message: "OK",
                data: rows
            });
        });
    }

    auction(id, res)
    {
        const query = {

            string: `   SELECT  a.Id, JSON_OBJECT('Id', a.Seller_Id, 'Username', a.Username, 'Rating', a.Seller_Rating) as User,
                                a.Name, a.Currently, a.First_Bid, a.Buy_Price, a.Location, a.Latitude, a.Longitude, a.Started, a.Ends,
                                a.Description, i.Images, b.Bids
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
                                                    JSON_OBJECT('Id', b.Id, 'User',
                                                    JSON_OBJECT('Id', gu.User_Id, 'Username', u.Username, 'Rating', gu.Bidder_Rating),
                                                    'Amount', b.Amount, 'Time', b.Time)) as Bids
                            FROM    Bid b,
                                    User u,
                                    General_User gu
                            WHERE   b.User_Id = gu.User_Id AND
                                    gu.User_Id = u.Id
                            GROUP BY b.Auction_Id
                        ) as b ON b.Auction_Id = a.Id`,

            escape: [id]
        }

        this.query(query, res, (rows) => {

            if (rows.length > 1)
                throw Error(`Duplicate auction id '${id}'`)

            let item = rows[0]

            item.User = JSON.parse(item.User);
            item.Images = item.Images === null ? [] : JSON.parse(item.Images);
            item.Bids = item.Bids === null ? [] : JSON.parse(item.Bids);

            res.send({
                error: false,
                message: "OK",
                data: item
            });
        });
    }

    auctions(callback) {
        const query = {
            string: `   SELECT  a.Id, JSON_OBJECT('Id', a.Seller_Id, 'Username', a.Username) as User,
                                a.Started, a.Ends, b.Bids
                        FROM
                        (
                            SELECT a.Id, a.Started, a.Ends, a.Seller_Id, u.Username
                            FROM Auction a,
                                 User u
                            WHERE a.Seller_Id = u.Id
                        ) as a
                        LEFT JOIN
                        (
                            SELECT  b.Auction_Id, JSON_ARRAYAGG(JSON_OBJECT('Id', b.Id, 'User', JSON_OBJECT('Id', b.User_Id, 'Username', u.Username), 'Amount', b.Amount)) as Bids
                            FROM    Bid b,
                                    User u
                            WHERE b.Id
                            GROUP BY b.Auction_Id
                        ) as b ON b.Auction_Id = a.Id
                        WHERE a.Ends > NOW()
                        ORDER BY a.Ends ASC LIMIT 500`,
            escape: []
        }

        this.sql.query(query.string, query.escape, (err, rows) => {

            if(err)
            {
                console.error(err);

                callback({
                    error: true,
                    message: 'Could not fetch auctions. Please try again.'
                });
                return;
            }

            for(let i = 0; i < rows.length; i++)
            {
                rows[i].User = JSON.parse(rows[i].User);
                rows[i].Bids = rows[i].Bids === null ? [] : JSON.parse(rows[i].Bids);
            }

            callback({
                error: false,
                data: rows
            });
        
        });
    }

    endAuction(auction_id, auction_name, seller_id, seller_name, winner, bids, callback)
    {
        const query = {
            string: `UPDATE 
                     (
                        SELECT *
                        FROM Auction
                        WHERE Id = ?
                     )
                     SET Ended = TRUE`,
            escape: [auction_id]
        }

        this.sql.query(query.string, query.escape, function(err, rows) {
            if(err)
            {
                console.error(err);

                callback({
                    error: true,
                    message: 'Could not end auction. Please try again.'
                });
                return;
            }

            let notifications = bids.map((bid) => {
                return {
                    User_Id: bid.User.Id,
                    Content: 
                                (bid.User.Username === winner)
                                ?
                                `You are now the proud owner of "${bid.Auction_Name}". Congratulations!`
                                :
                                `Your watched auction with name "${bid.Auction_Name}" has been bought out by user "${winner}".`
                             ,
                    Link: 
                            (bid.User.Username === winner)
                            ?
                            `/user/${winner}/messages/new&to=${seller_name}&subject=${`I have won "${auction_name}"`}`
                            :
                            `Your watched auction with name "${auction_name}" has been bought out by user "${winner}".`,
                    Type: 'Auction'
                }
            });

            notifications.push({
                User_Id: seller_id,
                Content: `Your auction with name "${auction_name}" has ${bids.length === 0 ? `ended with no buyers.` : `been won by user "${winner}".`}`,
                Link: `${bids.length === 0 ? `` : `/user/${seller_name}/messages/new&to=${winner}&subject=${`You have won "${auction_name}"`}`}`,
                Type: 'Auction'
            });

            this.sendNotifications(notifications, callback);

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

    recommended(username, res)
    {
        if(username)
        {
            // LSH Nearest Neighbour Algorithm Here
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

    image(path, res)
    {
        if (path.startsWith("http://") || path.startsWith("https://"))
        {
            res.redirect(path);
        }
        else
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
            
            

        

    }

    sendNotifications(notifications, callback = null)
    {
        const notification_query = {
            string: `INSERT INTO Notification (User_Id, Content, Link, Status, Type, Time)
                     VALUES `,
            escape: []
        }

        for(let i = 0; i < notifications.length; i++)
        {
            let notification = notifications[i];

            notification_query.string += `(?, ?, ?, 'Unread', ?, NOW())`;
            notification_query.escape.concat([notification.User_Id, notification.Content, notification.Link, notification.Type]);

            if(i !== notifications.length - 1)
                notification_query.string += `, `
        }

        this.sql.query(notification_query.string, notification_query.escape, function(err, rows) {

            if(err)
            {
                console.error(err);

                if(callback)
                    callback({
                        error: true,
                        message: 'Could not send notification. Please try again.'
                    });

                return;
            }

            if(callback)
                callback({
                    error: false,
                    data: rows
                });
        })
    }

    notifications(username, password, res)
    {
        const query = {
            string: "SELECT n.* FROM Notification as n, User as u WHERE n.User_Id = u.Id AND u.Username = ? AND u.Password = ? AND n.Status = 'Unread'",
            escape: [username, password]
        }

        this.query(query, res);
    }

    readNotification(username, password, notification, res)
    {
        this.user_permission(username, password, res, () => {
            const query = {
                string: "UPDATE Notification SET Status = 'Read' WHERE Id = ?",
                escape: [notification] 
            }
    
            this.query(query, res);
        })
        
    }

    messages(username, password, res)
    {
        const query = {
            string: `SELECT mh.Id as Header_Id, mh.Subject, 
                            JSON_ARRAYAGG(JSON_OBJECT(  "Subject", mh.Subject, "Header_Id", mh.Id, "Id", m.Id, "Body", m.Body, 
                                                        "Status", m.Status, "Time", m.Time, "Sender", su.Username, "Receiver", ru.Username,
                                                        "Sender_Deleted", m.Sender_Deleted, "Receiver_Deleted", m.Receiver_Deleted)) as Messages
                    FROM 
                        (
                            SELECT * FROM Message Where Time ORDER BY Time Asc
                        ) as m, 
                        User as ru, 
                        User as su, 
                        Message_Header as mh
                    WHERE   mh.Id = m.Message_Header_Id AND
                            su.Id = m.Sender_Id AND
                            ru.Id = m.Receiver_Id AND
                            ((ru.Username = ? AND ru.Password = ?) OR (su.Username = ? AND su.Password = ?))
                    GROUP BY mh.Id`,
            escape: [username, password, username, password]
        }

        this.query(query, res, (rows) => {
            
            const Messages = rows.map( (row) => {
                row.Messages = JSON.parse(row.Messages);
                return row;
            })

            res.send({
                error: false,
                message: "OK",
                data: Messages
            });
        });
    }

    readMessage(username, password, message, res)
    {
        const query = {
            string: "Update Message Set Status = 'Read' Where Id = ?",
            escape: [message.Id]
        }

        this.query(query, res);
    }

    sendMessage(username, password, recipient, subject, text, reply, res)
    {
        this.user_permission(username, password, res, () => {

            this.sql.beginTransaction(err => {

                if (err) 
                {
                    console.error(err);
                    return;
                }

                const checkRecipient = (callback) => {
                    const query = {
                        string: "Select 1 From User as u, General_User as gu Where u.Username = ? AND gu.User_Id = u.Id",
                        escape: [recipient]
                    }
            
                    this.query(query, res, (rows) => {
                        if (rows.length !== 1)
                        {
                            res.send({
                                error: true,
                                message: `User does not exist`,
                            })
            
                            return;
                        }

                        return callback();
                    })
                }

                const insertHeader = (reply, callback) => {
                    if (!reply)
                    {
                        const query = {
                            string: `INSERT INTO Message_Header (Subject) VALUES (?)`,
                            escape: [subject]
                        }
        
                        this.query(query, res, (result) => {
                            callback(result.insertId);
                        }, null, true)
                    }
                    else
                    {
                        callback(reply);
                    }
                }

                const sendNotification = () => {
                    const query = {
                        string: `INSERT INTO Notification (User_Id, Content, Link, Status, Type, Time)
                        Values ( (SELECT Id FROM User WHERE Username = ?), "${username} sent you a message!", "/user/${recipient}/messages", "Unread", "Message", NOW())`,
                        escape: [recipient, username]
                    }

                    this.query(query, res, (result) => {
                        res.send({
                            error: false,
                            message: "Sent"
                        });

                        this.sql.commit(err => {if (err) console.error(err)})
                    })
                }

                const insertMessage = (message_header_id) => {
                    const query = {
                        string: `   INSERT INTO Message (Message_Header_Id, Body, Time, Sender_Id, Receiver_Id, Status, Sender_Deleted, Receiver_Deleted)
                                    VALUES (?, ?, NOW(), (SELECT Id FROM User Where Username = ?), (SELECT Id FROM User WHERE Username = ?), 'Unread', FALSE, FALSE)`,
                        escape: [message_header_id, text, username, recipient]
                    }

                    this.query(query, res, (result) => {

                        return sendNotification();

                    }, null, true)
                }

                return checkRecipient( () => {insertHeader (reply, insertMessage)} );
            })
        });
    }

    deleteMessage(username, password, message, who, res)
    {
        this.user_permission(username, password, res, () => {

            const query = {
                string: `UPDATE Message SET ${who}_Deleted = TRUE WHERE Id = ?`,
                escape: [message.Id]
            }

            this.query(query, res, (result) => {

                const query = {
                    string: "SELECT 1 From Message Where Id = ? AND Sender_Deleted = TRUE AND Receiver_Deleted = TRUE",
                    escape: [message.Id]
                }

                this.query(query, res, (rows) => {

                    if (rows.length !== 0)
                    {
                        this.banishMessage(message, res, () => {
                            res.send({
                                error: false,
                                message: "Deleted"
                            })
                        })

                        return;
                    }

                    res.send({
                        error: false,
                        message: "Deleted"
                    })
                })
            })
        });
    }

    banishMessage(message, res, callback)
    {
        this.sql.beginTransaction(err => {

            if (err) 
            {
                console.error(err);
                return;
            }

            const query = {
                string: "SELECT mh.Id FROM Message_Header as mh WHERE mh.Id = ? AND EXISTS (SELECT m.Id FROM Message as m WHERE m.Message_Header_Id = mh.Id AND m.Id != ?)",
                escape: [message.Header_Id, message.Id]
            }

            this.query(query, res, (rows) => {

                let query = {
                    string: "DELETE FROM Message WHERE Id = ?;",
                    escape: [message.Id]
                }

                if (rows.length === 0)
                {
                    query.string += " DELETE FROM Message_Header Where Id = ?;";
                    query.escape.push(message.Header_Id);
                }

                this.query(query, res, (result) => {

                    this.sql.commit(err => {if (err) console.error(err)});

                    callback();

                }, null, true)

            }, null, true)
        });
    }

    query(query, res, callback = null, check = null, transaction=false)
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
                
                if (transaction)
                    return this.sql.rollback();

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

    transaction(queries, onError, onSuccess)
    {
        this.sql.beginTransaction(err => {
            if (err)
            {
                return this.onError(err);
            }

            return this.__transactionQuery(queries, 0, null, onError, onSuccess);
        })
        
    }

    __transactionQuery(queries, index, data, onError, onSuccess)
    {
        if (index === queries.length)
        {
            this.sql.commit(err => {
                if (err)
                {
                    this.onError(err);
                    return this.sql.rollback();
                }
            })

            if (onSuccess)
                return onSuccess(queries, data);
            else
                return this.onSuccess(queries, data);
        }

        const query = queries[index];
        let toExecute = query;

        if (query.hasOwnProperty("prepare") && data)
        {
            toExecute = query.prepapre(data)
        }

        this.sql.query(toExecute.string, toExecute.escape, (err, rows) => {
            if (err)
            {
                if (query.hasOwnProperty("onError"))
                {
                    query.onError(err);
                }
                else if (onError)
                {
                    onError(err);
                }
                else
                {
                    this.onError(err);
                }

                return this.sql.rollback();
            }

            this.__transactionQuery(queries, index + 1, rows, onSuccess)
        })
    }
}

module.exports = {
    DBController: DBController
}