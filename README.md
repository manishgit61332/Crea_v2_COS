# CREA: The AI Chief of Staff

Your project is fully scaffolded and connected.

## 📂 Project Structure
- **`crea-backend/`**: Node.js Server (Port 3001) + Telegram Bot.
- **`crea-web/`**: Next.js Dashboard (Port 3000).

## 🚀 How to Launch (Quick Start)

1. **Fill in your Keys** (Crucial Step):
   - Open `crea-backend/.env` -> Add Supabase URL, Key, OpenAI Key, Telegram Token.
   - Open `crea-web/.env.local` -> Add Supabase URL, Anon Key.

2. **Initialize Database**:
   - Copy the content of `crea-backend/schema.sql`.
   - Run it in your Supabase SQL Editor.

3. **Run Everything**:
   - Double-click `start_crea.bat` in this folder.
   - Or run `./start_crea.bat` in your terminal.

## 🔗 Links
- **Dashboard**: http://localhost:3000
- **Gateway**: http://localhost:3000/
- **Web Chat**: http://localhost:3000/dashboard/chat
