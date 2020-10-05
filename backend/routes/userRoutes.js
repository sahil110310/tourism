const express = require('express');
const Router = express.Router();
const authController = require('../controllers/authController')
const User = require('../models/users.model');


Router.route('/login').post(authController.login,(req, res)=>{

})
Router.route('/signup').post(authController.signup,(req, res)=>{
     
})
Router.route('/profile').get((req, res)=>{
    
})

module.exports = Router;