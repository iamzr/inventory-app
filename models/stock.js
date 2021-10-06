var mongoose = require("mongoose");

// Define schema
var Schema = mongoose.Schema;

var StockSchema = new Schema({
  device: { type: Schema.Types.ObjectId, ref: "Device", required: true },
  number_in_stock: { type: Number, min: 0, required: true },
});

// Virtual for device url
StockSchema.virtual("url").get(function () {
  return "stock/" + this._id;
});

// Export model
module.exports = mongoose.model("Stock", StockSchema);
