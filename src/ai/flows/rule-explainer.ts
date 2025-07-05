'use server';

/**
 * @fileOverview A game rule explainer AI agent.
 *
 * - explainRules - A function that explains the rules of a game.
 * - ExplainRulesInput - The input type for the explainRules function.
 * - ExplainRulesOutput - The return type for the explainRules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainRulesInputSchema = z.object({
  gameName: z.string().describe('The name of the game to explain the rules for.'),
});
export type ExplainRulesInput = z.infer<typeof ExplainRulesInputSchema>;

const ExplainRulesOutputSchema = z.object({
  explanation: z.string().describe('A concise explanation of the rules of the game.'),
});
export type ExplainRulesOutput = z.infer<typeof ExplainRulesOutputSchema>;

export async function explainRules(input: ExplainRulesInput): Promise<ExplainRulesOutput> {
  return explainRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainRulesPrompt',
  input: {schema: ExplainRulesInputSchema},
  output: {schema: ExplainRulesOutputSchema},
  prompt: `You are an expert game rule explainer. Your job is to explain the rules of a game in a concise and easy-to-understand manner for new players.

  Explain the rules for the following game:
  {{gameName}}`,
});

const explainRulesFlow = ai.defineFlow(
  {
    name: 'explainRulesFlow',
    inputSchema: ExplainRulesInputSchema,
    outputSchema: ExplainRulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
