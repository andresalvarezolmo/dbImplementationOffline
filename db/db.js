var mysql = require('mysql');
const { promisify } = require('util');

var query1 = "select * from Address;"
var query2 = "SELECT RestaurantName, AddressID, StreetNo, StreetName, Postcode, City FROM Restaurant, Address WHERE Restaurant.RestaurantAddress = Address.AddressID and Postcode Like 'dd1%';"


const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '1234',
    database: '20ac3d09',
    multipleStatements: true
});
connection.query = promisify(connection.query);

connection.connect((err)=>{
    if (err) console.log(err);
    console.log("Feelsgoodman")
});
// connection.query(query1,(err, result)=>{
//     if(err) console.log(err);
//     console.log("Query 1: ");
//     console.log(result);
// });
// connection.query(query2,(err, result)=>{
//     if(err) console.log(err);
//     console.log("Query 2: ");
//     console.log(result);
// });

module.exports = connection;
