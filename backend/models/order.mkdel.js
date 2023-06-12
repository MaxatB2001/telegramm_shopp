const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    items: [{type: mongoose.Schema.Types.ObjectId, ref: "Item"}],
    sum: {
        type: Number,
        required: true,
      },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;