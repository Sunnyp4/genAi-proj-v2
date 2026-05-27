const { GoogleGenAI } = require('@google/genai');
const { z, int } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const puppeteer = require("puppeteer-core")
const chromium = require("chrome-aws-lambda")

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

const jsonSchema = zodToJsonSchema(z.object({html:z.string().describe("the HTML content of the resume which can be coverted to PDF using libraries like pdfkit or puppeteer")}))

async function generateResumePdf(interviewReport) {
  const prompt = `Generate a resume for the candidate based on the following interview report: ${JSON.stringify(interviewReport)}. Return ONLY the HTML content of the resume without any explanations or markdown which can be coverted to PDF using libraries like pdfkit or puppeteer. Follow the exact JSON schema: ${JSON.stringify(jsonSchema)}`
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: jsonSchema
        }
    });
    const data = response.text;
    
    const pdfBuffer = await genaratePDFfromHTML(data);
    console.log("Generated resume HTML:", pdfBuffer);
    return pdfBuffer;
  } catch(err){
    console.error("Error generating resume PDF:", err);
    throw new Error(err);
  }
}


async function genaratePDFfromHTML(htmlContent) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath, // ✅ CRITICAL
    headless: chromium.headless
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: "networkidle0"
  });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  return pdfBuffer;
}



module.exports = { generateContent, generateResumePdf }

