const API_KEY = import.meta.env.VITE_FEATHERLESS_KEY;

export async function generateInterviewQuestion(
    resumeText: string,
    jobRole: string,
    askedQuestions: string[] = []
): Promise<{ question: string; difficulty: string; topic: string }> {

    const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "NousResearch/Hermes-3-Llama-3.1-8B",
            messages: [
                {
                    role: "system",
                    content: `You are a senior interviewer at a top tech company.
Resume: ${resumeText}
Target role: ${jobRole}
Previously asked questions: ${askedQuestions.join(" | ")}
Generate one new interview question that has not been asked before. Respond ONLY in this exact JSON format:
{"question": "...", "difficulty": "Easy/Medium/Hard", "topic": "..."}`
                },
                { role: "user", content: "Generate next question." }
            ]
        })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Clean up in case model adds extra text
    const jsonMatch = content.match(/\{.*\}/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

export async function getAIFeedback(
    question: string,
    answer: string
): Promise<{ feedback: string; score: number }> {
    const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "NousResearch/Hermes-3-Llama-3.1-8B",
            messages: [
                {
                    role: "system",
                    content: `You are an expert interviewer evaluating a candidate's answer.
Question: ${question}
Candidate's Answer: ${answer}
Provide constructive feedback and a score out of 10. Respond ONLY in this exact JSON format:
{"feedback": "...", "score": 8}`
                },
                { role: "user", content: "Evaluate the answer." }
            ]
        })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{.*\}/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}