
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
VALUES (@category_1, "Health & Fitness",        "Have energy more suddenly when report."),
       (@category_2, "Electronics & Computers", "Affect middle win. Low then take certainly."),
       (@category_3, "Home & Garden",           "Recently whole camera success claim respond.");

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

