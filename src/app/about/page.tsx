import React from 'react';

export default function About() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">About ROIS DE LA BZ</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our story, mission, and the team behind the platform.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              ROIS DE LA BZ was founded in 2023 with a simple mission: to create a platform that connects talented digital artists with collectors who appreciate unique, creative works in the form of NFTs.
            </p>
            <p className="text-gray-700 mb-4">
              What started as a small community of digital art enthusiasts has grown into a vibrant marketplace featuring thousands of unique digital assets from creators all around the world.
            </p>
            <p className="text-gray-700">
              We believe in the power of blockchain technology to revolutionize how digital art is owned, traded, and valued, ensuring artists receive fair compensation for their work.
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl h-64 md:h-auto"></div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Empower Artists</h3>
              <p className="text-gray-600">
                We're committed to empowering digital artists by providing a platform where they can showcase and monetize their creations with full ownership and royalty rights.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Build Trust</h3>
              <p className="text-gray-600">
                We aim to create a transparent, secure marketplace where collectors can discover authentic digital assets with verified provenance and ownership history.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Foster Community</h3>
              <p className="text-gray-600">
                We're dedicated to nurturing a vibrant community where artists and collectors can connect, collaborate, and celebrate digital creativity together.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mb-4 mx-auto"></div>
              <h3 className="text-lg font-bold">Alex Johnson</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mb-4 mx-auto"></div>
              <h3 className="text-lg font-bold">Samantha Lee</h3>
              <p className="text-gray-600">Creative Director</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mb-4 mx-auto"></div>
              <h3 className="text-lg font-bold">Michael Rivera</h3>
              <p className="text-gray-600">Lead Developer</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mb-4 mx-auto"></div>
              <h3 className="text-lg font-bold">Emma Chen</h3>
              <p className="text-gray-600">Community Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 