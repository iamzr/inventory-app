var mongoose = require("mongoose");

// Define schema
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
  name: { type: String, required: true },
  brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  screen_size: { type: Number, required: true },
  ram: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

// Virtual for device url
DeviceSchema.virtual("url").get(function () {
  return "device/" + this._id;
});

// Export model
module.exports = mongoose.model("Device", DeviceSchema);
