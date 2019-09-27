
USE freebay;

SET @max_user_id      := (SELECT MAX(Id) FROM User);
SET @max_address_id   := (SELECT MAX(Id) FROM Address);
SET @max_auction_id   := (SELECT MAX(Id) FROM Auction);
SET @max_category_id  := (SELECT MAX(Id) FROM Category);

SET @dummy_admin_id   := @max_user_id + 1;
SET @dummy_user_id    := @max_user_id + 2;

SET @dummy_address_id := @max_address_id + 1;

SET @category_1       := @max_category_id + 1;
SET @category_2       := @max_category_id + 2;
SET @category_3       := @max_category_id + 3;
SET @category_4       := @max_category_id + 4;
SET @category_5       := @max_category_id + 5;
SET @category_6       := @max_category_id + 6;
SET @category_7       := @max_category_id + 7;
SET @category_8       := @max_category_id + 8;
SET @category_9       := @max_category_id + 9;
SET @category_10      := @max_category_id + 10;
SET @category_11      := @max_category_id + 11;
SET @category_12      := @max_category_id + 12;
SET @category_13      := @max_category_id + 13;

-- Admin --

INSERT INTO User VALUES (@dummy_admin_id, 'admin', 'admin', 'admin@admin.admin');
INSERT INTO Admin VALUES (@dummy_admin_id);


-- User --

INSERT INTO Address VALUES (@dummy_address_id, 'Knossou', '83', '12345', 'Greece', 'Athens');
INSERT INTO User VALUES (@dummy_user_id, 'user', 'password', 'user@password.com');
INSERT INTO General_User VALUES (@dummy_user_id, 100.0, 100.0, 'Userus', 'Passwordius', '1234567890', @dummy_address_id, FALSE);


-- Auctions --

INSERT INTO Auction (Id, Seller_Id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description)
VALUES  (@max_auction_id + 1, 1, "Sumptuous Dandy's Outfit", 125.00, 100.00, 500.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "A luxurious suit for the extraordinary gentleman."),
        (@max_auction_id + 2, 1, "Modest Frock", 333.00, 100.00, 800.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-9-18 9:00:00", "An elegant frock for the graceful lady."),
        (@max_auction_id + 3, 3, "Venereal Disease", 0.00, 30.00, 69.69, "Olympus", NULL, NULL, "2019-01-11 9:00:00", "2019-12-18 9:00:00", ";)"),
        (@max_auction_id + 4, 3, "Natural Viagra", 23.00, 10.00, 55.00, "Olympus", NULL, NULL, "2019-01-11 9:00:00", "2019-10-18 9:00:00", "To make your partner say: 'By Jupiter's Cock!'"),
        (@max_auction_id + 5, 5, "Your Mother", 6.12, 5.00, 12.00, "Elladistan", NULL, NULL, "2019-01-11 9:00:00", "2019-10-18 9:00:00", ""),
        (@max_auction_id + 6, 4, "Child Tear - Flavoured Martini", 99.00, 45.00, 500.00, "Bastille inc", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", ""),
        (@max_auction_id + 7, 1, "Noble Scepter", 5236.00, 1000.00, 10000.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "");


-- Categories --

INSERT INTO Category (Id, Name, Caption)
VALUES (@category_1, "Health & Fitness",            "Your body is your temple. Respect it as you should."),
       (@category_2, "Clothing",                    "Be fashionable, be alluring."),
       (@category_3, "Home",                        "Home sweet home.");
       (@category_4, "CDs & Vinyl",                 "Kick back and relax to the sound of music."),
       (@category_5, "Digital Music",               "All the newest tracks are here."),
       (@category_6, "Computer & Accessories",      "The best computers money can buy."),
       (@category_7, "Jewellery",                   "Treat yourself to something glamorous and exquisite."),
       (@category_8, "Garden & Outdoors",           "Take a breath of fresh air."),
       (@category_9, "Kitchen",                     "Cooking has never been easier!"),
       (@category_10, "Pet Supplies",               "Because your small furry friend deserves only the best."),
       (@category_11, "Sports",                     "Live life to the fullest!"),
       (@category_12, "Toys & Games",               "From miniatures to videogames."),
       (@category_13, "Electronics",                "For all your electronics needs.");

INSERT INTO Auction_has_Category (Auction_Id, Category_Id)
VALUES (@max_auction_id + 1, @category_1),
       (@max_auction_id + 2, @category_1),
       (@max_auction_id + 3, @category_2),
       (@max_auction_id + 4, @category_2),
       (@max_auction_id + 5, @category_3),
       (@max_auction_id + 6, @category_3),
       (@max_auction_id + 7, @category_3);


-- Images --

INSERT INTO Image (Id, Path, Auction_Id)
VALUES  (5, "5.jpg", @max_auction_id + 1),
        (2, "2.jpg", @max_auction_id + 7),
        (4, "4.jpg", @max_auction_id + 5),
        (1, "1.jpg", @max_auction_id + 6),
        (6, "6.jpg", @max_auction_id + 2),
        (7, "7.gif", @max_auction_id + 4);


-- Views --

INSERT INTO Views (User_Id, Auction_Id, Time)
VALUES  (2, @max_auction_id + 1, "2019-01-12 9:00:00"),
        (2, @max_auction_id + 2, "2019-01-12 9:00:00"),
        (3, @max_auction_id + 5, "2019-01-12 9:00:00"),
        (4, @max_auction_id + 5, "2019-01-12 9:10:00"),
        (5, @max_auction_id + 6, "2019-01-12 9:00:00");


Insert into Message_Header (Id, Subject)
Values  (1, "You won 10000000 euro."),
        (2, "Welcome to Olympus delivery services");

Insert into Message (Id, Message_Header_Id, Body, Time, Sender_Id, Receiver_Id, Status, Sender_Deleted, Receiver_Deleted)
Values  (1, 1, "# Congratulations! \n* You won 100000 euro by doing absoluteley nothing. \n* In order to claim your prize please give us your personal life and credit card info! \n* Thanks in advance", NOW(), 1, @dummy_user_id, 'Read', FALSE, FALSE),
        (2, 1, "Greetings, \n What in the living hell are you talking about? I did not sign up for any prize", NOW() + 1, @dummy_user_id, 1, 'Read', FALSE, FALSE),
        (3, 1, "Perhaps you did not quite understand what's going on here... Please reply with your credit card information at once!", NOW() + 2, 1, @dummy_user_id, 'Unread', FALSE, FALSE),
        (4, 1, "I would like to commence a bank transfer or paypal payment instead of providing you my credit card information. What can we do about it?", NOW() + 3, @dummy_user_id, 1, 'Unread', FALSE, FALSE),
        (5, 2, "Olymnpu1 101", NOW() - 1, 3, 1010, 'Unread', FALSE, FALSE);

Insert into Notification (User_Id, Content, Link, Status, Type, Time)
Values  ( @dummy_user_id, "rulabula sent you a message!", "/user/user/messages", "Unread", "Message", NOW()),
        ( @dummy_user_id, "egw outbed you on: Your Mother", "/auction/1", "Unread", "Auction", NOW()),
        ( @dummy_user_id, "esy sent you a message!", "/user/user/messages", "Unread", "Message", NOW()),
        ( (SELECT Id FROM User WHERE Username = "rulabula"), "user sent you a message!", "/user/rulabula/messages", "Unread", "Message", NOW());

Update User Set Password = 'password' Where Username = 'rulabula';
Update General_User Set Validated = TRUE Where User_Id = (SELECT Id From User Where Username = 'user');

Update Auction Set Ended = TRUE Where Ends < NOW();

