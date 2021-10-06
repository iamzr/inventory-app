var Category = require("../models/category");
var Device = require("../models/device");
var async = require("async");

const { body, validationResult } = require("express-validator");

// Display list of all categorys
exports.category_list = function (req, res, next) {
  Category.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, list_category) {
      if (err) {
        return next(err);
      }
      res.render("category_list", {
        title: "Category List",
        category_list: list_category,
      });
    });
};
// Display detail page for a specific category
exports.category_detail = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },

      category_devices: function (callback) {
        Device.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results
        var err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("category_detail", {
        title: "Category Details",
        category: results.category,
        category_devices: results.category_devices,
      });
    }
  );
};

// Display category create form on GET
exports.category_create_get = function (req, res) {
  res.render("category_form", { title: "Create Category" });
};

// Handle Category create on POST
exports.category_create_post = [
  // Validate and sanatize
  body("name", "Category name required").trim().isLength({ min: 1 }).escape(),

  // Process request afer validating and santizing
  (req, res, next) => {
    var errors = validationResult(req);

    // Create category object with escaped and trimmed data
    var category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised data
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid

      //Check to see if it already exists
      Category.findOne({ name: req.body.name }).exec(function (
        err,
        found_category
      ) {
        if (err) {
          return next(err);
        }

        if (found_category) {
          // Category exists, redirect to its detail page
          res.redirect("../" + found_category.url);
        } else {
          category.save(function (err) {
            if (err) {
              return next(err);
            }

            // Category saved. Redirect to the category detail page
            res.redirect("../" + category.url);
          });
        }
      });
    }
  },
];

// Display Category delete form on GET
exports.category_delete_get = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      categories_devices: function (callback) {
        Device.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results
        res.redirect("/inventory/categorys");
      }

      // Succesful, so render
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        category_devices: results.categories_devices,
      });
    }
  );
};

// Handle Category delete form on POST
exports.category_delete_post = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      categories_devices: function (callback) {
        Device.find({ category: req.body.categoryid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.categories_devices.length > 0) {
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          category_devices: results.categories_devices,
        });
        return;
      } else {
        // Category has no books. Delete object and redirect to categorys page
        Category.findByIdAndRemove(
          req.body.categoryid,
          function deleteCategory(err) {
            if (err) {
              console.log(err);
              return next(err);
            }
            res.redirect("/inventory/categories");
          }
        );
      }
    }
  );
};

// Handle Category update on GET
exports.category_update_get = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results
        var err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("category_form", {
        title: "Update category",
        category: results.category,
      });
    }
  );
};

// Handle Category update on POST
exports.category_update_post = [
  body("name", "Category name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    // Create category object with escaped and trimmed data
    var category = new Category({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitised data
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid

      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        function (err, thecategory) {
          if (err) {
            return next(err);
          }
          res.redirect("/inventory/" + thecategory.url);
        }
      );
    }
  },
];
