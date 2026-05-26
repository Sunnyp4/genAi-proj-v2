const { GoogleGenAI } = require('@google/genai');
const { z, int } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema')


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


async function generateContent( resume, jobDescription, selfDescription) {
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


    const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',

    contents: prompt,

    config: {
        responseMimeType: 'application/json',

        responseJsonSchema: interviewPrepSchema
    }
});

const data = JSON.parse(response.text);
return data;
}

module.exports = generateContent

