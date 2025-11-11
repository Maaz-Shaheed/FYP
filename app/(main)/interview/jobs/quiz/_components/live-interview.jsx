"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import QuizResult from "../../../_components/quiz-result";
import { saveLiveInterviewResult } from "@/actions/job-quiz";

export default function LiveInterview({ job, onBack }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState({ bot: false, user: false });
  const [interviewTimeLimit, setInterviewTimeLimit] = useState(30); // Store for UI display
  
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingAudioRef = useRef(false);
  const currentAudioSourceRef = useRef(null); // Track current audio source for cancellation
  const startTimeRef = useRef(null);
  const questionCountRef = useRef(0);
  const currentBotMessageRef = useRef("");
  const transcriptRef = useRef([]);
  const botIsSpeakingRef = useRef(false); // Track when bot is speaking to prevent feedback
  const audioProcessorRef = useRef(null); // Reference to audio processor for cleanup
  const interviewTimeLimitRef = useRef(30); // Store interview time limit in seconds (default 30)
  const hasActiveResponseRef = useRef(false); // Track if there's an active response to cancel

  // Keep transcript ref in sync with state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const endInterview = useCallback(async () => {
    try {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      setIsRecording(false);
      setIsConnected(false);
      setIsProcessing(true);
      
      // Close WebSocket gracefully with code 1000 (normal closure)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.close(1000, "Interview ended by user");
        } catch (error) {
          console.log("WebSocket already closed or error closing:", error);
        }
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Disconnect audio processor
      if (audioProcessorRef.current) {
        try {
          audioProcessorRef.current.disconnect();
        } catch (error) {
          console.log("Error disconnecting processor:", error);
        }
      }
      
      // Clear connection error since we're intentionally closing
      setConnectionError(null);
      botIsSpeakingRef.current = false;
      
      // Process and save results
      toast.info("Processing interview results...");
      
      const result = await saveLiveInterviewResult(
        transcriptRef.current,
        questionCountRef.current,
        job.title,
        job.company,
        job.description
      );
      
      setResultData(result);
      toast.success("Interview completed and saved!");
      
    } catch (error) {
      console.error("Error ending interview:", error);
      toast.error(`Error ending interview: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [job]);

  // Auto-end timer - ends interview after the configured time limit or 5 questions
  const startAutoEndTimer = useCallback((timeLimitMs = 30000) => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    startTimeRef.current = Date.now();
    const timeLimitSeconds = Math.floor(timeLimitMs / 1000);
    
    // Set timer to end after the configured time limit
    inactivityTimerRef.current = setTimeout(() => {
      toast.info(`${timeLimitSeconds} seconds elapsed. Ending interview...`);
        endInterview();
    }, timeLimitMs);
  }, [endInterview]);

  // Check if we should auto-end based on question count
  useEffect(() => {
    if (questionCount >= 5 && isConnected) {
      toast.info("5 questions completed. Ending interview...");
      setTimeout(() => {
        endInterview();
      }, 2000);
    }
  }, [questionCount, isConnected, endInterview]);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000, // OpenAI Realtime API uses 24kHz
      });
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Play audio chunks
  const playAudioChunk = async (audioData) => {
    if (!audioContextRef.current || !audioData) {
      console.warn("⚠️ Cannot play audio: missing context or data");
      return;
    }
    
    try {
      // Ensure audio context is running
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Decode base64 audio data (PCM16 at 24kHz)
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
      
      // Convert PCM16 to Float32
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }
      
      // Create audio buffer
      const audioBuffer = audioContextRef.current.createBuffer(
        1, // mono
        float32.length,
        24000 // 24kHz sample rate
      );
      audioBuffer.getChannelData(0).set(float32);
      
      // Create and play audio source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      currentAudioSourceRef.current = source; // Store reference for cancellation
      
      setIsSpeaking(prev => ({ ...prev, bot: true }));
      
      await new Promise((resolve, reject) => {
        source.onended = () => {
          currentAudioSourceRef.current = null;
          setIsSpeaking(prev => ({ ...prev, bot: false }));
          // Allow immediate interruptions - don't block input
          botIsSpeakingRef.current = false;
          resolve();
        };
        source.onerror = () => {
          currentAudioSourceRef.current = null;
          botIsSpeakingRef.current = false;
          setIsSpeaking(prev => ({ ...prev, bot: false }));
          reject();
        };
        try {
          source.start(0);
        } catch (startError) {
          currentAudioSourceRef.current = null;
          botIsSpeakingRef.current = false;
          reject(startError);
        }
      });
    } catch (error) {
      console.error("❌ Error playing audio chunk:", error);
      botIsSpeakingRef.current = false;
      setIsSpeaking(prev => ({ ...prev, bot: false }));
    }
  };

  // Process audio queue
  const processAudioQueue = async () => {
    if (isPlayingAudioRef.current || audioQueueRef.current.length === 0) return;
    
    isPlayingAudioRef.current = true;
    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift();
      await playAudioChunk(audioData);
    }
    isPlayingAudioRef.current = false;
  };

  const startInterview = async () => {
    try {
      setConnectionError(null);
      setIsProcessing(true);
      
      // Get API key from server
      const tokenResponse = await fetch("/api/live-interview/token", {
        method: "POST",
      });
      
      if (!tokenResponse.ok) {
        throw new Error("Failed to get API token");
      }
      
      const { apiKey, model, interviewTimeLimit, voice } = await tokenResponse.json();
      
      // Store interview time limit for use in timer (in seconds)
      const timeLimit = interviewTimeLimit || 30;
      interviewTimeLimitRef.current = timeLimit;
      setInterviewTimeLimit(timeLimit); // Update state for UI
      const timeLimitMs = timeLimit * 1000;
      
      // Store voice for use in session configuration
      const voiceModel = voice || "cedar";
      
      // Connect to OpenAI Realtime API via WebSocket
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=${model || 'gpt-4o-realtime-preview-2024-10-01'}`,
        ['realtime', `openai-insecure-api-key.${apiKey}`, 'openai-beta.realtime-v1']
      );
      
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Connected to OpenAI Realtime API");
        setIsConnected(true);
        setIsProcessing(false);
      
        // Send session configuration
        ws.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `You are conducting a live interview for the position of ${job.title} at ${job.company}. 

CRITICAL RULES:
1. Ask EXACTLY 5 interview questions - count them carefully
2. After asking a question, STOP TALKING COMPLETELY and WAIT for the candidate to respond
3. DO NOT continue speaking after asking a question until the candidate provides a complete answer
4. DO NOT answer your own questions
5. DO NOT interrupt the candidate while they are speaking
6. DO NOT react to background noise or silence - wait for actual speech from the candidate
7. After the candidate finishes answering, wait 2 seconds of silence, then provide brief positive feedback (1-2 sentences), then ask the next question
8. Keep questions concise and conversational (2-3 sentences max per question)
9. Only speak when the candidate has finished speaking and there has been silence
10. Start with: "Hello! I'm excited to interview you for the ${job.title} position at ${job.company}. Let's begin with the first question."

Job description: ${job.description.substring(0, 2000)}`,
            voice: voiceModel,
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5, // Lower threshold for better speech detection
              prefix_padding_ms: 300,
              silence_duration_ms: 500, // Shorter silence duration to allow interruptions
            },
            temperature: 0.8,
          }
        }));
            
        // Start recording
            startRecording().catch((error) => {
          console.error("Microphone error:", error);
          toast.warning("Microphone access failed. Please grant microphone permissions to continue.");
        });
        
        startAutoEndTimer(timeLimitMs);
        
        // Send initial greeting to start the interview
        setTimeout(() => {
          hasActiveResponseRef.current = true; // Mark that we're creating a response
          ws.send(JSON.stringify({
            type: "response.create",
            response: {
              modalities: ["text", "audio"],
            }
          }));
        }, 500);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeMessage(data);
        } catch (error) {
          console.error("Error parsing message:", error);
              }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("Connection error occurred");
        toast.error("Connection error occurred");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        
        // Don't show error for normal closures (code 1000) or intentional closures (code 1001)
        // Also don't show error if connection was closed intentionally during endInterview
        if (event.code === 1000 || event.code === 1001) {
          // Normal closure, just update state
                  setIsConnected(false);
                  setIsProcessing(false);
              return;
            }
            
        // Only show error for unexpected closures
              setIsConnected(false);
              setIsProcessing(false);
      
        // Don't set error message for "Unknown reason" - it's usually just a normal close
        if (event.reason && event.reason !== 'Unknown reason' && event.reason !== 'Interview ended by user') {
          setConnectionError(`Connection closed: ${event.reason}`);
                  }
      };
      
    } catch (error) {
      console.error("Error starting interview:", error);
      setConnectionError(error.message);
      toast.error(`Failed to start interview: ${error.message}`);
        setIsProcessing(false);
        setIsConnected(false);
      }
  };

  const handleRealtimeMessage = (message) => {
    switch (message.type) {
      case "response.audio.delta":
        // Queue audio for playback
        if (message.delta) {
          hasActiveResponseRef.current = true; // Mark that we have an active response
          audioQueueRef.current.push(message.delta);
          processAudioQueue();
        }
        break;
        
      case "response.audio_transcript.delta":
        // Build bot transcript
        if (message.delta) {
          hasActiveResponseRef.current = true; // Mark that we have an active response
          currentBotMessageRef.current += message.delta;
        }
        break;
        
      case "response.audio_transcript.done":
        // Finalize bot transcript
        const botText = message.transcript || currentBotMessageRef.current;
        if (botText && botText.trim()) {
          // Check if this is a question
          if (botText.includes("?")) {
            questionCountRef.current += 1;
            setQuestionCount(questionCountRef.current);
            console.log(`📊 Question ${questionCountRef.current}/5`);
          }
          
          setTranscript(prev => {
            // Avoid duplicates
            const lastEntry = prev[prev.length - 1];
            if (lastEntry?.speaker === "bot" && lastEntry?.text === botText.trim()) {
              return prev;
            }
            return [...prev, { speaker: "bot", text: botText.trim(), timestamp: new Date() }];
          });
            }
        currentBotMessageRef.current = "";
        break;
        
      case "conversation.item.input_audio_transcription.completed":
        // User speech transcription
        if (message.transcript && message.transcript.trim()) {
          setTranscript(prev => {
                  const lastEntry = prev[prev.length - 1];
            if (lastEntry?.speaker === "user" && lastEntry?.text === message.transcript.trim()) {
                    return prev;
                  }
            return [...prev, { speaker: "user", text: message.transcript.trim(), timestamp: new Date() }];
                });
          setIsSpeaking(prev => ({ ...prev, user: false }));
              }
              break;
        
      case "input_audio_buffer.speech_started":
        setIsSpeaking(prev => {
          // If bot is speaking and there's an active response, cancel it (interruption)
          if (prev.bot && hasActiveResponseRef.current) {
            console.log("🛑 User interrupting bot - cancelling bot response and stopping audio");
            
            // Stop current audio playback
            if (currentAudioSourceRef.current) {
              try {
                currentAudioSourceRef.current.stop();
                currentAudioSourceRef.current.disconnect();
                currentAudioSourceRef.current = null;
              } catch (error) {
                console.log("Audio already stopped or error stopping:", error);
              }
            }
            
            // Clear audio queue
            audioQueueRef.current = [];
            isPlayingAudioRef.current = false;
            
            // Cancel bot's response on server - only if there's an active response
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && hasActiveResponseRef.current) {
              try {
                wsRef.current.send(JSON.stringify({
                  type: "response.cancel",
                }));
              } catch (error) {
                console.error("Error cancelling response:", error);
              }
            }
            
            // Update bot speaking state and mark user as speaking
            botIsSpeakingRef.current = false;
            currentBotMessageRef.current = ""; // Clear partial message
            hasActiveResponseRef.current = false; // Mark response as cancelled
            return { ...prev, user: true, bot: false };
          }
          return { ...prev, user: true };
        });
        break;
        
      case "input_audio_buffer.speech_stopped":
        setIsSpeaking(prev => ({ ...prev, user: false }));
        break;
        
      case "response.cancelled":
        // Bot response was cancelled (user interrupted)
        console.log("✅ Bot response cancelled due to interruption");
        hasActiveResponseRef.current = false; // No active response anymore
        setIsSpeaking(prev => ({ ...prev, bot: false }));
        currentBotMessageRef.current = ""; // Clear partial message
        break;
        
      case "response.done":
      case "response.content_part.done":
        hasActiveResponseRef.current = false; // No active response anymore
        setIsSpeaking(prev => ({ ...prev, bot: false }));
        break;
        
      case "error":
        // Handle specific error codes silently
        if (message.error?.code === "response_cancel_not_active") {
          // This is expected - user tried to interrupt but no active response
          // Just log and continue, don't show error
          console.log("ℹ️ No active response to cancel (already finished or not started)");
          hasActiveResponseRef.current = false;
          return;
        }
        
        // Log full error details for debugging other errors
        console.error("Realtime API error - Full message:", JSON.stringify(message, null, 2));
        console.error("Realtime API error - Error object:", message.error);
        
        // Handle various error formats
        let errorMessage = 'Unknown error occurred';
        
        if (message.error) {
          if (typeof message.error === 'string') {
            errorMessage = message.error;
          } else if (message.error.message) {
            errorMessage = message.error.message;
          } else if (message.error.code) {
            errorMessage = `Error code: ${message.error.code}`;
          } else if (message.error.type) {
            errorMessage = `Error type: ${message.error.type}`;
          } else if (Object.keys(message.error).length > 0) {
            errorMessage = JSON.stringify(message.error);
          }
        }
        
        // Only show toast for non-empty errors to avoid spam
        if (errorMessage !== 'Unknown error occurred' || Object.keys(message.error || {}).length > 0) {
          toast.error(`API Error: ${errorMessage}`);
        } else {
          // Log silently for empty errors
          console.warn("Empty error object received - ignoring");
        }
        break;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
      });
      
      mediaStreamRef.current = stream;
      
      // Create audio context for recording
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        
        // Allow interruptions - don't block input when bot is speaking
        // OpenAI's VAD will handle turn-taking properly
        
          const inputData = e.inputBuffer.getChannelData(0);
          
        // Send ALL audio to OpenAI - let their VAD handle noise filtering
        // This ensures your voice is always captured and interruptions work
          // Convert to PCM16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // Convert to base64
          const bytes = new Uint8Array(pcm16.buffer);
          const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
          
        // Send to OpenAI - always send audio, let OpenAI handle VAD
        wsRef.current.send(JSON.stringify({
          type: "input_audio_buffer.append",
          audio: base64Audio,
        }));
      };
      
      audioProcessorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      setIsRecording(true);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to access microphone");
      throw error;
    }
  };

  if (resultData) {
    return (
      <div className="space-y-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Mode Selection
          </Button>
        )}
        <div className="mx-2">
          <QuizResult result={resultData} onStartNew={() => {
            setResultData(null);
            setTranscript([]);
            setQuestionCount(0);
            questionCountRef.current = 0;
          }} />
        </div>
      </div>
    );
  }

  return (
    <Card className="glass border-2 border-secondary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Live Bot Interview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time interview for <strong>{job.title}</strong> at <strong>{job.company}</strong>
            </p>
          </div>
          {onBack && !isConnected && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected && !isProcessing && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Click start to begin a live conversational interview with the AI bot.
              The interview will automatically end after 5 questions or {interviewTimeLimit} seconds, whichever comes first.
            </p>
            {connectionError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
                <p className="font-medium mb-1">Connection Error</p>
                <p>{connectionError}</p>
              </div>
            )}
              <Button
                onClick={startInterview}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                size="lg"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Live Interview
              </Button>
          </div>
            )}

        {isProcessing && !isConnected && (
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-secondary" />
            <p className="text-muted-foreground">Connecting to interview bot...</p>
          </div>
        )}

        {(isConnected || isProcessing) && (
          <>
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                {isConnected && (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Connected</span>
                  </>
                )}
                {isRecording && (
                  <>
                    <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-sm">Listening...</span>
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Question {questionCount}/5
              </div>
            </div>

            {/* Live Transcript */}
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Live Transcript</h3>
              <div className="bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-3">
                {transcript.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Waiting for conversation to start...
                  </p>
                ) : (
                  transcript.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        entry.speaker === "bot"
                          ? "justify-start"
                          : "justify-end flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg transition-all ${
                          entry.speaker === "bot"
                            ? "bg-primary/10 text-foreground"
                            : "bg-secondary/20 text-foreground"
                        }`}
                      >
                        <div className="text-xs font-medium mb-1 opacity-70 flex items-center gap-2">
                          {entry.speaker === "bot" ? (
                            <>
                              <span>🤖 Interviewer</span>
                              {index === transcript.length - 1 && isSpeaking.bot && (
                                <Volume2 className="w-3 h-3 animate-pulse" />
                              )}
                            </>
                          ) : (
                            <>
                              <span>👤 You</span>
                              {index === transcript.length - 1 && isSpeaking.user && (
                                <Mic className="w-3 h-3 animate-pulse" />
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {isConnected && (
                <Button
                  onClick={endInterview}
                  variant="destructive"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "End Interview"
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
