'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Rocket, Mail, Phone, MapPin } from 'lucide-react';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import Image from 'next/image';
import { FaGithub, FaLinkedin, FaTwitter, FaDiscord, FaInstagram } from 'react-icons/fa';

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Documentation', href: '#docs' },
    { name: 'API Reference', href: '#api' },
  ],
  company: [
    { name: 'About', href: '#about' },
    { name: 'Blog', href: '#blog' },
    { name: 'Careers', href: '#careers' },
    { name: 'Contact', href: '#contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'Security', href: '#security' },
  ],
};

const socialMedia = [
  { name: 'GitHub', href: 'https://github.com/suhasbm09', icon: <FaGithub className="w-5 h-5" /> },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/suhas-b-m-88a179244', icon: <FaLinkedin className="w-5 h-5" /> },
  { name: 'Twitter', href: 'https://x.com/SuhasB22433', icon: <FaTwitter className="w-5 h-5" /> },
  { name: 'Discord', href: 'https://discord.gg/W2EyUVUk', icon: <FaDiscord className="w-5 h-5" /> },
  { name: 'Instagram', href: 'https://instagram.com/___suhas__bm_', icon: <FaInstagram className="w-5 h-5" /> },
];

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <footer 
      id="contact"
      ref={ref}
      className="bg-primary border-t border-white/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative">
                  <Rocket className="w-8 h-8 text-secondary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
                </div>
                <span className="text-xl font-bold gradient-text">
                  LaunchBox.AI
                </span>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Revolutionizing development with AI-powered tools for building, testing, and deploying applications.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-secondary" />
                  <span>suhasbm2004@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span>+91 9036751497</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span>Mysuru, Karnataka, India</span>
                </div>
              </div>
            </motion.div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              >
                <h3 className="text-foreground font-semibold mb-6 capitalize">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-secondary transition-colors duration-300 focus-visible:focus"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Newsletter Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-foreground font-semibold mb-6">
                Stay Updated
              </h3>
              <p className="text-muted-foreground mb-6">
                Get the latest updates on new features and platform improvements.
              </p>
              <NewsletterForm />
            </motion.div>
          </div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="py-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 w-full">
            <div className="text-muted-foreground text-sm flex items-center space-x-2">
              <span>© 2025 LaunchBox.AI. All rights reserved. | Built by Suhas B M for the World&apos;s Largest Hackathon.</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-muted-foreground text-sm">Powered by</span>
              <Image src="/bolt-badge.png" alt="Powered by Bolt.new" width={32} height={32} className="w-8 h-8 rounded-full" />
              <span className="text-muted-foreground text-sm font-bold">Bolt.new</span>
            </div>
            <div className="flex items-center space-x-6">
              {socialMedia.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-muted-foreground hover:text-secondary transition-colors duration-300 focus-visible:focus"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}