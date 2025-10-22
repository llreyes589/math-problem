// app/api/users/route.js
import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "../../../lib/supabaseClient";
import { useSearchParams } from "next/navigation";
import { NextRequest } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function GET(request: NextRequest) {
  const difficulty = request.nextUrl.searchParams.get("difficulty");
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a primary 5 level math problem. Add difficulty like easy, medium and hard. Make this question in ${difficulty} mode. It will also has hint in every question`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            problem_text: {
              type: Type.STRING,
            },
            hint: {
              type: Type.STRING,
            },
            correct_answer: {
              type: Type.INTEGER,
            },
          },
          propertyOrdering: ["problem_text", "hint", "correct_answer"],
        },
      },
    },
  });
  const result = JSON.parse(response.text);
  // make a copy of result varaiable
  const resultCopy = result.map((r) => {
    return {
      ...r,
    };
  });
  // exclude hint property in result
  delete result[0].hint;
  const { data, error } = await supabase
    .from("math_problem_sessions")
    .insert(result)
    .select("id, problem_text");
  if (error) {
    return NextResponse.json({ message: error });
  }
  // add hint in response
  data[0]["hint"] = resultCopy[0].hint;
  return NextResponse.json({ message: "Math problems created", data });
}

export async function POST(request) {
  const body = await request.json(); // Parse the request body as JSON
  // Receive the session ID and user's answer
  const { user_answer, session_id } = body;
  // Check if the answer is correct
  let { data: math_problem_sessions } = await supabase
    .from("math_problem_sessions")
    .select("correct_answer, problem_text")
    .eq("id", session_id)
    .single();
  const is_correct = +user_answer === math_problem_sessions.correct_answer;
  // Use AI to generate personalized feedback based on:
  // The original problem
  // The correct answer
  // The user's answer
  let feedback_text: string;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Given the math problem: ${math_problem_sessions.problem_text}, correct answer: ${math_problem_sessions.correct_answer} and user answer: ${user_answer}, give a helpful and personalized feedback_text.`,
  });

  feedback_text = response.text;
  // Whether they got it right or wrong
  // Save the submission to math_problem_submissions table
  const form_body = {
    session_id,
    user_answer,
    is_correct,
    feedback_text,
  };

  const { data, error } = await supabase
    .from("math_problem_submissions")
    .insert(form_body)
    .select(
      "id, user_answer, feedback_text, is_correct, created_at, math_problem_sessions(id, problem_text)"
    );

  if (error) {
    return NextResponse.json({ message: error });
  }

  // Return the feedback and correctness to the frontend
  return NextResponse.json({
    message: "Answer was submitted.",
    data,
  });
}
