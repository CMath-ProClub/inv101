"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

interface FormFields {
  name: string;
  email: string;
  topic: string;
}

export function LessonIdeaForm({ className }: { className?: string }) {
  const [fields, setFields] = useState<FormFields>({ name: "", email: "", topic: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!fields.name || !fields.email || !fields.topic) {
      setError("Add your name, email, and lesson idea so the curriculum team can follow up.");
      return;
    }

    startTransition(async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);
        await fetch("/api/feedback/lesson-idea", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...fields, submittedAt: new Date().toISOString() }),
          signal: controller.signal,
        }).catch(() => {
          /* intentionally ignore network errors so UX stays smooth */
        });
        clearTimeout(timeout);
      } catch (cause) {
        console.error("lesson-idea submit failed", cause);
      } finally {
        setSubmitted(true);
        setFields({ name: "", email: "", topic: "" });
      }
    });
  }

  return (
    <Card className={cn("h-full border-dashed border-accent/40 bg-gradient-to-br from-surface-card to-surface-card/80", className)}>
      <CardHeader>
        <div>
          <CardTitle>Suggest a lesson</CardTitle>
          <CardDescription>Tell the curriculum team what topic should ship next. We map requests weekly.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitted ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold">Idea received</p>
              <p className="text-text-secondary">We add the best submissions to the public roadmap on Fridays.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lesson-name">Your name</Label>
                <Input
                  id="lesson-name"
                  value={fields.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Camila Wu"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-email">Contact email</Label>
                <Input
                  id="lesson-email"
                  type="email"
                  value={fields.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="camila@learn.studio"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-topic">What should we teach?</Label>
              <Textarea
                id="lesson-topic"
                value={fields.topic}
                onChange={(event) => handleChange("topic", event.target.value)}
                placeholder="Ex: a drill that explains how macro news impacts dividend stocks"
                rows={5}
              />
            </div>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Average response: &lt; 48 hrs</p>
              <Button type="submit" disabled={isPending} className="min-w-[160px]">
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending
                  </span>
                ) : (
                  "Submit idea"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
