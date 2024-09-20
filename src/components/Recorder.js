/* global webkitSpeechRecognition */
// src/components/Recorder.js

import React, { useState, useEffect } from 'react';
import { Button, Card, Alert } from 'react-bootstrap';
import './Recorder.css'; // Import CSS file

const Recorder = () => {
    const [transcript, setTranscript] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    useEffect(() => {
        // Initialize the recognition object
        recognition.continuous = true; // Keep recording continuously
        recognition.interimResults = false; // Do not show interim results

        recognition.onresult = (event) => {
            const spokenText = Array.from(event.results)
                .map(result => result[0].transcript)
                .join(' ');
            setTranscript(spokenText); // Update transcript with all results
        };

        recognition.onerror = (event) => {
            console.error('Error occurred in recognition: ', event.error);
            stopRecording(); // Stop recording on error
        };

        recognition.onend = () => {
            if (isRecording) {
                setIsRecording(false); // Reset recording state when done
            }
        };

        return () => {
            recognition.stop(); // Clean up when component unmounts
        };
    }, [isRecording]);

    const startRecording = () => {
        setTranscript(''); // Clear previous transcript
        recognition.start();
        setIsRecording(true); // Set recording state to true
    };

    const stopRecording = async () => {
        recognition.stop(); // Stop the recognition
        setIsRecording(false); // Reset recording state
        await translateText(transcript); // Translate the final transcript
    };

    const detectLanguage = async (text) => {
        try {
            const response = await fetch(`https://api.mymemory.translated.net/detect?q=${encodeURIComponent(text)}`);
            const data = await response.json();
            return data.lang || 'en';
        } catch (error) {
            console.error('Error detecting language: ', error);
            return 'en';
        }
    };

    const translateText = async (text) => {
        const targetLanguage = 'en';
        const sourceLanguage = await detectLanguage(text);

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
        <Card className="p-4 mt-4">
            <Card.Body>
                <Button 
                    variant={isRecording ? "danger" : "primary"} 
                    onClick={isRecording ? stopRecording : startRecording}
                    className="me-2 mb-3" 
                >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>

                <div className="text-box">
                    <strong>Spoken Text:</strong>
                    <p>{transcript}</p>
                </div>
                
                <div className="text-box">
                    <strong>Translated Text:</strong>
                    {translatedText ? (
                        <Alert variant="success">{translatedText}</Alert>
                    ) : (
                        <Alert variant="info">Translation will appear here.</Alert>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default Recorder;


