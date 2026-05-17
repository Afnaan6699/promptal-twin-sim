import { createServerFn } from "@tanstack/react-start";

// Simple helper to extract pseudo-skills from text
function extractKeywords(text: string): string[] {
  const commonTech = ["react", "node", "typescript", "javascript", "python", "java", "sql", "aws", "docker", "kubernetes", "go", "c++", "rust", "vue", "angular", "system design", "leadership", "agile", "communication", "figma", "design", "css", "html"];
  const words = text.toLowerCase().split(/[\s,.-]+/);
  const found = new Set<string>();
  
  words.forEach(w => {
    if (commonTech.includes(w)) found.add(w.charAt(0).toUpperCase() + w.slice(1));
  });
  
  if (found.size < 4) {
    found.add("Problem Solving");
    found.add("Team Collaboration");
    found.add("Agile Methodologies");
  }
  return Array.from(found);
}

export const analyzeProfile = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    try {
      if (!(data instanceof FormData)) {
        throw new Error("Invalid input data");
      }

      const file = data.get("file") as File;
      const jd = data.get("jd") as string;
      const role = data.get("role") as string;

      if (!file || !jd || !role) {
        throw new Error("Missing required fields");
      }

      // Simulate network/processing delay to make it feel like AI
      await new Promise(resolve => setTimeout(resolve, 2000));

      const keywords = extractKeywords(jd);
      const isSenior = role.toLowerCase().includes("senior") || role.toLowerCase().includes("lead") || role.toLowerCase().includes("principal");

      // Generate realistic mock data
      const hiringProb = Math.floor(Math.random() * 30) + 55; // 55-85
      
      const skills = keywords.slice(0, 6).map(k => ({
        name: k,
        level: Math.floor(Math.random() * 40) + 50 // 50-90
      }));

      // Fallback skills if empty
      if (skills.length === 0) {
        skills.push({ name: "General Programming", level: 85 });
      }

      return {
        hiringProbability: hiringProb,
        scores: [
          { l: "Technical", v: Math.floor(Math.random() * 20) + 70 },
          { l: "Communication", v: Math.floor(Math.random() * 20) + 65 },
          { l: "Confidence", v: Math.floor(Math.random() * 20) + 60 },
          { l: "Role Match", v: hiringProb + 5 }
        ],
        radarData: [
          Math.floor(Math.random() * 20) + 70, // Tech
          Math.floor(Math.random() * 20) + 65, // Comm
          isSenior ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 20) + 50, // Depth
          Math.floor(Math.random() * 20) + 60, // Speed
          Math.floor(Math.random() * 20) + 70, // Calm
          hiringProb + 2 // Fit
        ],
        skills,
        strengths: [
          `${skills[0]?.name || "Core tech"} mastery`,
          isSenior ? "System Architecture" : "Clean code practices",
          "Adaptability"
        ],
        techStack: skills.map(s => s.name).slice(0, 4),
        watchOuts: [
          "May need ramp-up on specific internal tools",
          isSenior ? "Delegation vs hands-on balance" : "Advanced system design",
          "Handling ambiguous requirements"
        ],
        missingForRole: keywords.slice(4, 7).length > 0 ? keywords.slice(4, 7) : ["Advanced CI/CD", "Performance optimization"]
      };

    } catch (err: any) {
      console.error("Mock Analysis Error:", err);
      throw new Error(err.message || "Failed to analyze profile");
    }
  }
);
