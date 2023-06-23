import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config()

const FIGMA_API_KEY = process.env.FIGMA_API_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const app = express();

app.post('/monitor', async (req, res) => {
    const fileId = req.body.fileId;
    if (!fileId) {
        res.status(400).send({ error: 'fileId no proporcionado' });
        return;
    }

    // Obtén la información del archivo
    const figmaFileData = await getFigmaFile(fileId);

    const message = `El archivo de Figma ${figmaFileData.name} fue modificado por última vez a las ${new Date(figmaFileData.lastModified)}. Versión actual: ${figmaFileData.version}`;
    sendDiscordMessage(message);

    res.send({ message: `Enviado mensaje a Discord para el archivo ${fileId}` });
});


app.listen(3000, () => console.log('Servidor iniciado en el puerto 3000'));

async function getFigmaFile(fileId) {
    const response = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
        method: 'GET',
        headers: {
            'X-Figma-Token': FIGMA_API_KEY
        }
    });
    const data = await response.json();
    return data;
}

async function sendDiscordMessage(content) {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    });
    return response;
}

