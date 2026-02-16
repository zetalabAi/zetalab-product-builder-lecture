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

  // 개발 모드: Gemini API 키 없이도 작동 (목 응답)
  if (process.env.NODE_ENV === "development" && !process.env.GEMINI_API_KEY) {
    console.log('[invokeLLM] Dev mode: Using mock response (no Gemini API key)');

    // 사용자 메시지 추출
    const userMessages = messages
      .filter(m => m.role === "user")
      .map(m => typeof m.content === "string" ? m.content : "")
      .join("\n");

    // 목 프롬프트 생성
    const mockPrompt = `# 고품질 프롬프트 (개발 모드 샘플)

당신은 "${userMessages}"에 대한 전문가입니다.

## 목표
사용자가 제공한 정보를 바탕으로 명확하고 구체적인 결과물을 생성하세요.

## 요구사항
1. 사용자의 의도를 정확히 파악하여 반영
2. 전문적이고 체계적인 구조
3. 실행 가능한 구체적인 지침
4. 예상되는 결과물의 형태와 품질 기준 명시

## 실행 방법
1. 제공된 정보를 분석
2. 핵심 요소 추출
3. 단계별 실행 계획 수립
4. 품질 검증 기준 적용

## 검증 기준
- 요구사항 충족도
- 실행 가능성
- 결과물의 완성도

**참고**: 이 프롬프트는 개발 모드에서 생성된 샘플입니다.
실제 Gemini API를 사용하려면 .env 파일에 GEMINI_API_KEY를 설정하세요.`;

    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: mockPrompt,
            tool_calls: undefined,
          },
          finish_reason: "stop",
        },
      ],
    };
  }

  const ai = getGenAI();

  // Use most stable model name
  const primaryModel = "gemini-pro";
  const fallbackModel = "gemini-pro";

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

  // Helper function to try generating with a specific model
  const tryGenerate = async (modelName: string, retries: number = 3) => {
    console.log(`[invokeLLM] Trying model: ${modelName}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const model = ai.getGenerativeModel({
          model: modelName,
          generationConfig,
          systemInstruction: systemInstruction || undefined,
        });

        const chat = model.startChat({
          history: geminiMessages.slice(0, -1),
        });

        const lastMessage = geminiMessages[geminiMessages.length - 1];
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const response = result.response;
        const text = response.text();

        console.log(`[invokeLLM] Success with ${modelName} on attempt ${attempt}`);

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
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        };
      } catch (error: any) {
        const is503 = error.message?.includes('503') || error.message?.includes('overloaded');
        const isLastAttempt = attempt === retries;

        if (is503 && !isLastAttempt) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`[invokeLLM] Model ${modelName} overloaded (attempt ${attempt}/${retries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Re-throw on last attempt or non-503 errors
        throw error;
      }
    }
  };

  // Try primary model first
  try {
    return await tryGenerate(primaryModel, 3);
  } catch (primaryError: any) {
    console.log(`[invokeLLM] Primary model ${primaryModel} failed, trying fallback ${fallbackModel}...`);
    console.error(`[invokeLLM] Primary error:`, primaryError.message);

    // Try fallback model
    try {
      return await tryGenerate(fallbackModel, 2);
    } catch (fallbackError: any) {
      console.error(`[invokeLLM] Fallback model ${fallbackModel} also failed:`, fallbackError.message);
      throw new Error(`Both models failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
    }
  }
}
