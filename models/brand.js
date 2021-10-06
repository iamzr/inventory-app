var mongoose = require("mongoose");

// Define schema
var Schema = mongoose.Schema;

var BrandSchema = new Schema({
  name: { type: String, required: true },
});

// Virtual for device url
BrandSchema.virtual("url").get(function () {
  return "brand/" + this._id;
});

// Export model
module.exports = mongoose.model("Brand", BrandSchema);
