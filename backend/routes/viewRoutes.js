const express=require('express');
const viewController=require('../controllers/viewController');
const router=express.Router();
const authController=require('../controllers/authController');
const bookingController=require('../controllers/bookingController');

router.use(authController.isLoggedIn)
router.get('/',bookingController.createBookingCheckout,viewController.getOverview);
router.get('/tour/:slug',authController.protect,viewController.getTour);
router.get('/login',viewController.login);
router.get('/me',authController.protect, viewController.me)
router.get('/my-tours',authController.protect,bookingController.getMyTours)

module.exports=router;