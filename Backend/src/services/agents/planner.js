const runAI = require("../agents/aiClient");

async function plannerAgent(task) {
   const prompt = `
You are a planner agent.

Return ONLY valid JSON.

IMPORTANT:
- Steps MUST be EXACTLY one of these:
["analyze", "questions", "preparationPlan", "resume"]

Do NOT write descriptions
Do NOT explain steps
Do NOT add extra text

Return ONLY this format:

{
  "steps": ["analyze", "questions", "preparationPlan", "resume"]
}

Data:
${JSON.stringify(task)}
`;

    const response = await runAI(prompt);

    return JSON.parse(response);
}

module.exports = plannerAgent;