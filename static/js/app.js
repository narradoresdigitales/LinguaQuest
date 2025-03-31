document.addEventListener("DOMContentLoaded", function () {
    const startRecordingBtn = document.getElementById("startRecording");
    const userResponse = document.getElementById("responseText");
    const feedback = document.getElementById("feedback");
    const languageSelect = document.getElementById("language");
    const promptText = document.getElementById("promptText");
    const generatePromptBtn = document.getElementById("generatePrompt");
    const downloadTranscriptBtn = document.getElementById("downloadTranscript");




    // Create Stop Recording Button
    const stopRecordingBtn = document.createElement("button");
    stopRecordingBtn.textContent = "🛑 Stop Recording";
    stopRecordingBtn.id = "stopRecording";
    stopRecordingBtn.style.display = "none"; // Initially hidden
    stopRecordingBtn.disabled = true;
    startRecordingBtn.parentNode.insertBefore(stopRecordingBtn, startRecordingBtn.nextSibling);

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
        generatePromptBtn.disabled = !languageSelect.value;
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

        // Disable start button, update text, enable stop button
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = false;
        stopRecordingBtn.style.display = "inline-block"; // Show stop button
        startRecordingBtn.textContent = "🎤 Recording...";
        userResponse.textContent = "Listening...";
        feedback.textContent = "Processing...";
        startRecordingBtn.classList.add("recording");

        // Start speech recognition
        recognition.start();
    });

    // Handle the "Stop Recording" button click
    stopRecordingBtn.addEventListener("click", () => {
        console.log("Stop recording button clicked.");
        recognition.stop(); // Stop speech recognition
        resetUI();
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

    function resetUI() {
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        stopRecordingBtn.style.display = "none"; // Hide stop button
        startRecordingBtn.textContent = "🎤 Start Speaking";
        feedback.textContent = "Recording stopped.";
    }


    // Speech recognition setup
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    // Handle the result of speech recognition
    recognition.onresult = function(event) {
        const newTranscript = event.results[0][0].transcript;
        const responseTextArea = document.getElementById("responseText");
    
        // Append new transcript instead of overwriting
        responseTextArea.value += (responseTextArea.value ? "\n" : "") + newTranscript;
    
        // Update the transcript variable with the full text
        transcript = responseTextArea.value;

         // Enable the download button once there's text
        if (transcript.trim() !== "") {
        downloadTranscriptBtn.disabled = false;
    }
    };
    
    

    // Handle any errors during speech recognition
    recognition.onerror = (event) => {
        feedback.textContent = `Error occurred: ${event.error}`;
    };


   
    

    // Reset UI when recognition ends
    recognition.onend = () => {
        if (!stopRecordingBtn.disabled) {
            console.log("Recognition stopped by system, but user has not clicked stop.");
            return; // Do nothing if user hasn't clicked stop
        }
        
        console.log("Recognition ended by user.");
        resetUI();
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
