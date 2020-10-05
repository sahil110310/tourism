const catchAsync = require('./../utils/catchAsync')
const AppError=require('./../utils/appError')
const Review=require('./../models/review.model.js');
const factory=require('./handlerFactory');


exports.setTourAndUserId=(req,res,next)=>{
    if(!req.body.tour) req.body.tour=req.params.tourId;
    if(!req.body.user) req.body.user=req.user._id;
    next();
}

exports.getAllReviews=factory.getAll(Review);
exports.createReview=factory.createOne(Review);
exports.deleteReview=factory.deleteOne(Review);
exports.updateReview=factory.updateOne(Review);
exports.getOneReview=factory.getOne(Review);