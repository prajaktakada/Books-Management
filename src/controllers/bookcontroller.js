const BookModel = require("../models/BookModel.js")
const UserModel = require("../models/UserModel.js")
const ReviewModel = require("../models/ReviewModel.js")
const mongoose = require("mongoose")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidrequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

//POST /login         
const createbooks = async function (req, res) {
    try {
        let decodedUserToken = req.user;
        const requestBody = req.body;

        if (!(decodedUserToken.userId === requestBody.userId)) {
            return res.status(400).send({ status: false, message: "token id or user id not matched" });
        }
        if (!isValidrequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "request body is not found" });
        }

        //extract params
        const { title, excerpt, userId, ISBN, category, subcategory, review, releasedAt, } = requestBody;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "title is required" });
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "excerpt required" });
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId requred" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "object id is required" });
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: "category required" });
        }

        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "subcategory required" });
        }

        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "releasedAt required" });
        }
        const istitleAlreadyUsed = await BookModel.findOne({ title });

        if (istitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${title} title is already exist` });
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is required" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid userId` });
        }
        const isISBNAlreadyUsed = await BookModel.findOne({ ISBN });

        if (isISBNAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${ISBN} ISBN is already exist` })
        }

        let user = await UserModel.findById(userId);

        if (!user) {
            return res.status(400).send({ status: false, message: "user_Id not found" });
        }

        //validation end

        const bookData = { title, excerpt, userId, ISBN, category, subcategory, releasedAt: releasedAt ? releasedAt : "releasedAt field is mandatory", };
        let savedbook = await BookModel.create(bookData);
        res.status(201).send({ status: true, message: "book created succesfully", data: savedbook, });
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};



//GET /books 
const getbooks = async (req, res) => {

    try {

        const queryParams = req.query
        const filterQuery = { isDeleted: false }
        if (!isValidrequestBody(queryParams)) {
            let NDeleted = await BookModel.find(filterQuery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
            res.status(200).send({ status: true, message: 'Not Deleted Books List', data: NDeleted })
            return
        }

        const { userId, category, subcategory } = queryParams

        if (isValid(userId) && isValidObjectId(userId)) {
            filterQuery['userId'] = userId
        }

        if (isValid(category)) {
            filterQuery['category'] = category.trim()
        }

        if (isValid(subcategory)) {
            filterQuery['subcategory'] = subcategory.trim()
        }

        const Books = await BookModel.find(filterQuery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
        if (Array.isArray(Books) && Books.length === 0) {
            return res.status(404).send({ status: false, message: 'No Books found' })

        }

        let SortedBook = Books.sort(function (a, b) { return a.title > b.title && 1 || -1 })
        res.status(200).send({ status: true, message: 'Books list', data: SortedBook })

    } catch (err) {
        res.status(500).send({ staus: false, msg: err.message })
    }
}



//GET /books/:bookId
const getBookWithReview = async function (req, res) {
    try {

        const bookId = req.params.bookId

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, msg: `Invalid request. No request passed in the query` })
        }

        let bookDetail = await BookModel.findOne({ _id: bookId }).select({ ISBN: 0 })

        if (!isValid(bookDetail)) {
            return res.status(404).send({ status: false, msg: `book id not matched in db` })
        }

        let reviewsData = await ReviewModel.find({ bookId: bookDetail }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, reviews: 1 })

        let data = {
            _id: bookDetail._id,
            title: bookDetail.title,
            excerpt: bookDetail.excerpt,
            userId: bookDetail.userId,
            ISBN: bookDetail.ISBN,
            category: bookDetail.category,
            subcategory: bookDetail.subcategory,
            reviews: bookDetail.reviews,
            deletedAt: bookDetail.deletedAt,
            releasedAt: bookDetail.releasedAt,
            createdAt: bookDetail.createdAt,
            updatedAt: bookDetail.updatedAt,
            reviewsData: reviewsData
        }

        if (reviewsData.length == 0) { res.status(200).send({ status: true, message: "Book List", data: data }) }

        res.status(200).send({ status: true, message: `bookList`, data: data })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}




//PUT /books/:bookId
const update = async function (req, res) {
    try {
        //const requestbody= req.body
        let decodedUserToken = req.user;
        console.log(req.params);
        let bookUser = await BookModel.findOne({ _id: req.params.bookId });
        console.log(bookUser);
        if (decodedUserToken.userId == bookUser.userId) {
            if (bookUser.isDeleted == true) {
                return res.status(404).send({ status: false, msg: "the book has been already deleted" });
            }

            if (bookUser.isDeleted == false && bookUser.deletedAt == null) {
                const istitleAlreadyUsed = await BookModel.findOne({ title: req.body.title});

                if (istitleAlreadyUsed) {
                    return res.status(400).send({status: false,message: `${req.body.title} these title is already registered`});
                }

                const isISBNAlreadyUsed = await BookModel.findOne({ISBN:req.body.ISBN});

                if (isISBNAlreadyUsed) {
                    return res.status(400).send({status: false,message: `${req.body.ISBN} these ISBN is already registered`});
                }

                let newdata = await BookModel.findOneAndUpdate( { _id: bookUser },
                    {
                        title: req.body.title,
                        excerpt: req.body.excerpt,
                        ISBN: req.body.ISBN,
                        releasedAt: req.body.releasedAt,
                    },
                    { new: true }
                );

                if (Object.keys(req.body).length == 0) {
                    return res.status(400).send({status: true,message: "which field do you want to update?"});
                }

                console.log(newdata);

                res.status(200).send({ status: true, data: newdata });
            }
        } else {
            res.status(404).send({ err: "The User is Not Authorised" });
        }
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};


//DELETE /books/:bookId
const deletebookbyID = async function (req, res) {
    try {
        let decodedUserToken = req.user
        console.log(decodedUserToken)

        const bookId = req.params.bookId
        // console.log(bookId)

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid bookId` })
        }
        let deleteBook = await BookModel.findOne({ _id: req.params.bookId, isDeleted: false })
        console.log(deleteBook)

        if (!deleteBook) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }

        if (deleteBook.userId === decodedUserToken) {

            await BookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } })
            res.status(200).send({ status: true, message: `bookId deleted successfully` })
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}




module.exports = { createbooks, getbooks, getBookWithReview, update, deletebookbyID }





