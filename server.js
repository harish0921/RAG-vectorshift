require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// VectorShift API Endpoint integration
app.post("/chat", async (req, res) => {
    try {
        const { text, conversation_id } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const API_KEY = process.env.VECTORSHIFT_API_KEY;
        const API_URL = process.env.VECTORSHIFT_API_URL;

        if (!API_KEY || !API_URL) {
            console.error("VectorShift API Key or URL not configured in .env");
            return res.status(500).json({ error: "Server configuration error" });
        }

        // Call the VectorShift Chatbot API
        const response = await axios.post(
            API_URL,
            {
                text: text,
                conversation_id: conversation_id || "",
                generate_follow_up_questions: false,
                number_of_follow_up_questions: 3
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                }
            }
        );

        // Return the VectorShift response directly
        return res.json(response.data);

    } catch (error) {
        console.error("Error communicating with VectorShift API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to process request to RAG backend" });
    }
});

// Placeholder for document upload if needed later by the frontend
app.post("/upload", (req, res) => {
    res.json({ message: "Upload functionality not yet implemented with VectorShift." });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to test.`);
});
