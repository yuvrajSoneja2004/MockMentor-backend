const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});

router.get("/", (req, res) => {
  res.json({
    msg: "Server is currently running",
  });
});
let conversationHistory = [];
router.post("/chat", async (req, res) => {
  // Conversation history array

  try {
    const { message, candidateName, interviewerName } = req.body;
    console.log(message, candidateName, interviewerName);
    // Save user message to conversation history
    conversationHistory.push({ role: "user", content: message });
    // You are a helpful assistant designed to output
    const PROMPT_TEMPLATE = `Your name is ${interviewerName}, you are a professional software engineer for 20 years now and you are interviewing a person named ${candidateName} who is good in React.js and has 2 years of experience. Interview ${candidateName} without saying any other thing. Once the entire interview is over, give regards and at the end of the sentence, just write "{end}".`;

    // Get OpenAI response
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: PROMPT_TEMPLATE,
        },
        ...conversationHistory.map((msg) => {
          return {
            role: msg.role,
            content: msg.content,
          };
        }),
      ],
      model: "gpt-3.5-turbo-1106",
    });
    console.log(typeof completion.choices[0].message.content);
    console.log(completion.choices[0].message.content);

    // Save OpenAI response to conversation history
    conversationHistory.push({
      role: "system",
      content: completion.choices[0].message.content,
    });

    res.json({
      role: "system",
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
