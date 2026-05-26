
require('dotenv').config()
const app=require('./src/app')
const connectDB=require('./src/config/db')
const cookieParser=require('cookie-parser');
const cors = require('cors')

app.use(cors({
  origin: [
    "http://localhost:5173", // local dev
    "https://gen-ai-proj-v2.vercel.app" // production frontend ✅
  ],
  credentials: true
}));


app.use(cookieParser());
connectDB();


const authRouter=require('./src/routes/auth.routes')
app.use('/api/auth',authRouter)
const interviewRouter=require('./src/routes/interview.routes')

app.use('/api/interview', interviewRouter);


app.listen(3000,()=>{
    console.log('server is listening on port 3000')
})