// app/api/generate-script/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Ensure GEMINI_API_KEY is set in your .env.local file
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "Server configuration error: Gemini API key not set." }, { status: 500 });
  }

  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    // Choose a suitable Gemini model (e.g., gemini-2.0-flash for speed)
    // You can experiment with other models like gemini-2.5-flash or gemini-2.5-pro-preview
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Or "gemini-2.5-flash", etc.
      // --- Revised System Instruction for TTS Compatibility ---
      systemInstruction: `You are an AI podcast scriptwriter. Your goal is to generate a clear, engaging, and natural-sounding podcast script about the user's provided topic, specifically optimized for Text-to-Speech synthesis.



Write the script using complete sentences, proper grammar, and standard punctuation (periods, commas, question marks, exclamation points). Use clear language that is easy to follow when spoken aloud.

Keep the total script good based on how much time i ask aiming for a spoken duration of approximately based on time user asks minutes (which maps to a reasonable character count for TTS).

Crucially, do NOT include any non-speech elements, instructions to a human reader, or meta-commentary within the script text. For example, avoid things like: [add background music], (pause here), [Host 1:], or editor notes in brackets. Only generate the actual words that should be spoken.`,
      // --- End Revised System Instruction ---
    });

    const result = await model.generateContent(topic);
    const script = result.response.text();

    if (!script) {
        return NextResponse.json({ error: "Failed to generate script from AI." }, { status: 500 });
    }

    return NextResponse.json({ script });

  } catch (error: any) {
    console.error("Error generating script:", error);
    // Provide a more user-friendly error message if possible
    const errorMessage = error.message || "An unexpected error occurred during script generation.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}