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
    const {
      message,
      candidateName,
      interviewerName,
      roleForInterview,
      difficulty,
      language,
      interviewerBehavior,
      interviewerGender,
    } = req.body;
    console.log(interviewerGender, interviewerBehavior);
    // Save user message to conversation history
    conversationHistory.push({ role: "user", content: message });
    // You are a helpful assistant designed to output
    const PROMPT_TEMPLATE = `Your name is ${interviewerName}, you are a ${
      interviewerGender === "option-one" ? "Male" : "Female"
    } professional software engineer for 20 years now and you are interviewing a person named ${candidateName} for ${roleForInterview} role  and has 2 years of experience. interview difficulty will be ${difficulty}. your behaviour towards ${candidateName} will be ${interviewerBehavior} and it should be conducted in ${language} language Interview ${candidateName} without saying any other thing. Once the entire interview is over, give regards and at the end of the sentence, just write "{end}". when i say "SHOW_SCORE" then give me scores in the following array template.
    [
      {give score here}.
      {give an array of tips for improvement}
    ]
    (your regards when interview is finished).
    
    again , dont forget to write "{end}" when its over.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: PROMPT_TEMPLATE,
        },
        ...conversationHistory
          .filter((msg) => msg) // Filter out undefined elements
          .map((msg) => {
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

// Endpoint to clear conversation history
router.post("/clearHistory", (req, res) => {
  // Save the system message (first element) before clearing the array
  console.log("its being hit")
  const systemMessage = conversationHistory[0];

  // Clear conversation history, keeping the system message
  conversationHistory = [systemMessage];

  res.json({
    msg: "Conversation history cleared, except the system message",
  });
});


module.exports = router;
