var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    readProducts();
});

//display  10 bamazon items
function readProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // display all results of the SELECT statement in table
        console.table(res);
        buyProduct();
    });
}

//function to validate user entry
function validatePurchase(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);

    if (integer && (sign === 1)) {
        return true;
    } else {
        return "Please enter a valid number"
    }
}

function buyProduct() {
    // query the database for all items for sale
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
        inquirer
            .prompt([
                {
                    name: "id",
                    type: "input",
                    message: "What item would you like to purchase (please indicate ID #)?",
                    validate: validatePurchase,
                    filter: Number
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to purchase?",
                    validate: validatePurchase,
                    filter: Number
                }
            ])
            .then(function (answer) {
                // get the information of the chosen item
                var chosenItem = answer.id;
                var purchaseQty = answer.quantity;

                var query = "SELECT * FROM products WHERE ?";

                connection.query(query, { id: chosenItem }, function (err, data) {
                    if (err) throw err;

                    if (data.length === 0) {
                        console.log("Please select a valid item ID");
                    } else {
                        var productInfo = data[0];

                        if (purchaseQty <= productInfo.stock_quantity) {
                            console.log("PLACEHOLDER MESSAGE - ITEM ORDER SUCCESS")

                            var updateTable = "UPDATE products SET stock_quantity = " + (productInfo.stock_quantity - purchaseQty) + " WHERE id = " + chosenItem;

                            connection.query(updateTable, function (err, data) {
                                if (err) throw err;

                                console.log("PLACEHOLDER MESSAGE #2");
                                connection.end();
                            })
                        } else {
                            console.log("SORRY NOT ENOUGH IN STOCK");
                            readProducts();
                        }
                    }
                })

            });



    });
}