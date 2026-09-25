'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const commands = [
  { command: 'pwd', output: '/home/devopags', outputClassName: 'text-muted-foreground' },
  { command: 'git status', output: 'On branch main · app.js modified', outputClassName: 'text-primary' },
] as const;

export function AnimatedTerminal() {
  const [commandIndex, setCommandIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (reduceMotion || isFinished) return;

    const currentCommand = commands[commandIndex];
    const commandIsComplete = characterIndex >= currentCommand.command.length;

    const timeoutId = window.setTimeout(() => {
      if (!commandIsComplete) {
        setCharacterIndex((current) => current + 1);
        return;
      }

      if (commandIndex < commands.length - 1) {
        setCompletedCount(commandIndex + 1);
        setCommandIndex((current) => current + 1);
        setCharacterIndex(0);
        return;
      }

      setCompletedCount(commands.length);
      setIsFinished(true);
    }, commandIsComplete ? 700 : 85);

    return () => window.clearTimeout(timeoutId);
  }, [characterIndex, commandIndex, isFinished, reduceMotion]);

  useEffect(() => {
    if (!isFinished || reduceMotion) return;

    const intervalId = window.setInterval(() => {
      setDotCount((current) => current >= 3 ? 1 : current + 1);
    }, 450);

    return () => window.clearInterval(intervalId);
  }, [isFinished, reduceMotion]);

  if (reduceMotion) {
    return (
      <TerminalFrame>
        {commands.map((item) => (
          <div key={item.command}>
            <Prompt command={item.command} />
            <p className={item.outputClassName}>{item.output}</p>
          </div>
        ))}
        <Prompt command="..." />
      </TerminalFrame>
    );
  }

  if (isFinished) {
    return (
      <TerminalFrame>
        {commands.map((item) => (
          <div key={item.command}>
            <Prompt command={item.command} />
            <p className={item.outputClassName}>{item.output}</p>
          </div>
        ))}
        <Prompt command={'.'.repeat(dotCount)} cursor />
      </TerminalFrame>
    );
  }

  const currentCommand = commands[commandIndex];
  const commandIsComplete = characterIndex >= currentCommand.command.length;

  return (
    <TerminalFrame>
      {commands.slice(0, completedCount).map((item) => (
        <div key={item.command}>
          <Prompt command={item.command} />
          <p className={item.outputClassName}>{item.output}</p>
        </div>
      ))}

      <Prompt
        command={currentCommand.command.slice(0, characterIndex)}
        cursor={!commandIsComplete}
      />
      {commandIsComplete && (
        <>
          <p className={currentCommand.outputClassName}>{currentCommand.output}</p>
          <Prompt command="..." />
        </>
      )}
    </TerminalFrame>
  );
}

function TerminalFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-[8.75rem] border border-border bg-muted/30 p-3 font-mono text-[11px] leading-5 text-foreground"
      role="img"
      aria-label="Terminal minh họa lần lượt chạy lệnh pwd và git status"
    >
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

function Prompt({ command = '', cursor = false }: { command?: string; cursor?: boolean }) {
  return (
    <p>
      <span className="font-semibold text-primary">devopags@lab</span>
      <span className="font-semibold text-muted-foreground">:~</span>
      <span className="text-ink">$ {command}</span>
      {cursor && <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-1 animate-pulse bg-primary" />}
    </p>
  );
}
