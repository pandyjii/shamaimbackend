const express = require("express");
const {
  getToken,
  createOrder,
  fetchOrderById,
  fetchAllOrders,
  cancelOrder,
} = require("../controller/Shiprocket");

const router = express.Router();
//  /orders is already added in base path
router
  .post("/create", createOrder)
  .get("/:orderId", fetchOrderById)
  .get("/", fetchAllOrders)
  .post("/:orderId/cancel", cancelOrder);

exports.router = router;
