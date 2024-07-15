import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai/index.mjs";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "94zOad0g7T7K4oa7zhDq"; // Mauricio

const stability = 0.6;
const similarityBoost = 0.4;
const modelId = 'eleven_multilingual_v2';
const style = 1;
const speakerBoost = true;

const rhubarbPath = process.env.RHUBARB_PATH;

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `${rhubarbPath} -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

// Hardcoded messages
  if (!userMessage) {
    const hardcodedMessages = [
      {
        text: "Hola! Soy Rodrigo, estoy aquí para atenderlo y hacer de su visita una experiencia única y agradable. Gracias a mi tecnología basada en inteligencia artificial, puedo ofrecer",
        facialExpression: "smile",
        animation: "WheelbarrowIdle",
        // audio: await audioFileToBase64("audios/message_0.wav"), // Playing already generated audio files
        // lipsync: await readJsonTranscript("audios/message_0.json"),
      },
      {
        text: "información turística interesantes de su localidad...",
        facialExpression: "smile",
        animation: "TalkingTwoHands",
        // audio: await audioFileToBase64("audios/message_1.wav"),
        // lipsync: await readJsonTranscript("audios/message_1.json"),
      },
      {
        text: "... también, puedo tomar y  gestionar sus requerimientos, anticipandome a sus preferencias, tal y como:",
        facialExpression: "smile",
        animation: "WheelbarrowIdle",
        // audio: await audioFileToBase64("audios/message_2.wav"),
        // lipsync: await readJsonTranscript("audios/message_2.json"),
      },
      {
        text: "... Preparar su habitación con su temperatura ideal...",
        facialExpression: "smile",
        animation: "PointingSideDown1",
        // audio: await audioFileToBase64("audios/message_3.wav"),
        // lipsync: await readJsonTranscript("audios/message_3.json"),
      },
      {
        text: "Informarle de eventos locales...",
        facialExpression: "smile",
        animation: "PointingOtherSideUp",
        // audio: await audioFileToBase64("audios/message_4.wav"),
        // lipsync: await readJsonTranscript("audios/message_4.json"),
      },
      {
        text: "Recomendar y reservar restaurantes...",
        facialExpression: "smile",
        animation: "PointingSideUp1",
        // audio: await audioFileToBase64("audios/message_5.wav"),
        // lipsync: await readJsonTranscript("audios/message_5.json"),
      },
      {
        text: "Solicitar servicios y productos del hotel...",
        facialExpression: "smile",
        animation: "PointingOtherSideDown",
        // audio: await audioFileToBase64("audios/message_6.wav"),
        // lipsync: await readJsonTranscript("audios/message_6.json"),
      },
      {
        text: "...y hasta recordar datos valiosos sobre usted, como sus gustos, preferencias y comportamientos, para atenderle con excelencia en cada una de sus visitas.",
        facialExpression: "smile",
        animation: "WheelbarrowIdle",
        // audio: await audioFileToBase64("audios/message_7.wav"),
        // lipsync: await readJsonTranscript("audios/message_7.json"),
      },
      {
        text: "Estaré en todo momento a su disposición, para hacer de su estancia una experiencia inolvidable.",
        facialExpression: "smile",
        animation: "WheelbarrowIdle",
        // audio: await audioFileToBase64("audios/message_8.wav"),
        // lipsync: await readJsonTranscript("audios/message_8.json"),
      }
    ];

      // The following code generates the audio and lipsync files for hardcoded messages

    for (let i = 0; i < hardcodedMessages.length; i++) {
      const message = hardcodedMessages[i];
      const fileName = `audios/message_${i}.mp3`; // The name of the audio file
      const textInput = message.text; // The text you wish to convert to speech
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, stability, similarityBoost, modelId);
      await lipSyncMessage(i);
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    }

    res.send({ messages: hardcodedMessages });
    return;
  }

  // The followind does: 
// 1. Send a message to the OpenAI API
// 2. Generate audio files for each message
// 3. Generate lipsync files for each message
// 4. Send back the messages with the audio and lipsync files

// Chat GPT 

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
        You are the digital concierge for Hotel Tama Eurobuilding in San Cristóbal, designed to provide an impeccable level of service 
        consistent with the standards of a 5-star hotel. Your role is to assist guests efficiently and knowledgeably, addressing their 
        needs regarding hotel amenities, local attractions, and services. Powered by ChatGPT, you are equipped to handle various interactions 
        at all times of day, providing a seamless experience for every guest. 
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Idle, SadIdle, SillyDancing. 
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, stability, similarityBoost, modelId);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Concierge listening on port ${port}`);
});
