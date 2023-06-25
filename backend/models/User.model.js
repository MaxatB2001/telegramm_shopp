const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    adress: {
      type: String,
      required: true,
      default: "г. Казань ул Рихрда Зорге 32 к.2 кв 58"
    },
    phone: {
      type: String,
      required: true,
      default: "79179166659"
    },
    name: {
      type: String,
      required: true,
      default: "Альберт"
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;