import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const recognitionRef = useRef(null);
  const userDataRef = useRef(userData);
  const geminiFnRef = useRef(getGeminiResponse);
  const synth = window.speechSynthesis;

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    geminiFnRef.current = getGeminiResponse;
  }, [getGeminiResponse]);

  useEffect(() => {
    if (!userData) navigate("/signin");
  }, [userData, navigate]);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (error) {
      console.log(error);
    } finally {
      setUserData(null);
      navigate("/signin");
    }
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    }
  };

  const speak = (text) => {
    if (!synth) return;

    isSpeakingRef.current = true;
    if (isRecognizingRef.current) {
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        console.log(error);
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((voice) => voice.lang === "hi-IN");
    if (hindiVoice) utterance.voice = hindiVoice;

    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => startRecognition(), 800);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === "google-search") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
    }
    if (type === "calculator-open") {
      window.open("https://www.google.com/search?q=calculator", "_blank");
    }
    if (type === "instagram-open") {
      window.open("https://www.instagram.com/", "_blank");
    }
    if (type === "facebook-open") {
      window.open("https://www.facebook.com/", "_blank");
    }
    if (type === "weather-show") {
      window.open("https://www.google.com/search?q=weather", "_blank");
    }
    if (type === "youtube-search" || type === "youtube-play") {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiText("Speech recognition is not supported in this browser.");
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    let isMounted = true;
    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
        } catch (error) {
          if (error.name !== "InvalidStateError") console.error(error);
        }
      }
    }, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted && !isSpeakingRef.current) {
            try {
              recognition.start();
            } catch (error) {
              if (error.name !== "InvalidStateError") console.error(error);
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      console.warn("Recognition error:", event.error);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      const activeUser = userDataRef.current;
      if (!activeUser) return;

      const assistantName = activeUser.assistantName || "Assistant";
      if (transcript.toLowerCase().includes(assistantName.toLowerCase())) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        try {
          const data = await geminiFnRef.current?.(transcript);
          if (data) {
            handleCommand(data);
            setAiText(data.response);
          } else {
            const errorMsg = "I'm sorry, I couldn't connect to the server.";
            setAiText(errorMsg);
            speak(errorMsg);
          }
        } catch (error) {
          console.error("Error processing command:", error);
          const errorMsg = "I'm sorry, something went wrong.";
          setAiText(errorMsg);
          speak(errorMsg);
        }
        setUserText("");
      }
    };

    if (userDataRef.current) {
      const greeting = new SpeechSynthesisUtterance(`Hello ${userDataRef.current.name}, what can I help you with?`);
      greeting.lang = "hi-IN";
      window.speechSynthesis.speak(greeting);
    }

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      try {
        recognition.stop();
      } catch (error) {
        console.log(error);
      }
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);

  return (
    <div className="page-shell">
      <button
        className="ghost-btn absolute right-5 top-5 z-20 inline-flex h-10 w-10 items-center justify-center lg:hidden"
        onClick={() => setHam(true)}
      >
        <CgMenuRight className="text-xl" />
      </button>

      <div
        className={`fixed inset-0 z-30 lg:hidden ${ham ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-[340px] bg-[#050c18ee] p-5 shadow-[0_0_40px_#000] transition-transform duration-300 ${
            ham ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            className="ghost-btn ml-auto flex h-9 w-9 items-center justify-center"
            onClick={() => setHam(false)}
          >
            <RxCross1 />
          </button>

          <div className="mt-4 space-y-3">
            <button className="primary-btn h-11 w-full" onClick={handleLogOut}>
              Log Out
            </button>
            <button className="ghost-btn h-11 w-full" onClick={() => navigate("/customize")}>
              Customize Assistant
            </button>
          </div>

          <div className="mt-6">
            <p className="mono text-xs uppercase tracking-[0.22em] text-[#95c6f1]">History</p>
            <div className="scrollbar-thin mt-3 h-[64vh] space-y-2 overflow-y-auto pr-2">
              {userData?.history?.map((his, index) => (
                <div key={`${his}-${index}`} className="rounded-xl border border-[#7faee64d] bg-[#0a1730c7] px-3 py-2 text-sm text-[#d7e8ff]">
                  {his}
                </div>
              ))}
            </div>
          </div>
        </div>
        {ham && <div className="absolute inset-0 bg-[#00000080]" onClick={() => setHam(false)} />}
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="glass-card hidden h-[calc(100vh-2.4rem)] flex-col p-5 lg:flex">
          <p className="mono text-xs uppercase tracking-[0.24em] text-[#95c6f1]">TalkNEX Console</p>
          <h2 className="mt-2 text-2xl font-bold">Mission Feed</h2>
          <p className="mt-2 text-sm subtle">Track all your recent voice commands in one place.</p>

          <div className="mt-5 flex gap-2">
            <button className="primary-btn h-10 flex-1" onClick={handleLogOut}>
              Log Out
            </button>
            <button className="ghost-btn h-10 flex-1" onClick={() => navigate("/customize")}>
              Customize
            </button>
          </div>

          <div className="scrollbar-thin mt-5 flex-1 space-y-2 overflow-y-auto pr-1">
            {userData?.history?.map((his, index) => (
              <div key={`${his}-${index}`} className="rounded-xl border border-[#7faee64d] bg-[#0a1730c7] px-3 py-2 text-sm text-[#d7e8ff]">
                {his}
              </div>
            ))}
          </div>
        </aside>

        <main className="glass-card reveal-up flex min-h-[calc(100vh-2.4rem)] flex-col items-center justify-center p-5 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#86fff28a] bg-[#64e2c82b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9fff8]">
            <span className={`pulse-dot ${listening ? "active" : ""}`} />
            {listening ? "Listening" : "Standby"}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#86b8ff5e] bg-[#071329] p-2 shadow-[0_16px_45px_#00000066]">
            <img
              src={userData?.assistantImage}
              alt="Assistant"
              className="h-[270px] w-[210px] rounded-[1.5rem] object-cover sm:h-[390px] sm:w-[300px]"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
            I'm <span className="text-[#67f5d5]">{userData?.assistantName || "Assistant"}</span>
          </h1>

          <div className="mt-4">
            {!aiText && <img src={userImg} alt="User state" className="h-[110px] w-[110px] object-contain" />}
            {aiText && <img src={aiImg} alt="Assistant state" className="h-[110px] w-[110px] object-contain" />}
          </div>

          <div className="mt-4 w-full max-w-2xl rounded-2xl border border-[#86b8ff5e] bg-[#071329d4] px-4 py-4">
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#95c6f1]">Live Transcript</p>
            <p className="mt-2 min-h-[26px] text-center text-sm text-[#dbecff] sm:text-base">
              {userText || aiText || "Say your assistant name to begin."}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
