var mysql = require('mysql');
var inquirer = require('inquirer');
var promise = require('bluebird');
const util = require('util');
var Table = require('cli-table');




var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1qazMKO)',
    database: 'bamazonDB'
});

connection.connect(function (err) {
    if (err) throw err;
    // connection.end();   

});


function managerMainPage() {
    inquirer.prompt({
        type: 'list',
        name: 'mainMenu',
        message: 'please choose from the menu:',
        choices: [
            'View Porducts for Sale',
            'View Low Inventory',
            'Add to existing Inventory',
            'Add a new Product'
        ]
    }).then(answer => {
        console.log(answer.mainMenu)
        if (answer.mainMenu === 'View Porducts for Sale') {
            connection.query('SELECT * FROM products', function (err, res) {
                if (err) throw err;
                var table = new Table({
                    head: ['Item ID', 'Product Name', 'Price']
                  , colWidths: [10,25,10]
                });

                for (var i in res) {
                    var test = '$'
                    test = test + res[i].price
                    table.push(
                        [res[i].item_id, res[i].product_name,test]
                        );
                }
                console.log(table.toString());
                console.log('\n')
                startPage();
            })
        }
        else if (answer.mainMenu === 'View Low Inventory') {
            connection.query('SELECT * FROM products WHERE stock_quantity < 50', function (err, res) {
                if (err) throw err;
                var table = new Table({
                    head: ['Item ID', 'Product Name', 'Qty in Stock']
                  , colWidths: [10,25,20]
                });
                for (var i in res) {
                    table.push(
                        [res[i].item_id,res[i].product_name,res[i].stock_quantity]
                    )
                    // console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].stock_quantity)
                }
                console.log(table.toString());
                console.log('\n')
                startPage();
            })


        }
        else if (answer.mainMenu === 'Add a new product') {
            inquirer.prompt([{
                type: 'input',
                name: 'itemToAddName',
                message: 'What item would you like to add to the inventory:'
            },
            {
                type: 'input',
                name: 'itemToAddQty',
                message: 'How many units will you be adding to the inventory:'
            },
            {
                type: 'input;',
                name: 'itemToAddDepartment',
                message: 'What department would you like to enter this stock into:'
            },
            {
                type: 'input;',
                name: 'itemToAddPrice',
                message: 'What is the sale unit price of this product:'
            }]).then(function (answer) {
                var query = "INSERT INTO products (product_name,department_name,price,stock_quantity) VALUE ('" + answer.itemToAddName + "','" + answer.itemToAddDepartment + "'," + answer.itemToAddPrice + "," + answer.itemToAddQty + ")";
                connection.query(query, function (err, res) {
                    if (err) throw err;
                    console.log('New item has been added to the database');
                    console.log('\n')
                    startPage();
                })
            })
        }
        else if (answer.mainMenu === 'Add to existing Inventory') {
            inquirer.prompt([
                {
                    name: 'idInventoryAdd',
                    type: 'input',
                    message: 'Please enter product ID:'
                },
                {
                    name: 'idInventoryAddQty',
                    type: 'input',
                    message: 'Please enter Qty of inventory being added:'
                }
            ]).then(function (answer) {
                var newQty = parseInt(answer.idInventoryAddQty);
                var itemId = parseInt(answer.idInventoryAdd)
                var query = "SELECT stock_quantity FROM products WHERE item_id = " + itemId;
                connection.query(query, function (err, res) {
                    if (err) throw err;
                    var test = JSON.stringify(res[0].stock_quantity)
                    newQty = newQty + parseInt(test);
                    query = 'UPDATE products SET stock_quantity =' + newQty + ' WHERE item_id = ' + itemId;
                    connection.query(query, function (err, res) {
                        if (err) throw err;
                        console.log('qty has been updated')
                        console.log('\n');
                        startPage();
                    })
                })
            })
        }
    });
};




function startPage() {
    inquirer.prompt({
        name: 'doYouWantToStart',
        type: 'list',
        choices: [
            'Main Menu',
            'Quit'
        ]
    }).then(function (answer) {
        if (answer.doYouWantToStart === 'Main Menu') {
            console.log('\n')
            managerMainPage();
        }
        else {
            connection.end();
        }
    })
}

startPage();