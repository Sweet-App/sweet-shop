
const { upload, uploadToCloudinary } = require("../middlewares/cloudycategouriMiddleware");
const uploadToCloudinaryForUpdate=require("../middlewares/updates");
const categurieController = require("../controllers/categurieController");
const authMiddlewers = require('../middlewares/authMiddlewers');
const dynamicMiddleware = require("../middlewares/dynamicMiddleware");

const express = require('express');
const router = express.Router();
router.get('/search', categurieController.searchCatrgurie);
router
  .route('/')
  .get(categurieController.getAllcategurie)
 .post(
    authMiddlewers.protect,
    authMiddlewers.restrictTo("admin"),
    upload.single("image"),           // multer يقرأ الصورة من الفورم
    uploadToCloudinary,               // يرفعها على cloudinary
    categurieController.createcategurie
  );
router
  .route('/:id')
  .get(categurieController.getcategurie)
  .patch(
    authMiddlewers.protect,
    authMiddlewers.restrictTo("admin"),
        upload.single("image"),           // multer يقرأ الصورة من الفورم
    uploadToCloudinaryForUpdate,   
    categurieController.updatecategurie)
  .delete(
    authMiddlewers.protect,
    authMiddlewers.restrictTo('admin'),
    categurieController.deletecategurie
  );
module.exports = router;
