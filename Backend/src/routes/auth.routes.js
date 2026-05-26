const {Router}=require('express');
const {userRegister,userLogin,userLogout,getMeController}=require('../controller/auth.controller')
const authMiddleware=require('../middleware/auth.middleware')
const authController=require('../controller/auth.controller')


const authRouter=Router();

authRouter.post('/register',userRegister);
authRouter.post('/login',userLogin);
authRouter.get('/logout',userLogout);
authRouter.get("/get-me", authMiddleware, getMeController)


module.exports=authRouter;