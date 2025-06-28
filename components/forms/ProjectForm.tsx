'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const projectSchema = z.object({
  projectName: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(50, 'Project name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
  projectType: z.enum(['web-app', 'mobile-app', 'api', 'microservice', 'ai-model', 'other'], {
    required_error: 'Please select a project type',
  }),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const projectTypes = [
  { value: 'web-app', label: 'Web Application' },
  { value: 'mobile-app', label: 'Mobile Application' },
  { value: 'api', label: 'API Service' },
  { value: 'microservice', label: 'Microservice' },
  { value: 'ai-model', label: 'AI Model' },
  { value: 'other', label: 'Other' },
];

export function ProjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectType, setProjectType] = useState<string>('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Trigger login modal in header via custom event
        window.dispatchEvent(new CustomEvent('open-login-modal'));
        setIsSubmitting(false);
        return;
      }
      // Simulate API call or call your real createProject logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('🚀 Project created successfully!', {
        description: `Your ${data.projectType} project "${data.projectName}" is ready to launch.`,
        duration: 5000,
      });
      reset();
      setProjectType('');
      // Redirect to dashboard after creation
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to create project', {
        description: 'Please try again or contact support if the problem persists.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center space-x-2 mb-4"
        >
          <Sparkles className="w-6 h-6 text-accent" />
          <h3 className="text-2xl font-bold gradient-text">Start Building</h3>
          <Sparkles className="w-6 h-6 text-secondary" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground"
        >
          Create your first AI-powered project
        </motion.p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Name Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <Label htmlFor="projectName" className="text-foreground font-medium">
            Project Name *
          </Label>
          <Input
            id="projectName"
            {...register('projectName')}
            placeholder="My Awesome Project"
            className={`glass-morphism border-white/20 focus:border-secondary transition-all duration-300 ${
              errors.projectName ? 'border-red-500 focus:border-red-500' : ''
            }`}
            disabled={isSubmitting}
          />
          {errors.projectName && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm"
            >
              {errors.projectName.message}
            </motion.p>
          )}
        </motion.div>

        {/* Project Type Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <Label htmlFor="projectType" className="text-foreground font-medium">
            Project Type *
          </Label>
          <Select
            value={projectType}
            onValueChange={(value) => {
              setProjectType(value);
              setValue('projectType', value as any);
            }}
            disabled={isSubmitting}
          >
            <SelectTrigger className={`glass-morphism border-white/20 focus:border-secondary transition-all duration-300 ${
              errors.projectType ? 'border-red-500 focus:border-red-500' : ''
            }`}>
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent className="glass-morphism border-white/20">
              {projectTypes.map((type) => (
                <SelectItem 
                  key={type.value} 
                  value={type.value}
                  className="focus:bg-secondary/20 focus:text-secondary"
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.projectType && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm"
            >
              {errors.projectType.message}
            </motion.p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:focus"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Project...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Rocket className="w-4 h-4" />
                <span>Launch Project</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Success Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        {/* This would show success animation */}
      </motion.div>
    </motion.div>
  );
}