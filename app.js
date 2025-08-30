//1)
const express = require("express");
const cloudinary = require("./config/cloudinary");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const AppError = require("./utils/appError");
const errorGlobal = require("./controllers/errorController");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec=require('./swagger/swagger');
const bodyParser = require('body-parser');
//2
// Start express app
const app = express();
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*"); // Or specify a domain instead of *
//   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });


// Implement CORS
//سماح للمواقع من الاتصال بالخدمة
app.use(bodyParser.json());
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
app.use(cors());
app.use(cors());
//تحديد المواقع المسموح لها بالاتصال
// في حال وجود اكثر من موقع يتم تمرير مصفوفة بعناوين المواقع
// app.use(cors({
//   origin: 'https://www.website.com'
// }))
//السماح بالاتصال على جميع الموارد
app.options("*", cors());
//تحديد المسار او المورد المسموح الاتصال به
// app.options('/api/v1/resource', cors());

// Set security HTTP headers
//مكتبة لحماية الموقع في حال الرفع على استضافة
app.use(helmet());

// Development logging
//تتبع الطلبات في وضعية التطوير
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Limit requests from same API
// منع اغراق السرفر بطلبات وهمية
const limiter = rateLimit({
  max: 100,
  windowMs: 600 * 600 * 600 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
// منع استلام بينات كبيرة قادمة من الفرونت
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// القادم مع الطلب jwt لقرائة
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));
// Data sanitization against NoSQL query injection
// لمنع استلام بينات تشابه تعليمات قاعدة البيانات
app.use(mongoSanitize());

// Data sanitization against XSS
// html تعديل البيانات القادمة على شكل
app.use(xss());

// Prevent parameter pollution
// منع تكرار الحقول داخل الروت الى للحالات التالية
app.use(
  hpp({
    whitelist: ["duration", "difficulty", "price"],
  })
);
//ضغط البيانات قبل ارسالها من اجل تسريع النقل
app.use(compression());
//3)ROUTES
const userRouter = require("./routes/userRoutes");
const locationRouter = require("./routes/locationRouter");
const deliveryRoutes = require("./routes/deliveryRouter");
const productRouter = require("./routes/productRouter");
const categurieRouter = require("./routes/categurieRouter");
//const extesionRouter = require("./routes/extesionRouter");
const orderRoutes = require("./routes/orderRouter");
const searchRoutes = require('./routes/searchRoutes');
const reviewRotes = require("./routes/reviewRoter");
const cloudyRotes=require("./routes/cloudyRouter");
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/", userRouter);
app.use("/api/v1.0.0/users", userRouter);
app.use("/api/v1.0.0/locations", locationRouter);
app.use("/api/v1.0.0/deliverys", deliveryRoutes);
app.use("/api/v1.0.0/products", productRouter);
app.use("/api/v1.0.0/categuries", categurieRouter);
//app.use("/api/v1.0.0/extesions", extesionRouter);
app.use("/api/v1.0.0/orders", orderRoutes);
app.use('/api/v1.0.0', searchRoutes);
app.use("/api/v1.0.0/reviews", reviewRotes);
app.use("/api/v1.0.0/cloudy",cloudyRotes)
//في حال طلب مورد غير موجود
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorGlobal);

// process.on("uncaughtException", (err) => {
//   console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
//   console.log(err.name, err.message);
//   process.exit(1);
// });
//4)
// mongoose
//   .connect(process.env.DATABASE_URL)
//   .then((result) => {
//     app.listen(process.env.PORT, () => {
//       console.log(
//         `Example app listening at http://localhost:${process.env.PORT}/docs`
//       );
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION! 💥 Shutting down...");
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
// process.on("SIGTERM", () => {
//   console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
//   server.close(() => {
//     console.log("💥 Process terminated!");
//   });
// });
module.exports=app;
