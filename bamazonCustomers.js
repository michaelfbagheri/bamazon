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


function showtable() {
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
        var stock = res;
        takeCustomerOrder(stock);
    });
};

function takeCustomerOrder(stock) {

    inquirer.prompt([{
        name: 'choice',
        type: 'input',
        message: 'Please enter ID of itme you would like to purchase?'
    },
    {
        name: 'qty',
        type: 'input',
        message: 'Please enter quantity?'
    }]).then(function (answer) {
        var reqId = parseInt(answer.choice);
        var reqQty = parseInt(answer.qty);


        for (var i in stock) {
            if (stock[i].item_id === reqId && stock[i].stock_quantity >= reqQty) {
                var newQty = stock[i].stock_quantity - reqQty;
                var customerTotal = stock[i].price * reqQty
                var query = "UPDATE products SET stock_quantity = " + newQty + " WHERE item_id = " + reqId;
                connection.query(query, function (err, res) {
                    if (err) throw err;
                    console.log('Please prepare credit card, your total is $' + customerTotal)
                    theloop(res);
                })
            }
            else if (stock[i].item_id === reqId && stock[i].stock_quantity < reqQty) {
                console.log('very sorry we dont have that many in stock');
                theloop();
            }

        }


    });

};


showtable();


function theloop(someinfo) {

    inquirer.prompt({
        name: 'contLoop',
        type: 'input',
        message: 'Would you like to make another purchase?'
    }).then(function (answer) {
        var response = answer.contLoop
        if (response.toLowerCase() === 'yes' || response.toLowerCase() === 'y') {
            showtable();
        }
        else {
            connection.end();
        }
    });
    return someinfo;
}





