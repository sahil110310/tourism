class AppError extends Error{
    constructor(message,status){
        super(message);
        this.status=status;
        this.isOperational=true;
        this.errorMessage=message
        Error.captureStackTrace(this,this.constructor)
    }
}
module.exports=AppError;