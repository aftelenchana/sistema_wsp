
const http = require('http');
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

const flowDocs = addKeyword(['doc', 'documentacion', 'documentación']).addAnswer(
    [
        '📄 Aquí encontras las documentación recuerda que puedes mejorarla',
        'https://bot-whatsapp.netlify.app/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowTuto = addKeyword(['telenchana_ii', 'telenchana_uu']).addAnswer(
    [
        '🙌 Aquí encontras un ejemplo rapido',
        'https://bot-whatsapp.netlify.app/docs/example/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowGracias = addKeyword(['gg_kk_oo', 'oo_kk_ll']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowDiscord = addKeyword(['discord']).addAnswer(
    ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
    null,
    null,
    [flowSecundario]
)

const flowPrincipal = addKeyword(['ff_ee', 'yy_rr', 'hh_ll'])
    .addAnswer('🙌 Hola bienvenido a este *Chatbot*')
    .addAnswer(
        [
            'Hola estamos creando un chat bot con node.js',
            '👉  Soy Alex Telenchana',
            '👉  Estudiante de la Universidad Central del Ecuador',
            '👉 Me gusta mucho Medicina ',
        ],
        null,
        null,
        [flowDocs, flowGracias, flowTuto, flowDiscord]
    )


const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowPrincipal]);
    const adapterProvider = createProvider(BaileysProvider);

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();

    // Crear un servidor HTTP para manejar solicitudes POST
    const server = http.createServer((req, res) => {
        console.log('Solicitud recibida:', req.method, req.url);
        if (req.method === 'POST' && req.url === '/send-message') {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const { number, message } = JSON.parse(body);
                    const formattedNumber = `${number}@s.whatsapp.net`;
            
                 // Extraer todas las URLs de imágenes del mensaje
const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|pdf|xml|mp4))/ig;
const urlMatches = message.match(urlRegex);
const textWithoutUrls = message.replace(urlRegex, '').trim();

// Enviar texto primero si hay texto aparte de las URLs
if (textWithoutUrls) {
    await adapterProvider.sendText(formattedNumber, textWithoutUrls);
}

// Luego, si hay URLs de imagen, enviar cada imagen
if (urlMatches && urlMatches.length > 0) {
    for (const imageUrl of urlMatches) {
        await adapterProvider.sendMedia(formattedNumber, imageUrl); // Asegúrate de que este método es correcto según tu proveedor
    }
}

            
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Mensaje y/o imagen enviados' }));
                } catch (error) {
                    console.error(error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            });
            
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    });

    server.listen(3001, () => {
        console.log('Servidor HTTP corriendo en el puerto 3001');
    });
};

main();
