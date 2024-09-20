/* global webkitSpeechRecognition */

import React, { useState } from 'react';

const Recorder = () => {
    const [transcript, setTranscript] = useState('');
    const [translatedText, setTranslatedText] = useState('');

    let recognition;

    const startRecording = () => {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = async (event) => {
                const spokenText = event.results[0][0].transcript;
                setTranscript(spokenText);
                await translateText(spokenText); // Call translateText with detected language
            };

            recognition.onerror = (event) => {
                console.error('Error occurred in recognition: ', event.error);
            };

            recognition.start();
        } else {
            alert('Speech recognition not supported in this browser.');
        }
    };

    const stopRecording = () => {
        if (recognition) {
            recognition.stop();
        }
    };

    const detectLanguage = async (text) => {
        try {
            const response = await fetch(`https://api.mymemory.translated.net/detect?q=${encodeURIComponent(text)}`);
            const data = await response.json();
            return data.lang || 'en'; // Fallback to English if detection fails
        } catch (error) {
            console.error('Error detecting language: ', error);
            return 'en'; // Fallback to English
        }
    };

    const translateText = async (text) => {
        const targetLanguage = 'en'; // Target language is English
        const sourceLanguage = await detectLanguage(text); // Detect the spoken language

        // Make sure both source and target languages are valid
        if (sourceLanguage && targetLanguage) {
            try {
                const response = await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`
                );
                const data = await response.json();

                if (data.responseData && data.responseData.translatedText) {
                    setTranslatedText(data.responseData.translatedText);
                } else {
                    setTranslatedText('Translation not available.');
                }
            } catch (error) {
                console.error('Error translating text: ', error);
                setTranslatedText('Error translating text.');
            }
        } else {
            setTranslatedText('Please provide valid languages for translation.');
        }
    };

    return (
        <div>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            <p>Spoken Text: {transcript}</p>
            <p>Translated Text: {translatedText}</p>
        </div>
    );
};

export default Recorder;
