'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Project } from '@/lib/supabase';

const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(50, 'Project name must be less than 50 characters'),
  type: z.enum(['web-app', 'mobile-app', 'api', 'microservice', 'ai-model', 'other']),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

const projectTypes = [
  { value: 'web-app', label: 'Web Application' },
  { value: 'mobile-app', label: 'Mobile Application' },
  { value: 'api', label: 'API Service' },
  { value: 'microservice', label: 'Microservice' },
  { value: 'ai-model', label: 'AI Model' },
  { value: 'other', label: 'Other' },
];

interface CreateProjectDialogProps {
  onCreateProject: (data: CreateProjectFormData) => Promise<void>;
  trigger?: React.ReactNode;
}

export function CreateProjectDialog({ onCreateProject, trigger }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
  });

  const selectedType = watch('type');

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true);
    try {
      await onCreateProject(data);
      reset();
      setOpen(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-morphism border-slate-700 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              Create New Project
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Project Name *
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Awesome Project"
              className={`glass-morphism border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-400 ${
                errors.name ? 'border-red-500' : ''
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-300">
              Project Type *
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger className={`glass-morphism border-slate-600 focus:border-indigo-500 text-white ${
                errors.type ? 'border-red-500' : ''
              }`}>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent className="glass-morphism border-slate-700">
                {projectTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="text-slate-300 focus:bg-indigo-500/20 focus:text-white"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-400 text-sm">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your project..."
              className="glass-morphism border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-400 resize-none"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Project...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </div>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}