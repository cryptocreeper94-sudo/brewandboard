import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechToTextOptions {
  onResult?: (text: string) => void;
  onInterimResult?: (text: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

interface UseSpeechToTextReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
  const {
    onResult,
    onInterimResult,
    onError,
    continuous = false,
    language = "en-US",
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.("Speech recognition is not supported in your browser");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (interimText) {
        setInterimTranscript(interimText);
        onInterimResult?.(interimText);
      }

      if (finalText) {
        setTranscript((prev) => prev + " " + finalText);
        setInterimTranscript("");
        onResult?.(finalText.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      switch (event.error) {
        case "no-speech":
          onError?.("No speech detected. Please try again.");
          break;
        case "audio-capture":
          onError?.("No microphone found. Please check your device.");
          break;
        case "not-allowed":
          onError?.("Microphone access denied. Please allow microphone access.");
          break;
        default:
          onError?.(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (continuous && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Recognition ended");
        }
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      onError?.("Failed to start speech recognition");
    }
  }, [isSupported, continuous, language, onResult, onInterimResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript: transcript.trim(),
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export default useSpeechToText;
