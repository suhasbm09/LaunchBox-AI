'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Zap, 
  Shield, 
  Brain, 
  Rocket, 
  Code, 
  Database,
  Cloud,
  GitBranch,
  Cpu,
  Activity
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Development',
    description: 'Intelligent code generation, optimization, and debugging with advanced machine learning algorithms.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Testing',
    description: 'Automated testing pipelines with real-time feedback and comprehensive coverage analysis.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Rocket,
    title: 'One-Click Deployment',
    description: 'Seamless deployment to multiple cloud platforms with automated scaling and monitoring.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Code,
    title: 'Smart Code Editor',
    description: 'Intelligent IDE with context-aware suggestions, refactoring tools, and collaboration features.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Cloud,
    title: 'Cloud Integration',
    description: 'Native integration with major cloud providers and infrastructure as code.',
    color: 'from-sky-500 to-blue-500'
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Advanced Git workflows with intelligent merge conflict resolution and branch management.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Cpu,
    title: 'Performance Monitoring',
    description: 'Real-time performance metrics, bottleneck detection, and optimization recommendations.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Activity,
    title: 'Analytics Dashboard',
    description: 'Comprehensive insights into your development process with actionable analytics.',
    color: 'from-violet-500 to-purple-500'
  }
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section 
      id="features" 
      ref={ref}
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Powerful Features</span>
            <br />
            <span className="text-foreground">Built for Developers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to build, test, and deploy applications with the power of AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group"
            >
              <div className="glass-morphism p-6 rounded-xl hover-lift h-full">
                <div className="relative mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 group-hover:scale-110 transition-transform duration-300 group-hover:ring-4 group-hover:ring-accent/60 group-hover:ring-offset-2 group-hover:ring-offset-background`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-secondary transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="mt-4 flex items-center text-secondary group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm font-medium">Learn more</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-secondary/25 focus-visible:focus"
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}