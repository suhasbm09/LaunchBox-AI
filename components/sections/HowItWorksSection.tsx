'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, UserPlus, LayoutDashboard, FilePlus2, Code2, Bot, FileText, Cloud } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="w-7 h-7 text-secondary" />,
    title: 'Login or Signup',
    desc: 'Create your account to get started.'
  },
  {
    icon: <LayoutDashboard className="w-7 h-7 text-accent" />,
    title: 'Dashboard',
    desc: 'Access your dashboard and manage your projects.'
  },
  {
    icon: <FilePlus2 className="w-7 h-7 text-indigo-400" />,
    title: 'Create Project',
    desc: 'Enter your project details and submit.'
  },
  {
    icon: <Code2 className="w-7 h-7 text-blue-400" />,
    title: 'Code',
    desc: 'Build your app. Our AI will handle DevOps.'
  },
  {
    icon: <Bot className="w-7 h-7 text-pink-400" />,
    title: 'AI DevOps',
    desc: 'AI generates Dockerfile & Jenkinsfile for you.'
  },
  {
    icon: <FileText className="w-7 h-7 text-green-400" />,
    title: 'Guide',
    desc: 'Get a step-by-step deployment guide.'
  },
  {
    icon: <Cloud className="w-7 h-7 text-yellow-400" />,
    title: 'Deploy (Coming Soon)',
    desc: 'Deploy to AWS, Azure, GCP, Vercel, Netlify, and more.'
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden bg-[#10132a]">
      {/* Removed mesh/particle overlays for a solid background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-bold mb-12 text-center gradient-text drop-shadow-lg"
        >
          How it Works
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Steps as cards */}
          <ol className="space-y-8">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-start gap-5 bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg hover:scale-[1.025] transition-transform duration-300"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent shadow-md">
                  {step.icon}
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground mb-1">{step.title}</div>
                  <div className="text-muted-foreground text-sm">{step.desc}</div>
                </div>
              </motion.li>
            ))}
          </ol>
          {/* Visual/Deploy Card */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-morphism p-10 rounded-2xl shadow-2xl max-w-md w-full hover-lift border border-white/10"
            >
              <div className="text-center mb-4">
                <span className="text-2xl font-bold gradient-text flex items-center justify-center gap-2">
                  <Rocket className="w-7 h-7 text-accent animate-bounce" />
                  Deploy (Coming Soon)
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-4 text-center">
                Choose your cloud platform:
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  <Button variant="outline" disabled>AWS</Button>
                  <Button variant="outline" disabled>Azure</Button>
                  <Button variant="outline" disabled>GCP</Button>
                  <Button variant="outline" disabled>Vercel</Button>
                  <Button variant="outline" disabled>Netlify</Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">(Deploy logic will be added soon)</div>
              </div>
              <Button variant="default" disabled className="w-full mt-4 opacity-80 cursor-not-allowed flex items-center justify-center gap-2 text-lg">
                <Rocket className="w-5 h-5 animate-bounce" /> Deploy
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 