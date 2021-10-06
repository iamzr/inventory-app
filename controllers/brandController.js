var Brand = require("../models/brand");
var Device = require("../models/device");

var async = require("async");
var { body, validationResult } = require("express-validator");

// Display list of all brands
exports.brand_list = function (req, res, next) {
  Brand.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, list_brands) {
      if (err) {
        return next(err);
      }
      res.render("brand_list", {
        title: "Brand List",
        brand_list: list_brands,
      });
    });
};

// Display detail page for a specific brand
exports.brand_detail = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.params.id).exec(callback);
      },

      brand_devices: function (callback) {
        Device.find({ brand: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.brand == null) {
        // No results
        var err = new Error("Brand not found");
        err.status = 404;
        return next(err);
      }

      // Successful, so render
      res.render("brand_detail", {
        title: results.brand.name,
        brand: results.brand,
        brand_devices: results.brand_devices,
      });
    }
  );
};

// Display Brand create form on GET
exports.brand_create_get = function (req, res) {
  res.render("brand_form", { title: "Create brand" });
};

// Handle Brand create on POST
exports.brand_create_post = [
  // Validate and sanatize
  body("name", "Brand name required").trim().isLength({ min: 1 }).escape(),

  // Process request afer validating and santizing
  (req, res, next) => {
    var errors = validationResult(req);

    // Create brand object with escaped and trimmed data
    var brand = new Brand({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised data
      res.render("brand_form", {
        title: "Create Brand",
        brand: brand,
        errors: errors.array,
      });
    } else {
      // Data from form is valid

      //Check to see if it already exists
      Brand.findOne({ name: req.body.name }).exec(function (err, found_brand) {
        if (err) {
          return next(err);
        }

        if (found_brand) {
          // Brand exists, redirect to its detail page
          res.redirect("../" + found_brand.url);
        } else {
          brand.save(function (err) {
            if (err) {
              return next(err);
            }

            // Brand saved. Redirect to the brand detail page
            res.redirect("../" + brand.url);
          });
        }
      });
    }
  },
];

// Display Brand delete form on GET
exports.brand_delete_get = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brands_devices: function (callback) {
        Device.find({ brand: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.brand == null) {
        // No results
        res.redirect("/inventory/brands");
      }

      // Succesful, so render
      res.render("brand_delete", {
        title: "Delete Brand",
        brand: results.brand,
        brand_devices: results.brands_devices,
      });
    }
  );
};

// Handle Brand delete form on POST
exports.brand_delete_post = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.body.brandid).exec(callback);
      },
      brands_devices: function (callback) {
        Device.find({ brand: req.body.brandid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.brands_devices.length > 0) {
        res.render("brand_delete", {
          title: "Delete Brand",
          brand: results.brand,
          brand_devices: results.brands_devices,
        });
        return;
      } else {
        // Brand has no books. Delete object and redirect to brands page
        Brand.findByIdAndRemove(req.body.brandid, function deleteBrand(err) {
          if (err) {
            console.log(err);
            return next(err);
          }
          res.redirect("/inventory/brands");
        });
      }
    }
  );
};

// Handle Brand update on GET
exports.brand_update_get = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.brand == null) {
        // No results
        var err = new Erro("Brand not found");
        err.status = 404;
        return next(err);
      }
      // Success
      res.render("brand_form", { title: "Update Brand", brand: results.brand });
    }
  );
};

// Handle Brand update on POST
exports.brand_update_post = [
  // Validate and sanatize
  body("name", "Brand name required").trim().isLength({ min: 1 }).escape(),

  // Process request afer validating and santizing
  (req, res, next) => {
    var errors = validationResult(req);

    // Create brand object with escaped and trimmed data
    var brand = new Brand({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised data
      res.render("brand_form", {
        title: "Create Brand",
        brand: brand,
        errors: errors.array,
      });
      return;
    } else {
      // Data from form is valid
      Brand.findByIdAndUpdate(
        req.params.id,
        brand,
        {},
        function (err, thebrand) {
          if (err) {
            return next(err);
          }
          res.redirect("/inventory/" + thebrand.url);
        }
      );
    }
  },
];
