const express=require('express');
const authMiddleware=require('../middleware/auth.middleware');
const interviewController=require('../controller/interview.controller')
const upload=require('../middleware/file.middleware')



const interviewRouter=express.Router();

interviewRouter.post('/', authMiddleware,upload.single('resume'), interviewController.generateInterviewReportController)
interviewRouter.get('/', authMiddleware,interviewController.getAllInterviewReportsController)

 interviewRouter.get('/report/:id', authMiddleware, interviewController.getInterviewReportByIdController)
// interviewRouter.get('/:id/resume', authMiddleware, interviewController.getResumePdfController)

module.exports=interviewRouter;