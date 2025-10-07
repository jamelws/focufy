// Crea este nuevo archivo en tu carpeta de componentes, por ejemplo: /components/AIReport.js

import React from 'react';

// Un ícono simple para darle un toque visual
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-purple-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

export default function AIReport({ analysisText,t}) {
  if (!analysisText) {
    return null;
  }

  // Formatea el texto para una mejor visualización (convierte '*' en viñetas)
  const formattedText = analysisText
    .split('\n')
    .map((line, index) => {
      if (line.trim().startsWith('*')) {
        return <li key={index} className="mb-2">{line.trim().substring(1).trim()}</li>;
      }
      return <p key={index} className="mb-4">{line}</p>;
    });

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-zinc-800/50 dark:via-zinc-800/80 dark:to-zinc-800 rounded-xl shadow-md p-6 my-8 border border-purple-200 dark:border-zinc-700">
      <div className="flex items-center mb-4">
        <SparklesIcon />
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100" suppressHydrationWarning={true}>{t("formatedtext")}</h2>
      </div>
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        {formattedText}
      </div>
    </div>
  );
}