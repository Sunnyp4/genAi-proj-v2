const runAI = require("./aiClient");

module.exports = async function resume(context) {
  const prompt = `
Generate resume HTML.
Return only HTML.

${JSON.stringify(context)}
`;

  return await runAI(prompt);
};
