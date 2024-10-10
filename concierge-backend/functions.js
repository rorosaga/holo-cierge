import { request, text } from "express"
import dotenv from "dotenv";
import axios from 'axios';
import nodemailer from "nodemailer";

dotenv.config();

//ZoeDLM
export function infoFredAarons() {
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

export function infoLuisPerez() {
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

export function bancosDisponibles() {
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
export function infoDLM() {
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
export function preguntasFrecuentesDLM() {
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

//digitalConcierge
export async function contactanosEmail(sender, user_email, subject, body) {
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

export async function ticket_hotel_tama(requestText, roomNumber = 'Front Desk', guestName = 'Leo Digital Concierge') {
    const url = 'https://reservations-api.properties.guesthub.io/properties/154/request';
    const queryParams = {
        'Guesthub-Context': '{"properties":["propertyId"]}'
    };
    const requestBody = {
        isLogin: false,
        reservationId: null,
        browserIdentify: '1718991233075',
        serviceId: null,
        requestText: requestText,
        roomNumber: roomNumber,
        guestName: guestName
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

export async function getCurrentWeather() {
    // Define the parameters
    const parameters = {
        'key': process.env.METEOSOURCE_API_KEY,
        'place_id': 'san-cristobal'
    }

    // Define the base URL
    const url = "https://www.meteosource.com/api/v1/free/point";

    try {
        // Make the GET request using axios
        const response = await axios.get(url, { params: parameters });

        // Extract data from the response
        const data = response.data;

        // Return the data in a structured format
        return JSON.stringify({
            text: `Responde con la información básica que salga de la variable 'data'. Cambia la puntuación de los valores de ésta manera: si lees 23.5 refiérete al valor como 'veintitres punto cinco. En lugar de decir 'celcius' refierete a 'grados centígrados'`,
            data: data
        });

    } catch (error) {
        // Handle any errors that occur during the request
        console.error("Error fetching weather data:", error);

        return JSON.stringify({
            text: "Hubo un error al obtener la información del clima. Por favor, inténtalo de nuevo más tarde."
        });
    }
}

export function info_san_cristobal() {
    return JSON.stringify({
        text:
            `
    Es una ciudad venezolana, capital del Estado Táchira y del Municipio San 
    Cristóbal ubicada en la Región de los Andes al suroeste de Venezuela. Está 
    ubicada a 57 kilómetros de la frontera con Colombia. La ciudad es apodada 
    La Ciudad de la Cordialidad. Fue fundada por Juan Maldonado Ordóñez y Villaquirán, 
    capitán del ejército español, el 31 de marzo de 1561. Tiene una población 
    proyectada para el año 2023 de 405872 habitantes, mientras que toda el área 
    metropolitana cuenta con una población de 767402 habitantes. El hotel Tamá es llamado asi por el parque nacional ubicado en la region.
    `
    });
};

export function info_hotel() {
    return JSON.stringify({
        text:
            `
            Restaurantes y Bares:
            El Bosque que se especializa en sus desayunos y brunch, con barra libre de 6-30 a 10 de la mañana. Oliva (el restaurante oficial del hotel) abierto de 6 de la mañana a 11 de la noche, reconocido por sus sabrosa entrada de 'Berenjena Crispy Miel' y sus platos principales como los 'Medallones de Lomito Tamá', la 'Suprema de Pollo', y el 'Risotto de Camarones', tambien sirven hamburguesas y pastas personalizadas. Lola, un bar donde sirven comida gourmet y española, es un buen lugar donde se aprecia el espacio abierto y el buen ambiente social. Aqua es una fuente de soda que abre los fines de semana al lado de la piscina. La chocolatería en el area comercial tambien ofrece algunos postres artesanales.
            
            Recreacion y deporte:
            Se dispone de una área deportiva compuesta por una cancha de tenis y dos canchas de pádel, con espacios de servicios desarrollado en 2 plantas, la primera alberga sanitarios, fuente de soda, mini tienda y la segunda una terraza con visuales hacia las 3 canchas. En el área recreativa se ubica el parque infantil, adyacente a la piscina (que permanece abierta diariamente de 9am a 7pm) y a la terraza de la fuente de soda, y adicional en la zona de bosque contamos con caminerías ecológicas y áreas de picnic, descanso y contemplación de la vegetación y fauna del mismo. El casino, ubicado al lado de las canchas de padel y tenis, esta abierto 24-7 y cuenta con servicio personalizada.
      `
    });
};

export function getHotelData(hotelName = null, hotelOwner = null) {
    const data = [{
        hotelName: "Maracay",
        hotelOwner: "Zoraida Pernia",
        roomCount: 85
    },
    {
        hotelName: "Maiquetía",
        hotelOwner: "María Verde",
        roomCount: 243
    },
    {
        hotelName: "Miami",
        hotelOwner: "Ada Paredes",
        roomCount: 133
    },
    {
        hotelName: "Guayana",
        hotelOwner: "José Rodríguez",
        roomCount: 144
    },
    {
        hotelName: "Tamá",
        hotelOwner: "Carlos Jiménez",
        roomCount: 111
    },
    {
        hotelName: "Buenos Aires",
        hotelOwner: "Roberto Brizuela",
        roomCount: 57
    },
    {
        hotelName: "Quito",
        hotelOwner: "Richard Perdomo",
        roomCount: 96
    },
    {
        hotelName: "Coro",
        hotelOwner: "Rosina Ruiz",
        roomCount: 80
    },
    {
        hotelName: "Lechería",
        hotelOwner: "Ana Soto",
        roomCount: 111
    },
    {
        hotelName: "Barinas",
        hotelOwner: "Simón Casique",
        roomCount: 123
    },
    {
        hotelName: "El Tigre",
        hotelOwner: "Candi Arvelaiz",
        roomCount: 80
    }
    ];

    return JSON.stringify({
        text: `Responde con la información relevante al contexto que salga de la variable 'data'. Si reconoces al gerente, menciona solo el nombre de el respectivo hotel y agradecele por su trabajo.'`,
        data: data
    });
}

export function preguntasFrecuentesTama() {
    return JSON.stringify({
        text:
            `
    
    `
    });
};