
# Event Horizon Ticketing System

A full-stack event registration and check-in system featuring:
- **Participant Portal**: Registration with AI-generated badge personas.
- **Committee Portal**: Admin dashboard, QR code scanner, and real-time analytics.
- **Backend**: Node.js (Express) + SQLite database.

## 🚀 How to Run on GitHub (Codespaces)

1. Go to the GitHub repository for this project.
2. Click the green **Code** button.
3. Select the **Codespaces** tab.
4. Click **Create codespace on main**.
5. Wait for the environment to build.
6. Once the terminal opens, run:
   ```bash
   npm start
   ```
7. A popup will appear saying "Open in Browser". Click it to view the app.

## 💻 How to Run Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Accessing from Mobile (Local Network)

To test the QR scanner on your phone:
1. Ensure your phone and computer are on the same Wi-Fi.
2. Find your computer's local IP address (e.g., `192.168.1.5`).
3. Run the server.
4. On your phone, visit: `http://192.168.1.5:3000`.

## API Key Configuration

To use the AI Persona features, create a file named `.env` in the root directory (or export the variable in your terminal):

```
API_KEY=your_google_gemini_api_key
```
