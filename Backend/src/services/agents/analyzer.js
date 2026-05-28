const runAi = require("./aiClient");

async function analyzeAgent(input) {
    const prompt = `Analyze the resume, job description and self description.
Return ONLY valid JSON in this format:
{
  "matchScore": number,
  "skills": [],
  "missingSkills": []
}
Data:
${JSON.stringify(input)}
`
      const response = await runAi(prompt);

      return JSON.parse(response);
}


module.exports = analyzeAgent;