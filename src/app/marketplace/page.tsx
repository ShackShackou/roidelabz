import React from 'react';

export default function Marketplace() {
  const nfts = [
    {
      id: 'nft-1',
      name: 'Cosmic Wanderer',
      collection: 'Cosmic Journeys',
      price: '0.25 ETH',
      creator: 'DigitalDreamer',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      id: 'nft-2',
      name: 'Neon City',
      collection: 'Future Cities',
      price: '0.18 ETH',
      creator: 'NeoArtist',
      gradient: 'from-pink-500 to-red-600',
    },
    {
      id: 'nft-3',
      name: 'Abstract Emotion',
      collection: 'Abstract Dreams',
      price: '0.15 ETH',
      creator: 'EmotionalBytes',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'nft-4',
      name: 'Mountain Serenity',
      collection: 'Digital Landscapes',
      price: '0.22 ETH',
      creator: 'NatureTech',
      gradient: 'from-green-400 to-blue-500',
    },
    {
      id: 'nft-5',
      name: 'Pixel Punk #42',
      collection: 'Crypto Punks',
      price: '0.35 ETH',
      creator: 'PixelMaster',
      gradient: 'from-purple-400 to-indigo-500',
    },
    {
      id: 'nft-6',
      name: 'Digital Lion',
      collection: 'Digital Fauna',
      price: '0.28 ETH',
      creator: 'WildPixels',
      gradient: 'from-green-500 to-teal-600',
    },
    {
      id: 'nft-7',
      name: 'Galactic Portal',
      collection: 'Cosmic Journeys',
      price: '0.32 ETH',
      creator: 'StarGazer',
      gradient: 'from-gray-700 to-gray-900',
    },
    {
      id: 'nft-8',
      name: 'Melancholy',
      collection: 'Abstract Dreams',
      price: '0.19 ETH',
      creator: 'EmotionalBytes',
      gradient: 'from-blue-400 to-indigo-500',
    },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">NFT Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and trade unique digital assets on our secure NFT marketplace.
          </p>
        </header>

        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search NFTs..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>

          <div className="flex space-x-4">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              aria-label="Filter by collection"
            >
              <option value="">All Collections</option>
              <option value="abstract-dreams">Abstract Dreams</option>
              <option value="cosmic-journeys">Cosmic Journeys</option>
              <option value="crypto-punks">Crypto Punks</option>
              <option value="digital-fauna">Digital Fauna</option>
              <option value="digital-landscapes">Digital Landscapes</option>
              <option value="future-cities">Future Cities</option>
            </select>

            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              aria-label="Sort options"
            >
              <option value="recent">Recently Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="az">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <div key={nft.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className={`h-48 bg-gradient-to-br ${nft.gradient}`}></div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-1">{nft.name}</h3>
                <p className="text-sm text-gray-500 mb-3">Collection: {nft.collection}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Creator</p>
                    <p className="text-sm font-medium">{nft.creator}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-sm font-bold text-purple-600">{nft.price}</p>
                  </div>
                </div>
                <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 