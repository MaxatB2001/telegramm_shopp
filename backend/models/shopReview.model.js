const mongoose = require("mongoose");

const shopReviewSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const ShopReview = mongoose.model("ShopReview", shopReviewSchema);

module.exports = ShopReview;