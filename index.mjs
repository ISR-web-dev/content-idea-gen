// content_idea_generator/index.js

import express from "express";
import nodemailer from "nodemailer";
import { config } from "dotenv";
import { OpenAI } from "openai";

config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateContentIdeas = async () => {
  const prompt = `Research what's trending in web design and Framer, including platforms like Dribbble and Twitter. Based on that, generate:

1. One fresh Framer tutorial idea.
2. One creative timelapse idea involving Framer.
3. One meme idea for Framer/web designers.

Give them in a clean, short format I can directly use.`;

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o", // You can change to "gpt-4o-mini" if preferred
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return chatResponse.choices[0].message.content;
};

const sendEmail = async (ideas) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `Content Bot <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    subject: "Your Daily Framer Content Ideas",
    text: ideas,
  });
};

app.get("/run", async (req, res) => {
  try {
    const ideas = await generateContentIdeas();
    await sendEmail(ideas);
    res.send("✅ Content ideas generated and emailed!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to generate or send content ideas.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
