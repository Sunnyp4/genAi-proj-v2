const mongoose=require('mongoose');


const technicalQuestionSchema=new mongoose.Schema({
    question:{type:String,required:[true,'Question is required']},
    answer:{type:String,required:[true,'Answer is required']},
},{
    _id:false
})


const behavioralQuestionSchema=new mongoose.Schema({
      question:{type:String,required:[true,'Question is required']},
    answer:{type:String,required:[true,'Answer is required']},
},{
    _id:false
})


const preparationPlanSchema=new mongoose.Schema({
    day:{
        type:Number,
        required:[true,'Day is required']
    },
    focus:{
        type:String,
        required:[true,'Focus is required']
    },
    tasks:{
        type:[String],required:[true,'Tasks are required']
    }
},{
    _id:false
})

const interviewReportSchema=new mongoose.Schema({
    jobDescription:{type:String,required:[true,'Job description is required']},
    resume:{type:String},
    selfDescription:{type:String},
    matchScore:{
        type:Number,
        min:0,
        max:100
    },
    technicalQuestions:[technicalQuestionSchema],
    behavioralQuestions:[behavioralQuestionSchema],
    skillGaps:{
    type: [String],
    required: [true, 'Skill gaps are required']
},
    preparationPlans:[preparationPlanSchema],
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{
    timestamps:true
})

const InterviewReportModel=mongoose.model('InterviewReport',interviewReportSchema);

module.exports=InterviewReportModel;