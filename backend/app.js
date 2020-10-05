const express =  require('express');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/user',userRouter);
app.use('/api/tour',tourRouter);
app.use('/api/view',viewRouter);
app.use('/api/booking',bookingRouter);
app.use('/api/review',reviewRouter);
module.exports = app;