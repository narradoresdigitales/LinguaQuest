document.addEventListener("DOMContentLoaded", function () {
    const languageSelect = document.getElementById("language");
    const promptText = document.getElementById("promptText");
    const startRecordingBtn = document.getElementById("startRecording");
    const userResponse = document.getElementById("userResponse");
    const feedback = document.getElementById("feedback");

    const langCodes = { "English": "en-US", "Russian": "ru-RU", "Spanish": "es-ES" };
    let currentPrompt = "";  // Store the prompt fetched from backend

    languageSelect.addEventListener("change", () => {
        const langChoice = languageSelect.value;
        if (!langChoice) {
            promptText.textContent = "Select a language first";
            currentPrompt = "";
            return;
        }

        // Fetch prompt from backend
        fetch(`/prompt?language=${langChoice}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    promptText.textContent = `Error: ${data.error}`;
                    currentPrompt = "";
                } else {
                    promptText.textContent = data.prompt;
                    currentPrompt = data.prompt;  // Store for later use
                }
            })
            .catch(error => {
                promptText.textContent = "Error fetching prompt";
                currentPrompt = "";
                console.error("Fetch error:", error);
            });
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Your browser does not support speech recognition. Please use Chrome.");
        startRecordingBtn.disabled = true;
        startRecordingBtn.textContent = "🎤 Not Supported";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;

    startRecordingBtn.addEventListener("click", () => {
        const langChoice = languageSelect.value;
        if (!langChoice || !currentPrompt) {
            alert("Please select a language and wait for the prompt.");
            return;
        }

        recognition.lang = langCodes[langChoice];
        startRecordingBtn.textContent = "🎤 Recording...";
        startRecordingBtn.disabled = true;
        userResponse.textContent = "Listening...";
        feedback.textContent = "Processing...";
        recognition.start();
    });

    recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript;
        userResponse.textContent = transcript;
        sendToBackend(transcript, languageSelect.value, currentPrompt);
    });

    recognition.addEventListener("error", (event) => {
        userResponse.textContent = "Error: Unable to recognize speech.";
        feedback.textContent = "Try again.";
    });

    recognition.addEventListener("end", () => {
        startRecordingBtn.textContent = "🎤 Start Speaking";
        startRecordingBtn.disabled = false;
    });

    function sendToBackend(text, langChoice, expectedPrompt) {
        fetch("/assess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_input: text, lang_choice: langChoice, expected_prompt: expectedPrompt })
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            feedback.textContent = data.error 
                ? `Error: ${data.error}` 
                : `${data.ilr_level}\nScore: ${data.similarity_score}\nExpected: "${data.expected_prompt}"`;
        })
        .catch(error => {
            feedback.textContent = "Error: Unable to connect to server.";
            console.error("Fetch error:", error);
        });
    }
});