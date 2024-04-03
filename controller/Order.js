const { Order } = require("../model/Order");
const { nanoid } = require("nanoid");
const { Product } = require("../model/Product");
const { User } = require("../model/User");
const { sendMail, invoiceTemplate } = require("../services/common");
const axios = require("axios");
const Razorpay = require("razorpay");

const shiprocketBaseUrl = "https://apiv2.shiprocket.in/v1/external/";
const productDimensions = {
  length: 30,
  breadth: 15,
  height: 10,
  weight: 0.5,
};

const getProductsStats = (items) => {
  let totalProductQuantity = 0;
  let totalProductPrice = 0;

  items.forEach((item) => {
    totalProductQuantity += parseInt(item.units);
    totalProductPrice += parseFloat(item.selling_price) * parseInt(item.units);
  });

  return {
    totalProductQuantity,
    totalProductPrice,
    totalLength: productDimensions.length * totalProductQuantity,
    totalBreadth: productDimensions.breadth * totalProductQuantity,
    totalHeight: productDimensions.height * totalProductQuantity,
    totalWeight: productDimensions.weight * totalProductQuantity,
  };
};

exports.fetchOrdersByUser = async (req, res) => {
  const { id } = req.user;
  try {
    const orders = await Order.find({ user: id });
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json(err);
  }
};

 
// exports.confirmOrder = async (req, res) => {
//   // Extract required fields from the request body
//   try {
//     const {
//       firstName,
//       lastName,
//       addressLine1,
//       addressLine2,
//       city,
//       pincode,
//       state,
//       email,
//       phone,
//       items,
//       billing_address, // Added to extract billing address
//       paymentDetails,
//       paymentStatus,
//       orderDetails,
     
//     } = req.body;

//     for (let item of items) {
//       const productId = item.id;
//       console.log(productId);
//       console.log(Product);
//       if (productId) {
//         const product = await Product.findOne({ _id: productId });
//         // Continue with product processing
//       } else {
//         // Handle the case where product ID is not available
//         console.log("not found");
//       }
//     }
//      let payMode;
//     // Validate required fields
//     if (!paymentDetails) {
//       throw new Error("The payment method field is required.");
//     }

//     if (!billing_address) {
//       throw new Error("The billing address field is required.");
//     }

//      if(orderDetails && orderDetails.id){
//       payMode="prepaid"
//      }
//      else{
//       payMode="cash"
//      }

//     // Create Shiprocket order payload
//     const productStats = getProductsStats(items);
//     const orderPayload = {
//       // create a unique ID here
//       order_id: nanoid(),
//       order_date: new Date()
//         .toISOString()
//         .replace(/T/, " ")
//         .replace(/\..+/, ""),
      
//       pickup_location: "Primary 2",
//       billing_customer_name: firstName,
//       billing_last_name: lastName,
//       billing_address: addressLine1,
//       billing_address_2: addressLine2,
//       billing_city: city,
//       billing_pincode: pincode,
//       billing_state: state,
//       billing_country: "India",
//       billing_email: email,
//       billing_phone: phone,
//       shipping_is_billing: true,
//       shipping_customer_name: "",
//       shipping_last_name: "",
//       shipping_address: "",
//       shipping_address_2: "",
//       shipping_city: "",
//       shipping_pincode: "",
//       shipping_country: "",
//       shipping_state: "",
//       shipping_email: "",
//       shipping_phone: "",
//       order_items: items,
//       payment_method: payMode,
//       sub_total: productStats.totalProductPrice,
//       length: productStats.totalLength,
//       breadth: productStats.totalBreadth,
//       height: productStats.totalHeight,
//       weight: productStats.totalWeight,
//     };

//     // Make request to Shiprocket API to create order
//     const response = await axios.post(
//       `${shiprocketBaseUrl}orders/create/adhoc`,
//       orderPayload,
//       {
//         headers: {
//           Authorization: req.headers.Authorization,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // Save the order to the database
//     const order = new Order({
//       ...req.body,
//       shiprocketResponse: response.data,
//       payMode:orderPayload.payment_method,

      
//     });   
//      const savedOrder = await order.save();
  
//       console.log(orderPayload)
//     // Send success response
//     res.status(201).json({
//       order: savedOrder,
//       shiprocketResponse: response.data,
//       payMode:orderPayload.payment_method,
//     });
    
//   } catch (err) {
//     res.status(400).json({
//       message: "Error creating order",
//       error: err.message,
//     });
//   }
// };

// exports.createRazorpayOrder = async (req, res) => {
//   const { amount } = req.body;
//   const instance = new Razorpay({
//     key_id: "rzp_test_UanPsB91bqtxk7",
//     key_secret: "cnOU08osB0BigfEQ9xxDAtYb",
//   });

//   try {
//     const response = await instance.orders.create({
//       amount: amount * 100,
//       currency: "INR",
//     });

//     const orderDetails = {
//       id: response.id,
//       amount: response.amount / 100, // Convert back to original amount
//       currency: response.currency,
//       status: response.status,
//       // Add more details as needed
//     };


//   // res.send(response);
//   res.json({"responce":orderDetails})
//   } catch (error) {
//     res.status(400).json(error);
//   }
// };




// Backend code
exports.createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;
  const instance = new Razorpay({
    key_id: "rzp_test_UanPsB91bqtxk7",
    key_secret: "cnOU08osB0BigfEQ9xxDAtYb",
  });

  try {
    const razorpayResponse = await instance.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

   
    await confirmOrder(razorpayResponse);
    res.json({ "response": razorpayResponse });
  } catch (error) {
    res.status(400).json(error);
  }
};

// Function to confirm the order with payment details
const confirmOrder = async (paymentDescription) => {
  try {
    console.log('Payment details:', paymentDescription);
    console.log(paymentDescription);
  } catch (err) {
    console.error('Error confirming order:', err);
    // Handle error if necessary
  }
};



exports.confirmOrder = async (req, res) => {
  // Extract required fields from the request body
  try {
    const {
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      pincode,
      state,
      email,
      phone,
      items,
      billing_address, // Added to extract billing address
      paymentDetails,
      paymentStatus,
      razorpayResponse,
    } = req.body;

    for (let item of items) {
      const productId = item.id;
      console.log(productId);
      console.log(Product);
      if (productId) {
        const product = await Product.findOne({ _id: productId });
        // Continue with product processing
      } else {
        // Handle the case where product ID is not available
        console.log("not found");
      }
    }
    let payMode;
    // Validate required fields
    

    if (!billing_address) {
      throw new Error("The billing address field is required.");
    }

    if (razorpayResponse && razorpayResponse.id) {
      payMode = "prepaid";
    } else {
      payMode = "cash";
    }
     
    try{
   const shiprocketResponce=await confirmOrder(paymentDetails);
   var paymentResponce=shiprocketResponce?shiprocketResponce:"cash"
    }
    catch(err){
    console.log("err in confirming order",err)
    }

    // Create Shiprocket order payload
    const productStats = getProductsStats(items);
    const orderPayload = {
      // create a unique ID here
      order_id: nanoid(),
      order_date: new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, ""),

      pickup_location: "Primary 2",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: addressLine1,
      billing_address_2: addressLine2,
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: "India",
      billing_email: email,
      billing_phone: phone,
      shipping_is_billing: true,
      shipping_customer_name: "",
      shipping_last_name: "",
      shipping_address: "",
      shipping_address_2: "",
      shipping_city: "",
      shipping_pincode: "",
      shipping_country: "",
      shipping_state: "",
      shipping_email: "",
      shipping_phone: "",
      order_items: items,
      payment_method: payMode,
      sub_total: productStats.totalProductPrice,
      length: productStats.totalLength,
      breadth: productStats.totalBreadth,
      height: productStats.totalHeight,
      weight: productStats.totalWeight,
    };

    // Make request to Shiprocket API to create order
    const response = await axios.post(
      `${shiprocketBaseUrl}orders/create/adhoc`,
      orderPayload,
      {
        headers: {
          Authorization: req.headers.Authorization,
          "Content-Type": "application/json",
        },
      }
    );
  
    // Save the order to the database
    const order = new Order({
      ...req.body,
      shiprocketResponse: response.data,
      payMode: orderPayload.payment_method,
      paymentDetails:paymentResponce
    });
    const savedOrder = await order.save();

    // Send success response
    res.status(201).json({
      order: savedOrder,
      shiprocketResponse: response.data,
      payMode: orderPayload.payment_method,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error creating order",
      error: err.message,
    });
  }
};







// Backend code

// exports.createRazorpayOrder = async (req, res) => {
//   const { amount } = req.body;
//   const instance = new Razorpay({
//     key_id: "rzp_test_UanPsB91bqtxk7",
//     key_secret: "cnOU08osB0BigfEQ9xxDAtYb",
//   });

//   try {
//     const response = await instance.orders.create({
//       amount: amount * 100,
//       currency: "INR",
//     });

//     // Extract necessary data from the response
//     const { id: razorpay_order_id } = response;

//     // You may need to generate razorpay_payment_id and razorpay_signature here,
//     // depending on your application's flow and requirements.

//     // Example of generating a unique payment ID and signature
//     const razorpay_payment_id = generateUniquePaymentId();
//     const razorpay_signature = generateSignature(razorpay_payment_id, razorpay_order_id);

//     // Send the necessary data in the response
//     res.json({
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     });
//   } catch (error) {
//     res.status(400).json(error);
//   }
// };

// Example functions to generate payment ID and signature
function generateUniquePaymentId() {
  // Generate a unique payment ID (you may use a library or method suitable for your application)
  return 'unique_payment_id';
}









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
  let query = Order.find({ deleted: { $ne: true } });
  let totalOrdersQuery = Order.find({ deleted: { $ne: true } });

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
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const response = await axios.post(
      `${shiprocketBaseUrl}orders/cancel`,
      { ids: [orderId] },
      {
        headers: {
          Authorization: req.headers.Authorization,
          "Content-Type": "application/json",
        },
      }
    );
    res.send({ message: "Order has been canceled" });
  } catch (error) {
    res.status(400).json({
      message: "Error canceling order",
      error: error.message,
    });
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      pincode,
      state,
      email,
      phone,
      items,
    } = req.body;
    let productStats = getProductsStats(items);
    let reqModal = {
      // unique ID here
      order_id:nanoid(),
      order_date: new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, ""),
      pickup_customer_name: firstName,
      pickup_last_name: lastName,
      pickup_address: addressLine1,
      pickup_address_2: addressLine2,
      pickup_city: city,
      pickup_pincode: pincode,
      pickup_state: state,
      pickup_country: "India",
      pickup_email: email,
      pickup_phone: phone,
      shipping_customer_name: "Niladri",
      shipping_last_name: "Biswas",
      shipping_address: "11B, Bowali Mondal Road",
      shipping_address_2: "",
      shipping_city: "Kolkata",
      shipping_pincode: "700026",
      shipping_country: "India",
      shipping_state: "West Bengal",
      shipping_email: "shamaimlifestyle@gmail.com",
      shipping_phone: "9875505219",
      order_items: items,
      payment_method: "Prepaid",
      sub_total: productStats.totalProductPrice,
      length: productStats.totalLength,
      breadth: productStats.totalBreadth,
      height: productStats.totalHeight,
      weight: productStats.totalWeight,
    };
    const response = await axios.post(
      `${shiprocketBaseUrl}orders/create/return`,
      reqModal,
      {
        headers: {
          Authorization: req.headers.Authorization,
          "Content-Type": "application/json",
        },
      }
    );
    res.send({ message: "Order has been returned" });
  } catch (error) {
    res.status(400).json({
      message: "Error canceling order",
      error: error.message,
    });
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
