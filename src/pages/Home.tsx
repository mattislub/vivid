import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/export 1.mp4" type="video/mp4" />
          {/* Fallback gradient if video doesn't load */}
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex justify-center lg:justify-end">
            <div className="max-w-2xl text-center lg:mr-16">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-chewy text-white mb-8 leading-tight">
            <span className="block text-white mb-2">Brainstorming</span>
            <span className="text-3xl md:text-5xl lg:text-6xl text-slate-300">in progress</span>
          </h1>
          
              <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed font-knewave">
            Where we brainstorm, to put you in the spotlight
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/contact"
                  className="group bg-white hover:bg-gray-100 text-slate-900 font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  Get in Touch
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
                </Link>
            
                <Link 
                  to="/portfolio"
                  className="group border-2 border-white/20 hover:border-white/40 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 backdrop-blur-sm hover:backdrop-blur-md"
                >
                  Get a Glimpse
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center space-y-2 text-white/70">
            <span className="text-sm">Scroll Down</span>
            <ArrowDown size={20} />
          </div>
        </div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
      <div className="absolute top-3/4 right-20 w-32 h-32 bg-blue-500/20 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-purple-500/20 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '2.5s'}}></div>
      
      {/* Additional floating space elements */}
      <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-yellow-400/30 rounded-full animate-ping" style={{animationDelay: '0.5s', animationDuration: '3s'}}></div>
      <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-pink-400/20 rounded-full animate-pulse" style={{animationDelay: '1.5s', animationDuration: '2s'}}></div>
      <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-green-400/30 rounded-full animate-bounce" style={{animationDelay: '2.5s', animationDuration: '3.5s'}}></div>
    </div>
  );
};

export default Home;