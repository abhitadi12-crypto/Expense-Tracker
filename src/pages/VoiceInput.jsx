import React, { useState } from "react";
import { Mic, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/Card";
import { geminiService } from "../services/gemini";
import { cn } from "../utils/cn";

/**
 * VoiceInput Page - Add expenses using voice commands
 */
export const VoiceInput = ({ onSave, onCancel, isSaving, error }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [parsedExpense, setParsedExpense] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  /**
   * Start Web Speech API recording
   */
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecognizedText("");
      setParsedExpense(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setRecognizedText(finalTranscript);
        handleParse(finalTranscript);
      } else if (interimTranscript) {
        setRecognizedText(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  /**
   * Use Gemini to parse the recognized text
   */
  const handleParse = async (text) => {
    if (!text || text.trim().length < 3) return;
    
    setIsParsing(true);
    setParsedExpense(null);
    try {
      const data = await geminiService.parseExpense(text);
      if (data && data.is_expense) {
        setParsedExpense(data);
      } else {
        setRecognizedText(prev => prev + " (No expense detected. Try saying something like 'Spent 500 on dinner')");
      }
    } catch (err) {
      console.error("AI Parsing Error:", err);
      setRecognizedText(prev => prev + " (Error parsing expense. Please try again.)");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <Card className="text-center py-12">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Voice Input</h3>
        <p className="text-slate-500 mb-8">Tell Expense-Tracker about your expense</p>
        
        {/* Recording Button with Animation */}
        <div className="relative flex justify-center mb-8">
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.2 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute w-24 h-24 bg-indigo-500 rounded-full"
              />
            )}
          </AnimatePresence>
          <button 
            onClick={startRecording}
            disabled={isRecording || isParsing}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all relative z-10",
              isRecording ? "bg-red-500" : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            <Mic className="text-white w-10 h-10" />
          </button>
        </div>

        {/* Status and Recognized Text */}
        <div className="min-h-[100px] mb-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}
          {isRecording && <p className="text-indigo-600 font-medium animate-pulse">Listening...</p>}
          {recognizedText && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 italic text-slate-700">
              "{recognizedText}"
            </div>
          )}
          {isParsing && (
            <div className="flex items-center justify-center gap-2 text-slate-500 mt-4">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              AI is parsing...
            </div>
          )}
        </div>

        {/* Parsed Expense Confirmation */}
        {parsedExpense && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-left mb-8"
          >
            <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Detected Expense
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Item</p>
                <p className="font-semibold text-indigo-900">{parsedExpense.item}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Amount</p>
                <p className="font-semibold text-indigo-900">₹{parsedExpense.amount}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Category</p>
                <p className="font-semibold text-indigo-900">{parsedExpense.category}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Date</p>
                <p className="font-semibold text-indigo-900">{parsedExpense.date}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => onSave(parsedExpense, recognizedText)}
                disabled={isSaving}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {isSaving ? "Saving..." : "Confirm & Save"}
              </button>
              <button 
                onClick={() => setParsedExpense(null)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                Edit
              </button>
            </div>
          </motion.div>
        )}

        <button 
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 font-medium"
        >
          Cancel
        </button>
      </Card>
    </div>
  );
};
