
//User Model UserModel.js
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    title: {
        type: String,
        trim:true,
        required:'title is required',
        enum: ['Mr', 'Mrs', 'Miss']
    },

   name: {
        type: String,
        required:'name is required',
        trim:true
    },

    phone: {
        type:String,
        trim: true,
        required: 'phone number is required',
        unique: true},

    email:{type: String,
        trim: true,toLowercase:true,
        required: `Email is required`,
        unique: true},

    password: {
        type: String,
        required:'password is required',
        minlength: 8,
        maxlength: 15,
        trim:true},

    address:{
        street:{type:String},
        city:{type:String},
        pincode:{type:String}},

    },{ timestamps: true })

module.exports = mongoose.model('User', UserSchema)