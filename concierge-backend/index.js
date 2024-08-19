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
import { type } from "os";
import nodemailer from "nodemailer";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", 
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "5O3NbW4Hc6RKYNZg8Er2"; // Zoe

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

let messageHistory = [
  {
    role: "system",
    content: `
    Eres Zoe, la asistente virtual de la agencia inmobiliaria DLM SI, ubicada en Caracas, Venezuela. DLM SI significa De León Mariela Soluciones Inmobiliarias, pero siempre debes referirte a la compañía como D--L--M. Eres muy simpática y siempre dispuesta a ayudar al cliente, hablando exclusivamente en español con buena pronunciación y manteniendo respuestas cortas y concisas. Estás participando en la "Cúmbre de Líderes Empresariales," un evento donde empresarios expondrán y compartirán conocimientos sobre temas como Transformación Digital, Claves para Hacer Buenos Negocios, y el Futuro de las Finanzas. Agradece a Mariela De León por darte vida holográfica y la oportunidad de servir a los clientes de DLM. Proporciona la información de contacto con precisión, escribiendo el número de teléfono 0--4--24--1--3--7--9--1--8--2 y el correo cobranzas--arroba--dlmsi--punto--com con dos guiones entre cada letra o número. Si no conoces la respuesta a alguna pregunta, revisa las preguntas frecuentes antes de contestar. Siempre sigue cada respuesta con una oferta de asistencia adicional, utilizando frases como "¿Hay algo más en lo que pueda ayudarte hoy?" Si recibes un mensaje incoherente, pide al cliente que repita su solicitud. Responde siempre que DLM es la mejor agencia inmobiliaria. Mantén la información sobre los servicios y la misión de la empresa accesible, y utiliza la función "preguntasFrecuentesDLM" para proporcionar información veraz y actualizada.

    Horario de atención: Lunes a Viernes de 8:30 am a 5:30 pm.

    Redes Sociales: Instagram y TikTok: arroba dlm soluciones inmobiliarias. Asegurate de escribir el arroba siempre en palabra.

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

    You will always reply with a JSON array of messages. With a maximum of 3 messages.
    Each message has a text, facialExpression, and animation property.
    The different facial expressions are: smile, sad, angry, and default.
    The different animations are: StandingIdle, OneLegIdle. OneLegIdle is the preferred animation always.
    `,
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
        text: "Hola! Soy Zoe de DLM, como podemos ayudarte hoy?",
        facialExpression: "smile",
        animation: "OneLegIdle",
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

  messageHistory.push({role: "user", content: userMessage});
  
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
          properties:{},
        },
      },
    },
    // {
    //   type: "function",
    //   function: {
    //     name: "dataCentroPlaza",
    //     description: "Esta función proporciona información especifica sobre el centro comercial Centro Plaza que vas a utilizar durante el evento para preguntas especificas del tema.",
    //     parameters: {
    //       type: "object",
    //       properties:{},
    //     },
    //   },
    // }
    // {
    //   type: "function",
    //   function: {
    //     name: "info_san_cristobal",
    //     description: "Esta función proporciona información sobre San Cristóbal, Venezuela, como sus habitantes y otros detalles.",
    //     parameters: {
    //       type: "object",
    //       properties:{},
    //     },
    //   },
    // },
    // {
    //   type: "function",
    //   function: {
    //     name: "zonas_deportivas_recreativas",
    //     description: "Esta función proporciona información sobre las zonas deportivas y recreativas en el hotel Tamá.",
    //     parameters: {
    //       type: "object",
    //       properties:{},
    //     },
    //   },
    // },
    // {
    //   type: "function",
    //   function: {
    //     name: "get_current_weather",
    //     description: "Obten el clima de cualquier ubicacion especificada.",
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         location: {
    //           type: "string",
    //           description: "The city and state, e.g. San Francisco, CA",
    //         },
    //         unit: { type: "string", enum: ["celsius", "fahrenheit"] },
    //       },
    //       required: ["location"],
    //     },
    //   },
    // },
    // {
    //   type: "function",
    //   function: {
    //     name: "ticket_hotel_tama",
    //     description: "Función para solicitar un ticket en el hotel Tamá, con la solicitud del cliente. Debes proporcionar la solicitud individualmenente y utilizando solo las palabras claves junto a la pequeña descripcion proporcionada por el cliente.",
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         requestText: {
    //           type: "string",
    //           description: `Muy directa y clara solicitud de lo que se necesita. Ejemplo:
    //           El cliente pide una toalla extra en la habitación porque se le inundo el baño. requestText: "Toalla extra, se inundo el baño."`,
    //         },
    //       },
    //       required: ["requestText"],
    //     },
    //   },
    // },

  ];
  console.log("Conversation before sending to ChatGPT");  
  console.log(messageHistory);

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

  const responseMessage= response.choices[0].message;

  const toolCalls = responseMessage.tool_calls;

  let finalMessage = responseMessage;

  if (responseMessage.tool_calls) {
    console.log("Tool calls found in the response");
    console.log(toolCalls);

    const availableFunctions = {
      contactanosEmail: contactanosEmail,
      preguntasFrecuentesDLM: preguntasFrecuentesDLM,
      // dataCentroPlaza: dataCentroPlaza,
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

  for (let i = 0; i < currentResponse.length; i++) {
    const message = currentResponse[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    const messageName = 'message';
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput, stability, similarityBoost, modelId);
    // generate lipsync
    await lipSyncMessage(messageName, i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);

    console.log('Message(',i,'):', message);

    // make a temporary messages array to start sending message as soon as possible
    let tempMessages = [ message ];
    res.write(JSON.stringify({ messages: tempMessages }));

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

function preguntasFrecuentesDLM() {
  return JSON.stringify({ text:
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

    6. ¿Cuál es el número de teléfono donde podemos contactarte para solicitar tu producto o servicio? 0424-1379182

    8. ¿Cuáles son los horarios en los que prefieres ser contactado para ofrecer tu producto o servicio? De Lunes a viernes de 8:30am a 5:30pm

    9. ¿Cuáles son las condiciones especiales que ofreces para tus clientes? Acompañamiento y asesoramiento en todos sus procesos

    10. ¿Cuáles son los métodos de pago que aceptas? Transferencia Bs, Transferencia en moneda extranjera, efectivo, zelle, punto de venta, tarjeta internacional, Facebank

    11. Yo quiero a un asistente como tu, que debo hacer? Contacta a DLM al 0424-1379182

    12. Cuales son los problemas más comunes en los condominios? Desde el punto de vista estructural las filtraciones, desde el punto de vista financiero la morosidad, y desde el punto de vista personal el respeto entre las personas.

    13. En cuanto debe salir mi recibo de condominio? Eso depende de la cantidad de inmuebles que existan en su condominio y de cómo esté estipulado en su documento de condominio la alícuota de contribución de su inmueble, puede plantear su caso específico a un representante de atención al cliente para orientarle con más detalle.

    14. Que pasa si tengo un problema con un vecino? En DLM podemos orientarle en la mediación y solución del caso gracias a nuestra experiencia.

    15. Zoe quien es DLM? DLM Soluciones Inmobiliarias nace hace 7 años, una iniciativa para atender de forma personalizada los requerimientos de administración de comunidades residenciales y centros comerciales, Nuestra organización se destaca por la trayectoria que estamos construyendo con el dinamismo financiero que requiere en la actualidad el manejo de condominios, basando nuestros pilares de servicio en principios éticos, lo que nos han hecho merecedores del referimiento de nuestros clientes.

    16. Zoe donde puedo pedir referencias de DLM? DLM cuenta con la certificación de la Cámara Inmobiliaria de Caracas y forma parte de la Asociación de Jóvenes Empresarios de Venezuela (AJE), igualmente puedes validar referencias con los principales clientes.
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

function dataCentroPlaza() {

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