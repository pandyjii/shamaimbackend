const express = require("express");
const {
  confirmOrder,
  createRazorpayOrder,
  fetchOrdersByUser,
  deleteOrder,
  updateOrder,
  fetchAllOrders,
  cancelOrder,
  returnOrder,
} = require("../controller/Order");

const router = express.Router();
//  /orders is already added in base path
router
  .post("/", confirmOrder)
  .post("/create", createRazorpayOrder)
  .get("/own/", fetchOrdersByUser)
  .delete("/:id", deleteOrder)
  .patch("/:id", updateOrder)
  .get("/", fetchAllOrders)
  .post("/:orderId/cancel", cancelOrder)
  .post("/:orderId/return", returnOrder);

exports.router = router;
