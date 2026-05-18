'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-black" />
      <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 bg-blue-600 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-0 right-0 -z-10 w-[600px] h-[600px] opacity-20 bg-purple-600 blur-[150px] rounded-full mix-blend-screen" />
      
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur-md"
          >
            <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
            <span>AI-Powered Intelligence</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl"
          >
            Land Your Dream Job with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              AI Resume Intelligence
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl"
          >
            Upload your resume and instantly receive a complete ATS analysis, AI-driven rewrites, and a personalized career roadmap.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 bg-white text-black hover:bg-gray-200 rounded-full text-base font-semibold w-full sm:w-auto">
                Start Analyzing Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/editor">
              <Button size="lg" variant="outline" className="h-14 px-8 border-white/20 text-white hover:bg-white/10 rounded-full text-base font-semibold w-full sm:w-auto backdrop-blur-md bg-white/5">
                <FileText className="mr-2 h-5 w-5" />
                Live AI Editor
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
