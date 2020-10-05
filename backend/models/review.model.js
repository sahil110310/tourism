  
const mongoose = require('mongoose');
const Tour=require('./tour.model');
const reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:[true,'Review Cannot be Empty']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'A Review Must be belonging to a Tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review Must Belong to a User ']
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.statics.calculateAvgRating=async function(tourId){
    console.log(tourId);
    const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ]);
    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:stats[0].nRating,
            ratingsAverage:stats[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingsAverage:4.5
        })
    }
    
}

reviewSchema.post('save',function(){
    this.constructor.calculateAvgRating(this.tour)
})
reviewSchema.pre(/^findOneAnd/,async function(next){
    try{
        this.r=await this.findOne();
    }catch(err){
        next();
    }
    next();
});
reviewSchema.post(/^findOneAnd/,async function(){
    try{
        await this.r.constructor.calculateAvgRating(this.r.tour)
    }catch(err){
        console.log(err);
    }

});
reviewSchema.pre(/^find/,function(next){
 
    this.populate({
        path:'user',
        select:'name photo'
    })
    next();
})


const Review=mongoose.model('Reivew',reviewSchema);
module.exports=Review;