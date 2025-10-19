"use client";

import { useState } from "react";
import axios from "axios";

interface MathProblem {
  problem_text: string;
  final_answer: number;
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateProblem = async () => {
    // TODO: Implement problem generation logic
    // This should call your API route to generate a new problem
    // and save it to the database
    const endpoint = "/api/math-problem";
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setProblem(data.data[0]);
      setSessionId(data.data[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement answer submission logic
    // This should call your API route to check the answer,
    // save the submission, and generate feedback
    const body = {
      user_answer: userAnswer,
      session_id: sessionId,
    };
    const endpoint = "/api/math-problem";
    try {
      const { data } = await axios.post(endpoint, body);
      if (data) {
        setFeedback(data.data[0].feedback_text);
        setIsCorrect(data.data[0].is_correct);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-800/50"></div>

      <main className="relative container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
            Math Quest
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl">
            Challenge your mind with interactive math problems
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
          <button
            onClick={generateProblem}
            disabled={isLoading}
            className="group relative w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] focus:ring-2 focus:ring-violet-400 focus:outline-none disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 h-full w-full scale-[0.90] bg-white/30 blur-lg rounded-xl transition-all duration-300 group-hover:scale-105"></div>
            <div className="relative flex items-center justify-center space-x-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Generating Challenge...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🎲</span>
                  <span>Start New Challenge</span>
                </>
              )}
            </div>
          </button>
        </div>

        {problem && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <span className="text-3xl mr-3">🧮</span> Your Challenge
              </h2>
              <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-300 font-medium text-sm">
                Problem #{sessionId}
              </div>
            </div>

            <div className="mb-8 p-6 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl border-l-4 border-violet-500">
              <p className="text-xl text-gray-800 dark:text-gray-100 leading-relaxed">
                {problem.problem_text}
              </p>
            </div>

            <form onSubmit={submitAnswer} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="answer"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-3"
                >
                  Your Solution
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-6 py-4 text-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-violet-200 dark:focus:ring-violet-900 focus:border-violet-500 dark:focus:border-violet-500 transition-all duration-200 ease-in-out dark:text-white"
                    placeholder="Enter your solution..."
                    required
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300 blur"></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!userAnswer || isLoading}
                className="group relative w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] focus:ring-2 focus:ring-emerald-400 focus:outline-none disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 h-full w-full scale-[0.90] bg-white/30 blur-lg rounded-xl transition-all duration-300 group-hover:scale-105"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <span className="text-xl">✨</span>
                  <span>{isLoading ? "Checking..." : "Submit Solution"}</span>
                </div>
              </button>
            </form>
          </div>
        )}

        {feedback && (
          <div
            className={`transform transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 ${
              isCorrect
                ? "border-l-8 border-emerald-500"
                : "border-l-8 border-amber-500"
            }`}
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">{isCorrect ? "🎉" : "💡"}</span>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isCorrect ? "Brilliant Work!" : "Keep Learning!"}
              </h2>
            </div>
            <div
              className={`p-6 rounded-xl ${
                isCorrect
                  ? "bg-emerald-50/50 dark:bg-emerald-900/20"
                  : "bg-amber-50/50 dark:bg-amber-900/20"
              }`}
            >
              <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                {feedback}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
