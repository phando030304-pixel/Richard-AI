import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { richardKnowledge } from "@/data/basic";

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

type RequestBody = {
    messages?: ChatMessage[];
};

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is missing." },
                { status: 500 },
            );
        }

        const body = (await request.json()) as RequestBody;

        if (!Array.isArray(body.messages)) {
            return NextResponse.json(
                { error: "Messages are required." },
                { status: 400 },
            );
        }

        const ai = new GoogleGenAI({
            apiKey,
        });

        const conversation = body.messages
            .map((message) => {
                const speaker =
                    message.role === "user"
                        ? "User"
                        : "Richard AI";

                return `${speaker}: ${message.content}`;
            })
            .join("\n");

        const prompt = `
You are Richard AI, an interactive AI portfolio about Richard.

Your personality:
- Friendly
- Funny
- Energetic
- Expressive
- Professional when needed

Rules:
- Only answer questions about Richard.
- Use ONLY the information from RICHARD KNOWLEDGE.
- Never invent facts.
- Never guess.
- If information is unavailable, reply:
"I don't have that information about Richard yet!!!"

Writing style:
- Use natural English.
- Sound like a friendly person, not a robot.
- Keep answers concise unless the user asks for details.
- Use emojis occasionally.
- Do not overuse exclamation marks.
- Write in paragraphs.
- Use bullet points when listing skills, projects, education or experience.

Formatting rules:
- Never output JSON.
- Never output markdown code.
- Never output citations.
- Never output source references.
- Never output metadata.
- Never output language codes.
- Never output country codes.
- Never append unexplained two-letter abbreviations after locations.
- Write location names naturally.
- Do not repeat information.

RICHARD KNOWLEDGE

${JSON.stringify(richardKnowledge, null, 2)}

Conversation

${conversation}

Answer ONLY the user's latest question.
`;

        const result = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
        });

        const rawAnswer =
            result.text?.trim() ??
            "I don't have that information about Richard yet!!!";

        const cleanedAnswer = rawAnswer
            .replace(/\bVietnam[!,.]?\s+vn\b/gi, "Vietnam")
            .replace(/\bCanada[!,.]?\s+ca\b/gi, "Canada")
            .replace(/\bBritish Columbia[!,.]?\s+bc\b/gi, "British Columbia")
            .replace(/\s+\b(vn|ca|bc)\b(?=[.,!? ]|$)/gi, "")
            .replace(/[ ]{2,}/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        return NextResponse.json({
            answer: cleanedAnswer,
        });
    } catch (error: unknown) {
        console.error(error);

        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown Gemini API error";

        return NextResponse.json(
            {
                error: errorMessage,
            },
            {
                status: 500,
            },
        );
    }
}