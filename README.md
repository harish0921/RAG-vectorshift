# RAG Chatbot using VectorShift

## Project Overview

This project is a **Retrieval-Augmented Generation (RAG) Chatbot** built using VectorShift.
The chatbot answers user questions by retrieving relevant information from company documents such as HR policies and company rules.

Instead of relying only on a large language model, the system first searches a **knowledge base of documents** and then uses an AI model to generate accurate answers based on that information.

This approach improves accuracy and ensures responses are grounded in the uploaded documents.

---

## Features

* Document-based Question Answering
* Semantic Search using a Knowledge Base
* AI-generated responses using an LLM
* Conversation memory for multi-turn chats
* API integration for frontend chatbot applications
* Supports PDF documents such as HR policies and company rules

---

## Technologies Used

* VectorShift (Workflow orchestration)
* OpenAI LLM (GPT model)
* Vector Database (used internally by VectorShift)
* Retrieval-Augmented Generation (RAG)
* JavaScript Fetch API for frontend integration

---

## Project Architecture

The chatbot follows a **RAG pipeline architecture**.

User Question → Input Node → Knowledge Base Search → LLM (OpenAI) → Output Response

The knowledge base retrieves relevant document chunks and passes them to the AI model, which generates the final answer.

---

## Workflow Pipeline Explanation

### 1. Input Node

The input node receives the user's question from the chatbot interface or API request.

Example:
How many sick leaves are allowed?

Output variable:
input_1_text.text

---

### 2. Knowledge Base Reader

This node searches the uploaded documents using semantic similarity.

Documents used in this project:

* HR_policy.pdf
* leave_policy.pdf
* company_rules.pdf

The node retrieves the most relevant document content related to the user query.

Output variable:
knowledge_base_1.formatted_text

---

### 3. OpenAI Node

The OpenAI node receives the **document context** and **user question**.

Prompt structure:

Document Context:
{{knowledge_base_1.formatted_text}}

Question:
{{input_1_text.text}}

Answer:

The AI model analyzes the context and generates the final answer.

Model used:
GPT-5.1

---

### 4. Chat Memory Node

The chat memory node stores recent conversation history.

This allows the chatbot to understand follow-up questions and maintain context during multi-turn conversations.

Memory type:
Token Buffer

---

### 5. Output Node

The output node returns the final AI-generated response to the user interface or API.

Output variable:
openai_0.response

---

## Example Interaction

User Question:
How many sick leaves are allowed?

System Process:

1. Input node receives the question
2. Knowledge base searches the leave policy document
3. Relevant text is retrieved
4. OpenAI generates a response

Response:
Employees are entitled to 10 days of sick leave per year.

---

## API Integration Example

Example API request using JavaScript:

```javascript
const options = {
  method: 'POST',
  headers: {
    Authorization: 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "How many sick leaves are allowed?"
  })
};

fetch('https://api.vectorshift.ai/v1/chatbot/YOUR_CHATBOT_ID/run', options)
  .then(response => response.json())
  .then(data => console.log(data.summary));
```

---

## Folder Structure (Example)

project/
│
├── documents/
│   ├── HR_policy.pdf
│   ├── leave_policy.pdf
│   └── company_rules.pdf
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md

---

## Use Cases

* HR policy assistant
* Internal company knowledge chatbot
* Document Q&A system
* Customer support knowledge bot

---

## Future Improvements

* Add document citation in responses
* Improve document chunking strategy
* Add reranking for better retrieval accuracy
* Implement streaming responses
* Deploy as a full web application

---

## Conclusion

This project demonstrates how to build a **document-based AI chatbot using RAG architecture**.
By combining semantic search with large language models, the system can provide accurate answers based on internal documents.

This approach is widely used in modern AI applications for enterprise knowledge assistants and intelligent document processing systems.
