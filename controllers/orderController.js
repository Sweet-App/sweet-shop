const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Location = require('../models/locationModel');
const factory = require("../utils/handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");
const axios = require("axios");
exports.getAllOrder = factory.getAllpop1(
  Order,
  {
    path: "user",
    select: "name.ar name.en phone -_id",
  },
  {
    path: "cart.product",
    select: "name.ar name.en   -_id",
  },
  // {
  //   path: "delivery",
  //   select: "firstName lastName phone -_id",
  // },
  // {
  //   path: "location",
  // }
);
exports.getOrder = factory.getOne(
  Order,
  {
    path: "user",
    select: "name.ar name.en phone -_id",
  },
  {
    path: "cart.product",
    select: "name.ar name.en  -_id",
  },
  // {
  //   path: "delivery",
  //   select: "firstName lastName phone -_id",
  // },
  // {
  //   path: "location",
  // }
);
exports.getOrdersForDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;

    const orders = await Order.find({
      delivery: deliveryId,
      "status.ar": "توصيل"
    })
    .populate("user", "name") // إظهار اسم الزبون إن أردت
    .populate("cart.product", "name") // إظهار اسم المنتجات ضمن الطلب
    .populate("delivery","name")

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching delivery orders:", err);
    res.status(500).json({
      status: "error",
      message: "حدث خطأ أثناء جلب الطلبات.",
    });
  }
};
const Delivery = require("../models/deliveryModel");


exports.getAllDeliveriesWithOrders = async (req, res) => {
  try {
    const deliveries = await Delivery.find();

    const results = await Promise.all(
      deliveries.map(async (delivery) => {
        const orders = await Order.find({ delivery: delivery._id });

        return {
          delivery,
          orders,
        };
      })
    );

    res.status(200).json({
      status: "success",
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error("❌ خطأ في جلب الطلبات:", err.message);
    res.status(500).json({
      status: "error",
      message: "فشل في جلب الطلبات مع عمال التوصيل",
    });
  }
};
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
exports.createOrder = catchAsync(async (req, res, next) => {
  req.body.total = 0;
  let thisProduct;
  if (req.body.paidstatus.ar !== "نقدي"||req.body.paidstatus.en !== "Cash") {
    req.body.paid = true;
  }
  for (let i = 0; i < req.body.cart.length; i++) {
    thisProduct = await Product.findById(req.body.cart[i].product);
    if (!thisProduct) return next(new AppError("Product is not defind", 400));
    req.body.cart[i] = {
      product: req.body.cart[i].product,
      quantity: req.body.cart[i].quantity,
      price: req.body.cart[i].price * req.body.cart[i].quantity,
    };
    req.body.total += req.body.cart[i].price * req.body.cart[i].quantity;
  }
  /////////////////////////////////////////////يتطلب اتصال بشبكة//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if (req.body.withDelivery) {
    const locationUser = await Location.findById(req.body.location);
    if (!locationUser)
      return next(new AppError("Location is not defund", 400));
    // تعيين إحداثيات النقطتين
    const point1 = {
      latitude: 23.2025,
      longitude: 33.0032,
    };
    const point2 = {
      latitude: locationUser.Latitude,
      longitude: locationUser.Longitude,
    };
 
    
    const apiUrl = `https://router.project-osrm.org/route/v1/driving/${point1.longitude},${point1.latitude};${point2.longitude},${point2.latitude}?overview=false`; //جلب المسافة والمدة بين نقطتين
    // const apiUrl=`https://router.project-osrm.org/route/v1/driving/${point1.longitude},${point1.latitude};${point2.longitude},${point2.latitude}?steps=true`;//تفاصيل النقاط على الطريق
    axios
      .get(apiUrl)
      .then(async (response) => {
        const data = response.data;
        req.body.priceDelivery = data.routes[0].distance * 0.02 || 20;
        req.body.duration =
          Math.ceil(data.routes[0].duration / 60) + Math.random() * 120; //اضفة رقم عشوئي يمثل الذمن المتوقع لتحضير الطلب
        req.body.total += req.body.priceDelivery;
        req.body.user = req.user._id;
        const doc = await Order.create(req.body);
        res.status(200).json({
          status: "success",
          doc,
        });
      })
      .catch((error) => {
        res.status(400).json({ status: "errors", message: error.message });
      });
  }
  /////////////////////////////////////////////بدون اتصال///////////////////////////////////////////////////
  else {
    req.body.priceDelivery = 0;
    req.body.duration = Math.random() * 120; ////اضفة رقم عشوئي يمثل الذمن المتوقع لتحضير الطلب
    req.body.user = req.user._id;
    const doc = await Order.create(req.body);
    res.status(200).json({
      status: "success",
      doc,
    });
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
});
exports.updateOrderErr = catchAsync(async (req, res, next) => {
  req.body.total = 0;
  let thisProduct;
  // if (req.body.paidstatus.ar !== "نقدي"||req.body.paidstatus.en !== "CASH") {
  //   req.body.paid = true;
  // }
  for (let i = 0; i < req.body.cart.length; i++) {
    thisProduct = await Product.findById(req.body.cart[i].product);
    if (!thisProduct) return next(new AppError("Product is not defind", 400));
    req.body.cart[i] = {
      product: req.body.cart[i].product,
      quantity: req.body.cart[i].quantity,
      price: req.body.cart[i].price * req.body.cart[i].quantity,
    };
    req.body.total += req.body.cart[i].price * req.body.cart[i].quantity;
  }
  /////////////////////////////////////////////يتطلب اتصال بشبكة//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if (req.body.withDelivery) {
    const locationUser = await Location.findById(req.body.location);
    if (!locationBranch || !locationUser)
      return next(new AppError("Location is not defund", 400));
    // تعيين إحداثيات النقطتين
    const point1 = {
      latitude: "23.2025",
      longitude: "33.0032",
    };
    const point2 = {
      latitude: locationUser.Latitude,
      longitude: locationUser.Longitude,
    };
    const apiUrl = `https://router.project-osrm.org/route/v1/driving/${point1.longitude},${point1.latitude};${point2.longitude},${point2.latitude}?overview=false`; //جلب المسافة والمدة بين نقطتين
    // const apiUrl=`https://router.project-osrm.org/route/v1/driving/${point1.longitude},${point1.latitude};${point2.longitude},${point2.latitude}?steps=true`;//تفاصيل النقاط على الطريق
    axios
      .get(apiUrl)
      .then(async (response) => {
        const data = response.data;
        req.body.priceDelivery = data.routes[0].distance * 0.02 || 20;
        req.body.duration =
          Math.ceil(data.routes[0].duration / 60) + Math.random() * 120; //اضفة رقم عشوئي يمثل الذمن المتوقع لتحضير الطلب

        req.body.total += req.body.priceDelivery;
        req.body.user = req.user._id;
        const doc = await Order.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({
          status: "success",
          doc,
        });
      })
      .catch((error) => {
        res.status(400).json({ status: "errors", message: error.message });
      });
  }
  /////////////////////////////////////////////بدون اتصال///////////////////////////////////////////////////
  else {
    req.body.priceDelivery = 0;
    req.body.duration = Math.random() * 120; //اضفة رقم عشوئي يمثل الذمن المتوقع لتحضير الطلب
    req.body.user = req.user._id;
    const doc = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      doc,
    });
  }
});
exports.chekOrder = catchAsync(async (req, res, next) => {
  const doc = await Order.findById(req.params.id);
  if (Date.now() - doc.createdAt > 10 * 60 * 1000)
    return next(new AppError("لقد تجاوزت الوقت المسموح لتعديل الطلب", 400));
  next();
});
exports.statisticsWithLinkUser = factory.statisticsWithLink(
  Order,
  "total",
  "users",
  "user",
  "user.name",
  "user.phone",
  "user.email"
);

exports.getTotalOrdersValue = async (req, res) => {
    try {
        // جمع جميع قيم حقل "total" في الطلبات
        const totalValue = await Order.aggregate([
            {
                $group: {
                    _id: null, // لا نحتاج إلى تجميع حسب أي حقل
                    totalSum: { $sum: "$total" } // جمع قيم حقل "total"
                }
            }
        ]);

        const totalOrdersValue = totalValue.length > 0 ? totalValue[0].totalSum : 0; // إذا لم يكن هناك طلبات، اجعل القيمة 0

        res.status(200).json({ totalOrdersValue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ أثناء جمع قيم الطلبات' });
    }
};

exports.getcountOrder = async (req, res) => {
    try {
        const count = await  Order.countDocuments();// لحساب عدد الوثائق في مجموعة المستخدمين
        res.status(200).json({ totalUsers: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ أثناء حساب عدد المستخدمين' });
    }
};

exports.getDailyOrdersCount = async (req, res) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // احصل على تاريخ قبل 7 أيام

        // جمع عدد الطلبات لكل يوم
        const dailyOrdersCount = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate } // تحديد الفترة الزمنية
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // تجميع حسب التاريخ
                    count: { $sum: 1 } // حساب عدد الطلبات
                }
            },
            {
                $sort: { _id: 1 } // ترتيب النتائج حسب التاريخ
            }
        ]);

        // ملء الأيام التي ليس لديها طلبات بالقيمة 0
        const results = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0]; // تنسيق التاريخ

            const found = dailyOrdersCount.find(item => item._id === formattedDate);
            results.push({
                date: formattedDate,
                count: found ? found.count : 0
            });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ أثناء جمع عدد الطلبات' });
    }
};


exports.getTopProducts = async (req, res) => {
    try {
        // الحصول على جميع الطلبات
        const orders = await Order.find().populate('cart.product'); // تأكد من أن لديك علاقة مع نموذج المنتج
      
        // حساب عدد المنتجات
        const productCounts = {};

        // جمع الكميات لكل منتج
        orders.forEach(order => {
            order.cart.forEach(item => {
                const productName = item.product.name; // افترض أن لديك حقل name في نموذج المنتج
                const quantity = item.quantity;

                if (productCounts[productName]) {
                    productCounts[productName] += quantity;
                } else {
                    productCounts[productName] = quantity;
                }
            });
        });

        // تحويل الكائن إلى مصفوفة وترتيبها
        const sortedProducts = Object.entries(productCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // أخذ أعلى 5 منتجات

        res.status(200).json(sortedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ أثناء جمع بيانات المنتجات' });
    }
};
