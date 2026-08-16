import { useEffect, useRef, useState } from "react";

const SpeechRecognitionImpl =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function ProseInput({ value, onChange }) {
  const [recording, setRecording] = useState(false);
  const [supported] = useState(Boolean(SpeechRecognitionImpl));
  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");

  useEffect(() => {
    if (!supported) return;
    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const combined = baseTextRef.current ? `${baseTextRef.current} ${transcript}` : transcript;
      onChange(combined);
    };

    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  function toggleRecording() {
    if (!recognitionRef.current) return;
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      baseTextRef.current = value.trim();
      recognitionRef.current.start();
      setRecording(true);
    }
  }

  return (
    <div>
      <div className="field">
        <label htmlFor="prose-input">Dictate or type patient data, in any order</label>
        <textarea
          id="prose-input"
          rows={5}
          placeholder='e.g. "68 year old male, current smoker, blood pressure 148 over 92, total cholesterol 210, HDL 38, creatinine 1.3, A1c 7.2, takes lisinopril and metformin, no history of heart attack or stroke"'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="btn-row">
        <button
          type="button"
          className={`btn btn-outline btn-mic ${recording ? "recording" : ""}`}
          onClick={toggleRecording}
          disabled={!supported}
          title={supported ? "" : "Voice dictation isn't supported in this browser — try Chrome or Edge"}
        >
          {recording ? "⏹ Stop dictating" : "🎙 Dictate"}
        </button>
        {!supported && (
          <span className="small-muted">
            Voice dictation isn't supported in this browser — try Chrome/Edge, or just type.
          </span>
        )}
      </div>
    </div>
  );
}
