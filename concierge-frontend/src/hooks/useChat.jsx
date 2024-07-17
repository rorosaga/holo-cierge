import { createContext, useContext, useEffect, useState, useRef } from "react";

const backendUrl = "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  // states and refs for audio recording
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const chat = async (message, audioBlob = null) => {
    setLoading(true);

    const body = audioBlob ? new FormData() : JSON.stringify({ message });

    if (audioBlob) {
      body.append("audioInput", audioBlob, "audio.wav");
    }

    try {
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: audioBlob ? {} : { "Content-Type": "application/json" },
        body: audioBlob ? body : JSON.stringify({ message }),
      });

      const resp = (await data.json()).messages;
      setMessages((messages) => [...messages, ...resp]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/wav" });
        chunks.current = []; // reset chunks onstop
        chat(null, recordedBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      console.log("Listening...");

    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setIsRecording(false);
      console.log("Stopped listening...");
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };
  
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        startRecording,
        stopRecording,
        isRecording,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
