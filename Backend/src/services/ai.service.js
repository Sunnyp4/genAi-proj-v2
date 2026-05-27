const { GoogleGenAI } = require('@google/genai');
const { z, int } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const PDFDocument = require("pdfkit");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});

const interviewPrepSchema = {
    type: "object",

    properties: {
        matchScore: {
            type: "number"
        },

        technicalQuestions: {
            type: "array",

            items: {
                type: "object",

                properties: {
                    question: {
                        type: "string"
                    },

                    intention: {
                        type: "string"
                    },

                    answer: {
                        type: "string"
                    }
                },

                required: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        behavioralQuestions: {
            type: "array",

            items: {
                type: "object",

                properties: {
                    question: {
                        type: "string"
                    },

                    intention: {
                        type: "string"
                    },

                    answer: {
                        type: "string"
                    }
                },

                required: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        skillGaps: {
            type: "array",

            items: {
                type: "object",

                properties: {
                    skill: {
                        type: "string"
                    },

                    severity: {
                        type: "string",

                        enum: ["Low", "Medium", "High"]
                    }
                },

                required: [
                    "skill",
                    "severity"
                ]
            }
        },

        preparationPlans: {
            type: "array",

            items: {
                type: "object",

                properties: {
                    day: {
                        type: "integer"
                    },

                    focus: {
                        type: "string"
                    },

                    tasks: {
                        type: "array",

                        items: {
                            type: "string"
                        }
                    }
                },

                required: [
                    "day",
                    "focus",
                    "tasks"
                ]
            }
        }
    },

    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlans"
    ]
};


async function generateContent(resume, jobDescription, selfDescription) {
    const prompt = `
Generate interview preparation data STRICTLY in the provided JSON schema format.

IMPORTANT RULES:
- Return ONLY valid JSON
- Do NOT add extra fields
- Do NOT add explanations
- Do NOT add markdown
- Use exact property names from schema
- Follow the schema exactly

Candidate Information:

Job Description:
${jobDescription}

Resume:
${resume}

Self Description:
${selfDescription}
`;


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',

            contents: prompt,

            config: {
                responseMimeType: 'application/json',

                responseJsonSchema: interviewPrepSchema
            }
        });

        const data = JSON.parse(response.text);
        return data;
    }
    catch (err) {
        console.error("Error generating content:", err);
        throw new Error("Failed to generate interview preparation data");
    }
}

async function generateResumeData(interviewReport) {
    const prompt = `
Generate a professional resume JSON using this data:

${JSON.stringify(interviewReport)}

Return ONLY JSON in this exact format:

{
  "name": "string",
  "contact": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": ["string"],
  "projects": ["string"],
  "education": ["string"]
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    return JSON.parse(response.text);
}




async function generatePDF(resume) {
  const doc = new PDFDocument({ margin: 40 });

  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));

  // ✅ HEADER
  doc.font("Helvetica-Bold")
     .fontSize(20)
     .text(resume.name || "Name", { align: "center" });

  doc.moveDown(0.5);

  doc.font("Helvetica")
     .fontSize(10)
     .text(resume.contact || "", { align: "center" });

  doc.moveDown();

  // ✅ Section helper
  const section = (title, items) => {
    doc.moveDown();
    doc.font("Helvetica-Bold")
       .fontSize(14)
       .text(title);

    doc.moveDown(0.5);

    if (Array.isArray(items)) {
      doc.font("Helvetica").fontSize(10);
      items.forEach((item) => {
        doc.text(`• ${item}`, { lineGap: 3 });
      });
    } else {
      doc.font("Helvetica").fontSize(10).text(items || "");
    }
  };

  // ✅ CONTENT
  section("Summary", resume.summary);
  section("Skills", resume.skills);
  section("Experience", resume.experience);
  section("Projects", resume.projects);
  section("Education", resume.education);

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

async function generateResumePdf(interviewReport) {
  try {
    const resumeData = await generateResumeData(interviewReport);

    const pdfBuffer = await generatePDF(resumeData);

    return pdfBuffer;

  } catch (err) {
    console.error("Error generating resume PDF:", err);
    throw err;  // ✅ keep original error
  }
}
``



module.exports = { generateContent, generateResumePdf }

