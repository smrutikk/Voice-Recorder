import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const VoiceRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordingName, setRecordingName] = useState("recording");
  const [recordings, setRecordings] = useState([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    setAudioChunks([]);
    setIsRecording(true);

    recorder.ondataavailable = (event) => {
      setAudioChunks((prev) => [...prev, event.data]);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      clearInterval(timerRef.current);
      setSeconds(0);
    };

    recorder.start();
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);
  };

  const handlePlay = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play();
    }
  };

  const handleSave = () => {
    const name = prompt("Enter a name for your recording:", "recording");
    if (name) {
      setRecordingName(name);
      const reader = new FileReader();
      reader.readAsDataURL(new Blob(audioChunks, { type: "audio/wav" }));
      reader.onloadend = () => {
        const newRecordings = [...recordings, { name, data: reader.result }];
        setRecordings(newRecordings);
        localStorage.setItem("recordings", JSON.stringify(newRecordings));
      };
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${recordingName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadRecordings = () => {
    const saved = JSON.parse(localStorage.getItem("recordings")) || [];
    setRecordings(saved);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "linear-gradient(90deg, #141e30, #243b55)", color: "white" }}>
      <div className="wrapper bg-white p-4 rounded shadow" style={{ maxWidth: "500px", width: "90%" }}>
        <h2 className="text-dark">🎙️ Voice Recorder App</h2>
        <p className="timer text-dark">{formatTime(seconds)}</p>
        <button onClick={isRecording ? stopRecording : startRecording} className="btn btn-danger">
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button onClick={handlePlay} className="btn btn-primary mx-2" disabled={!audioUrl}>
          Play
        </button>
        <button onClick={handleSave} className="btn btn-success" disabled={!audioUrl}>
          Save
        </button>
        <button onClick={handleDownload} className="btn btn-warning mx-2" disabled={!audioUrl}>
          Download
        </button>
        <audio ref={audioPlayerRef} className="mt-4 d-block mx-auto" controls src={audioUrl}></audio>
        <h4 className="text-dark mt-3">Saved Recordings</h4>
        <ul className="list-group mx-auto mt-3" style={{ maxWidth: "500px" }}>
          {recordings.map((rec, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              <span style={{ fontWeight: "bold" }}>{rec.name}</span>
              <audio controls src={rec.data}></audio>
              <button className="btn btn-danger btn-sm" onClick={() => {
                const updated = recordings.filter((_, i) => i !== index);
                setRecordings(updated);
                localStorage.setItem("recordings", JSON.stringify(updated));
              }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VoiceRecorder;
