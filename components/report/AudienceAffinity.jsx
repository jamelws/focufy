import React from 'react'
import Card from './Card';
import CardHeader from './CardHeader';
import CardBody from './CardBody';

const AudienceAffinity = ({ affinity }) => {
  return (
    <Card>
        <CardHeader>Afinidad Musical (Tu Arma Secreta)</CardHeader>
        <CardBody>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
            Artistas que tu nicho de mercado escucha. ¡Úsalos en tus campañas de marketing!
            </p>
            <div className="space-y-4">
                {affinity.topArtists.map(artist => (
                    <div key={artist.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors">
                        <img src={artist.imageUrl} alt={artist.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=?'; }} />
                        <div>
                            <p className="font-semibold text-zinc-800 dark:text-white">{artist.name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{artist.genre}</p>
                        </div>
                    </div>
                ))}
            </div>
        </CardBody>
    </Card>
  )
}

export default AudienceAffinity