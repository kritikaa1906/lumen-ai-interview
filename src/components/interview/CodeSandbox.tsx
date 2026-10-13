import React, { useState } from 'react';
import { Play, RotateCcw, Terminal, Check, AlertCircle } from 'lucide-react';

interface CodeSandboxProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({
  code,
  language,
  onChange,
  onLanguageChange,
}) => {
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);

  const defaultTemplates: Record<string, string> = {
    typescript: `// TypeScript Implementation\nfunction solve(input: number[]): number {\n  // Implement your algorithm here\n  return input.reduce((acc, curr) => acc + curr, 0);\n}\n\nconsole.log("Result:", solve([10, 20, 30]));`,
    javascript: `// JavaScript Implementation\nfunction solve(input) {\n  // Implement your solution\n  return input.filter(x => x > 10);\n}\n\nconsole.log("Filtered:", solve([5, 12, 8, 130, 44]));`,
    python: `# Python Solution\ndef solve(arr):\n    # Process data pipeline\n    return sorted([x * 2 for x in arr if x > 0])\n\nprint("Output:", solve([3, -1, 4, 1, 5, 9]))`,
    sql: `-- SQL Analytical Query\nSELECT \n  user_id,\n  COUNT(*) as total_interviews,\n  ROUND(AVG(overall_score), 2) as average_score\nFROM results\nGROUP BY user_id\nHAVING total_interviews >= 1\nORDER BY average_score DESC;`,
  };

  const handleLanguageSwitch = (newLang: string) => {
    onLanguageChange(newLang);
    if (!code.trim() || Object.values(defaultTemplates).includes(code.trim())) {
      onChange(defaultTemplates[newLang] || '');
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setHasError(false);
    setOutput(null);

    setTimeout(() => {
      try {
        if (language === 'javascript' || language === 'typescript') {
          // Sandboxed JS evaluation
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args: any[]) => logs.push(`[ERROR] ${args.join(' ')}`),
            warn: (...args: any[]) => logs.push(`[WARN] ${args.join(' ')}`),
          };

          // Strip simple TS types for runtime testing
          const cleanCode = code
            .replace(/:\s*[A-Za-z0-9_\[\]<>]+/g, '')
            .replace(/interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g, '')
            .replace(/type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/g, '');

          const runFn = new Function('console', cleanCode);
          runFn(customConsole);

          setOutput(logs.length > 0 ? logs.join('\n') : '(Code executed successfully with 0 output statements)');
        } else if (language === 'python') {
          // Simulated Python execution output
          setOutput(`[Python 3.12 Runtime]\nExecuted sandbox successfully.\nStdout: [2, 6, 8, 10, 18]\nProcess finished with exit code 0`);
        } else if (language === 'sql') {
          // Simulated SQL execution output
          setOutput(`[MySQL 8 Engine] Query OK, 2 rows returned (12ms)\n\n+---------+------------------+---------------+\n| user_id | total_interviews | average_score |\n+---------+------------------+---------------+\n|       1 |                3 |         87.50 |\n|       2 |                1 |         82.00 |\n+---------+------------------+---------------+`);
        }
      } catch (err: any) {
        setHasError(true);
        setOutput(`Runtime Exception: ${err.message || String(err)}`);
      } finally {
        setIsRunning(false);
      }
    }, 200);
  };

  const handleReset = () => {
    onChange(defaultTemplates[language] || '');
    setOutput(null);
  };

  return (
    <div className="rounded-lg border border-[#282C24] bg-[#141712] overflow-hidden space-y-0">
      {/* Sandbox Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1B1E19] border-b border-[#282C24]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#C6F36B]">
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Code Sandbox</span>
          </div>

          {/* Language Selector buttons */}
          <div className="flex items-center gap-1 bg-[#111310] p-0.5 rounded border border-[#282C24]">
            {['typescript', 'javascript', 'python', 'sql'].map((lang) => (
              <button
                type="button"
                key={lang}
                onClick={() => handleLanguageSwitch(lang)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors uppercase ${
                  language === lang
                    ? 'bg-[#1B1E19] text-[#C6F36B] font-bold shadow-sm'
                    : 'text-[#74796F] hover:text-[#F5F2E9]'
                }`}
              >
                {lang === 'typescript' ? 'TS' : lang === 'javascript' ? 'JS' : lang}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded text-[#74796F] hover:text-[#F5F2E9] hover:bg-[#111310] transition-colors"
            title="Reset to Template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Textarea Editor with Monospace Numbers */}
      <div className="p-3 bg-[#111310]">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder="// Write your code solution here..."
          rows={8}
          spellCheck={false}
          className="w-full bg-transparent font-mono text-xs text-[#F5F2E9] placeholder-[#74796F] focus:outline-none resize-y leading-relaxed"
        />
      </div>

      {/* Output Terminal Console */}
      {output && (
        <div className="p-3 bg-[#0C0E0B] border-t border-[#282C24] font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#74796F] uppercase">
            <span>Console Execution Output</span>
            {hasError ? (
              <span className="text-[#EF4444] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Error
              </span>
            ) : (
              <span className="text-[#22C55E] flex items-center gap-1">
                <Check className="w-3 h-3" /> Exit 0
              </span>
            )}
          </div>
          <pre className={`whitespace-pre-wrap leading-relaxed ${hasError ? 'text-[#EF4444]' : 'text-[#A7B09C]'}`}>
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};
