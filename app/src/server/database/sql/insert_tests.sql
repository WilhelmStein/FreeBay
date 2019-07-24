-- User --

Insert into freebay.User (Username, Password, Email)
Values  ("TheSmilingGentleman", "luxuriousattire", "iamnotovercompensating@yahoo.com"),
        ("LadyGrantham", "whatisaweekend", "dowagercountess@arpanet.gov"),
        ("Venus", "fire", "desire@hotmail.com"),
        ("spinme", "rightround", "babyrightround@hotmail.com"),
        ("user", "password", "min@edu.gov"),
        ("JordanPeterson", "postmodernneomarxism", "daddeh@gmail.com");


-- Admin --

Insert into freebay.Admin (User_Id)
Select Id From freebay.User Where User.Username = "JordanPeterson";


-- Address --

Insert into freebay.Address (Street, Number, ZipCode, Country, City)
Values  ("Moloch St", "666", "12345", "United Kingdom", "London"),
        ("Olympus St", "7", "16561", "Greece", "Athens"),
        ("Downton Abbey", "1", "111111", "United Kingdom", "Newbury"),
        ("Record St", "5", "222222", "United Kingdom", "London");


-- General User --

Insert into freebay.General_User (User_Id, Seller_Rating, Bidder_Rating, Name, Surname, Phone, Address_Id, Validated)
Values  (1, 5.0, 0, "Reginald", "Von Waldberg", "+448795551234", 1, 1),
        (2, 0, 5.0, "Violet", "Grantham", "+441234567890", 3, 1),
        (3, 4.0, 5.0, "Aphrodite", "Zeusdaughtir", "+306969696969", 2, 1),
        (4, 0, 0, "Peter", "Burns", "+440987654321", 4, 0),
        (5, 2.0, 2.0, "Christis", "Christopulos", "+441111111112", 4, 1);

-- Auction -- 

-- Insert into freebay.Auction (Seller_Id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description)
-- Values  (0, "Sumptuous Dandy's Outfit", 125, 100, 500, "Historical Emporium", NULL, NULL, "20190111 9:00:00 AM", "20190118 9:00:00 AM", "A luxurious suit for the extraordinary gentleman.");