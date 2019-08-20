use freebay;

-- User --

INSERT INTO User Values (1011, 'admin', 'admin', 'admin@admin.admin');	
INSERT INTO Admin Values (1011);	

INSERT INTO User VALUES (1010, 'user', 'password', 'user@password.com');	
INSERT INTO Address Values (1010, 'Knossou', '83', '12345', 'Greece', 'Athens');	
INSERT INTO General_User VALUES (1010, 100.0, 100.0, 'Userus', 'Passwordius', '1234567890', 1010, FALSE);


Insert into Auction (Id, Seller_Id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description)
Values  (1, 1, "Sumptuous Dandy's Outfit", 125.00, 100.00, 500.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "A luxurious suit for the extraordinary gentleman."),
        (2, 1, "Modest Frock", 333.00, 100.00, 800.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "An elegant frock for the graceful lady."),
        (3, 3, "Venereal Disease", 0.00, 30.00, 69.69, "Olympus", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", ";)"),
        (4, 3, "Natural Viagra", 23.00, 10.00, 55.00, "Olympus", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "To make your partner say: 'By Jupiter's Cock!'"),
        (5, 5, "Your Mother", 6.12, 5.00, 12.00, "Elladistan", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", ""),
        (6, 4, "Child Tear - Flavoured Martini", 99.00, 45.00, 500.00, "Bastille inc", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", ""),
        (7, 1, "Noble Scepter", 5236.00, 1000.00, 10000.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "");


-- Views --

Insert into Views (User_Id, Auction_Id, Time)
Values  (2, 1, "2019-01-12 9:00:00"),
        (2, 2, "2019-01-12 9:00:00"),
        (3, 5, "2019-01-12 9:00:00"),
        (4, 5, "2019-01-12 9:10:00"),
        (5, 6, "2019-01-12 9:00:00");

-- Image --

Insert into Image (Id, Path, Auction_Id)
Values  (1, "1.jpg", 4),
        (2, "2.jpg", 2),
        (3, "3.png", 5),
        (4, "4.jpg", 5);

-- Category --

-- INSERT INTO Category VALUES (1, "Health & Fitness"), (2, "Electronics & Computers"), (3, "Home & Garden");
