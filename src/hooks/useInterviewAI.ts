import { useState, useCallback } from "react";
import { askAI } from "@/services/ollama";

export type QuestionState = {
  question: string;
  topic?: string;
  difficulty?: string;
};

export type InterviewTurn = QuestionState & {
  answer: string;
  feedback?: string;
};

const SYSTEM_PROMPT = `You are a realistic technical interviewer.
Ask one interview question at a time.
Wait for the candidate response.
Ask follow-up questions based on previous answers.
Act like a human interviewer.
Do not give solutions immediately.
Maintain conversational flow.
Do not output JSON, just speak naturally to the candidate.`;

export function useInterviewAI(contextRole: string) {
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionState>({
    question: "Calibrating your personalized interview...",
    topic: "Introduction",
    difficulty: "Medium",
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");

  const generateNextQuestion = useCallback(
    async (history: InterviewTurn[], candidateAnswer?: string) => {
      setIsThinking(true);
      
      // Build the conversation prompt
      let prompt = `The interview is for the role of ${contextRole}.\n\n`;
      
      if (history.length === 0 && !candidateAnswer) {
        prompt += "Start the interview by warmly introducing yourself and asking the candidate to introduce themselves.";
      } else {
        prompt += "Here is the conversation history:\n";
        history.forEach((turn, i) => {
          prompt += `Interviewer: ${turn.question}\n`;
          prompt += `Candidate: ${turn.answer}\n`;
          if (turn.feedback) {
            prompt += `Interviewer: ${turn.feedback}\n`;
          }
        });
        
        if (candidateAnswer) {
          prompt += `Candidate's latest answer: ${candidateAnswer}\n\n`;
          prompt += "Evaluate their latest answer briefly, provide natural conversational feedback, and immediately follow up with the next technical question.";
        }
      }

      const aiResponse = await askAI(prompt, SYSTEM_PROMPT);
      setIsThinking(false);
      return aiResponse;
    },
    [contextRole]
  );

  const startInterview = useCallback(async () => {
    setIsEvaluating(true);
    const firstQ = await generateNextQuestion([]);
    setCurrentQuestion({
      question: firstQ,
      topic: "Introduction",
      difficulty: "Easy",
    });
    setAiFeedback("");
    setIsEvaluating(false);
    return firstQ;
  }, [generateNextQuestion]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!answer.trim()) return null;

      setIsEvaluating(true);
      const nextResponse = await generateNextQuestion(turns, answer);
      
      const newTurn: InterviewTurn = {
        ...currentQuestion,
        answer,
        feedback: "AI feedback embedded in next response",
      };
      
      setTurns((prev) => [...prev, newTurn]);
      setAiFeedback("");
      
      // The AI response now contains both feedback and the next question
      setCurrentQuestion({
        question: nextResponse,
        topic: "Technical",
        difficulty: "Adaptive",
      });
      
      setIsEvaluating(false);
      return nextResponse;
    },
    [currentQuestion, turns, generateNextQuestion]
  );

  return {
    turns,
    currentQuestion,
    isEvaluating,
    isThinking,
    aiFeedback,
    startInterview,
    submitAnswer,
  };
}
