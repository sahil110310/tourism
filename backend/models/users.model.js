const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt=require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : [true, 'Please tell us your name'],
    },
    email:{
        type : String,
        required : [true,'Please provide your email'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail, 'Please provide correct Email id'],
    },
    roles:{
        type : String,
        enum : ['admin', 'user', 'guide', 'lead-guide'],
        default : 'user',
    },
    password:{
        type : String,
        required : [true, 'Please enter the password'],
        minlength : [8, 'length of a password must be greater than 8 characters'],
        select : false,
    },
    passwordConfirm:{
        type : String,
        required : [true, 'Please confirm your password'],
        validate :{
            validator : function(v){
                return v===this.password
            },
            message : 'Password is not same'
        }
    },
    passwordChanged:Date,
    passwordResetToken:String,
    passwordResetTokenExpire:Date,
    active:{
        type : Boolean,
        default : true,
        select : false
    }
});

userSchema.methods.correctPassword =async function(candidatePassword,password){
    return await candidatePassword===password
}

const User = mongoose.model('User',userSchema);
module.exports = User;