  
const Tour = require('../models/tour.model.js');
const catchAsync =require('../utils/catchAsync');
const AppError=require('./../utils/appError');
const factory=require('./handlerFactory');
const Jimp = require('jimp');
const multer=require('multer');

const multerStorage=multer.memoryStorage();
const filter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else
    cb(new AppError('Upload image only',400),false)
}
const upload=multer({
    storage:multerStorage,
    fileFilter:filter,
    limits:{
        fileSize:5000000
    }
});

exports.uploadTourPhoto= upload.fields([
{name:'imageCover',maxCount:1},
{name:'images',maxCount:3}
]);
exports.resizeTourPhoto=catchAsync(async (req,res,next)=>{
    if(!req.files.images && !req.files.imageCover) return next();
    //1) resize for image cover
    req.body.imageCover=`tour-${req.params.id}-${Date.now()}.jpeg`;
    Jimp.read(req.files.imageCover[0].buffer,(err,img)=>{
        if(err){
            next(new AppError('Error while Uploading Photo',400))
        }
        img.resize(2000,1333).quality(90).write(`public/img/tours/${req.body.imageCover}`)
    });

    //2) for images resize
    req.body.images=[];
   Promise.all(req.files.images.map(async(file,i)=>{
        const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
        Jimp.read(file.buffer,(err,img)=>{
            if(err){
                next(new AppError('Error while Uploading Photo',400))
            }
            img.resize(2000,1333).quality(90).write(`public/img/tours/${filename}`)
        });
        req.body.images.push(filename)
    }));
    next();
});

exports.aliasTopTours = async(req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingAverage,difficulty';
    next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour,{path:'reviews'});
exports.updateTour = factory.updateOne(Tour);
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats =  catchAsync(async(req, res,next) => {
    
        const stats = await Tour.aggregate([{
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    // _id: '$ratingsAverage',
                    numRatings: { $sum: '$ratingsQuantity' },
                    numTours: { $sum: 1 },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            // {
            //     $match: { _id: { $ne: 'EASY' } }
            // }
            
        ]);
        res.status(200).json({
            status: 'Success',
            stats
        });
    
});

exports.getMonthlyPlan= catchAsync(async(req, res,next) => {
        const year=req.params.year*1;
        const plan = await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numTourStart:{$sum:1},
                    tours:{$push:'$name'}

                }
            },
            {
                $addFields:{
                    month:'$_id'
                }
            },
            {
                $project:{_id:0}
            },
            {
                $sort:{numTourStart:-1}
            }
        ]);
        res.status(200).json({
            status: 'Success',
            plan
        });

});
exports.getToursWithIn=catchAsync(async(req, res,next)=>{
    const {distance,latlng,unit}={...req.params};
    const [lat,lng]=latlng.split(',');
    const radius=unit==='mi'?distance/3963.2:distance/6378.1;
    if(!lat || !lng){
        next(new AppError('Please Provide Latitude and Longitude'));
    }
    const tour=await Tour.find({
        startLocation:{
            $geoWithin:{
                $centerSphere:[[lng,lat],radius]
            }
        }
    });
    console.log(`radius is ${radius}`);
    res.status(200).json({
        status:'sucess',
        results:tour.length,
        data:{
            data:tour
        },

    })
});

exports.getDistanceTour=catchAsync(async(req, res,next) => {
    const {latlng,unit}={...req.params};
    const [lat,lng]=latlng.split(',');
    const multiplier=unit==='mi'?0.000621371:0.001;
    if(!lat || !lng){
        next(new AppError('Please Provide Latitude and Longitude'));
    }
    const tour=await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[lng*1,lat*1]
                },
                distanceField:'distance',
                distanceMultiplier:multiplier
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ])
    res.status(200).json({
        status:'sucess',
        results:tour.length,
        data:{
            data:tour
        },

    })
})