document.addEventListener("DOMContentLoaded", function () {
    const startRecordingBtn = document.getElementById("startRecording");
    const userResponse = document.getElementById("responseText");
    const feedback = document.getElementById("feedback");
    const languageSelect = document.getElementById("language");
    const promptText = document.getElementById("promptText");
    const generatePromptBtn = document.getElementById("generatePrompt");
    const downloadTranscriptBtn = document.getElementById("downloadTranscript");

    // Ensure required elements are present
    if (!startRecordingBtn || !userResponse || !feedback || !languageSelect || !promptText || !generatePromptBtn || !downloadTranscriptBtn) {
        console.error("Required elements are missing from the DOM.");
        return;
    }

    // Language codes mapping
    const langCodes = {
        English: "en-US",
        Russian: "ru-RU",
        Spanish: "es-ES"
    };

    let currentPrompt = "";
    let transcript = ""; // Variable to store the transcript text

    // Enable "Generate Prompt" button when a language is selected
    languageSelect.addEventListener("change", () => {
        if (languageSelect.value) {
            generatePromptBtn.disabled = false;
        } else {
            generatePromptBtn.disabled = true;
        }
    });

    // Handle the "Generate Prompt" button click
    generatePromptBtn.addEventListener("click", () => {
        const langChoice = languageSelect.value;
        if (!langChoice) {
            alert("Please select a language first.");
            return;
        }

        // Fetch a random prompt based on the selected language
        fetchPrompt(langChoice);
    });

    // Handle the "Start Recording" button click
    startRecordingBtn.addEventListener("click", () => {
        const langChoice = languageSelect.value;
        if (!langChoice || !currentPrompt) {
            alert("Please select a language and wait for the prompt.");
            return;
        }

        console.log("Start recording button clicked. Language:", langChoice);

        // Set the language for speech recognition
        recognition.lang = langCodes[langChoice];

        // Disable the start button, update its text, and update the feedback area
        startRecordingBtn.disabled = true;
        startRecordingBtn.textContent = "🎤 Recording...";
        userResponse.textContent = "Listening...";
        feedback.textContent = "Processing...";
        startRecordingBtn.classList.add("recording");

        // Start speech recognition
        recognition.start();
    });

    // Function to fetch and display a random prompt based on the selected language
    function fetchPrompt(language) {
        const prompts = {
            English: ["Describe your daily routine.", "Tell me about a place you've visited."],
            Russian: ["Опишите свою повседневную рутину.", "Расскажите мне о месте, которое вы посетили."],
            Spanish: ["Describe tu rutina diaria.", "Cuéntame sobre un lugar que visitaste."]
        };

        // Randomly select a prompt
        currentPrompt = prompts[language][Math.floor(Math.random() * prompts[language].length)];
        promptText.textContent = currentPrompt;

        // Enable the "Start Speaking" button
        generatePromptBtn.disabled = true;
        startRecordingBtn.disabled = false;
    }

    // Speech recognition setup
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    // Handle the result of speech recognition
    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        userResponse.value = speechResult;  // Display the recognized text in the response textarea
        transcript = speechResult;  // Store the transcript text
        feedback.textContent = "Processing complete";  // Update feedback text

        // Enable the "Download Transcript" button after recording is done
        downloadTranscriptBtn.disabled = false;
    };

    // Handle any errors during speech recognition
    recognition.onerror = (event) => {
        feedback.textContent = `Error occurred: ${event.error}`;
    };

    // Reset UI when recognition ends
    recognition.onend = () => {
        startRecordingBtn.disabled = false;
        startRecordingBtn.textContent = "🎤 Start Speaking";
        userResponse.textContent = "Response recorded.";
        feedback.textContent = "Recognition ended.";
    };

    // Handle the "Download Transcript" button click
    downloadTranscriptBtn.addEventListener("click", () => {
        if (!transcript) {
            alert("No transcript available to download.");
            return;
        }

        // Create a Blob containing the transcript
        const blob = new Blob([transcript], { type: "text/plain" });

        // Create a temporary link element to trigger the download
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = "transcript.txt";  // Set the download file name

        // Programmatically click the link to trigger the download
        downloadLink.click();
    });
});
