const Device = require("../models/device");
var Stock = require("../models/stock");

var { body, validationResult } = require("express-validator");

// Display list of all stocks
exports.stock_list = function (req, res, next) {
  Stock.find()
    .populate("device")
    .exec(function (err, list_stock) {
      if (err) {
        return next(err);
      }
      res.render("stock_list", { title: "Stock List", stock_list: list_stock });
    });
};

// Display detail page for a specific stock
exports.stock_detail = function (req, res) {
  Stock.findById(req.params.id)
    .populate("device")
    .exec(function (err, stock) {
      if (err) {
        return next(err);
      }
      if (stock == null) {
        // NO results
        var err = new Error("Device not found");
        err.status = 404;
        return next(err);
      }

      // Successful, so render
      res.render("stock_detail", { title: stock.device.name, stock: stock });
    });
};

// Display Stock create form on GET
exports.stock_create_get = function (req, res, next) {
  Device.find({}, "name brand")
    .populate("brand")
    .exec(function (err, devices) {
      if (err) {
        return next(err);
      }
      res.render("stock_form", {
        title: "Adding items to current stock",
        device_list: devices,
      });
    });
};

// Handle Stock create on POST
exports.stock_create_post = [
  // Validate and santise fields
  body("device", "Device must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("number", "Number must be specified")
    .trim()
    .isNumeric({ min: 1 })
    .escape(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Stock object with santized data
    var stock = new Stock({
      device: req.body.device,
      number_in_stock: req.body.number,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with santized data
      Device.find({}, "name").exec(function (err, devices) {
        if (err) {
          return next(err);
        }
        // Successful, so render
        res.render("stock_form", {
          title: "Adding items to current stock",
          device_list: devices,
          selected_device: stock.device._id,
          errors: errors.array(),
        });
      });
    } else {
      // Data from form is valid.
      stock.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to the new record
        res.redirect(stock.url);
      });
    }
  },
];

// Display Stock delete form on GET
exports.stock_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED YET");
};

// Handle Stock delete form on POST
exports.stock_delete_post = function (req, res) {
  res.send("NOT IMPLEMENTED YET");
};

// Handle Stock update on POST
exports.stock_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED YET");
};

// Handle Stock update on POST
exports.stock_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED YET");
};
