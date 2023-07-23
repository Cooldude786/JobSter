const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const authMiddleware = async (req, res, next) => {
    // check header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Token not found')
    }
    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        // Checking if the user is testUser or not if it is testUser then we will restrict update functionality by accessing boolean value.
        const testUser = payload.userId === '64bacaa9714d861372a94153'
        // attach the user to the job routes
        // In the below code we searching in a User model if the user with Id we get from token payload exists in DB.
        // & then we are removing password from the queried object.
        const user = await User.findById(payload.userId).select('-password')
        req.user = {userId: user._id, name: user.name, testUser}

        // In the below code we are getting the uer info directly from the payload
        // req.user = {userId: payload.userId, name: payload.name}
        // console.log(req.user);

        next()
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid')
    }
}

module.exports = authMiddleware