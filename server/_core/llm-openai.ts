import { ENV } from "./env";
import OpenAI from "openai";

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
  outputSchema?: any;
  output_schema?: any;
  responseFormat?: any;
  response_format?: any;
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

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = ENV.openaiApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY in environment variables.');
    }

    openaiClient = new OpenAI({ apiKey });
    console.log('[OpenAI] Client initialized');
  }

  return openaiClient;
}

// Convert message content to OpenAI format
function convertContent(content: MessageContent | MessageContent[]): any {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(item => {
      if ('type' in item && item.type === 'text') {
        return { type: 'text', text: item.text };
      }
      if ('type' in item && item.type === 'image_url') {
        return { type: 'image_url', image_url: item.image_url };
      }
      return item;
    });
  }

  if ('type' in content && content.type === 'text') {
    return content.text;
  }

  return content;
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    maxTokens,
    max_tokens,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const openai = getOpenAI();

  // Convert messages to OpenAI format
  const openaiMessages = messages.map(msg => ({
    role: msg.role,
    content: convertContent(msg.content),
    ...(msg.name ? { name: msg.name } : {}),
    ...(msg.tool_call_id ? { tool_call_id: msg.tool_call_id } : {}),
  }));

  // Configure request
  const requestConfig: any = {
    model: 'gpt-3.5-turbo', // Default model, can be changed to gpt-4
    messages: openaiMessages,
    max_tokens: maxTokens || max_tokens || 4096,
  };

  // Add tools if provided
  if (tools && tools.length > 0) {
    requestConfig.tools = tools;
    const choice = toolChoice || tool_choice;
    if (choice) {
      requestConfig.tool_choice = choice;
    }
  }

  // Handle response format
  const schema = outputSchema || output_schema;
  const format = responseFormat || response_format;

  if (schema || format?.type === 'json_object' || format?.type === 'json_schema') {
    requestConfig.response_format = { type: 'json_object' };
  }

  try {
    console.log('[invokeLLM] Calling OpenAI API with model:', requestConfig.model);

    const response = await openai.chat.completions.create(requestConfig);

    console.log('[invokeLLM] OpenAI API call successful');

    // Convert OpenAI response to our format
    return {
      id: response.id,
      created: response.created,
      model: response.model,
      choices: response.choices.map(choice => ({
        index: choice.index,
        message: {
          role: choice.message.role as Role,
          content: choice.message.content || '',
          tool_calls: choice.message.tool_calls as any,
        },
        finish_reason: choice.finish_reason,
      })),
      usage: response.usage,
    };
  } catch (error: any) {
    console.error('[invokeLLM] OpenAI API error:', error.message);
    throw new Error(`OpenAI API call failed: ${error.message}`);
  }
}

export type { OutputSchema, ResponseFormat } from "./llm";
