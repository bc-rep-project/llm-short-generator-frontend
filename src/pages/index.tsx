import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  DocumentArrowDownIcon, 
  LinkIcon, 
  SparklesIcon,
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Execution {
  id: string;
  status: 'running' | 'success' | 'error';
  startedAt: string;
  result?: any;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executions, setExecutions] = useState<Execution[]>([]);

  // Use the correct n8n webhook URL format
  // The webhook path from your workflow is 'ai-video-repurposing'
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 
    `${process.env.NEXT_PUBLIC_N8N_BASE_URL || 'https://llm-short-generator-backend.onrender.com'}/webhook/ai-video-repurposing`;

  const triggerWorkflow = async () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    if (!youtubeRegex.test(videoUrl.trim())) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Starting video processing...');

    // Create execution record
    const execution: Execution = {
      id: Date.now().toString(),
      status: 'running',
      startedAt: new Date().toISOString()
    };
    setExecutions(prev => [execution, ...prev]);

    try {
      // Trigger the n8n workflow via webhook
      const response = await axios.post(webhookUrl, {
        videoUrl: videoUrl.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 300000 // 5 minute timeout for video processing
      });

      // Update execution with success
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id ? { 
            ...exec, 
            status: 'success',
            result: response.data 
          } : exec
        )
      );

      toast.success(
        `Video processing completed! Generated ${response.data?.clips_generated || 'multiple'} clips.`, 
        { id: loadingToast, duration: 6000 }
      );
      setVideoUrl('');
      
    } catch (error: any) {
      console.error('Error triggering workflow:', error);
      
      // Update execution with error
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === execution.id ? { ...exec, status: 'error' } : exec
        )
      );

      let errorMessage = 'Failed to process video';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Processing timed out. Large videos may take longer to process.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Workflow endpoint not found. Please check backend deployment.';
      } else if (error.response?.status === 0 || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to backend. Please check if the service is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, { id: loadingToast, duration: 8000 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151'
          }
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8"
            >
              <VideoCameraIcon className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6"
            >
              AI Video Repurposing Tool
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Transform your long-form videos into viral short clips automatically. 
              Powered by GPT-4 AI analysis, perfect timing, and mobile optimization.
            </motion.p>
          </div>

          {/* Main Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 mb-12 shadow-2xl"
          >
            <div className="flex flex-col space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <LinkIcon className="h-6 w-6 text-purple-400" />
                <label htmlFor="video-url" className="text-xl font-semibold text-white">
                  YouTube Video URL
                </label>
              </div>
              
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 relative">
                  <input
                    id="video-url"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-lg transition-all duration-300"
                    disabled={isProcessing}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerWorkflow}
                  disabled={isProcessing || !videoUrl.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg shadow-lg transition-all duration-300"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-6 w-6" />
                      <span>Create Magic</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Processing History */}
          {executions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 mb-12 shadow-2xl"
            >
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <ClockIcon className="h-8 w-8 mr-3 text-purple-400" />
                Processing History
              </h2>
              
              <div className="space-y-4">
                {executions.map((execution, index) => (
                  <motion.div
                    key={execution.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {execution.status === 'running' && (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                        )}
                        {execution.status === 'success' && (
                          <CheckCircleIcon className="h-8 w-8 text-green-400" />
                        )}
                        {execution.status === 'error' && (
                          <ExclamationCircleIcon className="h-8 w-8 text-red-400" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-white text-lg">
                          Execution #{execution.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-gray-400">
                          Started: {new Date(execution.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        execution.status === 'running' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        execution.status === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {execution.status === 'running' ? 'Processing' :
                         execution.status === 'success' ? 'Completed' : 'Failed'}
                      </span>
                      
                      {execution.status === 'success' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 rounded-xl border border-purple-500/30 transition-all duration-300"
                          title="Download Results"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'AI-Powered Analysis',
                description: 'GPT-4 analyzes your content to identify viral-worthy moments with precision',
                icon: '🧠',
                gradient: 'from-purple-500 to-blue-500'
              },
              {
                title: 'Auto Subtitles',
                description: 'Generates stylized captions with perfect timing and engaging animations',
                icon: '📝',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                title: 'Mobile Optimized',
                description: 'Crops to 9:16 ratio perfect for TikTok, Instagram Reels, and YouTube Shorts',
                icon: '📱',
                gradient: 'from-cyan-500 to-purple-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"
                     style={{ background: `linear-gradient(135deg, ${feature.gradient.includes('purple') ? '#8b5cf6' : '#3b82f6'}, ${feature.gradient.includes('cyan') ? '#06b6d4' : '#8b5cf6'})` }}>
                </div>
                
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center shadow-2xl transition-all duration-300 group-hover:border-white/40">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center mt-16 pb-8"
          >
            <p className="text-gray-400">
              Powered by AI • Built with ❤️ • Transform your content today
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 