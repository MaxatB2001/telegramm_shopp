const Router = require("express");
const cartController = require("../controllers/cart.controller");

const cartRouter = new Router();

cartRouter.get("/orders/:userName", cartController.getUserOrders)
cartRouter.post('/:userName', cartController.addToCart)
cartRouter.get("/:userName", cartController.getUserCart)
cartRouter.post("/delete-item/:userName", cartController.deleteItemFromCart)

module.exports = cartRouter;