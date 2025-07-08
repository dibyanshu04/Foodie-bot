const User = require('../models/user');
const jwt = require('jsonwebtoken')
const signup = async (req, res) => {
    try {
        const { firstName, lastName, address, email, phone, password } = req.body;
      
        if (!firstName || !lastName || !email || !password || !phone) {
            return res.status(404).json({message: "Missing Required Fields!"})
        }
        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(400).json({message: "Email already registered"});

        const newUser = new User({ firstName, lastName, address, email, phone, password});
        await newUser.save();

        res.status(201).json({message: "Signup successful", user: newUser});


    } catch (error) {
        console.error("Signup error", error);
        res.status(500).json({message:"Signup failed"});
        
    }
};

const login = async (req,res) =>{
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if (!user || user.password !== password ){
            return res.status(401).json({message: "Invalid credentials"})
        }
        const token = jwt.sign(
          {
            user,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
        return res.status(200).json({message: "Login Successful", user, token});
    } catch (error) {
        console.error("Login error", error);
        return res.status(500).json({message:"Login Failed"});
    }
};
module.exports = {
    signup,
    login
};