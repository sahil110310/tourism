class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {...this.queryString };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        //1B) Advance Filtering

        // { difficulty: 'easy', duration: { gte: '5' } } // Convert this req response to the given below
        // { difficulty: 'easy', duration: { $gte: '5' } }

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query.sort(sortBy);
        } else {
            //By default sorting by createdAt in asc order
            this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query.select(fields); //Projecting
        } else {
            //here - indicate that that field is excluded.
            this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page) || 1;
        const limit = parseInt(this.queryString.limit) || 100;
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);
        /**
         * we are returing this keword in ever function beause we went chaining
         * like filter().sort().paginate().   so that wh we are returing this keword
         * so that it returns the object and we can access the quer and querString in another methode
         *
         **/
        return this;
    }
}
module.exports = APIFeatures;