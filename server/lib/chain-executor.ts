/**
 * ZetaLab - Chain Execution Engine
 * 프롬프트 체인 실행 엔진
 */

import {
  getChainExecution,
  getChainById,
  updateChainExecution,
} from '../db';

// Model-specific imports
import { invokeLLM as invokeClaudeLLM } from '../_core/llm-claude';
import { invokeLLM as invokeOpenAILLM } from '../_core/llm-openai';
import { invokeLLM as invokeGeminiLLM } from '../_core/llm';

// ============================================================================
// Types
// ============================================================================

interface StepResult {
  stepId: string;
  stepName: string;
  stepOrder: number;
  input: string;
  output: string;
  modelUsed: string;
  duration: number;
  cost: number;
  success: boolean;
  error?: string;
  executedAt: Date;
}

// ============================================================================
// Constants
// ============================================================================

// Model pricing (per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-opus-4-6': { input: 15.0, output: 75.0 },
  'claude-haiku-4-5': { input: 0.8, output: 4.0 },
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gemini-2.0-flash': { input: 0.075, output: 0.3 },
  'gemini-pro': { input: 0.5, output: 1.5 },
};

// Model mappings (user-friendly name -> actual API model ID)
const MODEL_MAPPING: Record<string, string> = {
  'claude-sonnet-4-5': 'claude-sonnet-4-5-20250929',
  'claude-opus-4-6': 'claude-opus-4-6-20250514',
  'claude-haiku-4-5': 'claude-haiku-4-5-20250124',
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gemini-2.0-flash': 'gemini-2.0-flash-exp',
  'gemini-pro': 'gemini-pro',
};

// ============================================================================
// Variable Substitution
// ============================================================================

/**
 * 프롬프트 템플릿의 변수를 치환
 * @param template - 변수를 포함한 템플릿 (예: "{{initial_input}}에 대해 분석하세요")
 * @param variables - 변수 값 맵 (예: { initial_input: "AI 트렌드", previous_output: "..." })
 * @returns 변수가 치환된 프롬프트
 */
function substituteVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    // Replace all occurrences of {{key}}
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value || '');
  }

  return result;
}

// ============================================================================
// Model Execution
// ============================================================================

/**
 * 비용 계산
 */
function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) {
    console.warn(`[calculateCost] Unknown model: ${modelId}, defaulting to 0 cost`);
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * AI 모델 호출
 */
async function invokeModel(
  modelId: string,
  prompt: string
): Promise<{ output: string; tokens: { input: number; output: number } }> {
  console.log(`[invokeModel] Calling model: ${modelId}`);

  // Determine which LLM client to use
  let invokeLLM: typeof invokeClaudeLLM;
  const actualModelId = MODEL_MAPPING[modelId] || modelId;

  if (modelId.startsWith('claude-')) {
    invokeLLM = invokeClaudeLLM;
  } else if (modelId.startsWith('gpt-')) {
    invokeLLM = invokeOpenAILLM;
  } else if (modelId.startsWith('gemini-')) {
    invokeLLM = invokeGeminiLLM;
  } else {
    throw new Error(`Unsupported model: ${modelId}`);
  }

  // Call LLM
  const result = await invokeLLM({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    maxTokens: 8000,
  });

  const output = result.choices[0]?.message?.content;
  if (!output || typeof output !== 'string') {
    throw new Error('Invalid response from model');
  }

  const tokens = {
    input: result.usage?.prompt_tokens || 0,
    output: result.usage?.completion_tokens || 0,
  };

  console.log(`[invokeModel] Success:`, {
    modelId,
    outputLength: output.length,
    tokens,
  });

  return { output, tokens };
}

// ============================================================================
// Chain Execution
// ============================================================================

/**
 * 체인 실행 (백그라운드)
 * @param executionId - 실행 ID
 */
export async function executeChainBackground(executionId: string): Promise<void> {
  console.log(`[executeChainBackground] Starting execution: ${executionId}`);

  try {
    // 1. Load execution
    const execution = await getChainExecution(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    // 2. Load chain
    const chain = await getChainById(execution.chainId);
    if (!chain) {
      throw new Error('Chain not found');
    }

    console.log(`[executeChainBackground] Loaded chain:`, {
      chainId: chain.id,
      stepCount: chain.steps.length,
      initialInput: execution.initialInput?.substring(0, 50),
    });

    // 3. Execute steps sequentially
    const stepResults: StepResult[] = [];
    let previousOutput = '';
    let totalCost = 0;
    const startTime = Date.now();

    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];
      const stepStartTime = Date.now();

      console.log(`[executeChainBackground] Executing step ${i + 1}/${chain.steps.length}:`, {
        stepId: step.id,
        stepName: step.name,
        modelId: step.modelId,
      });

      // Update execution status
      await updateChainExecution(executionId, {
        status: 'running',
        currentStepIndex: i,
        stepResults,
      });

      try {
        // Substitute variables
        const variables: Record<string, string> = {
          initial_input: execution.initialInput || '',
          previous_output: previousOutput,
        };

        const promptWithVariables = substituteVariables(
          step.promptTemplate,
          variables
        );

        // Execute model
        const { output, tokens } = await invokeModel(step.modelId, promptWithVariables);

        // Calculate cost
        const stepCost = calculateCost(step.modelId, tokens.input, tokens.output);
        totalCost += stepCost;

        // Store result
        const stepResult: StepResult = {
          stepId: step.id,
          stepName: step.name,
          stepOrder: step.order,
          input: promptWithVariables,
          output,
          modelUsed: step.modelId,
          duration: Date.now() - stepStartTime,
          cost: stepCost,
          success: true,
          executedAt: new Date(),
        };

        stepResults.push(stepResult);

        // Update previous output
        if (step.usePreviousOutput) {
          previousOutput = output;
        }

        console.log(`[executeChainBackground] Step ${i + 1} completed:`, {
          stepId: step.id,
          outputLength: output.length,
          duration: stepResult.duration,
          cost: stepCost,
        });
      } catch (error: any) {
        console.error(`[executeChainBackground] Step ${i + 1} failed:`, error);

        // Record failed step
        const stepResult: StepResult = {
          stepId: step.id,
          stepName: step.name,
          stepOrder: step.order,
          input: step.promptTemplate,
          output: '',
          modelUsed: step.modelId,
          duration: Date.now() - stepStartTime,
          cost: 0,
          success: false,
          error: error.message || 'Unknown error',
          executedAt: new Date(),
        };

        stepResults.push(stepResult);

        // Mark execution as failed
        await updateChainExecution(executionId, {
          status: 'failed',
          currentStepIndex: i,
          stepResults,
          completedAt: new Date(),
          totalCost,
          totalDuration: Date.now() - startTime,
          error: `Step ${i + 1} (${step.name}) failed: ${error.message}`,
        });

        return; // Stop execution
      }
    }

    // 4. Mark execution as completed
    await updateChainExecution(executionId, {
      status: 'completed',
      currentStepIndex: chain.steps.length - 1,
      stepResults,
      completedAt: new Date(),
      totalCost,
      totalDuration: Date.now() - startTime,
    });

    console.log(`[executeChainBackground] Execution completed:`, {
      executionId,
      stepCount: chain.steps.length,
      totalCost,
      totalDuration: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error(`[executeChainBackground] Execution failed:`, error);

    // Mark execution as failed
    try {
      await updateChainExecution(executionId, {
        status: 'failed',
        completedAt: new Date(),
        error: error.message || 'Unknown error',
      });
    } catch (updateError) {
      console.error(
        `[executeChainBackground] Failed to update execution status:`,
        updateError
      );
    }
  }
}

/**
 * 체인 실행 (동기) - 테스트용
 */
export async function executeChainSync(executionId: string): Promise<void> {
  return executeChainBackground(executionId);
}

// ============================================================================
// Exports
// ============================================================================

export { substituteVariables, invokeModel, calculateCost };
