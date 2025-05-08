// app/api/generate-audio/route.ts
import { ElevenLabsClient } from "elevenlabs";
import { NextResponse } from 'next/server';
import { promises as fsPromises, createWriteStream, access, mkdir } from 'fs'; // Import necessary functions from 'fs' and 'fs/promises'
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from 'stream/promises'; // Import pipeline from stream/promises

// Ensure ELEVENLABS_API_KEY is set in your .env.local file
const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
  console.error("ELEVENLABS_API_KEY environment variable not set.");
}

const elevenlabs = new ElevenLabsClient({ apiKey: apiKey });

// Ensure the public/audio directory exists
const audioDir = path.join(process.cwd(), 'public', 'audio');

async function ensureAudioDirectory() {
  try {
    await access(audioDir); // Use promise-based access
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(audioDir, { recursive: true }); // Use promise-based mkdir
    console.log(`Created directory: ${audioDir}`);
  }
}

// Call this function once when the route is loaded
// Note: In Vercel/serverless environments, this might re-run on new cold starts
ensureAudioDirectory();


export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "Server configuration error: ElevenLabs API key not set." }, { status: 500 });
  }

  try {
    const { script } = await request.json();

    if (!script) {
      return NextResponse.json({ error: "Script is required." }, { status: 400 });
    }

    // --- ElevenLabs TTS Call ---
    const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // Example voice ID - consider letting the user choose this
    const modelId = "eleven_turbo_v2_5"; // Example model ID - consider letting the user choose this

    const audioStream = await elevenlabs.generate({ // Get the ReadableStream
      voice_id: voiceId,
      model_id: modelId,
      text: script,
      // Optional: adjust settings like voice_settings
      // voice_settings: {
      //   stability: 0.5,
      //   similarity_boost: 0.7,
      // },
      // Optional: specify output format if needed, default is mp3
      // output_format: "mp3_44100_128",
    });
    // --- End ElevenLabs TTS Call ---

    // Save the audio stream to a file in the public directory
    const filename = `podcast-${uuidv4()}.mp3`;
    const filePath = path.join(audioDir, filename);

    // Use createWriteStream directly from the 'fs' module
    const writeStream = createWriteStream(filePath);

    // Pipe the audio stream to the file stream and wait for completion
    await pipeline(audioStream as any, writeStream); // Cast audioStream to 'any' to satisfy pipeline's type checking if needed

    // Construct the public URL
    const audioUrl = `/audio/${filename}`;

    return NextResponse.json({ audioUrl });

  } catch (error: any) {
    console.error("Error generating audio:", error);
    const errorMessage = error.message || "An unexpected error occurred during audio generation.";
     // Check for specific error types from ElevenLabs if possible (e.g., character limit, invalid voice)
    // For example: if (error.message.includes("character limit")) { ... }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}