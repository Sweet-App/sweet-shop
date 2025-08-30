const { upload, uploadToCloudinary } = require("../middlewares/cloudysignupMiddleware");
const uploadToCloudinaryForUpdate=require("../middlewares/updates");
const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const authMiddlewers = require('./../middlewares/authMiddlewers');
const dynamicMiddleware = require('./../middlewares/dynamicMiddleware');

const router = express.Router();
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.get('/total-users', userController.getTotalUsers); 
router.get('/total-delivereis', userController.getTotalDeleverys); 
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/resetPassword/:token', (req, res) => {
  res.render('user/resetPassword3');
});
router.post('/signup',
    upload.single("photo"),           // multer يقرأ الصورة من الفورم
    uploadToCloudinary,   
  authController.signup);
// router.use(authMiddlewers.protect);
router.patch('/activeMe', authMiddlewers.protect, userController.activeMe);
// router.use(authMiddlewers.isactive)
router.patch(
  '/updateMyPassword',
  authMiddlewers.protect,
  authController.updatePassword
);
router.get(
  '/me',
  authMiddlewers.protect,
  authMiddlewers.isactive,
  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  authMiddlewers.protect,
    upload.single("photo"),           // multer يقرأ الصورة من الفورم
    uploadToCloudinaryForUpdate,
       userController.updateMe);
router.delete('/deleteMe', authMiddlewers.protect, userController.deleteMe);
// router.use(authMiddlewers.restrictTo('admin'));
router
  .route('/')
  .get(
    authMiddlewers.protect,
    authMiddlewers.isactive,
    authMiddlewers.restrictTo('admin'),
    userController.getAllUsers
  )
  .post(
    authMiddlewers.protect,
    authMiddlewers.isactive,
    authMiddlewers.restrictTo('admin'),
    dynamicMiddleware.addVarBody("password","123454321"),
    userController.createUser
  );
router
  .route('/:id')
  .get(
    authMiddlewers.protect,
    authMiddlewers.isactive,
    authMiddlewers.restrictTo('admin'),
    userController.getUser
  )
  .patch(
    authMiddlewers.protect,
    authMiddlewers.restrictTo("admin"),
    imguserMiddlewers.uploadUserPhoto,
    dynamicMiddleware.setPathImginBody("users", "photo"),
    userController.updateUser
  )
  .delete(
    authMiddlewers.protect,
    authMiddlewers.isactive,
    authMiddlewers.restrictTo('admin'),
    userController.deleteUser
  );
  router

module.exports = router;
