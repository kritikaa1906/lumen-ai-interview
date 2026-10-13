import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceControlsProps {
  questionText: string;
  onDictatedText: (text: string) => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  questionText,
  onDictatedText,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  // Check support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('speechSynthesis' in window)) {
        setSpeechSupported(false);
      }
      const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      if (!hasRecognition) {
        setRecognitionSupported(false);
      }
    }
  }, []);

  // Text to Speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech Recognition (Dictation)
  useEffect(() => {
    let recognition: any = null;

    if (isListening && typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript.trim();
              if (text) {
                onDictatedText(` ${text}`);
              }
            }
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, onDictatedText]);

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Read Question Aloud */}
      {speechSupported && (
        <button
          type="button"
          onClick={toggleSpeech}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors ${
            isSpeaking
              ? 'bg-[#C6F36B] text-[#111310] border-[#C6F36B] font-semibold'
              : 'bg-[#111310] text-[#A7B09C] border-[#282C24] hover:text-[#F5F2E9] hover:border-[#3A3F34]'
          }`}
          title="Read question prompt aloud"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isSpeaking ? 'Stop Reading' : 'Listen Prompt'}</span>
        </button>
      )}

      {/* Voice Dictation (Microphone) */}
      {recognitionSupported && (
        <button
          type="button"
          onClick={() => setIsListening(!isListening)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors ${
            isListening
              ? 'bg-[#EF4444] text-white border-[#EF4444] font-semibold animate-pulse'
              : 'bg-[#111310] text-[#A7B09C] border-[#282C24] hover:text-[#F5F2E9] hover:border-[#3A3F34]'
          }`}
          title="Dictate response with microphone"
        >
          {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isListening ? 'Dictating...' : 'Voice Input'}</span>
        </button>
      )}
    </div>
  );
};
