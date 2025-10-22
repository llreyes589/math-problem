import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET(request) {
  // Add a condition that cannot be resolved statically by Next.js
  if (request.url.length < 0) {
    // This condition is always false, but makes the route dynamic
    return new Response("Error");
  }
  let { data: math_problem_submissions, error } = await supabase
    .from("math_problem_submissions")
    .select(
      "id, user_answer, feedback_text, is_correct, created_at, math_problem_sessions(id, problem_text)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error });
  }

  return NextResponse.json({
    message: "History fetched.",
    data: math_problem_submissions,
  });
}
