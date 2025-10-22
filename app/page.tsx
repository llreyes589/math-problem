"use client";

import { useState } from "react";
import axios from "axios";

type Difficulty = "easy" | "medium" | "hard";

interface MathProblem {
  problem_text: string;
  final_answer: number;
  difficulty: Difficulty;
  hint?: string;
  points: number;
}

interface SessionHistory {
  id: string;
  user_answer: number;
  is_correct: boolean;
  feedback_text: string;
  created_at: string;
  difficulty: Difficulty;
  points_earned: number;
  math_problem_sessions: {
    problem_text: string;
  };
}

interface ScoreInfo {
  current: number;
  streak: number;
  total: number;
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("medium");
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState<ScoreInfo>({
    current: 0,
    streak: 0,
    total: 0,
  });

  const difficultyConfig = {
    easy: { color: "emerald", points: 10 },
    medium: { color: "amber", points: 20 },
    hard: { color: "rose", points: 30 },
  };

  const fetchSessionHistory = async () => {
    try {
      const { data } = await axios.get("/api/math-problem/history");
      setSessionHistory(data.data);
    } catch (error) {
      console.error("Failed to fetch session history:", error);
    }
  };

  const generateProblem = async () => {
    setIsLoading(true);
    setShowHint(false);
    setHintsUsed(0);
    const endpoint = "/api/math-problem";
    try {
      const response = await fetch(
        `${endpoint}?difficulty=${selectedDifficulty}`
      );
      const data = await response.json();
      setProblem(data.data[0]);
      setSessionId(data.data[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const body = {
      user_answer: userAnswer,
      session_id: sessionId,
      hints_used: hintsUsed,
    };
    const endpoint = "/api/math-problem";
    try {
      const { data } = await axios.post(endpoint, body);
      if (data) {
        const responseData = data.data[0];
        setFeedback(responseData.feedback_text);
        setIsCorrect(responseData.is_correct);

        // Update score
        if (responseData.is_correct) {
          const basePoints = difficultyConfig[selectedDifficulty].points;
          const hintPenalty = hintsUsed * 2; // -2 points per hint used
          const earnedPoints = Math.max(basePoints - hintPenalty, 1);

          setScore((prev) => ({
            current: earnedPoints,
            streak: prev.streak + 1,
            total: prev.total + earnedPoints,
          }));
        } else {
          setScore((prev) => ({
            ...prev,
            current: 0,
            streak: 0,
          }));
        }

        setSessionHistory((history) => [responseData, ...history]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setUserAnswer("");
    }
  };

  const startOver = () => {
    // reset problem and feedback
    setProblem(null);
    setFeedback(null);
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
          <button
            onClick={() => {
              fetchSessionHistory();
              setShowHistory(true);
            }}
            className="mt-6 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>View History</span>
          </button>
        </div>

        {showHistory && (
          <div className="fixed inset-0 bg-gray-600/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <span className="text-3xl mr-3">📚</span> Session History
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-5rem)]">
                {sessionHistory.length > 0 ? (
                  <div className="space-y-4">
                    {sessionHistory.map((session) => (
                      <div
                        key={session.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                              {session.math_problem_sessions.problem_text}
                            </p>
                            <div className="flex items-center space-x-4 text-sm flex-wrap gap-y-2">
                              <span className="text-gray-500 dark:text-gray-400">
                                Your answer: {session.user_answer}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <time className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(
                                session.created_at
                              ).toLocaleDateString()}
                            </time>
                          </div>
                        </div>
                        <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm border-t border-gray-200 dark:border-gray-600/50 pt-3">
                          {session.feedback_text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No history yet. Start solving some problems!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-4 text-center transform transition-all duration-300 hover:shadow-lg">
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Current Score
            </p>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              {score.current}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-4 text-center transform transition-all duration-300 hover:shadow-lg">
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Streak
            </p>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
              {score.streak}🔥
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-4 text-center transform transition-all duration-300 hover:shadow-lg">
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Total Score
            </p>
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              {score.total}
            </p>
          </div>
        </div>

        {!problem ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8">
            {/* Difficulty Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
                Select Difficulty
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200
                    ${
                      selectedDifficulty === diff
                        ? `bg-${difficultyConfig[diff].color}-100 text-${difficultyConfig[diff].color}-700 dark:bg-${difficultyConfig[diff].color}-900/30 dark:text-${difficultyConfig[diff].color}-400 ring-2 ring-${difficultyConfig[diff].color}-500`
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Points: {difficultyConfig[selectedDifficulty].points} (-2 per
                hint used)
              </p>
            </div>

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
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <span className="text-3xl mr-3">🧮</span> Your Challenge
              </h2>
              <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-300 font-medium text-sm">
                Problem #{sessionId}
              </div>
            </div>

            <div className="mb-8">
              <div className="p-6 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl border-l-4 border-violet-500">
                <p className="text-xl text-gray-800 dark:text-gray-100 leading-relaxed">
                  {problem.problem_text}
                </p>
              </div>

              {/* Hint System */}
              {problem.hint && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setHintsUsed((prev) => prev + 1);
                    }}
                    disabled={showHint}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all duration-200"
                  >
                    <span className="mr-2">💡</span>
                    {showHint ? "Hint Used (-2 points)" : "Need a Hint?"}
                  </button>
                  {showHint && (
                    <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-amber-800 dark:text-amber-200">
                        {problem.hint}
                      </p>
                    </div>
                  )}
                </div>
              )}
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

            <button
              onClick={startOver}
              disabled={isLoading}
              className="group relative w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] focus:ring-2 focus:ring-violet-400 focus:outline-none disabled:cursor-not-allowed mt-4"
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
                    <span>Start Over</span>
                  </>
                )}
              </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
