document.addEventListener('DOMContentLoaded', () => {
    // ---- Navigation & Routing ----
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    // Simple SPA Routing based on click
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));

            // Add active class to clicked nav item
            item.classList.add('active');

            // Show corresponding page
            const pageId = item.getAttribute('data-page');
            document.getElementById(`page-${pageId}`).classList.add('active');

            // Close mobile sidebar if open
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('open');
            }
        });
    });

    // Mobile Sidebar Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.querySelector('.sidebar');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // ---- Chat Interface Logic ----
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');

    // Auto-resize textarea
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') {
            this.style.height = 'auto'; // Reset if empty
        }
    });

    // Handle Enter key (shift+enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendMessageBtn.addEventListener('click', sendMessage);

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        addUserMessage(text);

        // Clear input and reset height
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Scroll to bottom
        scrollToBottom();

        // Call real API
        getAIResponse(text);
    }

    function addUserMessage(text) {
        const messageHTML = `
            <div class="message user-message">
                <div class="message-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="message-bubble">
                    <p>${escapeHTML(text)}</p>
                </div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
    }

    function addAIMessage(text, source = "") {
        const messageHTML = `
            <div class="message ai-message">
                <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="message-bubble">
                    <p>${text}</p>
                    ${source ? `<small>Source: ${source}</small>` : ""}
                </div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
        scrollToBottom();
    }

    let currentConversationId = "";

    async function getAIResponse(question) {
        try {
            typingIndicator.style.display = 'flex';
            scrollToBottom();

            // Disable input while "thinking"
            chatInput.disabled = true;
            sendMessageBtn.disabled = true;

            const apiKey = "sk_Zd40CB9fCXaeYyn4HuJ0DBpp4QlyVAFNc7qDmzqQWFIhhZPS";
            const apiUrl = "https://api.vectorshift.ai/v1/chatbot/69b04f8cf3afd0eb70bdb996/run";

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    text: question,
                    conversation_id: currentConversationId,
                    generate_follow_up_questions: false,
                    number_of_follow_up_questions: 3
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();

            // Hide typing indicator and enable input
            typingIndicator.style.display = 'none';
            chatInput.disabled = false;
            sendMessageBtn.disabled = false;
            chatInput.focus();

            if (data.status === "success" || data.summary || data.output_message) {
                if (data.conversation_id) {
                    currentConversationId = data.conversation_id;
                }

                let sourceText = "";
                if (data.sources && data.sources.length > 0) {
                    sourceText = data.sources.join(", ");
                }

                // The API actually returns "output_message" instead of "summary"
                const aiText = data.output_message || data.summary || "No response provided.";
                addAIMessage(aiText, sourceText);
            } else {
                addAIMessage("⚠️ Error: " + (data.error || "Failed to process reaction."));
            }

        } catch (error) {
            typingIndicator.style.display = 'none';
            chatInput.disabled = false;
            sendMessageBtn.disabled = false;
            chatInput.focus();

            addAIMessage("⚠️ Error connecting to RAG backend.");
            console.error(error);
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Basic HTML escaper
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // ---- File Upload Logic ----
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const uploadList = document.getElementById('uploadList');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight dropzone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle file input change
    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        [...files].forEach(uploadFile);
    }

    function uploadFile(file) {
        uploadToBackend(file);

        // Create UI element
        const fileId = 'file-' + Math.random().toString(36).substr(2, 9);

        let iconClass = "fa-file-alt";
        if (file.name.endsWith('.pdf')) iconClass = "fa-file-pdf";
        if (file.name.endsWith('.csv')) iconClass = "fa-file-csv";
        if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) iconClass = "fa-file-word";

        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);

        const uploadElementString = `
            <div class="upload-item" id="${fileId}">
                <div class="file-info">
                    <i class="fa-solid ${iconClass}"></i>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <span>${sizeInMb} MB</span>
                    </div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="bar-${fileId}"></div>
                </div>
                <div>
                    <span class="badge warning" id="status-${fileId}">Uploading...</span>
                </div>
            </div>
        `;

        uploadList.insertAdjacentHTML('afterbegin', uploadElementString);

        // Simulate upload and chunking/embedding process
        const progressBar = document.getElementById(`bar-${fileId}`);
        const statusBadge = document.getElementById(`status-${fileId}`);

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                // Switch status to Processing (chunking/embedding)
                statusBadge.innerText = "Embedding...";
                progressBar.style.backgroundColor = 'var(--info)';

                setTimeout(() => {
                    statusBadge.className = "badge success";
                    statusBadge.innerText = "Indexed";
                    progressBar.style.display = 'none';

                    // Trigger a toast or notification in a real app
                }, 2000);
            }
            progressBar.style.width = `${progress}%`;
        }, 300);
    }

    async function uploadToBackend(file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            console.log("Upload success:", data);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    }

    // ---- Settings Interactions ----
    const tempSlider = document.getElementById('tempSlider');
    const tempValue = document.getElementById('tempValue');

    if (tempSlider && tempValue) {
        tempSlider.addEventListener('input', (e) => {
            tempValue.innerText = e.target.value;
        });
    }

    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    });
});
