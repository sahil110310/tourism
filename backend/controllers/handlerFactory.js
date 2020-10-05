const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
const APIFeatures = require('../utils/apiFetures');

exports.deleteOne=Model=>catchAsync(async(req, res,next) => {
    console.log(req.params.id)
    const doc=await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError('can not find this Document With Given Id',404))
    }
    res.status(204).json({
        status: 'Success',
        data: null
    });
});

exports.updateOne=Model=>catchAsync(async(req, res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    //console.log(doc)
    if(!doc){
        return next(new AppError('can not find this Document With Given Id',404))
    }
    res.status(200).json({
        status: 'Success',
        data: {
            data:doc
        }
    });
});

exports.createOne =Model=>catchAsync(async(req, res,next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getOne=(Model,populateOptions)=>catchAsync(async(req, res,next) => {
    let query = Model.findById(req.params.id);
    if(populateOptions){
        query=query.populate(populateOptions)
    }
    const doc =await query.select('-__v');
    if(!doc){
        return next(new AppError('Can not find this Document With Given Id',404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            data:doc
        }
    });
});

exports.getAll=Model=>catchAsync(async(req, res,next) => {
    //This is for nested Review 
    let filter={};
    const tourId=req.params.tourId;
    if(tourId)filter={tour:tourId};

    //BUILD QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // EXECUTE THE QUERY
    const doc = await features.query;
    //SEND RESPONSE
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: doc.length,
        data: {
            data:doc
        }
    });
});