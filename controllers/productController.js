const Product = require('../models/productModel');
const factory = require("../utils/handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");
exports.getAllProduct = factory.getAllpop1(Product,
    { path: "categurie", select: "name -_id" }
  );
exports.getProduct = factory.getOne(Product,
    { path: "categurie", select: "name -_id" }
  );
exports.updateProduct = factory.updateOne(Product);
exports.createProduct = factory.createOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.getAllProductCategory = factory.getField(Product, "categurie");
exports.getcountProduct = async (req, res) => {
    try {
        const count = await  Product.countDocuments();// لحساب عدد الوثائق في مجموعة المستخدمين
        res.status(200).json({ totalUsers: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ أثناء حساب عدد المستخدمين' });
    }
};
exports.searchProduct = async (req, res) => {
    const { name } = req.query; // الحصول على اسم المنتج من استعلام GET

    if (!name) {
        return res.status(400).json({ message: 'يرجى تقديم اسم المنتج للبحث' });
    }

    try {
        // البحث عن المنتج باستخدام الاسم باللغة العربية أو الإنجليزية
        const products = await Product.find({
            $or: [
                { 'name.ar': { $regex: name, $options: 'i' } }, // البحث باللغة العربية
                { 'name.en': { $regex: name, $options: 'i' } }  // البحث باللغة الإنجليزية
            ]
        });

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ أثناء البحث عن المنتجات' });
    }
};

// exports.deleteCategory = catchAsync(async (req, res, next) => {
//   const doc = await Product.deleteMany({
//     category: req.params.category,
//     branch: req.params.branchId,
//   });
//   res.status(200).json({
//     status: "success",
//     doc: null,
//   });
// });
// exports.updateCategory = catchAsync(async (req, res, next) => {
//   const doc = await Product.updateMany(
//     { category: req.params.category, branch: req.params.branchId },
//     { $set: req.body }
//   );
//   res.status(200).json({
//     status: "success",
//     doc: null,
//   });
// });
