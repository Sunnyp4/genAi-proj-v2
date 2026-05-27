const pdfParse = require('pdf-parse');
const { generateContent, generateResumePdf } = require('../services/ai.service');
const InterviewReportModel = require('../models/interviewReport.model')

async function generateInterviewReportController(req, res) {
    console.log("✅ generateInterviewReportController called");
    const resume = req.file;
    const { jobDescription, selfDescription } = req.body;
    const resumeData = await (new pdfParse.PDFParse(Uint8Array.from(resume.buffer))).getText();

    if ((!resume || !selfDescription) && !jobDescription) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const interviewReport = await generateContent(resumeData.text, jobDescription, selfDescription);
    const newReport = new InterviewReportModel({
        userId: req.user.id,
        jobDescription,
        resume: resumeData.text,
        selfDescription, ...interviewReport
    });
    await newReport.save();

    res.status(200).json({ message: "Interview report generated successfully", newReport });

}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await InterviewReportModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ message: "Interview reports retrieved successfully", newReport: interviewReports });
    } catch (error) {
        console.error("Error retrieving interview reports:", error);
        res.status(500).json({ message: "Failed to retrieve interview reports" });
    }
}

async function getInterviewReportByIdController(req, res) {
    const { id } = req.params;
    try {
        const interviewReport = await InterviewReportModel.findOne({ _id: id, userId: req.user.id });
        if (!interviewReport) {
            return res.status(404).json({ message: 'Interview report not found' })
        }
        res.status(200).json({ message: 'Interview report retrieved successfully', newReport: interviewReport })
    } catch (error) {
        console.error("Error retrieving interview report:", error);
        res.status(500).json({ message: "Failed to retrieve interview report" });
    }
}
async function getResumePdfController(req, res) {
    const { id } = req.params;
    try {
        const interviewReport = await InterviewReportModel.findOne({ _id: id, userId: req.user.id });
        if (!interviewReport) {
            return res.status(404).json({ message: 'Interview report not found' })
        }
        const pdfBuffer = await generateResumePdf(interviewReport);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=resume_${id}.pdf`,
        });
        res.send(pdfBuffer);

    }
    catch (error) {
        console.error("Error generating resume PDF:", error);

        res.status(500).json({
            message: "Error generating resume PDF",
            error: error.message,
            stack: error.stack   // ✅ include full stack trace
        });
    }


}


module.exports = { generateInterviewReportController, getAllInterviewReportsController, getInterviewReportByIdController, getResumePdfController }