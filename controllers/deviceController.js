var Device = require("../models/device");
var Brand = require("../models/brand");
var Category = require("../models/category");
var Stock = require("../models/stock");

var async = require("async");
var { body, validationResult } = require("express-validator");
const { InsufficientStorage } = require("http-errors");

exports.index = function (req, res) {
  async.parallel(
    {
      device_count: function (callback) {
        Device.count({}, callback);
      },
      total_stock: function (callback) {
        Stock.countDocuments({}, callback);
      },
      brand_count: function (callback) {
        Brand.countDocuments({}, callback);
      },
      category_count: function (callback) {
        Category.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Inventory Overview",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all devices
exports.device_list = function (req, res, next) {
  Device.find({}, "name brand")
    .sort({ title: 1 })
    .populate("brand")
    .exec(function (err, list_devices) {
      if (err) {
        return next(err);
      }
      res.render("device_list", {
        title: "Device List",
        device_list: list_devices,
      });
    });
};

// Display detail page for a specific device
exports.device_detail = function (req, res, next) {
  async.parallel(
    {
      device: function (callback) {
        Device.findById(req.params.id)
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
      stock: function (callback) {
        Stock.find({ device: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.device == null) {
        // No results
        var err = new Error("Device not found");
        err.status = 404;
        return next(err);
      }
      var stock;
      if (results.stock.number_in_stock === 0) {
        stock = "Out of stock";
      } else if (results.stock.number_in_stock < 20) {
        stock = "Low stock";
      } else {
        stock = "In stock";
      }

      //Successful, so render
      res.render("device_detail", {
        title: "Device Details",
        device: results.device,
        stock: stock,
      });
    }
  );
};

// Display Device create form on GET
exports.device_create_get = function (req, res, next) {
  async.parallel(
    {
      brands: function (callback) {
        Brand.find(callback);
      },
      categories: function (callback) {
        Category.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("device_form", {
        title: "Create Device",
        brands: results.brands,
        categories: results.categories,
      });
    }
  );
};

// Handle Device create on POST
// exports.device_create_post = function (req, res) {
//   res.send("Not implmement");
// };
exports.device_create_post = [
  //Converts the categories to an array
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") {
        req.body.category = [];
      } else {
        req.body.category = new Array(req.body.category);
      }
    }
    next();
  },

  // Validate and sanatize
  body("name", "Device name required").trim().isLength({ min: 1 }).escape(),
  body("brand", "Brand must not be empty").escape(),
  body("screen", "Screen size must not be empty").trim().escape(),
  body("ram", "RAM must not be empty").trim().escape(),
  body("categroy.*").escape(),

  // Process request afer validating and santizing
  (req, res, next) => {
    var errors = validationResult(req);

    // Create device object with escaped and trimmed data
    var device = new Device({
      name: req.body.name,
      brand: req.body.brand,
      screen_size: req.body.screen,
      ram: req.body.ram,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised data

      // Get al brands and categories
      async.parallel(
        {
          brands: function (callback) {
            Brand.find(callback);
          },

          categories: function (callback) {
            Category.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected categories as checked
          for (let i = 0; i < results.categories.length; i++) {
            if (device.category.indexOf(results.categories[i]._id) > -1) {
              results.categories[i].checked = "true";
            }
          }
          res.render("device_form", {
            title: "Create Device",
            brands: results.brands,
            categories: results.categories,
            device: device,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from for is valid. Save Device.

      device.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("../" + device.url);
      });
    }
  },
];

// Display Device delete form on GET
exports.device_delete_get = function (req, res, next) {
  async.parallel(
    {
      device: function (callback) {
        Device.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.device == null) {
        // No results
        res.redirect("inventory/devices");
      }
      // Successful, so render
      res.render("device_delete", {
        title: "Delete Device",
        device: results.device,
      });
    }
  );
};

// Handle Device delete form on POST
exports.device_delete_post = function (req, res, next) {
  // async.parallel({
  //   device: function(callback) {
  //     Device.findById(req.body.deviceid).exec(callback)
  //   }
  // }, function (err, results) {
  //   if (err) {
  //     return next(err)
  //   }
  //   // Success
  Device.findByIdAndRemove(req.body.deviceid, function deleteDevice(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/inventory/devices");
  });
  // })
};

// Handle Device update on GET
exports.device_update_get = function (req, res, next) {
  async.parallel(
    {
      device: function (callback) {
        Device.findById(req.params.id)
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
      brands: function (callback) {
        Brand.find(callback);
      },
      categories: function (callback) {
        Category.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.device == null) {
        // No result
        var err = new Error("no device found");
        err.status = 404;
        return next(err);
      }

      // Success
      // Mark our selected genres as checked.
      for (
        var all_c_iter = 0;
        all_c_iter < results.categories.length;
        all_c_iter++
      ) {
        for (
          var device_c_iter = 0;
          device_c_iter < results.device.category.length;
          device_c_iter++
        ) {
          if (
            results.categories[all_c_iter]._id.toString() ===
            results.device.category[device_c_iter]._id.toString()
          ) {
            results.categories[all_c_iter].checked = "true";
          }
        }
      }
      res.render("device_form", {
        title: "Update Device",
        brands: results.brands,
        categories: results.categories,
        device: results.device,
      });
    }
  );
};

// Handle Device update on POST
exports.device_update_post = [
  //Converts the categories to an array
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") {
        req.body.category = [];
      } else {
        req.body.category = new Array(req.body.category);
      }
    }
    next();
  },

  // Validate and sanatize
  body("name", "Device name required").trim().isLength({ min: 1 }).escape(),
  body("brand", "Brand must not be empty").escape(),
  body("screen", "Screen size must not be empty").trim().escape(),
  body("ram", "RAM must not be empty").trim().escape(),
  body("categroy.*").escape(),

  // Process request afer validating and santizing
  (req, res, next) => {
    var errors = validationResult(req);

    // Create device object with escaped and trimmed data and old id
    var device = new Device({
      name: req.body.name,
      brand: req.body.brand,
      screen_size: req.body.screen,
      ram: req.body.ram,
      category:
        typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised data
      console.log("eerrrrorss");
      console.log(errors);
      // Get all brands and categories
      async.parallel(
        {
          brands: function (callback) {
            Brand.find(callback);
          },

          categories: function (callback) {
            Category.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected categories as checked
          for (let i = 0; i < results.categories.length; i++) {
            if (device.category.indexOf(results.categories[i]._id) > -1) {
              results.categories[i].checked = "true";
            }
          }
          res.render("device_form", {
            title: "Update Device",
            brands: results.brands,
            categories: results.categories,
            device: device,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save Device.
      console.log("saved");
      Device.findByIdAndUpdate(
        req.params.id,
        device,
        {},
        function (err, thedevice) {
          if (err) {
            return next(err);
          }
          res.redirect("/inventory/" + thedevice.url);
        }
      );
    }
  },
];
