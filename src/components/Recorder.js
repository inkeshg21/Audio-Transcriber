/* global webkitSpeechRecognition */

import React, { useState } from 'react';
import { Button, Card, Alert } from 'react-bootstrap';

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
                await translateText(spokenText);
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
                <Button variant="primary" onClick={startRecording} className="me-2 mb-3">Start Recording</Button>
                <Button variant="secondary" onClick={stopRecording} className="mb-3">Stop Recording</Button>

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
