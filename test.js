const axios = require('axios');
const apiKey = "sk_Zd40CB9fCXaeYyn4HuJ0DBpp4QlyVAFNc7qDmzqQWFIhhZPS";
const apiUrl = "https://api.vectorshift.ai/v1/chatbot/69b04f8cf3afd0eb70bdb996/run";

async function test() {
    try {
        const response = await axios.post(
            apiUrl,
            {
                text: "What are the rules?",
                conversation_id: "",
                generate_follow_up_questions: false,
                number_of_follow_up_questions: 3
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            }
        );
        console.log("SUCCESS:");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("ERROR:");
        console.error(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}
test();
