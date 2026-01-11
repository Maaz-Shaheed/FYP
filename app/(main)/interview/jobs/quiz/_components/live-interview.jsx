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
  const [interviewTimeLimit, setInterviewTimeLimit] = useState(120); // Store for UI display
  
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
  const recordingAudioContextRef = useRef(null); // Separate audio context for recording at native rate
  const interviewTimeLimitRef = useRef(120); // Store interview time limit in seconds (default 120)
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
    if (questionCount >= 3 && isConnected) {
      toast.info("3 questions completed. Ending interview...");
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
      if (recordingAudioContextRef.current && recordingAudioContextRef.current.state !== 'closed') {
        recordingAudioContextRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Play audio chunks
  const playAudioChunk = async (audioData) => {
    // Ensure we have a valid audio context for playback
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000, // OpenAI Realtime API uses 24kHz
      });
    }

    if (!audioContextRef.current || !audioData) return;

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
        } catch {
          currentAudioSourceRef.current = null;
          botIsSpeakingRef.current = false;
          reject();
        }
      });
    } catch (error) {
      console.error("Error playing audio chunk:", error);
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
        `wss://api.openai.com/v1/realtime?model=${model || 'gpt-realtime-mini'}`,
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
            instructions: `You are interviewing for ${job.title} at ${job.company}. Ask exactly 3 concise questions.

START WITH: "Hi! Welcome to PrepMate AI. Let's begin your interview."

CRITICAL:
- Start with the welcome message above, then ask your first question
- Questions must be SHORT and DIRECT (1 sentence max, under 15 words)
- After each question, STOP and wait for answer
- Do NOT ramble, explain, or add fluff
- User can interrupt you - stop immediately when they speak
- Keep internal count of questions asked
- AFTER asking 3 questions total, say "Thank you for your time. The interview is now complete." and immediately call the end_interview function
- Example good question: "Tell me about your experience with React."
- Example bad question: "So, I'd love to hear more about your background and specifically if you could elaborate on your experience working with React and maybe share a project."

Job: ${job.description.substring(0, 1500)}`,
            voice: voiceModel,
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.3, // Much lower threshold - detect speech easier
              prefix_padding_ms: 200, // Less padding - faster response
              silence_duration_ms: 300, // Shorter silence - stop faster when interrupted
            },
            temperature: 0.7, // Lower temperature for more focused responses
            tools: [
              {
                type: "function",
                name: "end_interview",
                description: "Call this function when the interview is complete (after 3 questions have been asked). This will end the interview session.",
                parameters: {
                  type: "object",
                  strict: true,
                  properties: {
                    reason: {
                      type: "string",
                      description: "The reason for ending the interview (e.g., '3 questions completed')"
                    },
                    questions_asked: {
                      type: "number",
                      description: "The number of questions asked during the interview"
                    }
                  },
                  required: ["reason", "questions_asked"]
                }
              }
            ],
            tool_choice: "auto"
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
      case "response.created":
        // Response is being created - mark as active for interruption handling
        hasActiveResponseRef.current = true;
        break;

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
          // Log bot dialogue to console
          console.log("🤖 Bot:", botText.trim());

          // Count questions - but NOT the welcome message or initial greeting
          // Only count actual interview questions (containing ? and not just greetings)
          const trimmedText = botText.trim();
          const isWelcomeOrGreeting =
            trimmedText.toLowerCase().includes("welcome") ||
            trimmedText.toLowerCase().includes("let's begin") ||
            trimmedText.toLowerCase().includes("let us begin") ||
            (trimmedText.startsWith("Hi!") && trimmedText.length < 50);

          // Count as question if it has "?" and is NOT a welcome/greeting message
          if (trimmedText.includes("?") && !isWelcomeOrGreeting) {
            questionCountRef.current += 1;
            setQuestionCount(questionCountRef.current);
          }

          setTranscript(prev => {
            // Avoid duplicates and sort by timestamp
            const newEntry = { speaker: "bot", text: trimmedText, timestamp: new Date() };
            const lastEntry = prev[prev.length - 1];
            if (lastEntry?.speaker === "bot" && lastEntry?.text === trimmedText) {
              return prev;
            }
            const newTranscript = [...prev, newEntry];
            // Sort by timestamp to ensure correct order
            return newTranscript.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          });
            }
        currentBotMessageRef.current = "";
        break;
        
      case "conversation.item.input_audio_transcription.completed":
        // User speech transcription
        if (message.transcript && message.transcript.trim()) {
          console.log("🗣️ User speech detected:", message.transcript);
          const userText = message.transcript.trim();
          setTranscript(prev => {
            // Avoid duplicates and sort by timestamp
            const lastEntry = prev[prev.length - 1];
            if (lastEntry?.speaker === "user" && lastEntry?.text === userText) {
              return prev;
            }
            const newEntry = { speaker: "user", text: userText, timestamp: new Date() };
            const newTranscript = [...prev, newEntry];
            // Sort by timestamp to ensure correct order
            return newTranscript.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          });
          setIsSpeaking(prev => ({ ...prev, user: false }));
              }
              break;
        
      case "input_audio_buffer.speech_started":
        setIsSpeaking(prev => {
          // Always cancel bot response when user starts speaking (aggressive interruption)
          if (hasActiveResponseRef.current) {
            console.log("🛑 User started speaking - cancelling bot response");

            // Stop current audio playback immediately
            if (currentAudioSourceRef.current) {
              try {
                currentAudioSourceRef.current.stop();
                currentAudioSourceRef.current.disconnect();
                currentAudioSourceRef.current = null;
              } catch (error) {
                // Audio already stopped or error stopping - ignore
              }
            }

            // Clear all queued audio
            audioQueueRef.current = [];
            isPlayingAudioRef.current = false;

            // Cancel bot's response on server
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              try {
                wsRef.current.send(JSON.stringify({
                  type: "response.cancel",
                }));
              } catch (error) {
                console.error("Error cancelling response:", error);
              }
            }

            // Reset all bot speaking states
            botIsSpeakingRef.current = false;
            currentBotMessageRef.current = "";
            hasActiveResponseRef.current = false;
          }

          return { ...prev, user: true, bot: false };
        });
        break;
        
      case "input_audio_buffer.speech_stopped":
        setIsSpeaking(prev => ({ ...prev, user: false }));
        break;
        
      case "response.cancelled":
        // Bot response was cancelled (user interrupted)
        hasActiveResponseRef.current = false; // No active response anymore
        setIsSpeaking(prev => ({ ...prev, bot: false }));
        currentBotMessageRef.current = ""; // Clear partial message
        break;
        
      case "response.done":
        hasActiveResponseRef.current = false; // No active response anymore
        setIsSpeaking(prev => ({ ...prev, bot: false }));

        // Check for function calls in the response output
        if (message.response?.output) {
          for (const output of message.response.output) {
            if (output.type === "function_call" && output.name === "end_interview") {
              console.log("🔧 Function call received: end_interview", output.arguments);
              try {
                const args = JSON.parse(output.arguments);
                console.log(`📋 Interview ended via function call. Reason: ${args.reason}, Questions asked: ${args.questions_asked}`);

                // Update question count from function call if provided
                if (args.questions_asked) {
                  questionCountRef.current = args.questions_asked;
                  setQuestionCount(args.questions_asked);
                }

                // Show toast notification
                toast.info(args.reason || "Interview completed");

                // End the interview after a brief delay to let the final message play
                setTimeout(() => {
                  endInterview();
                }, 1500);
              } catch (error) {
                console.error("Error parsing function call arguments:", error);
              }
            }
          }
        }
        break;

      case "response.content_part.done":
        hasActiveResponseRef.current = false; // No active response anymore
        setIsSpeaking(prev => ({ ...prev, bot: false }));
        break;
        
      case "error":
        // Handle specific error codes silently
        if (message.error?.code === "response_cancel_not_active") {
          // This is expected - user tried to interrupt but no active response
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

      default:
        // Ignore unhandled message types
        break;
    }
  };

  const startRecording = async () => {
    try {
      // Get audio at browser's native sample rate
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Create a separate audio context for recording at browser's native rate
      if (!recordingAudioContextRef.current || recordingAudioContextRef.current.state === 'closed') {
        recordingAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = recordingAudioContextRef.current;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      const TARGET_SAMPLE_RATE = 24000;
      const sourceSampleRate = audioContext.sampleRate;
      const sampleRateRatio = TARGET_SAMPLE_RATE / sourceSampleRate;

      let audioSendCount = 0;
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Log first audio chunk for debugging
        if (audioSendCount === 0) {
          console.log("🎤 Audio capture started - sample rate:", sourceSampleRate, "Hz -> target:", TARGET_SAMPLE_RATE, "Hz");
        }
        audioSendCount++;

        // Resample to 24kHz if needed
        let resampledData;
        if (sourceSampleRate === TARGET_SAMPLE_RATE) {
          resampledData = inputData;
        } else {
          // Simple linear interpolation resampling
          const outputLength = Math.round(inputData.length * sampleRateRatio);
          resampledData = new Float32Array(outputLength);
          for (let i = 0; i < outputLength; i++) {
            const srcIndex = i / sampleRateRatio;
            const index = Math.floor(srcIndex);
            const fraction = srcIndex - index;
            if (index + 1 < inputData.length) {
              resampledData[i] = inputData[index] * (1 - fraction) + inputData[index + 1] * fraction;
            } else {
              resampledData[i] = inputData[index] || 0;
            }
          }
        }

        // Convert to PCM16
        const pcm16 = new Int16Array(resampledData.length);
        for (let i = 0; i < resampledData.length; i++) {
          const s = Math.max(-1, Math.min(1, resampledData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert to base64 - use chunked encoding for large arrays
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i += 8192) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 8192, len)));
        }
        const base64Audio = btoa(binary);

        // Send to OpenAI
        try {
          wsRef.current.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64Audio,
          }));
        } catch (error) {
          console.error("Error sending audio data:", error);
        }
      };

      audioProcessorRef.current = processor;

      // Only connect source to processor - DO NOT connect processor to destination
      // (that would create a feedback loop and cause audio issues)
      source.connect(processor);

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
              The interview will automatically end after 3 questions or {interviewTimeLimit} seconds, whichever comes first.
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
                Question {questionCount}/3
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
