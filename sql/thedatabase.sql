SET SQL_SAFE_UPDATES = 0;

unlock tables;
#DROP DATABASE BabaGanoush; 
#code above^ for if you need to reset the database
DROP DATABASE IF EXISTS 20ac3d09;
CREATE DATABASE 20ac3d09;
USE 20ac3d09;

DROP TABLE IF EXISTS Address;
CREATE TABLE Address(
AddressID INT NOT NULL,
StreetNo INT NOT NULL, StreetName VARCHAR(64) NOT NULL, postcode VARCHAR(8) NOT NULL, city VARCHAR(32),
PRIMARY KEY (AddressID)
);

DROP TABLE IF EXISTS Shift;
CREATE TABLE Shift (
ShiftID int NOT NULL,
ShiftType ENUM('lunch', 'dinner') NOT NULL, ShiftDate DATE NOT NULL,
PRIMARY KEY (ShiftID)
);

DROP TABLE IF EXISTS Restaurant;
CREATE TABLE Restaurant (
RestaurantID int NOT NULL,
RestaurantName varchar(20) NOT NULL,
RestaurantAddress INT NOT NULL,
PRIMARY KEY (RestaurantID),
FOREIGN KEY (RestaurantAddress) REFERENCES Address(AddressID) ON DELETE NO
ACTION ON UPDATE CASCADE
);

DROP TABLE IF EXISTS Staff;
CREATE TABLE Staff (
StaffID int NOT NULL,
    StaffName varchar(32) NOT NULL,
    StaffAddress INT NOT NULL,
      StaffSalary int NOT NULL,
StaffPosition ENUM('Manager', 'Waiter', 'Chef', 'Director') NOT NULL DEFAULT 'Waiter',
StaffInsuranceNo VARCHAR(32) NOT NULL, Supervises INT,
fk_RestaurantID int,
PRIMARY KEY (StaffID),
FOREIGN KEY (fk_RestaurantID) REFERENCES Restaurant(RestaurantID),
FOREIGN KEY (Supervises) REFERENCES Staff(StaffID),
FOREIGN KEY (StaffAddress) REFERENCES Address(AddressID) ON DELETE NO ACTION ON UPDATE
CASCADE );

DROP TABLE IF EXISTS StaffShift;
CREATE TABLE StaffShift(
      fk_StaffID int NOT NULL,
    fk_ShiftID int NOT NULL,
    Overtime BOOL DEFAULT FALSE,
FOREIGN KEY (fk_StaffID) REFERENCES Staff(StaffID),
FOREIGN KEY (fk_ShiftID) REFERENCES Shift(ShiftID) );

DROP TABLE IF EXISTS TableBooth;
CREATE TABLE TableBooth(
      TableID int NOT NULL,
    TableNo int NOT NULL,
    NumberOfSeats int DEFAULT 4,
      RestaurantID int  NOT NULL,
    PRIMARY KEY (TableID),
FOREIGN KEY (RestaurantID) REFERENCES Restaurant(RestaurantID) );

DROP TABLE IF EXISTS SupplyOrder;
CREATE TABLE SupplyOrder(
	SupplyOrderID int NOT NULL AUTO_INCREMENT,
    SupplyOrderDate DATE NOT NULL,
    SupplyOrderCost int NOT NULL,
	RestaurantID int NOT NULL,
    PRIMARY KEY (SupplyOrderID),
   	FOREIGN KEY (RestaurantID) REFERENCES Restaurant(RestaurantID)
);

DROP TABLE IF EXISTS Ingredient;
CREATE TABLE Ingredient(
SupplyID int NOT NULL, IngredientName VARCHAR(64) NOT NULL,
      Unit int NOT NULL,
    PRIMARY KEY (SupplyID,IngredientName)
);

DROP TABLE IF EXISTS RestaurantSupply;
CREATE TABLE RestaurantSupply( RestaurantID int NOT NULL, SupplyID int NOT NULL,
StockLeft int NOT NULL,
PRIMARY KEY (RestaurantID, SupplyID),
FOREIGN KEY (SupplyID) REFERENCES Ingredient(SupplyID),
FOREIGN KEY (RestaurantID) REFERENCES Restaurant(RestaurantID) );

DROP TABLE IF EXISTS Dish;
CREATE TABLE Dish(
      DishID int NOT NULL,
    Price int NOT NULL,
    PreparationTime int NOT NULL,
Count int NOT NULL Default 0, -- how often was this dish ordered 
PRIMARY KEY (DishID)
);

DROP TABLE IF EXISTS IngredientInDish;
CREATE TABLE IngredientInDish( SupplyID int NOT NULL,
DishID int NOT NULL,
Quantity int NOT NULL,
PRIMARY KEY (SupplyID, DishID),
FOREIGN KEY (SupplyID) REFERENCES Ingredient(SupplyID) ON DELETE NO ACTION ON UPDATE CASCADE,
FOREIGN KEY (DishID) REFERENCES Dish(DishID) ON DELETE NO ACTION ON UPDATE CASCADE
);

DROP TABLE IF EXISTS Customer;
CREATE TABLE Customer(
CustomerID int NOT NULL,
CustomerName varchar(32) NOT NULL, CustomerFirstName varchar(32) NOT NULL,
CustomerEmail varchar(64) NOT NULL,
CustomerAddressID int,
PRIMARY KEY (CustomerID),
FOREIGN KEY (CustomerAddressID) REFERENCES Address(AddressID) ON DELETE SET
NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS FoodOrder;
CREATE TABLE FoodOrder (
OrderID int NOT NULL auto_increment,
    FoodOrderTime DATETIME NOT NULL,
      PaymentReference int,
      Price decimal(6,2) NOT NULL default 0,
    CustomerID int,
    TableID int,
    PRIMARY KEY (OrderID),
FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID), FOREIGN KEY (TableID) REFERENCES TableBooth(TableID)
);

LOCK TABLES Address WRITE;
INSERT INTO Address (AddressID,StreetNo, StreetName, Postcode, City) VALUES 
	(1,21, 'High Street', 'DD1 4RF', 'Dundee'),
    (2,44, 'Airlie Place', 'DD1 3EE', 'Dundee'),
    (3,89, 'Commercial Street', 'DD1 8GH', 'Dundee'),
    (4,1, 'Nethergate', 'DD1 8RT', 'Dundee'),
    (5,8372, 'Blackness Road', 'DD2 5KL', 'Dundee'),
    (6,1, 'Balfour Street', 'DD1 4RF', 'Dundee'),
    (7,2, 'High Street', 'DD1 4HD', 'Dundee'),
    (8,3, 'Park Place', 'DD1 4HW', 'Dundee'),
    (9,4, 'Burnaby Street', 'DD2 1QH', 'Dundee'),
    (10,5, 'Geddes Quadrangle', 'DD1 4HG', 'Dundee'),
    (11,6, 'College Green', 'DD1 4HN', 'Dundee'),
    (12,7, 'Balfour Street', 'DD1 4HB', 'Dundee'),
    (13,8, 'Ninewells Campus', 'DD2 1UB', 'Dundee'),
    (14,9, 'DUSA Union Level 1', 'DD1 4HN', 'Dundee'),
    (15,10, 'Smalls Lane', 'DD1 4HR', 'Dundee'),
    (16,11, 'Park Place', 'DD1 4HR', 'Dundee'),
    (17,12, 'Old Hawkhill', 'DD1 4EN', 'Dundee'),
    (18,13, 'Perth Road', 'DD1 4HT', 'Dundee'),
    (19,14, 'Kirsty Semple Way', 'DD2 4BF', 'Dundee'),
    (20,15, 'Smalls Wynd', 'DD1 4HN', 'Dundee'),
    (21,16, 'Peters Lane', 'DD1 4HJ', 'Dundee');
UNLOCK TABLES;

LOCK TABLES Shift write;
INSERT INTO Shift (ShiftID,ShiftType, ShiftDate) VALUES
	(1,'lunch', CURDATE()),
    (2,'dinner', CURDATE()),
    (3,'lunch', '2020-11-11'),
    (4,'dinner', '2020-11-11'),
    (5,'lunch', '2020-11-12'),
    (6,'dinner', '2020-11-12'),
    (7,'lunch', '2020-11-13'),
    (8,'dinner', '2020-11-13'),
    (9,'lunch', '2020-11-14'),
    (10,'dinner', '2020-11-14'),
    (11,'lunch', '2020-11-15'),
    (12,'dinner', '2020-11-15'),
    (13,'lunch', '2020-11-16'),
    (14,'dinner', '2020-11-16'),
    (15,'lunch', '2020-11-17'),
    (16,'dinner', '2020-11-17');
UNLOCK TABLES;

LOCK TABLES Restaurant WRITE;
INSERT INTO Restaurant (RestaurantID, RestaurantName, RestaurantAddress) VALUES
	(1,'The Bread Bar',1),
    (2,'Borrito Boy',2),
    (3,'my mifan',3);
unlock tables;

LOCK TABLES Staff WRITE;
INSERT INTO Staff (StaffID,StaffName, StaffAddress, StaffSalary, StaffPosition, StaffInsuranceNo, Supervises, fk_RestaurantID) VALUES
	(1,'Peter Pan', 4, 4300, 'Manager', 'AB 12 34 56 78 A', NULL, 1),
    (2,'Henry Heinz', 5, 340, 'Chef', 'AB 21 43 65 63 A', NULL, 1),
    (3,'Duncan McDuncan', 6, 20000, 'Director', 'AB 70 51 79 38 A', NULL, 1),
    (4,'Bruce Banner', 7, 340, 'Chef', 'AB 53 46 88 79 C', NULL, 1),
    (5,'Bruce Wayne', 8, 340, 'Chef', 'AB 39 83 87 15 D', NULL, 1),
    (6,'Jason Todd', 9, 170, 'Waiter', 'AB 21 70 23 84 E', NULL, 1),
    (7,'Harley Quinn', 4, 170, 'Waiter', 'AB 39 61 75 15 F', NULL, 1),
    (8,'Obi-Wan Kenobi', 5, 170, 'Waiter', 'AB 55 10 78 90 G', NULL, 1),
    (9,'Baby Yoda', 6, 170, 'Waiter', 'AB 20 66 91 12 H', NULL, 1),
    (10,'Sheev Palpatine', 7, 170, 'Waiter', 'AB 74 45 61 48 I', NULL, 1),
    (11,'Peter Parker', 8, 170, 'Waiter', 'AB 53 81 66 22 J', NULL, 1),
    (12,'Miles Morales', 9, 170, 'Waiter', 'AB 94 80 93 85 K', NULL, 1),
    (13,'Jay Jonah Jameson Jr.', 4, 170, 'Waiter', 'AB 49 65 24 59 L', NULL, 1),
    (14,'Harry Styles', 5, 170, 'Waiter', 'AB 97 51 21 68 M', NULL, 1),
    (15,'Thor Odinson', 6, 170, 'Waiter', 'AB 16 64 18 23 N', NULL, 1),
    (16,'Nick Fury', 7, 4300, 'Manager', 'AB 11 24 39 12 O', NULL, 1),
    
    (17,'Oswald Cobblepot', 8, 4300, 'Manager', 'AB 19 45 42 52 P', NULL, 2),
    (18,'Mary-Jane Watson', 9, 340, 'Chef', 'AB 80 67 81 60 Q', NULL, 2),
    (19,'Gwen Stacy', 4, 20000, 'Director', 'AB 68 49 55 47 R', NULL, 2),
    (20,'T Challa', 5, 340, 'Chef', 'AB 26 66 93 88 S', NULL, 2),
    (21,'Anakin Skywalker', 6, 340, 'Chef', 'AB 44 63 10 87 T', NULL, 2),
    (22,'Luke Skywalker', 7, 170, 'Waiter', 'AB 52 30 22 91 U', NULL, 2),
    (23,'Lee Harvey Oswald', 8, 170, 'Waiter', 'AB 54 17 95 91 V', NULL, 2),
    (24,'John F Kennedy', 9, 170, 'Waiter', 'AB 39 57 42 78 W', NULL, 2),
    (25,'Barack Obama', 4, 170, 'Waiter', 'AB 79 87 15 62 X', NULL, 2),
    (26,'Pepper Potts', 5, 170, 'Waiter', 'AB 98 26 76 61 Y', NULL, 2),
    (27,'Harry Osborn', 6, 170, 'Waiter', 'AB 77 60 21 78 Z', NULL, 2),
    (28,'Norman Osborn', 7, 170, 'Waiter', 'AB 80 57 48 25 A', NULL, 2),
    (29,'Otto Octavius', 8, 170, 'Waiter', 'AB 83 25 38 28 B', NULL, 2),
    (30,'Cheryl Cole', 9, 170, 'Waiter', 'AB 75 13 60 69 C', NULL, 2),
    (32,'Tobey Maguire', 4, 170, 'Waiter', 'AB 76 85 73 90 D', NULL, 2),
    (33,'Steven Strange', 5, 4300, 'Manager', 'AB 44 39 55 36 E', NULL, 2),
    
    (34,'Ezio Auditore', 6, 4300, 'Manager', 'AB 35 80 57 46 F', NULL, 3),
    (35,'Hannibal Lecter', 7, 340, 'Chef', 'AB 20 33 53 65 I', NULL, 3),
    (36,'Stan Lee', 8, 20000, 'Director', 'AB 66 37 39 80 J', NULL, 3),
    (37,'Ki-Adi Mundi', 9, 340, 'Chef', 'AB 44 20 48 95 K', NULL, 3),
    (38,'Waylon Jones', 4, 340, 'Chef', 'AB 43 37 76 69 L', NULL, 3),
    (39,'Dick Grayson', 5, 170, 'Waiter', 'AB 14 48 97 34 M', NULL, 3),
    (40,'Kratos', 6, 170, 'Waiter', 'AB 72 41 88 79 N', NULL, 3),
    (41,'Geralt Rivia', 7, 170, 'Waiter', 'AB 52 42 32 58 O', NULL, 3),
    (42,'Triss Merigold', 8, 170, 'Waiter', 'AB 11 67 27 81 P', NULL, 3),
    (43,'Harry Potter', 9, 170, 'Waiter', 'AB 97 37 50 21 Q', NULL, 3),
    (44,'Tom Riddle', 4, 170, 'Waiter', 'AB 70 40 98 68 R', NULL, 3),
    (45,'Alex Mercer', 5, 170, 'Waiter', 'AB 91 78 62 47 S', NULL, 3),
    (46,'James Heller', 6, 170, 'Waiter', 'AB 77 79 18 55 T', NULL, 3),
    (47,'James Bond', 7, 170, 'Waiter', 'AB 59 86 74 31 U', NULL, 3),
    (48,'Thor Odinson', 8, 170, 'Waiter', 'AB 51 13 30 48 V', NULL, 3),
    (49,'Nick Fury', 9, 4300, 'Manager', 'AB 31 27 95 63 W', NULL, 3);
UNLOCK TABLES;


LOCK TABLES StaffShift WRITE;
INSERT INTO StaffShift (fk_StaffID,fk_ShiftID) VALUES
	(1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(17,1),(18,1),(19,1),(20,1),(21,1),(22,1),(23,1),(24,1),(34,1),(35,1),(36,1),(37,1),(38,1),(39,1),(40,1),(41,1);
unlock tables;

LOCK TABLES TableBooth WRITE;
INSERT INTO TableBooth (TableID, TableNo,RestaurantID) VALUES
	(1,1,1),
    (2,2,1),
    (3,3,1),
    (4,4,1),
    (5,5,1),
    (6,1,2),
    (7,2,2),
    (8,3,2),
    (9,4,2),
    (10,5,2),
    (11,1,3),
    (12,2,3),
    (13,3,3),
    (14,4,3),
    (15,5,3);
unlock tables;

#generic price of 1000 quid
LOCK TABLES SupplyOrder WRITE;
INSERT INTO SupplyOrder (SupplyOrderId, SupplyOrderDate, SupplyOrderCost,RestaurantID) VALUES
	(1,'2018-01-1',1000,1),
    (2,'2018-02-2',1000,1),
    (3,'2018-03-3',1000,1),
    (4,'2018-04-4',1000,1),
    (5,'2018-05-5',1000,1),
    (6,'2018-06-6',1000,2),
    (7,'2018-07-7',1000,2),
    (8,'2018-08-8',1000,2),
    (9,'2018-09-9',1000,2),
    (10,'2018-10-10',1000,2),
    (11,'2018-11-11',1000,3),
    (12,'2018-12-12',1000,3),
    (13,'2018-12-13',1000,3),
    (14,'2018-12-14',1000,3),
    (15,'2018-12-15',1000,3),
    (16,'2019-01-1',1000,1),
    (17,'2019-02-2',1000,1),
    (18,'2019-03-3',1000,1),
    (19,'2019-04-4',1000,1),
    (20,'2019-05-5',1000,1),
    (21,'2019-06-6',1000,2),
    (22,'2019-07-7',1000,2),
    (23,'2019-08-8',1000,2),
    (24,'2019-09-9',1000,2),
    (25,'2019-10-10',1000,2),
    (26,'2019-11-11',1000,3),
    (27,'2019-12-12',1000,3),
    (28,'2019-12-13',1000,3),
    (29,'2019-12-14',1000,3),
    (30,'2019-12-15',1000,3),
    (31,'2020-01-1',1000,1),
    (32,'2020-02-2',1000,1),
    (33,'2020-03-3',1000,1),
    (34,'2020-04-4',1000,1),
    (35,'2020-05-5',1000,1),
    (36,'2020-06-6',1000,2),
    (37,'2020-07-7',1000,2),
    (38,'2020-08-8',1000,2),
    (39,'2020-09-9',1000,2),
    (40,'2020-10-10',1000,2),
    (41,'2020-11-11',1000,3),
    (42,'2020-12-12',1000,3),
    (43,'2020-12-13',1000,3),
    (44,'2020-12-14',1000,3),
    (45,'2020-12-15',1000,3);
unlock tables;

LOCK TABLES Ingredient WRITE;
INSERT INTO Ingredient (SupplyID, IngredientName, Unit) VALUES
	(1,'pasta',1),
    (1,'chicken',1),
    (1,'Fish',1),
    (2,'prawns',1),
    (2,'rice',1),
    (2,'potatoes',1),
    (3,'bread',1),
    (3,'flour',1),
    (3,'noodles',1),
    (4,'sugar',1),
    (4,'celery',1),
    (4,'carrot',1),
    (5,'broccoli',1),
    (5,'salt',1),
    (5,'pepper',1);
unlock tables;

LOCK TABLES RestaurantSupply WRITE;
INSERT INTO RestaurantSupply (RestaurantID, SupplyID, StockLeft) VALUES
	(1,1,3),
    (1,2,3),
    (1,3,3),
    (1,4,3),
    (1,5,3),
    (2,1,3),
    (2,2,3),
    (2,3,3),
    (2,4,3),
    (2,5,3),
    (3,1,3),
    (3,2,3),
    (3,3,3),
    (3,4,3),
    (3,5,3);
unlock tables;

LOCK TABLES Dish WRITE;
INSERT INTO Dish (DishID, Price, PreparationTime) VALUES
	(1,9,5),
    (2,10,10),
    (3,11,10),
    (4,12,10),
    (5,9,10),
    (6,10,10),
    (7,11,10),
    (8,12,10),
    (9,9,5),
    (10,10,10),
    (11,11,10),
    (12,9,10),
    (13,10,10),
    (14,25,20),
    (15,20,20);
unlock tables;

LOCK TABLES IngredientInDish WRITE;
INSERT INTO IngredientInDish (SupplyID, DishID, Quantity) VALUES
	(1,6,1),
    (1,9,1),
    (1,14,1),
    (2,15,1),
    (2,10,1),
    (2,2,1),
    (3,13,1),
    (3,5,1),
    (3,8,1),
    (4,4,1),
    (4,7,1),
    (4,12,1),
    (5,1,1),
    (5,11,1),
    (5,3,1);
unlock tables;

LOCK TABLES Customer WRITE;
INSERT INTO Customer (CustomerID,CustomerName, CustomerFirstName,CustomerEmail) VALUES
	(1,'Mario','Luigi','marioluigi@gmail.com'),
    (2,'Peach','Princess','princesspeach@gmail.com'),
    (3,'Fox','Lucius','luciusfox@gmail.com'),
    (4,'Dolan','Remy','243918@dundee.ac.uk'),
    (5,'Inspector','Health','hi@nhs.co.uk'),
    (6,'Weasley','Ron','rweasley@hogwarts.co.uk'),
    (7,'Bourne','Jason','jbourne@treadstone.co.uk'),
    (8,'Capaldi','Lewis','lewisc@yahoo.com'),
    (9,'Fun','Guy','Fungi@Mushroom.com'),
    (10,'Parker','Ben','bparker@rip.co.uk'),
    (11,'Snape','Severus','ss@hogwarts.co.uk'),
    (12,'Granger','Hermione','hg@hogwarts.co.uk'),
    (13,'Ace','Jack','jackace@dundee.ac.uk'),
    (14,'De Gaulle','Charles','CDG@ww2.fr'),
    (15,'thulhu','C','Cthulhu@uhoh.com'),
    (16,'Zilla','God','gojira@ohno.jp');
unlock tables;

DROP TABLE IF EXISTS Numbers;
CREATE TABLE Numbers(
NumberID INT NOT NULL,OrderNum INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY (OrderNum));

LOCK TABLES Numbers WRITE;
INSERT INTO Numbers (NumberID) VALUES
(10001),
(10011),
(10021),
(10031),
(10041),
(10051),
(10061),
(10071),
(10081),
(10091),
(10101),
(10111),
(10121),
(10131),
(10141),
(10151),
(10161),
(10171),
(10181),
(10191),
(10201),
(10211),
(10221),
(10231),
(10241),
(10251),
(10261),
(10271),
(10281),
(10291),
(10301),
(10311),
(10321),
(10331),
(10341),
(10351),
(10361),
(10371),
(10381),
(10391),
(10401),
(10411),
(10421),
(10431),
(10441),
(10451),
(10461),
(10471),
(10481),
(10491),
(10501),
(10511),
(10521),
(10531),
(10541),
(10551),
(10561),
(10571),
(10581),
(10591),
(10601),
(10611),
(10621),
(10631),
(10641),
(10651),
(10661),
(10671),
(10681),
(10691),
(10701),
(10711),
(10721),
(10731),
(10741),
(10751),
(10761),
(10771),
(10781),
(10791),
(10801),
(10811),
(10821),
(10831),
(10841),
(10851),
(10861),
(10871),
(10881),
(10891),
(10901),
(10911),
(10921),
(10931),
(10941),
(10951),
(10961),
(10971),
(10981),
(10991),
(11001),
(11011),
(11021),
(11031),
(11041),
(11051),
(11061),
(11071),
(11081),
(11091),
(11101),
(11111),
(11121),
(11131),
(11141),
(11151),
(11161),
(11171),
(11181),
(11191),
(11201),
(11211),
(11221),
(11231),
(11241),
(11251),
(11261),
(11271),
(11281),
(11291),
(11301),
(11311),
(11321),
(11331),
(11341),
(11351),
(11361),
(11371),
(11381),
(11391),
(11401),
(11411),
(11421),
(11431),
(11441),
(11451),
(11461),
(11471),
(11481),
(11491),
(11501),
(11511),
(11521),
(11531),
(11541),
(11551),
(11561),
(11571),
(11581),
(11591),
(11601),
(11611),
(11621),
(11631),
(11641),
(11651),
(11661),
(11671),
(11681),
(11691),
(11701),
(11711),
(11721),
(11731),
(11741),
(11751),
(11761),
(11771),
(11781),
(11791),
(11801),
(11811),
(11821),
(11831),
(11841),
(11851),
(11861),
(11871),
(11881),
(11891),
(11901),
(11911),
(11921),
(11931),
(11941),
(11951),
(11961),
(11971),
(11981),
(11991),
(12001),
(12011),
(12021),
(12031),
(12041),
(12051),
(12061),
(12071),
(12081),
(12091),
(12101),
(12111),
(12121),
(12131),
(12141),
(12151),
(12161),
(12171),
(12181),
(12191),
(12201),
(12211),
(12221),
(12231),
(12241),
(12251),
(12261),
(12271),
(12281),
(12291),
(12301),
(12311),
(12321),
(12331),
(12341),
(12351),
(12361),
(12371),
(12381),
(12391),
(12401),
(12411),
(12421),
(12431),
(12441),
(12451),
(12461),
(12471),
(12481),
(12491),
(12501),
(12511),
(12521),
(12531),
(12541),
(12551),
(12561),
(12571),
(12581),
(12591),
(12601),
(12611),
(12621),
(12631),
(12641),
(12651),
(12661),
(12671),
(12681),
(12691),
(12701),
(12711),
(12721),
(12731),
(12741),
(12751),
(12761),
(12771),
(12781),
(12791),
(12801),
(12811),
(12821),
(12831),
(12841),
(12851),
(12861),
(12871),
(12881),
(12891),
(12901),
(12911),
(12921),
(12931),
(12941),
(12951),
(12961),
(12971),
(12981),
(12991),
(13001),
(13011),
(13021),
(13031),
(13041),
(13051),
(13061),
(13071),
(13081),
(13091),
(13101),
(13111),
(13121),
(13131),
(13141),
(13151),
(13161),
(13171),
(13181),
(13191),
(13201),
(13211),
(13221),
(13231),
(13241),
(13251),
(13261),
(13271),
(13281),
(13291),
(13301),
(13311),
(13321),
(13331),
(13341),
(13351),
(13361),
(13371),
(13381),
(13391),
(13401),
(13411),
(13421),
(13431),
(13441),
(13451),
(13461),
(13471),
(13481),
(13491),
(13501),
(13511),
(13521),
(13531),
(13541),
(13551),
(13561),
(13571),
(13581),
(13591),
(13601),
(13611),
(13621),
(13631),
(13641),
(13651),
(13661),
(13671),
(13681),
(13691),
(13701),
(13711),
(13721),
(13731),
(13741),
(13751),
(13761),
(13771),
(13781),
(13791),
(13801),
(13811),
(13821),
(13831),
(13841),
(13851),
(13861),
(13871),
(13881),
(13891),
(13901),
(13911),
(13921),
(13931),
(13941),
(13951),
(13961),
(13971),
(13981),
(13991),
(14001),

(100012),
(100112),
(100212),
(100312),
(100412),
(100512),
(100612),
(100712),
(100812),
(100912),
(101012),
(101112),
(101212),
(101312),
(101412),
(101512),
(101612),
(101712),
(101812),
(101912),
(102012),
(102112),
(102212),
(102312),
(102412),
(102512),
(102612),
(102712),
(102812),
(102912),
(103012),
(103112),
(103212),
(103312),
(103412),
(103512),
(103612),
(103712),
(103812),
(103912),
(104012),
(104112),
(104212),
(104312),
(104412),
(104512),
(104612),
(104712),
(104812),
(104912),
(105012),
(105112),
(105212),
(105312),
(105412),
(105512),
(105612),
(105712),
(105812),
(105912),
(106012),
(106112),
(106212),
(106312),
(106412),
(106512),
(106612),
(106712),
(106812),
(106912),
(107012),
(107112),
(107212),
(107312),
(107412),
(107512),
(107612),
(107712),
(107812),
(107912),
(108012),
(108112),
(108212),
(108312),
(108412),
(108512),
(108612),
(108712),
(108812),
(108912),
(109012),
(109112),
(109212),
(109312),
(109412),
(109512),
(109612),
(109712),
(109812),
(109912),
(110012),
(110112),
(110212),
(110312),
(110412),
(110512),
(110612),
(110712),
(110812),
(110912),
(111012),
(111112),
(111212),
(111312),
(111412),
(111512),
(111612),
(111712),
(111812),
(111912),
(112012),
(112112),
(112212),
(112312),
(112412),
(112512),
(112612),
(112712),
(112812),
(112912),
(113012),
(113112),
(113212),
(113312),
(113412),
(113512),
(113612),
(113712),
(113812),
(113912),
(114012),
(114112),
(114212),
(114312),
(114412),
(114512),
(114612),
(114712),
(114812),
(114912),
(115012),
(115112),
(115212),
(115312),
(115412),
(115512),
(115612),
(115712),
(115812),
(115912),
(116012),
(116112),
(116212),
(116312),
(116412),
(116512),
(116612),
(116712),
(116812),
(116912),
(117012),
(117112),
(117212),
(117312),
(117412),
(117512),
(117612),
(117712),
(117812),
(117912),
(118012),
(118112),
(118212),
(118312),
(118412),
(118512),
(118612),
(118712),
(118812),
(118912),
(119012),
(119112),
(119212),
(119312),
(119412),
(119512),
(119612),
(119712),
(119812),
(119912),
(120012),
(120112),
(120212),
(120312),
(120412),
(120512),
(120612),
(120712),
(120812),
(120912),
(121012),
(121112),
(121212),
(121312),
(121412),
(121512),
(121612),
(121712),
(121812),
(121912),
(122012),
(122112),
(122212),
(122312),
(122412),
(122512),
(122612),
(122712),
(122812),
(122912),
(123012),
(123112),
(123212),
(123312),
(123412),
(123512),
(123612),
(123712),
(123812),
(123912),
(124012),
(124112),
(124212),
(124312),
(124412),
(124512),
(124612),
(124712),
(124812),
(124912),
(125012),
(125112),
(125212),
(125312),
(125412),
(125512),
(125612),
(125712),
(125812),
(125912),
(126012),
(126112),
(126212),
(126312),
(126412),
(126512),
(126612),
(126712),
(126812),
(126912),
(127012),
(127112),
(127212),
(127312),
(127412),
(127512),
(127612),
(127712),
(127812),
(127912),
(128012),
(128112),
(128212),
(128312),
(128412),
(128512),
(128612),
(128712),
(128812),
(128912),
(129012),
(129112),
(129212),
(129312),
(129412),
(129512),
(129612),
(129712),
(129812),
(129912),
(130012),
(130112),
(130212),
(130312),
(130412),
(130512),
(130612),
(130712),
(130812),
(130912),
(131012),
(131112),
(131212),
(131312),
(131412),
(131512),
(131612),
(131712),
(131812),
(131912),
(132012),
(132112),
(132212),
(132312),
(132412),
(132512),
(132612),
(132712),
(132812),
(132912),
(133012),
(133112),
(133212),
(133312),
(133412),
(133512),
(133612),
(133712),
(133812),
(133912),
(134012),
(134112),
(134212),
(134312),
(134412),
(134512),
(134612),
(134712),
(134812),
(134912),
(135012),
(135112),
(135212),
(135312),
(135412),
(135512),
(135612),
(135712),
(135812),
(135912),
(136012),
(136112),
(136212),
(136312),
(136412),
(136512),
(136612),
(136712),
(136812),
(136912),
(137012),
(137112),
(137212),
(137312),
(137412),
(137512),
(137612),
(137712),
(137812),
(137912),
(138012),
(138112),
(138212),
(138312),
(138412),
(138512),
(138612),
(138712),
(138812),
(138912),
(139012),
(139112),
(139212),
(139312),
(139412),
(139512),
(139612),
(139712),
(139812),
(139912),
(140012),
(100013),
(100113),
(100213),
(100313),
(100413),
(100513),
(100613),
(100713),
(100813),
(100913),
(101013),
(101113),
(101213),
(101313),
(101413),
(101513),
(101613),
(101713),
(101813),
(101913),
(102013),
(102113),
(102213),
(102313),
(102413),
(102513),
(102613),
(102713),
(102813),
(102913),
(103013),
(103113),
(103213),
(103313),
(103413),
(103513),
(103613),
(103713),
(103813),
(103913),
(104013),
(104113),
(104213),
(104313),
(104413),
(104513),
(104613),
(104713),
(104813),
(104913),
(105013),
(105113),
(105213),
(105313),
(105413),
(105513),
(105613),
(105713),
(105813),
(105913),
(106013),
(106113),
(106213),
(106313),
(106413),
(106513),
(106613),
(106713),
(106813),
(106913),
(107013),
(107113),
(107213),
(107313),
(107413),
(107513),
(107613),
(107713),
(107813),
(107913),
(108013),
(108113),
(108213),
(108313),
(108413),
(108513),
(108613),
(108713),
(108813),
(108913),
(109013),
(109113),
(109213),
(109313),
(109413),
(109513),
(109613),
(109713),
(109813),
(109913),
(110013),
(110113),
(110213),
(110313),
(110413),
(110513),
(110613),
(110713),
(110813),
(110913),
(111013),
(111113),
(111213),
(111313),
(111413),
(111513),
(111613),
(111713),
(111813),
(111913),
(112013),
(112113),
(112213),
(112313),
(112413),
(112513),
(112613),
(112713),
(112813),
(112913),
(113013),
(113113),
(113213),
(113313),
(113413),
(113513),
(113613),
(113713),
(113813),
(113913),
(114013),
(114113),
(114213),
(114313),
(114413),
(114513),
(114613),
(114713),
(114813),
(114913),
(115013),
(115113),
(115213),
(115313),
(115413),
(115513),
(115613),
(115713),
(115813),
(115913),
(116013),
(116113),
(116213),
(116313),
(116413),
(116513),
(116613),
(116713),
(116813),
(116913),
(117013),
(117113),
(117213),
(117313),
(117413),
(117513),
(117613),
(117713),
(117813),
(117913),
(118013),
(118113),
(118213),
(118313),
(118413),
(118513),
(118613),
(118713),
(118813),
(118913),
(119013),
(119113),
(119213),
(119313),
(119413),
(119513),
(119613),
(119713),
(119813),
(119913),
(120013),
(120113),
(120213),
(120313),
(120413),
(120513),
(120613),
(120713),
(120813),
(120913),
(121013),
(121113),
(121213),
(121313),
(121413),
(121513),
(121613),
(121713),
(121813),
(121913),
(122013),
(122113),
(122213),
(122313),
(122413),
(122513),
(122613),
(122713),
(122813),
(122913),
(123013),
(123113),
(123213),
(123313),
(123413),
(123513),
(123613),
(123713),
(123813),
(123913),
(124013),
(124113),
(124213),
(124313),
(124413),
(124513),
(124613),
(124713),
(124813),
(124913),
(125013),
(125113),
(125213),
(125313),
(125413),
(125513),
(125613),
(125713),
(125813),
(125913),
(126013),
(126113),
(126213),
(126313),
(126413),
(126513),
(126613),
(126713),
(126813),
(126913),
(127013),
(127113),
(127213),
(127313),
(127413),
(127513),
(127613),
(127713),
(127813),
(127913),
(128013),
(128113),
(128213),
(128313),
(128413),
(128513),
(128613),
(128713),
(128813),
(128913),
(129013),
(129113),
(129213),
(129313),
(129413),
(129513),
(129613),
(129713),
(129813),
(129913),
(130013),
(130113),
(130213),
(130313),
(130413),
(130513),
(130613),
(130713),
(130813),
(130913),
(131013),
(131113),
(131213),
(131313),
(131413),
(131513),
(131613),
(131713),
(131813),
(131913),
(132013),
(132113),
(132213),
(132313),
(132413),
(132513),
(132613),
(132713),
(132813),
(132913),
(133013),
(133113),
(133213),
(133313),
(133413),
(133513),
(133613),
(133713),
(133813),
(133913),
(134013),
(134113),
(134213),
(134313),
(134413),
(134513),
(134613),
(134713),
(134813),
(134913),
(135013),
(135113),
(135213),
(135313),
(135413),
(135513),
(135613),
(135713),
(135813),
(135913),
(136013),
(136113),
(136213),
(136313),
(136413),
(136513),
(136613),
(136713),
(136813),
(136913),
(137013),
(137113),
(137213),
(137313),
(137413),
(137513),
(137613),
(137713),
(137813),
(137913),
(138013),
(138113),
(138213),
(138313),
(138413),
(138513),
(138613),
(138713),
(138813),
(138913),
(139013),
(139113),
(139213),
(139313),
(139413),
(139513),
(139613),
(139713),
(139813),
(139913),
(140013);
unlock tables;

DROP PROCEDURE IF EXISTS filldates;
DELIMITER |
CREATE PROCEDURE filldates(dateStart DATE, dateEnd DATE)
BEGIN
  WHILE dateStart <= dateEnd DO
    INSERT INTO FoodOrder (FoodOrderTime) VALUES (dateStart);
    SET dateStart = date_add(dateStart, INTERVAL 1 DAY);
  END WHILE;
END;
|
DELIMITER ;
CALL filldates('2018-01-01','2021-04-18');

#SELECT * FROM FoodOrder;

UPDATE FoodOrder,Numbers
SET OrderID=NumberID
WHERE OrderID=OrderNum
AND OrderID <> NumberID;
#SELECT * FROM FoodOrder;
UPDATE FoodOrder
SET Price=2000
WHERE 1=1;


DROP TABLE IF EXISTS Payment;
CREATE TABLE Payment(
      PaymentID int NOT NULL AUTO_INCREMENT,
Amount decimal(6,2),
PaymentMethod varchar(50) NOT NULL DEFAULT 'Cash', PaymentDate DATE NOT NULL,
OrderID int NOT NULL DEFAULT 1204,
PRIMARY KEY (PaymentID),
FOREIGN KEY (OrderID) REFERENCES FoodOrder(OrderID) );


DROP PROCEDURE IF EXISTS filldates;
DELIMITER |
CREATE PROCEDURE filldates(dateStart DATE, dateEnd DATE)
BEGIN
  WHILE dateStart <= dateEnd DO
    INSERT INTO Payment (PaymentDate) VALUES (dateStart);
    SET dateStart = date_add(dateStart, INTERVAL 1 DAY);
  END WHILE;
END;
|
DELIMITER ;
CALL filldates('2018-01-01','2021-04-18');

UPDATE Payment,Numbers
SET Payment.OrderID=NumberID
WHERE Payment.PaymentID=OrderNum
AND OrderID <> NumberID;

UPDATE Payment
SET Amount=2000
WHERE 1=1;


UPDATE Staff
SET StaffSalary=1000
WHERE StaffPosition='Manager';
UPDATE Staff
SET StaffSalary=3000
WHERE StaffPosition='Director';
#SELECT * FROM Staff;


UPDATE SupplyOrder
SET SupplyOrderCost=200
WHERE SupplyOrderCost=1000;
#SELECT * FROM SupplyOrder;