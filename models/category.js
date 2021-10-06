var mongoose = require("mongoose");

// Define schema
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: { type: String, required: true },
});

// Virtual for device url
CategorySchema.virtual("url").get(function () {
  return "category/" + this._id;
});

// Export model
module.exports = mongoose.model("Category", CategorySchema);
