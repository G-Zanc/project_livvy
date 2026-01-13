// AI Service stub - to be implemented with your chosen AI provider

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIService {
  sendMessage: (message: string, history: AIMessage[]) => Promise<string>;
}

// Placeholder implementation
export const aiService: AIService = {
  sendMessage: async (message: string, _history: AIMessage[]) => {
    // TODO: Implement with your AI provider (OpenAI, Claude, etc.)
    console.log("AI message received:", message);
    return "AI integration coming soon. Message received: " + message;
  },
};
