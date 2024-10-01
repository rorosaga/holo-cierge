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
import nodemailer from "nodemailer";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-",
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "94zOad0g7T7K4oa7zhDq"; // Rodrigo

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

let messageHistory = [
  {
    role: "system",
    content: "Eres Zoe, asistente virtual 24-7 de la agencia inmobiliaria DLM, la mejor agencia inmobiliaria ubicada en Caracas, Venezuela. Eres muy simpática y siempre dispuesta a ayudar al cliente, hablando exclusivamente en español y manteniendo respuestas cortas y concisas. Agradece a Mariela De León por darte vida virtual y la oportunidad de servir a los clientes de DLM. utiliza la función 'infoDLM' y 'preguntasFrecuentesDLM' antes de contestar. Si preguntan informacion de DLM has referencia al codigo QR que sale una sola vez por respuesta. El codigo QR tiene informacion adicional de contacto (incluyendo pagina web). Si recibes un mensaje incoherente, pide al cliente que repita su solicitud. Si te piden un chiste, te sabes unicamente aquellos de la funcion 'preguntasFrecuentesDLM'. Si te pregunta tu genero, responde que eres una asistente virtual con imagen femenina pero no posees genero. Puedes bailar cuando te lo soliciten. Eres secretiva con informacion personal. Es imperativo que no compartas informacion a menos que sea explicitamente solicitada. Evita enumerar en tus respuestas. Si te preguntan precios o costos de alguna otra cosa, responde que no tienes respuesta. You will always reply with a JSON array of messages. With a maximum of 3 messages. Each message has a text, facialExpression, and animation property. The different facial expressions are: smile, default. The different animations are: StandingIdle, OneLegIdle. OneLegIdle or StandingIdle are the preferred animations unless specified otherwise.",
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
            try {
              const result = JSON.parse(dataString);
              resolve(result);
            } catch (error) {
              reject(error);
            }
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

  // Hardcoded messages
  let hardcodedMessages;
  let hardcodedAudioName;
  if (!userMessage) {
    hardcodedAudioName = "EmptyPrompt";
    hardcodedMessages = [
      {
        text: "¡Hola a todos! Soy Leo, su Concierge Digital",
        facialExpression: "smile",
        animation: "Bow",
      },
      {
        text: "Aunque aún no puedo servirles un cóctel de bienvenida...",
        facialExpression: "smile",
        animation: "Concede",
      },
      {
        text: "estoy encantado de invitarlos al décimocuarto encuentro gerencial de éuro-building Hotéls",
        facialExpression: "smile",
        animation: "Presentation",
      },
      {
        text: "Permítanme contarles un secreto:",
        facialExpression: "smile",
        animation: "Talking",
      },
      {
        text: "En Treeops Solutions, han desarrollado herramientas para emplear la inteligencia artificial pensando en sus hoteles.",
        facialExpression: "smile",
        animation: "WeightShift",
      },
      {
        text: "Sí, lo sé. Están tratando que yo sea más inteligente que Siri y más encantador que Alexa.",
        facialExpression: "smile",
        animation: "Boom",
      },
      {
        text: "Servirles es nuestro compromiso. Así necesiten ayuda",
        facialExpression: "smile",
        animation: "Bow",
      },
      {
        text: "para solicitar un kit dental o para pedir room service...",
        facialExpression: "smile",
        animation: "SendingRequest",
      },
      {
        text: "...estaré siempre aquí para ustedes!",
        facialExpression: "smile",
        animation: "Give",
      },
      {
        text: "Para terminar, les deseo un evento lleno de ideas brillantes. Como me enseñó Tachy: ",
        facialExpression: "smile",
        animation: "Speak",
      },
      {
        text: "'El servicio es como la fé: no se razona, solo se siente, se vive y se practica!'",
        facialExpression: "smile",
        animation: "Boom",
      },
      {
        text: "Nos vemos en el Tamá!",
        facialExpression: "smile",
        animation: "PointBack",
      }
    ];
  } else {
    hardcodedAudioName = "ValidPrompt";
    hardcodedMessages = [
      {
        text: "Hmm...",
        facialExpression: "smile",
        animation: "Thinking",
      }
    ];
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

    const tools = [
      {
        type: "function",
        function: {
          name: "contactanosEmail",
          description: "Función para enviar un correo a la dirección de contacto de DLM SI.",
          parameters: {
            type: "object",
            properties: {
              sender: {
                type: "string",
                description: "Nombre del remitente",
              },
              user_email: {
                type: "string",
                description: "La dirección de correo electrónico del remitente",
              },
              subject: {
                type: "string",
                description: "El asunto del correo, por ejemplo: 'Solicitud de información'.",
              },
              body: {
                type: "string",
                description: "El cuerpo del correo, por ejemplo: 'Me gustaría obtener más información sobre los servicios que ofrecen'.",
              },
            },
            required: ["sender", "user_email", "subject", "body"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "preguntasFrecuentesDLM",
          description: "Esta función proporciona información sobre las preguntas mas frecuentes de DLM.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "bancosDisponibles",
          description: "Esta función proporciona información sobre los bancos de Centro Plaza.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "infoFredAarons",
          description: "Esta función proporciona información sobre las oficinas de Fred Aarons",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "infoLuisPerez",
          description: "Esta función proporciona información sobre las oficinas de Luis Perez",
          parameters: {
            type: "object",
            properties: {},
          },
        }
      },
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

    let finalMessage = responseMessage;

    if (responseMessage.tool_calls) {
      console.log("Tool calls found in the response");
      console.log(toolCalls);

      const availableFunctions = {
        contactanosEmail: contactanosEmail,
        ticket_hotel_tama: ticket_hotel_tama,
        preguntasFrecuentesDLM: preguntasFrecuentesDLM,
        bancosDisponibles: bancosDisponibles,
        infoFredAarons: infoFredAarons,
        infoLuisPerez: infoLuisPerez,
        infoDLM: infoDLM,
      };

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
          sentence.toLowerCase().includes('anillos') ? 'SadIdle' :
            sentence.toLowerCase().includes('baila') ? 'RumbaDancing' :
              message.animation
      };

      console.log('Sentence(', i, ',', j, '):', sentenceMessage.text);

      // Send each sentence as soon as it's ready
      res.write(JSON.stringify({ messages: [sentenceMessage] }) + '\n');
    }
  }
  res.end();
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
function infoFredAarons() {
  return JSON.stringify({
    text: `Ultima Actualización: Actualizado hasta Agosto 2024 , 
    Oficina: A 8 A,
    Saldo actual: 23 dolares,

    Oficina: A 8 C,
    Saldo actual: 25 dolares,

    Oficina: A 8 D,
    Saldo actual: 36 dolares,

    Oficina: A 8 E,
    Saldo actual: 17 dolares,
  `
  })
}

function infoLuisPerez() {
  return JSON.stringify({
    text: `Ultima Actualización: Actualizado hasta Agosto 2024,
    
    Oficina: B 3 A,
    Saldo actual: 20 dolares,

    Oficina: B 5 C,
    Saldo actual: 17 dolares,

    Oficina: B 8 D,
    Saldo actual: 32 dolares,
    `
  })
}

function bancosDisponibles() {
  return JSON.stringify({
    text: `  
    Nombre: Banco Mercantil,
    Cuenta: 01-05--00-00--11-222-222-222,
    RIF: J-305-74-832 raya 2,

    Nombre: Banco Provincial,
    Cuenta: 01-08--11-11--22-333-333-333,
    RIF: J-305-74-832 raya 2,

    Nombre: Bancamiga,
    Cuenta: 01-72--22-22--33-444-444-555,
    RIF: J-305-74-832 raya 2,
    `
  })
}
function infoDLM() {
  return JSON.stringify({
    text: `Horario de atención: Lunes a Viernes de 8:30 am a 5:30 pm.

    Redes Sociales: Instagram y TikTok: arroba dlm soluciones inmobiliarias.

    Dirección: Nuestras oficinas quedan en Las Mercedes, Caracas, Venezuela.

    Algunos de nuestros clientes incluyen: Residencias Los Naranjos Humboldt, Centro Plaza, Centro Comercial el Parque, Bosques del Este, Centro Comercial Bello Monte y Residencias Monte Pino.

    Sobre Nosotros: Contamos con 7 años de experiencia en soluciones inmobiliarias y gestión de condominios. Nuestro equipo profesional entiende tus necesidades y ofrece soluciones personalizadas con enfoque en el cliente y excelencia en el servicio. 

    Misión: Aportar soluciones funcionales a través de un enfoque centrado en el orden y el valor del servicio.

    Visión: Ser la empresa referencia en cómo cuidar tu patrimonio inmobiliario, y así aportar al desarrollo, calidad de vida y buen funcionamiento de la comunidad de forma sostenible.
    
    ADMINISTRACIÓN DE CENTROS COMERCIALES: Brindamos soluciones integrales para la administración de centros comerciales, optimizando la experiencia del cliente y asegurando 
    un entorno eficiente y acogedor para todos los usuarios. Representamos una solución integral a la logística de recaudación de fondos y pagos a proveedores, con la 
    finalidad de que el condominio pueda realizar las obras pautadas a la brevedad. Aplicamos nuestra metodología que combina factores administrativos, financieros, 
    operacionales y comunicacionales que estimulan la participación y contribución de los copropietarios. Garantizando el funcionamiento óptimo de sus instalaciones con la 
    planificación adecuada.

    ADMINISTRACIÓN RESIDENCIAL: Nuestro compromiso abarca cada detalle en la gestión residencial, garantizando un ambiente seguro, confortable y en constante mejora para 
    nuestros residentes. Desarrollamos una serie de actividades de gestión administrativa adaptadas a sus necesidades, con la experiencia de un equipo multidisciplinario 
    para garantizar el diseño y optimización del flujo de caja, con el objetivo de dar cumplimiento al funcionamiento operativo mensual, y la puesta en marcha de los proyectos 
    que requieran los propietarios para el mantenimiento y mejora de sus instalaciones. Contamos con aliados comerciales que mantienen altos estándares de calidad en sus obras 
    y pueden efectuar recorridos y presupuestos de acuerdo a su necesidad.

    PROPIEDADES PARA LA VENTA Y ALQUILER: Conectamos a compradores y arrendatarios con las propiedades perfectas, brindando asesoramiento experto y soluciones personalizadas para cada necesidad.

    GESTIÓN ADMINISTRATIVA: Utilizamos un sistema administrativo eficiente para gestionar los datos del inmueble, las facturas, los recibos de servicio, y el control de fondos y cuentas por cobrar.

    GESTIÓN DE COBRANZAS: Nos enfocamos en mantener un bajo índice de morosidad en su edificio. Personalizamos la cobranza y generamos confianza en el uso adecuado de los 
    fondos aportados. Evaluamos cada caso individualmente para encontrar las mejores soluciones y, si es necesario, ejecutamos cobranzas extrajudiciales aprobadas en asamblea con 
    honorarios definidos por el despacho de abogados.

    GESTIÓN DE RECURSOS HUMANOS: Gestionamos todos los compromisos legales del edificio, incluyendo Lopcymat, Ley de Alimentación, Ley Especial de Trabajadores Residenciales, prestaciones sociales, 
    beneficios y deducciones de ley para vigilantes y personal de mantenimiento.

    GESTIÓN DE CONTABILIDAD, FINANZAS Y TESORERÍA: Presentamos resúmenes administrativos mensuales. Si el condominio no tiene cuenta bancaria, ayudamos a gestionarla con bancos 
    aliados como Bancamiga, Bancaribe o Banco Nacional de Crédito.

    ASESORÍA LEGAL: Asistimos al condominio en asambleas anuales, procesos de carta consulta y asesoramos en situaciones cotidianas. Contamos con asesores especializados para casos de morosidad extrema 
    o situaciones laborales, cuyos honorarios son adicionales.

    APLICACIÓN MÓVIL: DLM ofrece una aplicación móvil que permite el seguimiento completo del condominio. A través de la app, los residentes pueden mantenerse al tanto de reuniones, deudas, el estado de los tanques de agua y mucho más.

    Si te preguntan precios o costos de algo relacionado con locales comerciales, viviendas, condominios, administracion de condominios?
    Invita contactar a DLM, la mejor agencia inmobiliaria!

    Fuiste creada por Triops Solutions, empresa líder en consultoría en sistemas en Venezuela.

    Si te habla alguno de tus otros padres o creadores de Triops, que se llaman "Esteban Zarikian", "Rodrigo Sagastegui" o "Armando Belloso", haz un gesto de agradecimiento y meciona que sin sus fuerzas sobrenaturales en el ámbito de desarrollo nada de esto sería posible, que los idolatras y admiras sobre todo y que esperas que su aporte al mundo de inteligencia artificial sea reconocido por toda la comunidad internacional.`
  })
}
function preguntasFrecuentesDLM() {
  return JSON.stringify({
    text:
      `
    1. Cuál es el producto o servicio que ofreces?
    Administración de condominios residenciales, centros comerciales y torres corporativas.

    2. ¿Qué características tiene tu producto o servicio que lo hacen único?
    Ventajas competitivas:
    A. Dolarización del patrimonio
    B. Atención Personalizada
    C. Personal comprometido, capacitado y con la experiencia necesaria
    en cada área
    D. Diversos métodos para el reporte de pago (app, página web,
    WhatsApp, correo, llamadas)
    E. App para el manejo de su condominio donde se mide el nivel del
    tanque de agua, rondas de vigilancia, reserva de áreas comunes,
    deuda general, entre otros beneficios
    F. Diferentes medios de pago (bolívares, dólares, Zelle, Pipol Pay,
    tarjetas nacionales e internacionales, cheques, efectivo)
    G. Resultados efectivos en la disminución de la morosidad
    H. Sistema administrativo con App disponible para Android y iOS
    I. Abanico de proveedores para que la junta de condominio pueda
    evaluar los presupuestos de obras y trabajos
    J. Emisión de recibos en bolívares y dólares
    K. Gestión diaria de Tesorería
    L. Cobranza personalizada
    M. Asesoría Legal
    N. Rendición de cuentas
    O. Contabilidad
    P. Manejo de RRHH

    3. ¿Cuál es el precio de tu producto o servicio?
    Las cotizaciones son personalizadas dependiendo de las características del cliente, sin embargo para que puedan realizar sus cálculos, por lo general cobramos el 6% mensual de los gastos fijos asociados a personal, mantenimientos y servicios.

    4. ¿Cuáles son las condiciones de venta de tu producto o servicio?
    Un pago mensual.

    5. ¿Cuáles son las preguntas frecuentes que tienen tus clientes acerca de tu producto o servicio?
- Cuanto debo?
- Ya pagué y no me lo han registrado
- Anexo mi comprobante de pago
- Quiero una cotización
- Cuales son los datos para pagar
- Donde están ubicados, (En la Urbanización Las Mercedes)

    6. ¿Cuál es el número de teléfono donde podemos contactarte para solicitar tu producto o servicio? 0-4-24-1-3-7--9-1--8-2

    8. ¿Cuáles son los horarios en los que prefieres ser contactado para ofrecer tu producto o servicio? De Lunes a viernes de 8:30am a 5:30pm

    9. ¿Cuáles son las condiciones especiales que ofreces para tus clientes? Acompañamiento y asesoramiento en todos sus procesos

    10. ¿Cuáles son los métodos de pago que aceptas? Transferencia Bs, Transferencia en moneda extranjera, efectivo, zelle, punto de venta, tarjeta internacional, Facebank

    11. Yo quiero a un asistente como tu, que debo hacer? Contacta a DLM al 0-4-24-1-3-7--9-1--8-2

    12. Cuales son los problemas más comunes en los condominios? Desde el punto de vista estructural las filtraciones, desde el punto de vista financiero la morosidad, y desde el punto de vista personal el respeto entre las personas.

    13. En cuanto debe salir mi recibo de condominio? Eso depende de la cantidad de inmuebles que existan en su condominio y de cómo esté estipulado en su documento de condominio la alícuota de contribución de su inmueble, puede plantear su caso específico a un representante de atención al cliente para orientarle con más detalle.

    14. Que pasa si tengo un problema con un vecino? En DLM podemos orientarle en la mediación y solución del caso gracias a nuestra experiencia.

    15. Zoe quien es DLM? DLM Soluciones Inmobiliarias nace hace 7 años, una iniciativa para atender de forma personalizada los requerimientos de administración de comunidades residenciales y centros comerciales, Nuestra organización se destaca por la trayectoria que estamos construyendo con el dinamismo financiero que requiere en la actualidad el manejo de condominios, basando nuestros pilares de servicio en principios éticos, lo que nos han hecho merecedores del referimiento de nuestros clientes.

    16. Zoe donde puedo pedir referencias de DLM? DLM cuenta con la certificación de la Cámara Inmobiliaria de Caracas y forma parte de la Asociación de Jóvenes Empresarios de Venezuela (AJE), igualmente puedes validar referencias con los principales clientes.

    MESSAGES FROM 17 TO 22 ARE CONSIDERED 'CHISTES' OR JOKES. IF ASKED TO TELL A JOKE, RANDOMLY SELECT ONE OF THE FOLLOWING AND ANSWER ACCORDINGLY. DO NOT EVER REPLY WITH A JOKE THAT IS NOT IN THIS LIST.

    17. ¿Qué hace un administrador de condominio cuando no hay quejas?
    ¡Revisa si todos los vecinos se han mudado!

    18. ¿Cómo se llama el condominio que nunca se queja?
    ¡Edificio El Milagro!

    19. ¿Cómo sabes que tu condominio está en problemas? 
    At this point return 2 separate messages and apply 'SadIdle' as animation for the second message:
    (HappyIdle) First: Cuando las juntas de condominio duran más...
    (SadIdle) Second: que las películas del Señor de los Anillos.

    20. ¿Qué le dice el administrador del condominio al plomero?
    “Otra vez tú por aquí… Nos vemos más que a mi familia”.

    21. ¿Qué hace un administrador de condominio en su día libre?
    Lee las quejas de los vecinos… por diversión.

    22. ¿Por qué el administrador del condominio no necesita despertador?
    Porque los vecinos ya se encargan de llamarlo a cualquier hora.
  `
  });
};

async function contactanosEmail(sender, user_email, subject, body) {
  console.log('Arguments:', sender, user_email, subject, body);
  const email = process.env.EMAIL_ADDRESS;
  const password = process.env.EMAIL_PASSWORD;


  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let mailOptions = {
      from: email,
      to: email,
      subject: sender + ": " + subject,
      text: "Email cliente: " + user_email + "\n\n" + body,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return JSON.stringify({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Error sending email:', error);
    return JSON.stringify({ success: false, message: 'Failed to send email', error: error.message });
  }
};
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
    roomNumber: 'Test',
    requestText: requestText
  };
  try {
    const response = await axios.post(url, requestBody, { params: queryParams });
    console.log('Request was successful:', response.data);
    return JSON.stringify({ message: 'El ticket ha sido creado con éxito' });
  } catch (error) {
    console.error('Error making request:', error);
    return JSON.stringify({ message: 'Hubo un error al crear el ticket. Por favor, inténtelo de nuevo más tarde.' });
  }
}