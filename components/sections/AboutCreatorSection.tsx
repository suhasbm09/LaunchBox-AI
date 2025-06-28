'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Github, Twitter, Linkedin, Mail, Globe, Star, Instagram, ExternalLink } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import Image from 'next/image';

const socialLinks = [
  {
    icon: Github,
    href: 'https://github.com/suhasbm09',
    label: 'GitHub',
    color: 'hover:text-gray-400'
  },
  {
    icon: Twitter,
    href: 'https://x.com/SuhasB22433',
    label: 'X (Twitter)',
    color: 'hover:text-blue-400'
  },
  {
    icon: Globe,
    href: 'https://portfolio-suhasbm.vercel.app',
    label: 'Portfolio',
    color: 'hover:text-purple-400'
  },
  {
    icon: Linkedin,
    href: 'https://linkedin.com/in/suhas-b-m-88a179244',
    label: 'LinkedIn',
    color: 'hover:text-blue-600'
  },
  {
    icon: Mail,
    href: 'mailto:suhasbm2004@gmail.com',
    label: 'Email',
    color: 'hover:text-green-400'
  }
];

const modalLinks = [
  {
    icon: Instagram,
    href: 'https://instagram.com/___suhas__bm_',
    label: 'Instagram',
    color: 'hover:text-pink-400',
    description: 'Follow me on Instagram'
  },
  {
    icon: Globe,
    href: 'https://portfolio-suhasbm.vercel.app',
    label: 'Portfolio',
    color: 'hover:text-purple-400',
    description: 'Check out my portfolio'
  },
  {
    icon: Twitter,
    href: 'https://x.com/SuhasB22433',
    label: 'X (Twitter)',
    color: 'hover:text-blue-400',
    description: 'Connect with me on X'
  }
];

const achievements = [
  { number: '50K+', label: 'Developers' },
  { number: '1M+', label: 'Projects Built' },
  { number: '99.9%', label: 'Uptime' },
  { number: '24/7', label: 'Support' }
];

export function AboutCreatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section 
      id="about" 
      ref={ref}
      className="py-24 relative overflow-hidden"
    >
      <div className="absolute inset-0 particle-bg opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-foreground">Meet the</span>
                <br />
                <span className="gradient-text">Creator of</span>
                <br />
                <span className="text-foreground">LaunchBox.AI</span>
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Hey, I&apos;m <strong>Suhas B M</strong> — a final-year Computer Science Engineering student with a deep passion for Solana blockchain, Generative AI, and building impactful developer tools.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                LaunchBox.AI was built from scratch for the World&apos;s Largest Hackathon using Bolt.new. My goal? To reimagine how developers code, containerize, and deploy — all powered by AI and simplified into a single playground.
              </p>
            </motion.div>

            {/* Achievements
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                    {achievement.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {achievement.label}
                  </div>
                </motion.div>
              ))}
            </motion.div> */}

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 glass-morphism rounded-full text-muted-foreground transition-all duration-300 ${link.color} hover:scale-110 focus-visible:focus group`}
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary/20 rounded-full blur-2xl float-animation" />
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-accent/20 rounded-full blur-2xl float-animation" />
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-secondary/30 rounded-full blur-xl float-animation" />

              <motion.div
                initial={{ rotateY: 15, rotateX: -5 }}
                animate={isInView ? { rotateY: 0, rotateX: 0 } : {}}
                transition={{ delay: 0.6, duration: 1 }}
                whileHover={{ 
                  rotateY: -5, 
                  rotateX: 5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="glass-morphism p-8 rounded-2xl shadow-2xl max-w-sm w-full hover-lift"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-secondary to-accent p-1 flex items-center justify-center">
                    <Image src="/profile.jpg" alt="Powered by Bolt.new" width={96} height={96} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-accent rounded-full p-2">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Suhas B M
                  </h3>
                  <p className="text-secondary font-medium mb-4">
                    Final-Year CSE Student • Solana & AI Enthusiast
                  </p>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    &quot;Builder of LaunchBox.AI. Passionate about making fullstack DevOps simpler, smarter, and more accessible — all through AI-native tools.&quot;
                  </p>
                  
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white rounded-full font-semibold transition-all duration-300 shadow-lg focus-visible:focus"
                      >
                        Connect With Me
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold gradient-text">
                          Let&apos;s Connect!
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-6">
                        {modalLinks.map((link, index) => (
                          <motion.a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center justify-between p-4 rounded-lg border border-border hover:border-secondary/50 transition-all duration-300 ${link.color} group`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors duration-300`}>
                                <link.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">
                                  {link.label}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {link.description}
                                </div>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors duration-300" />
                          </motion.a>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
