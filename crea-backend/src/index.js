require('dotenv').config();
const { startBot } = require('./bot');
const { startServer } = require('./server');

async function main() {
    console.log('Starting CREA Backend...');

    try {
        // Start Telegram Bot
        await startBot();
        // Start API Server
        startServer();

    } catch (error) {
        console.error('Failed to start services:', error);
    }
}

main().catch(console.error);
