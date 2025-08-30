const uploadToCloudinaryForUpdate=require("../middlewares/updates")
const { upload, uploadToCloudinary } = require("../middlewares/cloudyextesionMiddleware");
const extesionController = require("../controllers/extesionController");
const authMiddlewers = require("../middlewares/authMiddlewers");

const dynamicMiddleware = require("../middlewares/dynamicMiddleware");
const express = require("express");
const router = express.Router({ mergeParams: true });
router
  .route("/uplode")
  .post(
    authMiddlewers.protect,
    authMiddlewers.restrictTo("user"),
    upload.single("image"),           // multer يقرأ الصورة من الفورم
    uploadToCloudinaryForUpdate,  
      dynamicMiddleware.addVarBody("order", "orderId"),
    extesionController.createextesion
  );
router
  .route("/") //استعلام عن اضفات طلب محدد
  .get(
    authMiddlewers.protect,authMiddlewers.restrictTo("admin"),
    dynamicMiddleware.addQuery("order", "orderId"),
    extesionController.getAllextesion
  )
  .post(
    authMiddlewers.protect,
    authMiddlewers.restrictTo("user"),
    upload.single("image"),           // multer يقرأ الصورة من الفورم
    uploadToCloudinary,  
      dynamicMiddleware.addVarBody("order", "orderId"),
    extesionController.createextesion
  );  
router
  .route("/:id")
  .get(authMiddlewers.protect,authMiddlewers.restrictTo("admin"), extesionController.getextesion)
  .patch(
    authMiddlewers.protect,
    authMiddlewers.restrictTo("user"),
        upload.single("image"),           // multer يقرأ الصورة من الفورم
    uploadToCloudinaryForUpdate,  
    extesionController.updateextesion
  )
  .delete(
    authMiddlewers.protect,
    authMiddlewers.restrictTo("user"),
    extesionController.deleteextesion
  );
router
  .route("/:id/uplode")
  .patch(
    authMiddlewers.protect,
    authMiddlewers.restrictTo("user"),
    dynamicMiddleware.filteredBody("photo"),
    dynamicMiddleware.setPathImginBody("extensions", "photo"),
    extesionController.updateextesion
  );

module.exports = router;
