'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const newsletterSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('🎉 Successfully subscribed!', {
        description: 'You\'ll receive our latest updates and exclusive content.',
        duration: 4000,
      });
      
      reset();
    } catch (error) {
      toast.error('Subscription failed', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          {...register('email')}
          type="email"
          placeholder="Enter your email"
          className={`pl-10 glass-morphism border-white/20 focus:border-secondary transition-all duration-300 ${
            errors.email ? 'border-red-500 focus:border-red-500' : ''
          }`}
          disabled={isSubmitting}
        />
      </div>
      
      {errors.email && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {errors.email.message}
        </motion.p>
      )}
      
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-secondary hover:bg-secondary/90 text-white py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:focus"
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Subscribing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Subscribe</span>
          </div>
        )}
      </Button>
    </motion.form>
  );
}