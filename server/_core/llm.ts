import { ENV } from "./env";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

// Initialize Google Generative AI
let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = ENV.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

// Convert messages to Gemini format
const convertToGeminiMessages = (messages: Message[]) => {
  const geminiMessages: any[] = [];
  let systemInstruction = "";

  for (const message of messages) {
    const contentParts = ensureArray(message.content).map(normalizeContentPart);
    const textContent = contentParts
      .filter(part => part.type === "text")
      .map(part => (part as TextContent).text)
      .join("\n");

    if (message.role === "system") {
      systemInstruction += textContent + "\n";
    } else if (message.role === "user") {
      geminiMessages.push({
        role: "user",
        parts: [{ text: textContent }],
      });
    } else if (message.role === "assistant") {
      geminiMessages.push({
        role: "model",
        parts: [{ text: textContent }],
      });
    }
  }

  return { geminiMessages, systemInstruction: systemInstruction.trim() };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const {
    messages,
    tools,
    maxTokens,
    max_tokens,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const ai = getGenAI();
  const modelName = "gemini-2.0-flash-exp";

  // Convert messages
  const { geminiMessages, systemInstruction } = convertToGeminiMessages(messages);

  // Configure generation
  const generationConfig: any = {
    maxOutputTokens: maxTokens || max_tokens || 8192,
  };

  // Handle JSON output
  const schema = outputSchema || output_schema;
  const format = responseFormat || response_format;

  if (schema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = schema.schema;
  } else if (format?.type === "json_object") {
    generationConfig.responseMimeType = "application/json";
  } else if (format?.type === "json_schema") {
    generationConfig.responseMimeType = "application/json";
    if (format.json_schema?.schema) {
      generationConfig.responseSchema = format.json_schema.schema;
    }
  }

  // Create model with configuration
  const model = ai.getGenerativeModel({
    model: modelName,
    generationConfig,
    systemInstruction: systemInstruction || undefined,
  });

  // Start chat session
  const chat = model.startChat({
    history: geminiMessages.slice(0, -1), // All but last message
  });

  // Send last message
  const lastMessage = geminiMessages[geminiMessages.length - 1];
  const result = await chat.sendMessage(lastMessage.parts[0].text);
  const response = result.response;
  const text = response.text();

  // Convert to OpenAI-compatible format
  return {
    id: `gemini-${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    model: modelName,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: text,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 0, // Gemini doesn't provide this directly
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
}
