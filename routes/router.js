const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Feed = require("../models/post.model");

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
  console.log("its being hit");
  const systemMessage = conversationHistory[0];

  // Clear conversation history, keeping the system message
  conversationHistory = [systemMessage];

  res.json({
    msg: "Conversation history cleared, except the system message",
  });
});

// Endpoint to get all posts
router.get("/getAllPosts", async (req, res) => {
  try {
    const posts = await Feed.find({});

    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.json({
      res: false,
      msg: error,
    });
  }
});
// Endpoint to Post conversation on feed
router.post("/postFeed", async (req, res) => {
  try {
    const { postDesc, conversation, tags } = req.body;

    // Create a new instance of the 'Feed' model
    const newFeed = new Feed({
      postDesc,
      conversation,
      tags,
    });

    // Save the new feed to the MongoDB database
    const savedFeed = await newFeed.save();

    // Send a success response with the saved feed data
    res.status(201).json({
      res: true,
    });
    console.log("Success!");
  } catch (error) {
    // Handle errors and send an error response
    console.error("Error saving feed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GEt feed comments
router.get("/getComments/:feedId", async (req, res) => {
  try {
    const { feedId } = req.params;
    if (!feedId) {
      return res.json({
        res: false,
        msg: "Provide feedid",
      });
    }

    console.log("got hit");

    const particularFeed = await Feed.findOne({ _id: feedId }); // Use findOne instead of find
    if (!particularFeed) {
      return res.status(404).json({ error: "Feed not found" });
    }

    res.status(200).json(particularFeed.comments || []); // Return an empty array if comments is undefined
  } catch (error) {
    console.log("Error getting comments", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to post comments on a feed
router.post("/postComment/:feedId", async (req, res) => {
  try {
    const { feedId } = req.params;
    const { comment, createdAt, profileName, profilePic, input } = req.body;

    // Check if feedId and comment are provided
    if (!feedId || !comment) {
      return res.status(400).json({
        res: false,
        msg: "Provide feedId and comment",
      });
    }

    // Find the particular feed
    const particularFeed = await Feed.findOne({ _id: feedId });

    // Check if the feed exists
    if (!particularFeed) {
      return res.status(404).json({ error: "Feed not found" });
    }

    // Update the comments array in the feed document
    particularFeed.comments.push({
      text: comment,
      createdAt,
      profileName,
      profilePic,
      input,
    });

    // Save the updated feed to the MongoDB database
    await particularFeed.save();

    // Send a success response
    res.status(201).json({
      res: true,
      msg: "Comment posted successfully",
    });
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
