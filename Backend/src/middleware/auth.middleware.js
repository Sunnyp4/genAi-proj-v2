const jwt=require('jsonwebtoken');
const blacklistModel=require('../models/blacklist.model');

  async function authMiddleware(req,res,next){
    console.log("Token from cookie:", req.cookies);
    const token=req.cookies.token
     // Debugging line to check the token value
    const isTokenBlacklisted= await blacklistModel.findOne({token});
    if(isTokenBlacklisted){
        return res.status(401).json({message:'Unauthorized'});
    }
    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user=decoded
        next()

    }
    catch(error){
        return res.status(401).json({message:'Unauthorized'});
    }
 }

 module.exports=authMiddleware;