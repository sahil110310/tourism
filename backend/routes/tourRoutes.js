const express = require('express');
const authController=require('../controllers/authController');
const tourController = require('../controllers/tourController');
const reviewRouter=require('./../routes/reviewRoutes');
const router = express.Router();

//router.param('id', tourController.checkID);
router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthy-plan/:year').get(tourController.getMonthlyPlan);
router
    .route('/')
    .get(tourController.getAllTours) // if route is /api/v1/users and it is http get methode then @getAllTours function will be Call.
    .post(authController.protect,authController.restrict('admin','lead-guide'),tourController.createTour); // if route is /api/v1/users and it is http post methode then @createTour function will be Call.

router.
    route('/tours-within/:distance/point/:latlng/:unit')
    .get(tourController.getToursWithIn)

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistanceTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect,authController.restrict('admin','lead-guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto
    ,tourController.updateTour)
    .delete(authController.protect,authController.restrict('admin','lead-guide'),tourController.deleteTour);

//nested router
router.use('/:tourId/reviews',reviewRouter);   
module.exports = router;