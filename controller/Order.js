const { Order } = require("../model/Order");
const { Product } = require("../model/Product");
const { User } = require("../model/User");
const { sendMail, invoiceTemplate } = require("../services/common");

exports.fetchOrdersByUser = async (req, res) => {
    const { id } = req.user;
    try {
      const orders = await Order.find({ user: id });
  
      res.status(200).json(orders);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  
  exports.createOrder = async (req, res) => {
    const order = new Order(req.body);
    // here we have to update stocks;
    
    for(let item of order.items){
       let product =  await Product.findOne({_id:item.product.id})
       product.$inc('stock',-1*item.quantity);
       // for optimum performance we should make inventory outside of product.
       await product.save()
    }

    try {
      const doc = await order.save();
      const user = await User.findById(order.user)
       // we can use await for this also 
      //  sendMail({to:user.email,html:invoiceTemplate(order),subject:'Order Received' })
             
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  
  exports.deleteOrder = async (req, res) => {
      const { id } = req.params;
      try {
      const order = await Order.findByIdAndDelete(id);
      res.status(200).json(order);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  
  exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    try {
      const order = await Order.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(order);
    } catch (err) {
      res.status(400).json(err);
    }
  };

  exports.fetchAllOrders = async (req, res) => {
    // sort = {_sort:"price",_order="desc"}
    // pagination = {_page:1,_limit=10}
    let query = Order.find({deleted:{$ne:true}});
    let totalOrdersQuery = Order.find({deleted:{$ne:true}});
  
    
    if (req.query._sort && req.query._order) {
      query = query.sort({ [req.query._sort]: req.query._order });
    }
  
    const totalDocs = await totalOrdersQuery.count().exec();
    console.log({ totalDocs });
  
    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
  
    try {
      const docs = await query.exec();
      res.set('X-Total-Count', totalDocs);
      res.status(200).json(docs);
    } catch (err) {
      res.status(400).json(err);
    }
  };

  
  exports.cancelOrder = async (req, res) => {
    // const orderId = req.params.orderId;

    try {
      const order = await Order.findById(req.params.orderId);
  
      if (!order) {
        return res.status(404).send({ message: 'Order not found' });
      }
  
      // Check if the order is already processed, you might not allow cancellation
      if (order.status === 'shipped' || order.status === 'delivered') {
        return res.status(400).send({ message: 'Order cannot be canceled at this stage' });
      }
  
      order.status = 'canceled';
      await order.save();
  
      res.send({ message: 'Order has been canceled', order });
    } catch (error) {
      res.status(500).send({ message: 'Error canceling order', error: error.message });
    }
  };
  
 
  
  exports.returnOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order is eligible for return
        if (order.status !== 'shipped' && order.status !== 'delivered') {
            return res.status(400).json({ message: 'Order cannot be returned at this stage' });
        }

        // Update the order status to 'returned'
        order.status = 'returned';
        await order.save();

        // Additional logic for any specific tasks related to returning an order

        res.json({ message: 'Order has been returned', order });
    } catch (error) {
        res.status(500).send({ message: 'Error returning order', error: error.message });
    }
};

  // exports.createShipment= async (req, res) => {
  //   try {
  //     // Extract shipping details from request body
  //     const { name, address, email, phone } = req.body;
  
  //     // You might want to fetch item details from cartItems too
  //     // let product =  await Product.findOne({_id:item.product.id})
  //     // Create shipment using Shiprocket API
  //     const response = await shiprocket.createOrder({
  //       order_id:item.product.id , // Example order ID
  //       name,
  //       address,
  //       email,
  //       phone
  //       // Add other necessary details like weight, mode of shipping, etc.
  //     });
  
  //     res.json(response);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Internal Server Error' });
  //   }
  // };
  
  