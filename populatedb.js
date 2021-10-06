#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/

var async = require("async");
var Device = require("./models/device");
var Stock = require("./models/stock");
var Category = require("./models/category");
var Brand = require("./models/brand");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var brands = [];
var categories = [];
var devices = [];
var stocks = [];

function deviceCreate(device_name, brand, screen_size, ram, device_type, cb) {
  var deviceDetail = {
    device_name,
    brand,
    screen_size,
    ram,
    device_type,
  };

  var device = new Device(deviceDetail);

  device.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Device: " + device);
    devices.push(device);
    cb(null, device);
  });
}

function brandCreate(name, cb) {
  var brand = new Brand({ brand: name });

  brand.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Brand: " + brand);
    brands.push(brand);
    cb(null, brand);
  });
}

function categoryCreate(name, cb) {
  var category = new Category({ category: name });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function stockCreate(device, number_in_stock, cb) {
  var stock = new Stock({ device, number_in_stock });

  stock.save(function (err) {
    if (err) {
      console.log("ERROR CREATING Stock instance : " + stock);
      cb(err, null);
      return;
    }
    console.log("New device item added to stock: " + stock);
    stocks.push(stock);
    cb(null, stock);
  });
}

function createBrandsCategories(cb) {
  async.series(
    [
      function (callback) {
        brandCreate("Apple", callback);
      },

      function (callback) {
        brandCreate("Samsung", callback);
      },

      function (callback) {
        brandCreate("Motorola", callback);
      },

      function (callback) {
        categoryCreate("Tablet", callback);
      },

      function (callback) {
        categoryCreate("Device", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createDevices(cb) {
  async.parallel(
    [
      function (callback) {
        deviceCreate("iPhone X", brands[0], 5.85, 3, categories[1], callback);
      },

      function (callback) {
        deviceCreate(
          "Galaxy S12",
          brands[1],
          6.17,
          12,
          categories[1],
          callback
        );
      },

      function (callback) {
        deviceCreate("Moto G60", brands[2], 6.78, 6, categories[1], callback);
      },

      function (callback) {
        deviceCreate("iPad", brands[0], 10.2, 3, categories[0], callback);
      },
    ],
    // optional callback
    cb
  );
}

function createStock(cb) {
  async.parallel(
    [
      function (callback) {
        stockCreate(devices[0], 50, callback);
      },

      function (callback) {
        stockCreate(devices[1], 42, callback);
      },

      function (callback) {
        stockCreate(devices[2], 30, callback);
      },

      function (callback) {
        stockCreate(devices[3], 23, callback);
      },
    ],
    // Optional callback
    cb
  );
}

async.series(
  [createBrandsCategories, createDevices, createStock],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Stocks " + stocks);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
