USE 20ac3d09;

#number of orders per day for a month for one restaurant
SELECT RestaurantName, convert(FoodOrderTime,DATE) as fooddate, COUNT(DISTINCT(FoodOrderTime)) as n_of_orders 
FROM Restaurant, FoodOrder
WHERE Restaurant.RestaurantName='my mifan' AND (FoodOrder.FoodOrderTime >='2020-10-01' AND FoodOrder.FoodOrderTime<='2020-10-31') AND OrderID LIKE '%3'
GROUP BY RestaurantName,fooddate WITH ROLLUP;

#number of orders per month for the last 3 months for one restaurant
SELECT RestaurantName, extract(YEAR_MONTH FROM FoodOrderTime) as foodmonth, COUNT(DISTINCT(FoodOrderTime)) as n_of_orders 
FROM Restaurant, FoodOrder
WHERE Restaurant.RestaurantName='my mifan' AND (FoodOrder.FoodOrderTime >='2020-09-01' AND FoodOrder.FoodOrderTime<='2020-11-30') AND OrderID LIKE '%3'
GROUP BY RestaurantName,foodmonth WITH ROLLUP;

#number of orders per year for the last 3 years for one restaurant
SELECT RestaurantName, extract(YEAR FROM FoodOrderTime) as foodyear, COUNT(DISTINCT(FoodOrderTime)) as n_of_orders 
FROM Restaurant, FoodOrder
WHERE Restaurant.RestaurantName='The Bread Bar' AND (FoodOrder.FoodOrderTime >='2018-01-01' AND FoodOrder.FoodOrderTime<='2020-12-31') AND OrderID LIKE '%1'
GROUP BY RestaurantName,foodyear WITH ROLLUP;

#number of orders per year for the last 3 years for all restaurants
#2020 2019 and 2018
SELECT RestaurantName, extract(YEAR FROM FoodOrderTime) as foodyear, COUNT(DISTINCT(FoodOrderTime)) as n_of_orders 
FROM Restaurant, FoodOrder
WHERE Restaurant.RestaurantID=RIGHT(FoodOrder.OrderID,1) AND (FoodOrder.FoodOrderTime >='2018-01-01' AND FoodOrder.FoodOrderTime<='2020-12-31') AND (OrderID LIKE '%1' OR OrderID LIKE '%2' OR OrderID LIKE '%3')
GROUP BY RestaurantName,foodyear WITH ROLLUP;

#revenue per month for a year
WITH 
incometable (incomeyearmonth,income) AS (SELECT extract(YEAR_MONTH FROM PaymentDate),SUM(Amount) 
FROM Payment
WHERE (Payment.PaymentDate LIKE '2018%')
group by extract(YEAR_MONTH FROM PaymentDate)),
supplycost (monthAndYear,cost) AS (SELECT extract(YEAR_MONTH FROM SupplyOrderDate),SUM(SupplyOrderCost) 
FROM SupplyOrder
WHERE (SupplyOrder.SupplyOrderDate LIKE '2018%')
group by extract(YEAR_MONTH FROM SupplyOrderDate)),
staffcosttable (staffcost) AS (SELECT SUM(StaffSalary) FROM Staff)
SELECT monthAndYear,(income-cost-staffcost) AS revenue
FROM supplycost,incometable,staffcosttable
WHERE incometable.incomeyearmonth=supplycost.monthAndYear;

#revenue per year for 3 years
WITH 
incometable (incomeyear,income) AS (SELECT extract(YEAR FROM PaymentDate),SUM(Amount) 
FROM Payment
WHERE (Payment.PaymentDate >='2018-01-01' AND Payment.PaymentDate<='2020-12-31')
group by extract(YEAR FROM PaymentDate)),
supplycost (supplyorderyear,cost) AS (SELECT extract(YEAR FROM SupplyOrderDate),SUM(SupplyOrderCost) 
FROM SupplyOrder
WHERE (SupplyOrder.SupplyOrderDate >='2018-01-01' AND SupplyOrder.SupplyOrderDate<='2020-12-31')
group by extract(YEAR FROM SupplyOrderDate)),
staffcosttable (staffcost) AS (SELECT (SUM(StaffSalary)*12) FROM Staff)
SELECT supplyorderyear,(income-cost-staffcost) AS revenue
FROM supplycost,incometable,staffcosttable
WHERE incometable.incomeyear=supplycost.supplyorderyear;

#number of registered customers
SELECT Count(CustomerID) AS number_of_customers FROM Customer;

#Total number of staff
SELECT Count(StaffID) AS number_of_staff FROM Staff;
#Number of managers
SELECT Count(StaffID) AS number_of_managers
FROM Staff
WHERE StaffPosition='Manager';
#Number of Chefs
SELECT Count(StaffID) AS number_of_chefs
FROM Staff
WHERE StaffPosition='Chef';
#Number of Waiters
SELECT Count(StaffID) AS number_of_waiters
FROM Staff
WHERE StaffPosition='Waiter';

#full potential not reached until I put more data into database
#but these queries all work
#number of orders per day for a month for all restaurants
#for the month of november
SELECT RestaurantName, convert(FoodOrderTime,DATE) as fooddate, COUNT(DISTINCT(FoodOrderTime)) as n_of_orders 
FROM Restaurant, FoodOrder
WHERE Restaurant.RestaurantID=RIGHT(FoodOrder.OrderID,1) AND (FoodOrder.FoodOrderTime >='2020-11-01' AND FoodOrder.FoodOrderTime<='2020-11-30') AND (OrderID LIKE '%1' OR OrderID LIKE '%2' OR OrderID LIKE '%3')
GROUP BY RestaurantName,fooddate WITH ROLLUP;

#number of orders per month for the last 3 months for all restaurants
#september october and november
SELECT RestaurantName, extract(YEAR_MONTH FROM FoodOrderTime) as foodmonth, COUNT(DISTINCT(FoodOrderTime)) as n_of_orders 
FROM Restaurant, FoodOrder
WHERE Restaurant.RestaurantID=RIGHT(FoodOrder.OrderID,1)AND (FoodOrder.FoodOrderTime >='2020-09-01' AND FoodOrder.FoodOrderTime<='2020-11-30') AND (OrderID LIKE '%1' OR OrderID LIKE '%2' OR OrderID LIKE '%3')
GROUP BY RestaurantName,foodmonth WITH ROLLUP;
