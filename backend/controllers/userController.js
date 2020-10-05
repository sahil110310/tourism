const User=require('./../models/user.model.js')
const catchAsync = require('./../utils/catchAsync')
const multer=require('multer');
const Jimp = require('jimp');
const AppError=require('./../utils/appError')
const factory=require('./handlerFactory');


const filterObj=(obj, ...filters)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(filters.includes(el)) newObj[el]=obj[el]
    })
    return newObj;
}
// const multerStorage=multer.diskStorage({
//     destination: function(req,file,cb){
//         cb(null,'public/img/users')
//     },
//     filename:function(req,file,cb){
//         const ext=file.mimetype.split('/')[1];
//         cb(null,`user-${req.user._id}-${Date.now()}.${ext}`)
//     }
// })
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
exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    next();
}
exports.updateMe=catchAsync(async(req,res,next)=>{
    if(req.body.password || req.body.passwordConfirm){
        next(new AppError('This is not For changing the password',400));
    }
    const filterBody=filterObj(req.body,'name','email');
    if(req.file)filterBody.photo=req.file.filename;
    const user=await User.findByIdAndUpdate(req.user._id,filterBody,{runValidators:true,new :true}).select('-__v')
    res.status(200).json({
        status:'success',
        data:{
            user
        }
    })
});

exports.deleteMe=catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user._id,{active:false})
    res.status(200).json({
        status:'success',
        data:null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet Define'
    });
};
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
// Do not Update Password With
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);


exports.uploadPhoto= upload.single('photo');
exports.resizeUploadPhoto=catchAsync(async(req,res,next)=>{
    if(!req.file) return next();
    console.log(req.file);
    req.file.filename=`user-${req.user._id}-${Date.now()}.jpeg`;
    Jimp.read(req.file.buffer,(err,img)=>{
        if(err){
            next(new AppError('Error while Uploading Photo',400))
        }
        img.resize(500,500).quality(90).write(`public/img/users/${req.file.filename}`)
    });
    next();
});