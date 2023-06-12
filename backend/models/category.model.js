const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;