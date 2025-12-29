'use client';

import { useState, useRef, useEffect } from 'react';

export function Terminal() {
  const [output, setOutput] = useState<string[]>(['$ npm run dev', 'Starting development server...', '✓ Ready on http://localhost:3000']);
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setOutput((prev) => [...prev, `$ ${input}`, 'Command output...']);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
        <button className="text-gray-300 text-sm font-semibold border-b-2 border-blue-500 pb-1" type="button">
          Terminal
        </button>
        <button className="text-gray-500 text-sm hover:text-gray-300" type="button">
          Problems
        </button>
        <button className="text-gray-500 text-sm hover:text-gray-300" type="button">
          Output
        </button>
      </div>

      <div ref={outputRef} className="flex-1 p-4 font-mono text-sm text-green-400 overflow-auto">
        {output.map((line, i) => (
          <div key={`${line}-${i}`} className={line.startsWith('$') ? 'text-white' : ''}>
            {line}
          </div>
        ))}
      </div>

      <form className="p-4 border-t border-gray-700" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-green-400 font-mono outline-none"
            placeholder="Type a command..."
          />
        </div>
      </form>
    </div>
  );
}
