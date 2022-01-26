
//Books Model BookModel.js
//
const mongoose = require('mongoose')

const BooksSchema = new mongoose.Schema({

    title: {
        type: String,
        required: 'title is required',
        unique: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: 'excerpt is required',
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: 'userID is required',
        trim: true
    },


    ISBN: {
        type: String,
        required: 'ISBN is required',
        unique: true,
        trim: true
    },

    category: {
        type: String,
        required: 'category is required',
        trim: true

    },

    subcategory: {
        type: String,
        required: 'subcategory is required',
        trim: true
    },

    reviews: {
        type: Number,
        default: 0,
        required:true  
    },

    deletedAt: {
        type: Date,
        default: null
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    releasedAt: {
        type: Date,
        required: 'releasedat is required'
    }


}, { timestamps: true })

module.exports = mongoose.model('Books', BooksSchema)








