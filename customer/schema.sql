DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE product(
  item_id INT(10) AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(20) NOT NULL,
  department_name VARCHAR(20) NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_quantity INT(10) DEFAULT 1,
  PRIMARY KEY (item_id)
);

INSERT INTO product (product_name, department_name, price, stock_quantity)
VALUES ("iphone7", "electronic", 400, 20), ("macbookair", "electronic", 800, 15), ("macbookpro", "electronic", 1300, 15), ("postit", "office", 3.99, 100), ("paper", "office", 6.50, 100), ("orange", "food", 5, 50), ("chicken", "food", 15, 50), ("candy", "food", 3.99, 50), ("paper clip", "office", 1.99, 50), ("gaming mouse", "electronic", 49.99, 50);

SELECT*FROM product;
