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

function showStock() {
  connection.query("SELECT*FROM product", function(err, res) {
    if (err) throw err;
    console.log("\n");
    for (var i = 0; i < res.length; i++) {
      console.log("ID: "+res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price:" + res[i].price + " || Quantity: " + res[i].stock_quantity);
    }
  })
}
function quantitySelect(item, max, price, id){
  console.log("We have "+max+" of "+item);
  inquirer.prompt({
    name:"quantity",
    type:"input",
    message:"How many item would you like to buy? (only #)"
  }).then(function(answer){
    if(answer.quantity%1!=0 ||answer.quantity<0){
      console.log("Please enter only # quantity")
      return quantitySelect(item, max, price, id);
    }else if (answer.quantity==0) {
      console.log("You answered 0 lets go back to choices of items");
      return buy();
    }else if(answer.quantity>max){
      console.log("Insufficient quantity!");
      return quantitySelect(item, max, price, id);
    }else{
      console.log("Thank you for your purchase");
      console.log("-----------------------------");
      console.log("Item: "+item+"-----"+price);
      console.log("-------------x"+answer.quantity);
      console.log("total-------$"+answer.quantity*price);
      console.log("-----------------------------");
      var minus= max-answer.quantity;
      return updateItem(id, minus);
    }
  });
}
function updateItem(id, quantity){
  connection.query("UPDATE product SET ? WHERE ?",[{stock_quantity:quantity},{item_id: id}],function(err, res){
    console.log(res.affectedRows + " products updated!\n");
    return welcome();
  })
}

function buy(){
  connection.query("SELECT*FROM product", function(err, res){
    if (err) throw err;
    var choiceArr=["GO BACK"];
    var idArr=[];
    for (var i = 0; i < res.length-1; i++) {
      choiceArr.push(res[i].product_name);
      idArr.push(res[i].item_id);
    }
    inquirer.prompt({
      name:"item",
      type:"list",
      message:"What would you like to buy?",
      choices: choiceArr
    })
    .then(function(answer){
      if (answer.item=="GO BACK") {
        return welcome();
      }
      var id=idArr[choiceArr.indexOf(answer.item)-1];
      connection.query("SELECT*FROM product WHERE ?",{item_id:id},function(err, res){
        if (err) throw err;
        console.log(res);
        var max=res[0].stock_quantity;
        var price=res[0].price;
        quantitySelect(answer.item, max, price, id);
      })

    })
  })
}

function welcome() {
  inquirer
    .prompt({
      name: "todo",
      type: "list",
      message: "What would you like to do?",
      choices: ["BUY!", "Show what Bamazon has", "QUIT"]
    })
    .then(function(answer) {

      if (answer.todo=="QUIT") {
        connection.end();
      }else if (answer.todo=="Show what Bamazon has") {
        showStock();
        welcome();
      }else if (answer.todo=="BUY!") {
        buy();
      }

      });
};
welcome();
