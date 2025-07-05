"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { explainRules, type ExplainRulesOutput } from '@/ai/flows/rule-explainer';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function RuleExplainer({ gameName }: { gameName: string }) {
  const [explanation, setExplanation] = useState<ExplainRulesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplainRules = async () => {
    setIsLoading(true);
    setError(null);
    setExplanation(null);
    try {
      const result = await explainRules({ gameName });
      setExplanation(result);
    } catch (e) {
      setError('Failed to get explanation. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8 bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-accent flex items-center">
            <Wand2 className="mr-2" />
            AI Rule Explainer
        </CardTitle>
        <CardDescription>New to {gameName}? Get a quick rundown of the rules from our AI assistant.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExplainRules} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Explaining...
            </>
          ) : (
            `Explain ${gameName} Rules`
          )}
        </Button>

        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {explanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="whitespace-pre-wrap text-sm text-foreground">{explanation.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
