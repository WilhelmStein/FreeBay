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
            string: "Select * From Auction Where Id = ?",
            escape: [auctionId]
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