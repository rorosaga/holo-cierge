import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fsPromises } from "fs";
import fs from "fs";
import path from 'path';
import OpenAI from "openai/index.mjs";
import multer from "multer";
import { spawn } from "child_process";
import nodemailer from "nodemailer";
import { fileURLToPath } from 'url';
import { contactanosEmail, ticket_hotel_tama, info_san_cristobal, getCurrentWeather, getHotelData, info_hotel } from './functions.js';

dotenv.config();

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const readAvatars = async () => {
  try {
    const avatarsPath = path.join(__dirname, '..', 'concierge-frontend', 'src', 'data', 'avatars.json');
    const data = await fsPromises.readFile(avatarsPath, 'utf8');
    const avatars = JSON.parse(data);
    //console.log(avatars);
    return avatars;
  } catch (err) {
    console.error('Error reading the file:', err);
    return null;
  }
};

// Use the avatars data
const avatarData = await readAvatars();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-",
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = avatarData.avatars.digitalConcierge.voiceID;

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, 'audio.wav');
  }
});

const upload = multer({ storage: storage });

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

const lipSyncMessage = async (file, message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/${file}_${message}.mp3 audios/${file}_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `${rhubarbPath} -f json -o audios/${file}_${message}.json audios/${file}_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate /
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

//Initial prompt.
let messageHistory = [
  {
    role: "system",
    content: avatarData.avatars.digitalConcierge.systemPrompt,
  },
];


let currentResponse = [];

app.post("/chat", upload.single('audioInput'), async (req, res) => {
  let userMessage = req.body.message;
  const audioFile = req.file;

  if (audioFile) {
    const filePath = audioFile.path;
    console.log(`Received audio file: ${filePath}`);

    try {
      const fileExists = fs.existsSync(filePath);
      console.log(`Audio file exists: ${fileExists}`);
    } catch (error) {
      console.error(`Error checking audio file existence: ${error}`);
    }

    const transcribeAudio = async () => {
      try {
        return new Promise((resolve, reject) => {
          const process = spawn('python', ['transcribe.py', filePath]);
          let dataString = '';

          process.stdout.on('data', (data) => {
            dataString += data.toString();
            console.log(`Python stdout: ${dataString}`);
            const partialTranscription = JSON.stringify({ partialTranscription: dataString });
            res.write(partialTranscription + '\n');
          });

          process.stderr.on('data', (data) => {
            console.error(`Transcription error: ${data}`);
            reject(data);
          });

          process.on('close', (code) => {
            console.log(`Transcription process exited with code ${code}`);
            const result = JSON.parse(dataString);
            resolve(result);
          });
        });
      } catch (error) {
        currentResponse = [
          {
            text: "Lo siento! No te puedo escuchar!",
            facialExpression: "sad",
            animation: "Annoyed",
          },
          {
            text: "Creo que hay un problema con el microfono!",
            facialExpression: "default",
            animation: "Thinking",
          }
        ];
      }
    };


    try {
      const { transcription, transcription_time } = await transcribeAudio();
      if (!transcription) {
        userMessage = 'El audio fue incoherente, porfavor preguntale al usuario si puede repetir su mensaje.';
      } else {
        userMessage = transcription;
      }
      console.log(`Transcribed message: ${userMessage}`);
      console.log(`Transcription time: ${transcription_time} seconds`);
    } catch (error) {
      console.error(`Error transcribing audio: ${error}`);
      res.status(500).send({ error: 'Error transcribing audio' });
      return;
    }

    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted audio file: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting audio file: ${error}`);
    }
  }

  // Intro message: Import from JSON
  let hardcodedMessages;
  let hardcodedAudioName;

  if (!userMessage) {
    hardcodedAudioName = "EmptyPrompt";
    hardcodedMessages = avatarData.avatars.digitalConcierge.hardcodedMessages.test;
  }


  // The following code generates the audio and lipsync files for hardcoded messages if they don't exist already
  const generateFiles = async (retryCount = 0) => {
    if (!hardcodedMessages) return; // Skip if there are no hardcoded messages

    try {
      await Promise.all(hardcodedMessages.map(async (message, i) => {
        const fileName = `audios/${hardcodedAudioName}_${i}.mp3`;
        const messageName = hardcodedAudioName;

        if (!fs.existsSync(`audios/${hardcodedAudioName}_${i}.mp3`) || !fs.existsSync(`audios/${hardcodedAudioName}_${i}.json`)) {
          const textInput = message.text;
          await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, stability, similarityBoost, modelId);
          await lipSyncMessage(messageName, i);
          console.log(`Generated audio and lipsync for message ${i}`);
        }

        message.audio = await audioFileToBase64(`audios/${hardcodedAudioName}_${i}.mp3`);
        message.lipsync = await readJsonTranscript(`audios/${hardcodedAudioName}_${i}.json`);
      }));
    } catch (error) {
      if (retryCount < 1) {
        console.log(`Retry attempt ${retryCount + 1} for file generation`);
        await generateFiles(retryCount + 1);
      } else {
        throw error;
      }
    }
  };

  // Generate files with retry
  try {
    await generateFiles();
  } catch (error) {
    console.error("Error generating files:", error);
    res.status(500).json({ error: "Failed to generate necessary files" });
    return;
  }

  if (hardcodedMessages) {
    res.write(JSON.stringify({ messages: hardcodedMessages }) + '\n');
    res.end();
    return;
  }
  res.write(JSON.stringify({ messages: hardcodedMessages }) + '\n');
  if (!userMessage) {
    res.end();
    return;
  }
  // The following does: 
  // 1. Send a message to the OpenAI API
  // 2. Generate audio files for each message
  // 3. Generate lipsync files for each message
  // 4. Send back the messages with the audio and lipsync files

  // Chat GPT 
  try {
    messageHistory.push({ role: "user", content: userMessage });
    //Tools to be imported from JSON
    const tools = [
      {
        type: "function",
        function: {
          name: "info_san_cristobal",
          description: "Esta función proporciona información sobre San Cristóbal, Venezuela, como sus habitantes y otros detalles.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "info_hotel",
          description: "Esta función proporciona información sobre el hotel Tamá incluyendo areas recreativas, bares y restaurantes, y salas donde se pueden realizar eventos.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getCurrentWeather",
          description: "Función para obtener data climatológica local (San Cristobal).",
          parameters: {
            type: "object",
            properties: {},
          },
        }
      },
      {
        type: "function",
        function: {
          name: "ticket_hotel_tama",
          description: "Función para solicitar un ticket en el hotel Tamá, con la solicitud del cliente. Debes proporcionar la solicitud individualmenente y utilizando solo las palabras claves.",
          parameters: {
            type: "object",
            properties: {
              requestText: {
                type: "string",
                description: `Muy directa y clara solicitud de lo que se necesita. Ejemplo:
              El cliente pide una toalla extra en la habitación. requestText: "Toalla extra"`,
              },
              roomNumber: {
                type: "string",
                description: "Lugar a donde se entrega el servicio (opcional).",
              },
            },
            required: ["requestText"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getHotelData",
          description: "Esta función proporciona información sobre los Eurobuildings en la región, basado en el nombre del Eurobuilding o el gerente del mismo. También puedes encontrar el número de habitaciones de cada hotel. Agradece siempre al gerente del hotel encontrado.",
          parameters: {
            type: "object",
            properties: {
              hotelName: {
                type: "string",
                description: "Nombre del Eurobuilding (opcional).",
              },
              hotelOwner: {
                type: "string",
                description: "Nombre del gerente del hotel (opcional).",
              },
            },
            required: [],
          }
        }
      }
    ];
    //console.log("Conversation before sending to ChatGPT");
    //console.log(messageHistory);

    const time = new Date().getTime();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: {
        type: "json_object",
      },
      messages: messageHistory,
      tools: tools,
      tool_choice: "auto",
    });

    console.log(`ChatGPT response time: ${new Date().getTime() - time}ms`);
    console.log("ChatGPT response:");
    console.log(response.choices[0].message);

    messageHistory.push(response.choices[0].message);

    const responseMessage = response.choices[0].message;

    const toolCalls = responseMessage.tool_calls;

    const availableFunctions = {
      contactanosEmail,
      ticket_hotel_tama,
      info_hotel,
      info_san_cristobal,
      getCurrentWeather,
      getHotelData
    };

    let finalMessage = responseMessage;
    //Tool calls to be imported from JSON
    if (responseMessage.tool_calls) {
      console.log("Tool calls found in the response");
      console.log(toolCalls);

      // messages.push(responseMessage);

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];

        if (functionToCall) {
          const functionArgs = JSON.parse(toolCall.function.arguments);

          const functionResponse = await functionToCall(...Object.values(functionArgs));

          messageHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: functionResponse,
          });

        } else {
          console.error(`Function ${functionName} not found`);
        }
      }

      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        temperature: 0.6,
        response_format: {
          type: "json_object",
        },
        messages: messageHistory,
      });

      console.log("Second response after function calls");
      console.log(secondResponse.choices);

      messageHistory.push(secondResponse.choices[0].message);

      finalMessage = JSON.parse(secondResponse.choices[0].message.content);

    } else {
      console.log("No tool calls found in the response");
      finalMessage = JSON.parse(responseMessage.content);
      console.log("FINAL MESSAGE:", finalMessage);
    }

    if (finalMessage.messages) {
      currentResponse = finalMessage.messages || finalMessage;
    }
  } catch (error) {
    console.error("Error during ChatGPT API call:", error);
    currentResponse = [
      {
        text: "Parece que no tengo acceso a los servidores...",
        facialExpression: "sad",
        animation: "SadIdle",
      },
      {
        text: "Sugiero usar un VPN!",
        facialExpression: "default",
        animation: "Thinking",
      }
    ];
  }

  // Function to split text into sentences
  const splitIntoSentences = (text) => {
    return text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  };

  for (let i = 0; i < currentResponse.length; i++) {
    const message = currentResponse[i];
    const sentences = splitIntoSentences(message.text);

    for (let j = 0; j < sentences.length; j++) {
      const sentence = sentences[j].trim();
      // Generate audio file for the sentence
      const fileName = `audios/message_${i}_sentence_${j}_.mp3`;
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, sentence, stability, similarityBoost, modelId);

      // Generate lipsync for the sentence
      const messageName = `message_${i}_sentence_${j}`;
      await lipSyncMessage(messageName, '');

      const sentenceMessage = {
        text: sentence,
        audio: await audioFileToBase64(fileName),
        lipsync: await readJsonTranscript(`audios/${messageName}_.json`),
        facialExpression: message.facialExpression,
        animation: sentence.toLowerCase().includes('qr') ? 'Presentation' :
          sentence.toLowerCase().includes('anillos') ? 'SadIdle' : message.animation
      };

      console.log('Sentence(', i, ',', j, '):', sentenceMessage.text);

      // Send each sentence as soon as it's ready
      res.write(JSON.stringify({ messages: [sentenceMessage] }) + '\n');
    }
  }
  res.end();
});

const readJsonTranscript = async (file) => {
  const data = await fsPromises.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fsPromises.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Concierge listening on port ${port}`);
});