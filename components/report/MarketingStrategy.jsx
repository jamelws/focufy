"use client";
import React, { useState } from 'react'
import Card from './Card';
import CardHeader from './CardHeader';
import CardBody from './CardBody';

const LoadingSpinner = () => <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

// --- Gemini API Helper ---
const callGeminiAPI = async (prompt) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // API Key is handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            return "No se pudo obtener una respuesta de la IA. Intenta de nuevo.";
        }
    } catch (error) {
        console.error("Gemini API call error:", error);
        return "Error al contactar la IA. Revisa la consola para más detalles.";
    }
};

const MarketingStrategy = ({ song }) => {  
    const [ideas, setIdeas] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateIdeas = async () => {
        if (!song?.title) {
            setIdeas("No hay datos de la canción para generar ideas.");
            return;
        }
        const keywords = song?.summary?.keywords?.join(", ") || "música";
        const affinity = song?.affinity?.topArtists?.map(a => a.name).join(" y ") || "artistas similares";
        
        const prompt = `Eres un experto en marketing musical. Para la canción "${song.title}" (género ${keywords}), que resuena con fans de ${affinity}, genera 3 ideas creativas y accionables para una campaña de marketing en redes sociales (TikTok, Instagram). Formatea como una lista con bullets.`;

        setIsLoading(true);
        const result = await callGeminiAPI(prompt);
        setIdeas(result);
        setIsLoading(false);
    };

    return (
        <Card>
            <CardHeader>Estrategia de Marketing con IA</CardHeader>
            <CardBody>{isLoading ? <LoadingSpinner /> : ideas ? <div className="text-sm whitespace-pre-wrap h-64 overflow-y-auto">{ideas}</div> : <button onClick={generateIdeas} className="w-full flex items-center justify-center px-4 py-2 font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors">✨ Generar Ideas de Marketing</button>}</CardBody>
        </Card>
    )  
}

export default MarketingStrategy