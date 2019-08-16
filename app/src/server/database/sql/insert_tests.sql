use freebay;

-- User --

Insert into User (Username, Password, Email)
Values  ("TheSmilingGentleman", "luxuriousattire", "iamnotovercompensating@yahoo.com"),
        ("LadyGrantham", "whatisaweekend", "dowagercountess@arpanet.gov"),
        ("Venus", "fire", "desire@hotmail.com"),
        ("spinme", "rightround", "babyrightround@hotmail.com"),
        ("user", "password", "min@edu.gov"),
        ("JordanPeterson", "postmodernneomarxism", "daddeh@gmail.com"),
        ('user', 'password', 'user@password.com');


-- Admin --

Insert into Admin (User_Id)
Select Id From User u Where u.Username = "JordanPeterson";


-- Address --

Insert into Address (Street, Number, ZipCode, Country, City)
Values  ("Moloch St", "666", "12345", "United Kingdom", "London"),
        ("Olympus St", "7", "16561", "Greece", "Athens"),
        ("Downton Abbey", "1", "111111", "United Kingdom", "Newbury"),
        ("Record St", "5", "222222", "United Kingdom", "London"),
        ('Knossou', '83', '12345', 'Greece', 'Athens');


-- General User --

Insert into General_User (User_Id, Seller_Rating, Bidder_Rating, Name, Surname, Phone, Address_Id, Validated)
Values  (1, 100.0, 0, "Reginald", "Von Waldberg", "+448795551234", 1, 1),
        (2, 0, 100.0, "Violet", "Grantham", "+441234567890", 3, 1),
        (3, 70.0, 100.0, "Aphrodite", "Zeusdaughtir", "+306969696969", 2, 1),
        (4, 0, 0, "Peter", "Burns", "+440987654321", 4, 0),
        (5, 20.0, 20.0, "Christis", "Christopulos", "+441111111112", 4, 1),
        (7, 100.0, 100.0, 'Userus', 'Passwordius', '1234567890', 5, 0);

-- Auction -- 

Insert into Auction (Seller_Id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description)
Values  (1, "Sumptuous Dandy's Outfit", 125.00, 100.00, 500.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "A luxurious suit for the extraordinary gentleman."),
        (1, "Modest Frock", 333.00, 100.00, 800.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "An elegant frock for the graceful lady."),
        (3, "Venereal Disease", 0.00, 30.00, 69.69, "Olympus", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", ";)"),
        (3, "Natural Viagra", 23.00, 10.00, 55.00, "Olympus", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "To make your partner say: 'By Jupiter's Cock!'"),
        (5, "Your Mother", 4.12, 5.00, 12.00, "Elladistan", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", ""),
        (4, "Child Tear - Flavoured Martini", 99.00, 45.00, 500.00, "Bastille inc", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", ""),
        (1, "Noble Scepter", 5236.00, 1000.00, 10000.00, "Historical Emporium", NULL, NULL, "2019-01-11 9:00:00", "2019-01-18 9:00:00", "");

-- Views --

Insert into Views (User_Id, Auction_Id, Time)
Values  (2, 1, "2019-01-12 9:00:00"),
        (2, 2, "2019-01-12 9:00:00"),
        (3, 5, "2019-01-12 9:00:00"),
        (4, 5, "2019-01-12 9:00:00"),
        (5, 6, "2019-01-12 9:00:00");

-- Image --

Insert into Image (Id, Path, Auction_Id)
Values  (1, "1.jpg", 6),
        (2, "2.jpg", 7),
        (3, "3.png", 5),
        (4, "4.jpg", 5);

-- Category --

INSERT INTO Category VALUES (1, "Health & Fitness"), (2, "Electronics & Computers"), (3, "Home & Garden");
