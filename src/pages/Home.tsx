import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden h-full w-full object-cover sm:block"
        >
          <source src="/export%201.mp4" type="video/mp4" />
        </video>

        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover sm:hidden"
        >
          <source src="/phone%20size.mp4" type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-slate-900/30 mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-950/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex justify-center lg:justify-end">
            <div className="max-w-2xl text-center lg:mr-16">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 px-6 py-10 shadow-[0_30px_60px_rgba(15,23,42,0.55)] backdrop-blur-md sm:px-12">
                <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

                <div className="relative">
                  <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                    Creative Minds at Work
                  </span>

                  <h1 className="text-4xl font-chewy leading-tight text-white sm:text-5xl md:text-7xl lg:text-8xl">
                    <span className="block text-white">Brainstorming</span>
                    <span className="mt-2 block text-white">in progress</span>
                  </h1>

                  <p className="mt-8 text-lg font-knewave leading-relaxed text-slate-200 sm:text-xl md:text-2xl">
                    Where we brainstorm, to put you in the spotlight
                  </p>

                  <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                      to="/contact"
                      className="group inline-flex items-center rounded-full bg-white px-8 py-4 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-xl"
                    >
                      Get in Touch
                      <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                    </Link>

                    <Link
                      to="/portfolio"
                      className="group inline-flex items-center rounded-full border-2 border-white/30 px-8 py-4 font-semibold text-white transition-all duration-300 backdrop-blur-sm hover:border-white/60 hover:backdrop-blur-md"
                    >
                      Get a Glimpse
                    </Link>
                  </div>
                </div>
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