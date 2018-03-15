var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
});
var lowStockItem = {
  id: [],
  name: []
}

function welcome() {
  inquirer.prompt({
    name: "welcome",
    type: "list",
    message: "You are on MANAGER MODE select:",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "QUIT"]
  }).then(function(answer) {
    switch (answer.welcome) {
      case "View Products for Sale":
        console.log("\nVIEW ALL\n");
        showStock();
        break;
      case "View Low Inventory":
        lowStock();
        break;
      case "Add to Inventory":
        addInventory();
        break;
      case "Add New Product":
        addNew();
        break;
      case "QUIT":
        connection.end();
        break;

    }

  })
}

function showStock() {
  connection.query("SELECT*FROM product", function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      console.log("ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price:" + res[i].price + " || Quantity: " + res[i].stock_quantity);
    }
    console.log("\n");
    return welcome();
  })
}

function lowStock() {

  connection.query("SELECT*FROM product WHERE `stock_quantity`<=5", function(err, res) {
    if (err) throw err;
    if (res) {
      console.log("\n");
      console.log("ALERT! THERE IS ITEM WITH LOW INVENTORY")
      for (var i = 0; i < res.length; i++) {
        console.log("ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price:" + res[i].price + " || Quantity: " + res[i].stock_quantity);
        lowStockItem.id.push(res[i].item_id);
        lowStockItem.name.push(res[i].product_name);
      }
      console.log("\n");
    }
    return welcome();
  })
}

function addNew() {
  var nameItem = "";
  var departmentItem = "";
  var priceItem = 0;
  var stockItem = 0;

  function first() {
    inquirer.prompt({
      name: "name",
      type: "input",
      message: "ENTER NAME OF THE NEW ITEM",
    }).then(function(answer) {
      connection.query("SELECT product_name FROM product", function(err, res) {
        if (err) throw err;
        if (res.indexOf(answer.name) < 0) {
          nameItem = answer.name;
          return second();
        } else {
          console.log("THIS ITEM IS ALREADY IN THE SYSTEM");
          return welcome();
        }
      })
    })
  }

  function second() {
    inquirer.prompt({
      name: "department",
      type: "list",
      message: "ENTER DEPARTMENT NAME FOR ITEM",
      choices: ["electronic", "food", "office", "null"],
    }).then(function(answer) {
      departmentItem = answer.department;
      return third();
    })
  }

  function third() {
    inquirer.prompt({
      name: "price",
      type: "input",
      message: "ENTER UNIT PRICE FOR THE NEW ITEM"
    }).then(function(answer) {
      if (answer.price % 1 != 0) {
        console.log("Please enter numerical value");
        return third();
      } else if (answer.price == 0) {
        console.log("YOU ARE FIRED! WE DO NOT SELL ITEMS FOR FREE!!");
        connection.end();
      } else {
        priceItem += answer.price;
        return fourth();
      }
    })
  }


  function fourth() {
    inquirer.prompt({
      name: "stock",
      type: "input",
      message: "ENTER QUANTITY OF THE NEW ITEM IN STOCK"
    }).then(function(answer) {
        if (answer.stock % 1 != 0) {
          console.log("Please enter numerical value");
          return fourth();
        } else if (answer.stock == 0) {
          console.log("ARE YOU SURE? IF THERE IS NO ITEM IN STOCK, DO NOT ADD IT! TRY AGAIN!");
          return fourth();
        } else {
          stockItem += answer.stock;
          var query="INSERT INTO product (product_name, department_name, price, stock_quantity) VALUES ('" + nameItem + "', '" + departmentItem + "', " + priceItem + ", " + stockItem + ")";
          console.log(query);
          connection.query(query, function(err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " products added!\n");
              return welcome();
            });


          }
        })
    }
    first();
  }

  function addInventory() {
    var addID = "";
    var addmany = 0;

    function itemID() {
      inquirer.prompt({
        name: "itemID",
        type: "input",
        message: "ENTER ITEM_ID NUMBER TO ADD ITEM (only item that is Low in stock)"
      }).then(function(answer) {
        if (answer.itemID % 1 != 0) {
          console.log("Please enter numerical value");
          return itemID();
        } else if (lowStockItem.id.indexOf(parseInt(answer.itemID)) < 0) {
          console.log("ITEM NOT EXISTS");
          return itemID();
        } else {
          addID = answer.itemID;
          return quantity();
        }
      })
    }

    function quantity() {
      inquirer.prompt({
        name: "quantity",
        type: "input",
        message: "ENTER HOW MANY ITEM YOU ARE ADDING"
      }).then(function(answer) {
        if (answer.quantity % 1 != 0 && answer.quantity != 0) {
          console.log("Please enter numerical value and not Zero");
          return quantity();
        } else {
          addmany = answer.quantity;
          return final();
        }
      });
    }

    function final() {
      connection.query("UPDATE product SET ? WHERE ?", [{
        stock_quantity: addmany
      }, {
        item_id: addID
      }], function(err, res) {
        console.log(res.affectedRows + " products updated!\n");
        return welcome();
      })
    }
    itemID();
  }
  lowStock();
