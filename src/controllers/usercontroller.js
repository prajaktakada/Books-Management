const UserModel = require("../models/UserModel.js")
const jwt = require("jsonwebtoken")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}

const isValidrequestBody = function (requestBody) {
    return Object.keys(requestBody).length !== 0

}


//POST /register
const registerUser = async function (req, res) {
    try {
        const requestBody = req.body

        if (!isValidrequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'value in request body is required' })
        }

        //extract param
        var { title, name, phone, email, password, address } = requestBody

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: 'name is not valid' })
        }

        name = name.trim()

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'accept only 10 digit number.' })
        }
        
        if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: `Phone Number is not valid` })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is required' })
        }

        title = title.trim()

        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: 'title is not valid provid among mr,miss,mrs' }) 
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' })
        }
        if (!((password.length > 7) && (password.length < 16))) {
            return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })
        }

        if (!isValid(email)) {
            (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)))
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
        }
        //  email = email.trim();

        const isNumberAndEmailAlreadyUsed = await UserModel.findOne({$and:[{ phone:phone,email:email}]});
        if (isNumberAndEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: " phone or email is already registered" })
        }

        const userData = { title, name, phone, email, password, address }
        let saveduser = await UserModel.create(userData)
        res.status(201).send({ status: true, message: 'user created succesfully', data: saveduser })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}



//POST /login
const login = async function (req, res) {
    try {

        const requestBody = req.body
        if (!isValidrequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'value in request body is required' })
        }

        var {email,password} = requestBody
    
        if (email && password) {
            let User = await UserModel.findOne({ email: email, password: password })

            if (User) {
                const Token = jwt.sign({
                    userId: User._id,
                    iat: Math.floor(Date.now() / 1000), //issue date
                    exp: Math.floor(Date.now() / 1000)+ 30 * 60
                }, "Group9") //exp date 30*60=30min
                res.header('x-api-key', Token)

                res.status(200).send({ status: true, msg: "success",userId:User._id, Token })
            } else {
                res.status(400).send({ status: false, Msg: "Invalid Credentials" })
            }
        } else {
            res.status(400).send({ status: false, msg: "request body must contain  email as well as password" })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



 module.exports ={registerUser,login}
