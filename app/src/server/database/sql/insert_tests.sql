use freebay;

-- User --

INSERT INTO User Values (1011, 'admin', 'admin', 'admin@admin.admin');	
INSERT INTO Admin Values (1011);	

INSERT INTO User VALUES (1010, 'user', 'password', 'user@password.com');	
INSERT INTO Address Values (1010, 'Knossou', '83', '12345', 'Greece', 'Athens');	
INSERT INTO General_User VALUES (1010, 100.0, 100.0, 'Userus', 'Passwordius', '1234567890', 1010, FALSE);


Insert into Auction (Id, Seller_Id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description)
Values  (501, 1, "Sumptuous Dandy's Outfit", 125.00, 100.00, 500.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "A luxurious suit for the extraordinary gentleman."),
        (502, 1, "Modest Frock", 333.00, 100.00, 800.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-9-18 9:00:00", "An elegant frock for the graceful lady."),
        (503, 3, "Venereal Disease", 0.00, 30.00, 69.69, "Olympus", NULL, NULL, "2019-01-11 9:00:00", "2019-12-18 9:00:00", ";)"),
        (504, 3, "Natural Viagra", 23.00, 10.00, 55.00, "Olympus", NULL, NULL, "2019-01-11 9:00:00", "2019-10-18 9:00:00", "To make your partner say: 'By Jupiter's Cock!'"),
        (505, 5, "Your Mother", 6.12, 5.00, 12.00, "Elladistan", NULL, NULL, "2019-01-11 9:00:00", "2019-10-18 9:00:00", ""),
        (506, 4, "Child Tear - Flavoured Martini", 99.00, 45.00, 500.00, "Bastille inc", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", ""),
        (507, 1, "Noble Scepter", 5236.00, 1000.00, 10000.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "");


Insert into Auction_has_Category(Auction_Id, Category_Id)
Values (501, 1), (502, 1), (503, 2), (504, 2), (505, 3), (506, 3), (507, 3);

-- Views --

Insert into Views (User_Id, Auction_Id, Time)
Values  (2, 501, "2019-01-12 9:00:00"),
        (2, 502, "2019-01-12 9:00:00"),
        (3, 505, "2019-01-12 9:00:00"),
        (4, 505, "2019-01-12 9:10:00"),
        (5, 506, "2019-01-12 9:00:00");

-- Image --

Insert into Image (Id, Path, Auction_Id)
Values  (5, "5.jpg", 501),
        (2, "2.jpg", 507),
        (4, "4.jpg", 505),
        (1, "1.jpg", 506),
        (6, "6.jpg", 502),
        (7, "7.gif", 504);


Insert into Message_Header (Id, Subject)
Values  (1, "You won 10000000 euro."),
        (2, "Welcome to Olympus delivery services");

Insert into Message (Id, Message_Header_Id, Body, Time, Sender_Id, Receiver_Id, Status, Sender_Deleted, Receiver_Deleted)
Values  (1, 1, "# Congratulations! \n* You won 100000 euro by doing absoluteley nothing. \n* In order to claim your prize please give us your personal life and credit card info! \n* Thanks in advance", NOW(), 1, 1010, 'Read', FALSE, FALSE),
        (2, 1, "Greetings, \n What in the living hell are you talking about? I did not sign up for any prize", NOW() + 1, 1010, 1, 'Read', FALSE, FALSE),
        (3, 1, "Perhaps you did not quite understand what's going on here... Please reply with your credit card information at once!", NOW() + 2, 1, 1010, 'Unread', FALSE, FALSE),
        (4, 1, "I would like to commence a bank transfer or paypal payment instead of providing you my credit card information. What can we do about it?", NOW() + 3, 1010, 1, 'Unread', FALSE, FALSE),
        (5, 2, "Olymnpu1 101", NOW() - 1, 3, 1010, 'Unread', FALSE, FALSE);

Insert into Notification (User_Id, Content, Link, Status, Type, Time)
Values  (1010, "rulabula sent you a message!", "/messages", "Unread", "Message", NOW()),
        (1010, "egw outbed you on: Your Mother", "/auction/1", "Unread", "Auction", NOW()),
        (1010, "esy sent you a message!", "/messages", "Unread", "Message", NOW()),
        ( (SELECT Id FROM User WHERE Username = "rulabula"), "user sent you a message!", "/messages", "Unread", "Message", NOW());

Update User Set Password = 'password' Where Username = 'rulabula';

-- Category --

-- INSERT INTO Category VALUES (1, "Health & Fitness"), (2, "Electronics & Computers"), (3, "Home & Garden");