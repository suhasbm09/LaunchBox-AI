'use client';

import { motion } from 'framer-motion';
import { TypewriterEffect } from '@/components/ui/TypewriterEffect';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { useState, useEffect } from 'react';
import Image from 'next/image';

function useTypewriter(fullText: string, speed = 18, delay = 800, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let i = 0;
    let isMounted = true;
    function type() {
      if (!isMounted) return;
      if (i <= fullText.length) {
        setDisplayed(fullText.slice(0, i));
        i++;
        timeout = setTimeout(type, speed);
      } else {
        timeout = setTimeout(() => {
          setDisplayed('');
          i = 0;
          type();
        }, pause);
      }
    }
    const start = setTimeout(type, delay);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
      clearTimeout(start);
    };
  }, [fullText, speed, delay, pause]);
  return displayed;
}

export function HeroSection() {
  const subtitle = "Revolutionary AI-powered platform that transforms your development workflow with intelligent automation, real-time testing, and advanced simulation capabilities.";
  const typed = useTypewriter(subtitle, 18, 800, 1800);
  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center justify-center relative overflow-hidden gradient-mesh"
    >
      <div className="absolute inset-0 particle-bg opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_0.6fr_1fr] gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left pr-4"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 break-words"
            >
              <span className="gradient-text">Build. Test. Simulate.</span>
              <br />
              <span className="text-foreground">All in One AI</span>
              <br />
              <span className="text-foreground">DevOps Playground</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl sm:text-2xl text-accent font-semibold mb-8 max-w-2xl mx-auto lg:mx-0 typewriter-glow"
            >
              <span>
                {typed}
                <span className="typewriter-cursor">|</span>
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-secondary hover:bg-secondary/90 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-secondary/25 focus-visible:focus"
                onClick={() => window.dispatchEvent(new Event('open-login-modal'))}
              >
                Start Building
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-full font-semibold text-lg transition-all duration-300 focus-visible:focus"
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Center - Bolt.new Badge */}
          <div className="flex justify-center items-center">
            <Image src="/bolt-badge.png" alt="Powered by Bolt.new" width={128} height={128} className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full shadow-lg my-8" />
          </div>

          {/* Right Content - 3D Floating Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex justify-center lg:justify-end pl-4"
          >
            <div className="relative">
              {/* Floating geometric shapes */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-secondary/20 rounded-full blur-xl float-animation" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-accent/20 rounded-full blur-xl float-animation" />
              <div className="absolute top-1/2 -left-8 w-12 h-12 bg-secondary/30 rounded-full blur-lg float-animation" />
              
              {/* Main Form Card */}
              <motion.div
                initial={{ rotateY: -15, rotateX: 5 }}
                animate={{ rotateY: 0, rotateX: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                whileHover={{ 
                  rotateY: 5, 
                  rotateX: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="glass-morphism p-8 rounded-2xl shadow-2xl max-w-md w-full hover-lift"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <ProjectForm />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-secondary rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-secondary rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}