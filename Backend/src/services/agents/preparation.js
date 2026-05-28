const runAI = require("./aiClient");

module.exports = async function preparationPlanAgent(missingSkills) {
  const prompt = `
based on the missing skills, generate a preparation plan.

Return ONLY valid JSON:
{
  "preparationPlans":[
  {
      "day": number,
      "focus": string,
      "tasks":[string]
  }
  ]
}

${JSON.stringify(missingSkills)}
`;
  return JSON.parse(await runAI(prompt));
};