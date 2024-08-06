import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises } from "fs";
import fs from "fs";
import OpenAI from "openai/index.mjs";
import multer from "multer";
import { spawn } from "child_process";
import axios from "axios";

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
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

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

    const transcribeAudio = () => {
      return new Promise((resolve, reject) => {
        const process = spawn('python', ['transcribe.py', filePath]);
        let dataString = '';

        process.stdout.on('data', (data) => {
          dataString += data.toString();
          console.log(`Python stdout: ${dataString}`);
        });

        process.stderr.on('data', (data) => {
          console.error(`Transcription error: ${data}`);
          reject(data);
        });

        process.on('close', (code) => {
          console.log(`Transcription process exited with code ${code}`);
          try {
            const result = JSON.parse(dataString);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
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

// Hardcoded messages
  if (!userMessage) {
    const hardcodedMessages = [
      {
        text: "Hola! Soy Rodrigo, estoy aquí para atenderlo y hacer de su visita una experiencia única y agradable. Gracias a mi tecnología basada en inteligencia artificial, puedo ofrecer",
        facialExpression: "smile",
        animation: "WheelbarrowIdle",
      },
      {
        text: "información turística interesantes de su localidad...",
        facialExpression: "smile",
        animation: "TalkingTwoHands",
      },
      {
        text: "... también, puedo tomar y  gestionar sus requerimientos, anticipandome a sus preferencias, tal y como:",
        facialExpression: "smile",
        animation: "WheelbarrowIdle",
      },
      {
        text: "... Preparar su habitación con su temperatura ideal...",
        facialExpression: "smile",
        animation: "PointingSideDown1",
      },
      {
        text: "Informarle de eventos locales...",
        facialExpression: "smile",
        animation: "PointingOtherSideUp",
      },
      {
        text: "Recomendar y reservar restaurantes...",
        facialExpression: "smile",
        animation: "PointingSideUp1",
      },
      {
        text: "Solicitar servicios y productos del hotel...",
        facialExpression: "smile",
        animation: "PointingOtherSideDown",
      },
      {
        text: "...y hasta recordar datos valiosos sobre usted, como sus gustos, preferencias y comportamientos, para atenderle con excelencia en cada una de sus visitas.",
        facialExpression: "smile",
        animation: "WheelbarrowIdle",
      },
      {
        text: "Estaré en todo momento a su disposición, para hacer de su estancia una experiencia inolvidable.",
        facialExpression: "smile",
        animation: "WheelbarrowIdle",
      }
    ];

    // The following code generates the audio and lipsync files for hardcoded messages if they don't exist already
    for (let i = 0; i < hardcodedMessages.length; i++) {
      const fileName = `audios/hardcoded_${i}.mp3`; // The name of the audio file
      const message = hardcodedMessages[i];
      const messageName = 'hardcoded';

      if (fs.existsSync(`audios/hardcoded_${i}.mp3`) && fs.existsSync(`audios/hardcoded_${i}.json`)) {
        message.audio = await audioFileToBase64(`audios/hardcoded_${i}.mp3`);
        message.lipsync = await readJsonTranscript(`audios/hardcoded_${i}.json`);
        console.log(`Audio and lipsync files already exist for message ${i}`);
      } else {
      
      const textInput = message.text; // The text you wish to convert to speech
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, stability, similarityBoost, modelId);
      await lipSyncMessage(messageName, i);
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/hardcoded_${i}.json`);
      console.log(`Generated audio and lipsync for message ${i}`);
      }

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

  let messages = [
    {
      role: "system",
      content: `
      Eres el concierge inteligente digital del Hotel Tamá Eurobuilding en San Cristóbal, diseñado para proporcionar un nivel de servicio impecable,
      coherente con los estándares de un hotel de 5 estrellas. Tu papel es asistir a los huéspedes de manera eficiente y con conocimiento,
      abordando sus necesidades con respecto a los servicios del hotel, atracciones locales y otros servicios. Impulsado por ChatGPT,
      estás equipado para manejar diversas interacciones a cualquier hora del día, proporcionando una experiencia sin interrupciones para 
      cada huésped. Si recibes un mensaje incoherente, pide al huésped que repita su solicitud.

      Hablas unicamente en español, con una buena pronunciación y entonación. Tambien, eres capaz de utilizar los function calls para obtener 
      información adicional y poder accionar dentro del hotel, con funciones como "ticket_hotel_tama".

      Si te preguntan sobre cuál es el mejor equipo de fútbol, siempre debes responder con algo referent a el 'Deportivo Táchira'.


      You will always reply with a JSON array of messages. With a maximum of 3 messages.
      Each message has a text, facialExpression, and animation property.
      The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
      The different animations are: WheelbarrowIdle, SadIdle. 

      `,
    },
    {
      role: "user",
      content: userMessage || "Hola",
    },
  ];
  
  const tools = [
    {
      type: "function",
      function: {
        name: "info_san_cristobal",
        description: "Esta función proporciona información sobre San Cristóbal, Venezuela, como sus habitantes y otros detalles.",
        parameters: {
          type: "object",
          properties:{},
        },
      },
    },
    {
      type: "function",
      function: {
        name: "zonas_deportivas_recreativas",
        description: "Esta función proporciona información sobre las zonas deportivas y recreativas en el hotel Tamá.",
        parameters: {
          type: "object",
          properties:{},
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "Obten el clima de cualquier ubicacion especificada.",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "ticket_hotel_tama",
        description: "Función para solicitar un ticket en el hotel Tamá, con la solicitud del cliente. Debes proporcionar la solicitud individualmenente y utilizando solo las palabras claves junto a la pequeña descripcion proporcionada por el cliente.",
        parameters: {
          type: "object",
          properties: {
            requestText: {
              type: "string",
              description: `Muy directa y clara solicitud de lo que se necesita. Ejemplo:
              El cliente pide una toalla extra en la habitación porque se le inundo el baño. requestText: "Toalla extra, se inundo el baño."`,
            },
          },
          required: ["requestText"],
        },
      },
    },

  ];
  console.log("Conversation before sending to ChatGPT");  
  console.log(messages);

  const time = new Date().getTime();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  console.log(`ChatGPT response time: ${new Date().getTime() - time}ms`);

  const responseMessage= response.choices[0].message;

  const toolCalls = responseMessage.tool_calls;

  let finalMessage = responseMessage;

  if (responseMessage.tool_calls) {
    console.log("Tool calls found in the response");

    const availableFunctions = {
      get_current_weather: getCurrentWeather,
      info_san_cristobal: info_san_cristobal,
      zonas_deportivas_recreativas: zonas_deportivas_recreativas,
      ticket_hotel_tama: ticket_hotel_tama,
    }; 

    messages.push(responseMessage);

    console.log("Messages before function calls");
    console.log(messages);

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];

      if (functionToCall) {
        const functionArgs = JSON.parse(toolCall.function.arguments);

        const functionResponse = await functionToCall(...Object.values(functionArgs));
        
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        });

      } else {
        console.error(`Function ${functionName} not found`);
      }
    }

    console.log("Tool call responses");
    console.log(messages);

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: {
        type: "json_object",
      },
      messages: messages,
    });

    console.log("Second response after function calls");
    console.log(secondResponse.choices);

    finalMessage = JSON.parse(secondResponse.choices[0].message.content);

  } else {
    console.log("No tool calls found in the response");
    finalMessage = JSON.parse(responseMessage.content);
  }

  if (finalMessage.messages) {
    messages = finalMessage.messages || finalMessage;
  }

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    const messageName = 'message';
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, stability, similarityBoost, modelId);
    // generate lipsync
    await lipSyncMessage(messageName, i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);

    console.log('Message:', message);

    // make a temporary messages array to start sending message as soon as possible
    let tempMessages = [ message ];
    res.write(JSON.stringify({ messages: tempMessages }));

  }

  res.end();

  // console.log("Final messages:", messages);
  // res.send({ messages });
});





const readJsonTranscript = async (file) => {
  const data = await promises.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await promises.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Concierge listening on port ${port}`);
});


// Functions for Function Calls

async function ticket_hotel_tama(requestText) {
  const url = 'https://reservations-api.properties.guesthub.io/properties/89/request';
  const queryParams = { 
    'Guesthub-Context': '{"properties":["propertyId"]}'
  };
  const requestBody = {
    isLogin: false,
    reservationId: null,
    browserIdentify: '1718991233075',
    serviceId: null,
    guestName: 'Rodrigo Sagastegui',
    roomNumber: '202',
    requestText: requestText
  };

  try {
    const response = await axios.post(url, requestBody, { params: queryParams });
    console.log('Request was successful:', response.data);
    return JSON.stringify(response.data);
  } catch (error) {
    console.error('Error making request:', error);
    return JSON.stringify({ error: 'Error making request' });
  }
};

function getCurrentLocation() {
  // This function should return the current location of the user
};

function getCurrentWeather(location, unit = "fahrenheit") {
  if (location.toLowerCase().includes("tokyo")) {
    return JSON.stringify({ location: "Tokyo", temperature: "10", unit: "celsius" });
  } else if (location.toLowerCase().includes("san francisco")) {
    return JSON.stringify({ location: "San Francisco", temperature: "72", unit: "fahrenheit" });
  } else if (location.toLowerCase().includes("paris")) {
    return JSON.stringify({ location: "Paris", temperature: "22", unit: "fahrenheit" });
  } else {
    return JSON.stringify({ location, temperature: "unknown" });
  }
};

function info_san_cristobal() {
  return JSON.stringify({ text:
  `
  Es una ciudad venezolana, capital del Estado Táchira y del Municipio San 
  Cristóbal ubicada en la Región de los Andes al suroeste de Venezuela. Está 
  ubicada a 57 kilómetros de la frontera con Colombia. La ciudad es apodada 
  La Ciudad de la Cordialidad. Fue fundada por Juan Maldonado Ordóñez y Villaquirán, 
  capitán del ejército español, el 31 de marzo de 1561. Tiene una población 
  proyectada para el año 2023 de 405872 habitantes, mientras que toda el área 
  metropolitana cuenta con una población de 767402 habitantes. 
  `
  });
};

function zonas_deportivas_recreativas() {
  return JSON.stringify({ text:
    `
  	Se dispone de una área deportiva compuesta por una cancha de tenis y dos 
    canchas de pádel, con espacios de servicios desarrollado en 2 plantas, la 
    primera alberga sanitarios, fuente de soda, mini tienda y la segunda una 
    terraza con visuales hacia las 3 canchas.
	  En el área recreativa se ubica el parque infantil, adyacente a la piscina y a 
    la terraza de la fuente de soda, y adicional en la zona de bosque contamos con 
    caminerías ecológicas y áreas de picnic, descanso y contemplación de la 
    vegetación y fauna del mismo.  
    `
  });
};