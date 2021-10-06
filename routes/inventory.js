var express = require("express");
var router = express.Router();

// Require controller modules
var device_controller = require("../controllers/deviceController");
var brand_controller = require("../controllers/brandController");
var category_controller = require("../controllers/categoryController");
var stock_controller = require("../controllers/stockController");

//// Device Routes ////

// GET inventory homepage
router.get("/", device_controller.index);

// GET request for creating a Device. Note: THis has to come before routes that display DEvice (uses id)
router.get("/device/create", device_controller.device_create_get);

// POST request for creating a Device
router.post("/device/create", device_controller.device_create_post);

// GET request for deleting a Device
router.get("/device/:id/delete", device_controller.device_delete_get);

// POST request for deleting a Device
router.post("/device/:id/delete", device_controller.device_delete_post);

// GET request for updating a Device
router.get("/device/:id/update", device_controller.device_update_get);

// POST request for updating a Device
router.post("/device/:id/update", device_controller.device_update_post);

// GET request for one Device
router.get("/device/:id", device_controller.device_detail);

// Get request for all Devices
router.get("/devices", device_controller.device_list);

//// Brand Routes ////

// GET request for creating a Brand. Note: THis has to come before routes that display DEvice (uses id)
router.get("/brand/create", brand_controller.brand_create_get);

// POST request for creating a Brand
router.post("/brand/create", brand_controller.brand_create_post);

// GET request for deleting a Brand
router.get("/brand/:id/delete", brand_controller.brand_delete_get);

// POST request for deleting a Brand
router.post("/brand/:id/delete", brand_controller.brand_delete_post);

// GET request for updating a Brand
router.get("/brand/:id/update", brand_controller.brand_update_get);

// POST request for updating a Brand
router.post("/brand/:id/update", brand_controller.brand_update_post);

// GET request for one Brand
router.get("/brand/:id", brand_controller.brand_detail);

// Get request for all Brands
router.get("/brands", brand_controller.brand_list);

//// Stock Routes ////

// GET request for creating a Stock. Note: THis has to come before routes that display DEvice (uses id)
router.get("/stock/create", stock_controller.stock_create_get);

// POST request for creating a Stock
router.post("/stock/create", stock_controller.stock_create_post);

// GET request for deleting a Stock
router.get("/stock/:id/delete", stock_controller.stock_delete_get);

// POST request for deleting a Stock
router.post("/stock/:id/delete", stock_controller.stock_delete_post);

// GET request for updating a Stock
router.get("/stock/:id/update", stock_controller.stock_update_get);

// POST request for updating a Stock
router.post("/stock/:id/update", stock_controller.stock_update_get);

// GET request for one Stock
router.get("/stock/:id", stock_controller.stock_detail);

// Get request for all Stocks
router.get("/stock", stock_controller.stock_list);

//// Category Routes ////

// GET request for creating a Category. Note: THis has to come before routes that display DEvice (uses id)
router.get("/category/create", category_controller.category_create_get);

// POST request for creating a Category
router.post("/category/create", category_controller.category_create_post);

// GET request for deleting a Category
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request for deleting a Category
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request for updating a Category
router.get("/category/:id/update", category_controller.category_update_get);

// POST request for updating a Category
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one Category
router.get("/category/:id", category_controller.category_detail);

// Get request for all Categorys
router.get("/categories", category_controller.category_list);

// Export
module.exports = router;
