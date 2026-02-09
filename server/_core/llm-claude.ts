import { ENV } from "./env";
import Anthropic from "@anthropic-ai/sdk";

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

// Initialize Anthropic client
let anthropic: Anthropic | null = null;

const getAnthropic = () => {
  if (!anthropic) {
    const apiKey = ENV.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
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

// Convert messages to Claude format
const convertToClaudeMessages = (messages: Message[]) => {
  const claudeMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
  let systemMessage = "";

  for (const message of messages) {
    const contentParts = ensureArray(message.content).map(normalizeContentPart);
    const textContent = contentParts
      .filter(part => part.type === "text")
      .map(part => (part as TextContent).text)
      .join("\n");

    if (message.role === "system") {
      systemMessage += textContent + "\n";
    } else if (message.role === "user") {
      claudeMessages.push({
        role: "user",
        content: textContent,
      });
    } else if (message.role === "assistant") {
      claudeMessages.push({
        role: "assistant",
        content: textContent,
      });
    }
  }

  return { claudeMessages, systemMessage: systemMessage.trim() };
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

  // 개발 모드: Anthropic API 키 없이도 작동 (목 응답)
  if (process.env.NODE_ENV === "development" && !process.env.ANTHROPIC_API_KEY) {
    console.log('[invokeLLM] Dev mode: Using mock response (no Anthropic API key)');

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
실제 Claude API를 사용하려면 .env 파일에 ANTHROPIC_API_KEY를 설정하세요.`;

    return {
      id: `mock-${Date.now()}`,
      created: Math.floor(Date.now() / 1000),
      model: "claude-3-haiku-20240307",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: mockPrompt,
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
  }

  const client = getAnthropic();
  console.log('[invokeLLM] Calling Claude API');

  // Convert messages
  const { claudeMessages, systemMessage } = convertToClaudeMessages(messages);

  // Handle JSON output
  const schema = outputSchema || output_schema;
  const format = responseFormat || response_format;

  // Prepare request params
  const requestParams: any = {
    model: "claude-3-haiku-20240307",
    max_tokens: Math.min(maxTokens || max_tokens || 4096, 4096), // Haiku max: 4096
    messages: claudeMessages,
  };

  if (systemMessage) {
    requestParams.system = systemMessage;
  }

  // Claude doesn't support JSON schema directly, but we can use system prompt
  if (schema || format?.type === "json_object" || format?.type === "json_schema") {
    const jsonInstruction = "\n\nIMPORTANT: You must respond with valid JSON only, no additional text.";
    requestParams.system = (requestParams.system || "") + jsonInstruction;
  }

  try {
    const response = await client.messages.create(requestParams);

    // Extract text content from Claude response
    let textContent = "";
    for (const block of response.content) {
      if (block.type === "text") {
        textContent += block.text;
      }
    }

    console.log('[invokeLLM] Claude API success');

    return {
      id: response.id,
      created: Math.floor(Date.now() / 1000),
      model: response.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: textContent,
          },
          finish_reason: response.stop_reason || "stop",
        },
      ],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  } catch (error: any) {
    console.error('[invokeLLM] Claude API error:', error.message);
    throw new Error(`Claude API error: ${error.message}`);
  }
}
