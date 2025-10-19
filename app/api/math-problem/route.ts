// app/api/users/route.js
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "../../../lib/supabaseClient";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function GET(request) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      "Generate a math problems. Make it in json form with problem_text and correct_answer properties",
    config: {
      responseMimeType: "application/json",
    },
  });
  const result = JSON.parse(response.text);
  const { data, error } = await supabase
    .from("math_problem_sessions")
    .insert(result)
    .select();
  if (error) {
    return NextResponse.json({ message: error });
  }
  return NextResponse.json({ message: "Math problems created", data });
}

export async function POST(request) {}
