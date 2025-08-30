// const multer = require("multer");
// const AppError = require("../utils/appError");

// // إعداد التخزين
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/prodects");
//   },
//   filename: (req, file, cb) => {
// //     const ext = file.mimetype.split("/")[1];
// const ext = file.originalname.split('.').pop();
//     cb(null, `prodect-${Date.now()}-${file.fieldname}.${ext}`); // إضافة fieldname لتمييز الملفات
//   },
// });

// // إعداد الفلتر
// const multerFilter = (req, file, cb) => {
// //   if (file.mimetype.startsWith("image/")) { // تحقق من أن الملف هو صورة
//     cb(null, true);
// //   } else {
// //     cb(new AppError("Not an image! Please upload only images.", 400), false);
// //   }
// };

// // إعداد multer مع دعم الحقول المتعددة
// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });

// // تحديد الحقول التي سيتم قبولها
// exports.uploadProdectPhoto = upload.fields([
//   { name: "image", maxCount: 1 }, // حقل الصورة
//   { name: "model", maxCount: 1 }   // حقل النموذج
// ]);
