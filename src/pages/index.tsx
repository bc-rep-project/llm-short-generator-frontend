import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PlayIcon, DocumentArrowDownIcon, LinkIcon } from '@heroicons/react/24/outline';

interface Execution {
  id: string;
  status: 'running' | 'success' | 'error';
  startedAt: string;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executions, setExecutions] = useState<Execution[]>([]);

  const n8nApiUrl = process.env.NEXT_PUBLIC_N8N_API_URL || 'https://your-n8n-domain.com/api/v1';
  const workflowId = process.env.NEXT_PUBLIC_WORKFLOW_ID || 'your-workflow-id';

  const triggerWorkflow = async () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Starting video processing...');

    try {
      // Trigger the n8n workflow
      const response = await axios.post(
        `${n8nApiUrl}/workflows/${workflowId}/execute`,
        {
          videoUrl: videoUrl.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_API_KEY}`
          }
        }
      );

      const execution: Execution = {
        id: response.data.data.executionId,
        status: 'running',
        startedAt: new Date().toISOString()
      };

      setExecutions(prev => [execution, ...prev]);
      toast.success('Video processing started!', { id: loadingToast });
      setVideoUrl('');
      
      // Poll for execution status
      pollExecutionStatus(execution.id);
      
    } catch (error: any) {
      console.error('Error triggering workflow:', error);
      toast.error(error.response?.data?.message || 'Failed to start processing', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const pollExecutionStatus = async (executionId: string) => {
    try {
      const response = await axios.get(
        `${n8nApiUrl}/executions/${executionId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_API_KEY}`
          }
        }
      );

      const status = response.data.data.finished ? 
        (response.data.data.stoppedAt ? 'success' : 'error') : 'running';

      setExecutions(prev => 
        prev.map(exec => 
          exec.id === executionId ? { ...exec, status } : exec
        )
      );

      if (status === 'running') {
        // Continue polling every 10 seconds
        setTimeout(() => pollExecutionStatus(executionId), 10000);
      } else if (status === 'success') {
        toast.success('Video processing completed!');
      } else {
        toast.error('Video processing failed');
      }
    } catch (error) {
      console.error('Error polling execution status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Video Repurposing Tool
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your long-form videos into viral short clips automatically. 
              Just paste a YouTube URL and let AI do the magic!
            </p>
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col space-y-4">
              <label htmlFor="video-url" className="text-lg font-semibold text-gray-700">
                YouTube Video URL
              </label>
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <LinkIcon className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
                  <input
                    id="video-url"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    disabled={isProcessing}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={triggerWorkflow}
                  disabled={isProcessing || !videoUrl.trim()}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>{isProcessing ? 'Processing...' : 'Process Video'}</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Executions List */}
          {executions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Processing History</h2>
              <div className="space-y-4">
                {executions.map((execution) => (
                  <motion.div
                    key={execution.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        execution.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                        execution.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          Execution {execution.id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Started: {new Date(execution.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        execution.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                        execution.status === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {execution.status === 'running' ? 'Processing' :
                         execution.status === 'success' ? 'Completed' : 'Failed'}
                      </span>
                      {execution.status === 'success' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Download Results"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI-Powered Analysis',
                description: 'GPT-4 analyzes your content to identify viral-worthy moments',
                icon: '🧠'
              },
              {
                title: 'Auto Subtitles',
                description: 'Generates stylized captions with perfect timing',
                icon: '📝'
              },
              {
                title: 'Mobile Optimized',
                description: 'Crops to 9:16 ratio perfect for TikTok and Reels',
                icon: '📱'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 