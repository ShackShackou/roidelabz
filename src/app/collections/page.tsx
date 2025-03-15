import React from 'react';
import Link from 'next/link';

export default function Collections() {
  const collections = [
    {
      id: 'abstract-dreams',
      name: 'Abstract Dreams',
      description: 'A collection of abstract digital art representing dreams and emotions.',
      items: 10,
      gradient: 'from-pink-400 to-red-500',
    },
    {
      id: 'digital-landscapes',
      name: 'Digital Landscapes',
      description: 'Breathtaking digital landscapes inspired by real and imaginary worlds.',
      items: 15,
      gradient: 'from-blue-400 to-green-500',
    },
    {
      id: 'crypto-punks',
      name: 'Crypto Punks',
      description: 'Unique pixel art characters with different attributes and traits.',
      items: 8,
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'future-cities',
      name: 'Future Cities',
      description: 'Futuristic cityscapes showcasing visions of tomorrow\'s urban environments.',
      items: 12,
      gradient: 'from-purple-400 to-indigo-500',
    },
    {
      id: 'cosmic-journeys',
      name: 'Cosmic Journeys',
      description: 'Space-themed digital art exploring the wonders of the universe.',
      items: 9,
      gradient: 'from-gray-700 to-gray-900',
    },
    {
      id: 'digital-fauna',
      name: 'Digital Fauna',
      description: 'Digitally created animals and creatures from real and fantasy worlds.',
      items: 14,
      gradient: 'from-green-400 to-teal-500',
    },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">NFT Collections</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections of unique digital art from talented creators around the world.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className={`h-64 bg-gradient-to-br ${collection.gradient}`}></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{collection.name}</h3>
                <p className="text-gray-600 mb-4">{collection.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{collection.items} items</span>
                  <Link href={`/collections/${collection.id}`} className="text-purple-600 font-medium hover:text-purple-800">
                    View Collection
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 