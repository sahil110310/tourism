  
const mongoose = require('mongoose');
const slugify = require('slugify');

// SCHEMA
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour Must Have A Name'], //Validation
        unique: true,
        trim: true,
        minlength:[3,'A tour Name must have length greater than 3'],
        maxlength:[30,'A tour name must have length less than 30']
    },
    slug: {type:String},
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'it should have difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'A tour must have a difficulty of easy,medium,difficult'
        }
    },
    price: {
        required: [true, 'A tour must have a price'],
        type: Number
    },
    ratingsAverage: {
        default: 4.5,
        type: Number,
        min:[1,'A tour Rating must be greater than 1.0'],
        max:[5,'A tour Rating must be less than 5.0'],
        set:val=>Math.round(val*10)/10
    },
    ratingsQuantity: {
        default: 0,
        type: Number
    },
    priceDiscount: {
        type:Number,
        validate:{
            validator:function(val){
                return val < this.price;
            },
            message:'Discount {VALUE} must be less than current price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have an description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover photo']
    },
    images: [String],
    createsAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    isPublish : {
        type:Boolean,
        deafult:true,
    },
    startLocation:{
        type:{
            type:String,
            deafult:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        description:String,
        address:String
    },
    locations:[{
        type:{
            type:String,
            deafult:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        description:String,
        address:String,
        day:Number
    }],
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1})
tourSchema.index({startLocation:'2dsphere'})

tourSchema.virtual('tourWeekend').get(function(){
    return this.duration/7;
});
tourSchema.virtual('reviews',{
    ref:'Reivew',
    foreignField:'tour',
    localField:'_id'
});

// DOC Middalware in mongoose this middlware called before .save() .create methode but in inserMany in didn't call this middlware.
tourSchema.pre('save', function(next){
this.slug = slugify(this.name,{lowercase:true});
next();
});

// tourSchema.post('save',function(doc,next){
//     console.log('post middware');
//     next();
// })

//QUERY Middleware

tourSchema.pre(/^find/,function(next){
    this.find({isPublish:{$ne:false}});
    next();
})
tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChanged'
    })
    next();
})
//Aggregation middlware
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{isPublish:{$ne:false}}})
//     next();
// })
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;