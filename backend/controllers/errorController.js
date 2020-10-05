const AppError=require('./../utils/appError')
const developmentError=(err,req,res)=>{
    if(req.originalUrl.startsWith('/api')){
        err.status=err.status || 400;
        return res.status(err.status).json({
            status:`${err.status}`.startsWith(4)?'failed':'error',
            message:err.errorMessage,
            err
        })
    }
    return res.status(400).render('error',{
        title:'Something Went Wrong',
        msg:err.errorMessage
    })
   
}
const ProdError=(err,req,res)=>{
    console.log(err);
    if(req.originalUrl.startsWith('/api')){
        if(err.isOperational){
                err.status=err.status || 400;
                return res.status(err.status).json({
                status:`${err.status}`.startsWith(4)?'failed':'error',
                message:err.errorMessage
            })
        }
        else{
            return res.status(500).json({
                status:'failed',
                message:'Something Went Wrong'
            })
        }
    }
    if(err.isOperational){
        err.status=err.status || 400;
        return res.status(err.status).render('error',
            {
            title:'Something Went Wrong',
            msg:err.errorMessage
        })
        }
        console.log(err);
        return res.status(500).render('error',{
            title:'Something Went Wrong',
            msg:'Please Try Again Sometimes after'
        })
}

    

const handleCastErrorDB = err =>{
    const message= `Invalid ${err.path}:${err.value}`
    console.log(message);
    return new AppError(message,400)
}
const handleDuplicateErrorDB = err=>{
    const message= `This ${Object.keys(err.keyValue)} is ${err.keyValue[Object.keys(err.keyValue)]} already there, Please Change it`;
    return new AppError(message,400);
}
const handleValidationErrorDB= err=>{
    const data=Object.values(err.errors).map(el=>el.message)
    const message=`Invalid data input ${data.join('. ')}`;
    return new AppError(message,400);
}
const handleJwtTokenExpire=()=>{
    return new AppError('Token is expired Please Login Againg',401)
}
const handleJwtTokenChanged=()=>{
    return new AppError('Token is Not Valid Please Login Again',401)
}
module.exports=(err,req,res,next)=>{
    let error={...err};
    if(process.env.NODE_ENV==='development'){
        console.log(err);
        developmentError(error,req,res)
    }
    else if(process.env.NODE_ENV==='production'){
        console.log(err);
         if(error.name==='CastError'){
             error=handleCastErrorDB(err)
         }
         else if(error.code===11000){
            error=handleDuplicateErrorDB(err)
         }
         else if(error.name==='ValidationError') error= handleValidationErrorDB(err)
         else if(error.name==='TokenExpiredError') error =handleJwtTokenExpire()
         else if(error.name==='JsonWebTokenError') error =handleJwtTokenChanged()
        ProdError(error,req,res)
    }
}