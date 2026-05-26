const userModel = require('../models/user.models');
const blacklistModel = require('../models/blacklist.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



async function userRegister(req, res) {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const isUserAlreadyExist = await userModel.findOne({
        $or: [{ userName }, { email }]
    })
    if (isUserAlreadyExist) {
        res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
        userName,
        email,
        password: hashedPassword
    })
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,          // ✅ Required for HTTPS (production)
        sameSite: "None",      // ✅ Required for cross-origin
        maxAge: 60 * 60 * 1000 // optional (1 hour)
    });

    res.status(201).json({
        message: 'User registered successfully', user: {
            id: newUser._id,
            userName: newUser.userName,
            email: newUser.email
        }
    });
}

async function userLogin(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'user not found' });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if (!isPasswordMatched) {
        return res.status(400).json({ message: 'password is incorrect' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,          // ✅ Required for HTTPS (production)
        sameSite: "None",      // ✅ Required for cross-origin
        maxAge: 60 * 60 * 1000 // optional (1 hour)
    });

    res.status(200).json({
        message: 'User logged in successfully', user: {
            id: user._id,
            userName: user.userName,
            email: user.email
        }
    });

}
async function userLogout(req, res) {
    res.clearCookie('token');
    const token = req.cookies.token;
    const isUserBlacklisted = await blacklistModel.findOne({ token });
    if (isUserBlacklisted) {
        return res.status(400).json({ message: 'User already logged out' });
    }
    if (token) {
        await blacklistModel.create({ token });
        res.status(200).json({ message: 'User logged out successfully' });
    }


}

async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email
        }
    })

}

module.exports = { userRegister, userLogin, userLogout, getMeController };