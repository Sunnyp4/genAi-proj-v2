const runAI = require("./aiClient");

module.exports = async function question(analysis) {
  const prompt = `
Generate interview questions.

Return ONLY valid JSON:
{
  "technical": [
{
      "question": "string",
      "answer": "string"
    }
],
  "behavioral": [
{
      "question": "string",
      "answer": "string"
    }
]
}

${JSON.stringify(analysis)}
`;
  return JSON.parse(await runAI(prompt));
};