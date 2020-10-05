const Tour=require('./../models/tour.model.js');
const AppError=require('./../utils/appError');
const catchAsync=require('./../utils/catchAsync');


exports.getOverview=catchAsync(async (req,res)=>{
    const tours=await Tour.find();
    res.status(200).render('overview',{
        title:"All Tours",
        tours
    })
});

exports.getTour=catchAsync (async (req,res,next)=>{
    const tour=await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fields:'rating review user'
    });
    if(!tour){
        next(new AppError('Cannot Find This Tour',400));
    }
    res.status(200).render('tour',{
        title:`${tour.name} Tour`,
        tour
    })
});

exports.login=catchAsync(async(req,res)=>{
    res.status(200).render('login');
})

exports.me=(req,res)=>{
    res.status(200).render('account',{
        title:'Your Account'
    });
}