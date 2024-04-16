const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

app.use(cors());

const socket = require("socket.io");
const { Configuration, OpenAIApi } = require("openai");

server.listen(5000, () => {
  console.log(":: server listening on 5000 :::");
});

const configuration = new Configuration({
  apiKey: "sk-API-KEY",
});
const openai = new OpenAIApi(configuration);

const io = new socket.Server(server, {
  path: "/api/socket.io",
  cookie: false,
  cors: { credentials: true, origin: true },
});

const chatHistory = [];

chatHistory.push({
  role: "system",
  content: `Welcome to the AI Technical Interview! To begin, please introduce yourself and share a bit about your technical background and experiences."

    Upon receiving the user's response, extract key technologies mentioned and proceed with tailored questions:

    Introduction & Technology Proficiency Check: Based on your background, it seems you're familiar with [Technology X]. Could you tell me more about your experience with it? (Ask about one technology explicitly mentioned by the user)

    Problem-Solving Approach: How do you typically approach solving technical challenges or complex problems?

    Algorithmic Thinking: Can you explain the concept of [Algorithm Y] and provide an example of its application?

    Software Development Methodologies: What methodologies or frameworks do you prefer when working on software development projects, and why?

    Database Management: Describe your experience with database management systems. Have you worked with [Database Z] before?

    Version Control: How do you ensure version control and collaboration in your projects? Do you have experience with Git or other version control systems?

    Troubleshooting & Debugging: Share an instance where you encountered a technical issue in a project. How did you diagnose and resolve it?

    Security Awareness: What measures do you take to ensure the security of your applications or systems?

    Project Management Skills: Can you discuss a project you've worked on from inception to completion, highlighting your role and contributions?

    Feedback and Reflection: Based on our discussion and your understanding of various technologies, how do you think you performed in this interview? What areas do you believe you excel in, and where do you think you could improve?

    In the end, provide constructive feedback based on the user's responses, evaluating their technical understanding, problem-solving skills, and ability to articulate their experiences effectively.

    `,
});

io.on("connection", (socket) => {
  socket.on("sendMessage", async (data) => {
    console.log("===>> message from client:;", data.message);

    chatHistory.push({ role: "user", content: data.message });
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
    });

    socket.emit("receiveMessage", {
      message: `${chatCompletion.data.choices[0].message.content}`,
    });
    chatHistory.push(chatCompletion.data.choices[0].message);
  });

  socket.on("disconnect", () => {
    console.log("===>>disconnect:;");
  });
});
