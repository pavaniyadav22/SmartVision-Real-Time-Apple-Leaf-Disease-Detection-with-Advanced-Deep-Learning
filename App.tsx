
import React, { useState, useCallback } from 'react';
import { Icons, APP_NAME } from './constants';
import { AnalysisResult } from './types';
import { analyzeLeaf } from './services/geminiService';
import CameraView from './components/CameraView';
import ResultCard from './components/ResultCard';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'history'>('camera');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [history, setHistory] = useState<{result: AnalysisResult, image: string}[]>([]);

  const handleAnalysis = async (base64: string) => {
    setIsAnalyzing(true);
    setCurrentImage(base64);
    try {
      const result = await analyzeLeaf(base64);
      setCurrentResult(result);
      setHistory(prev => [{ result, image: base64 }, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please check your network connection or API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-emerald-600">
              <Icons.Leaf />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{APP_NAME}</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">v2.1 Edge</span>
          </div>
          <nav className="flex gap-4">
            <button 
              onClick={() => setActiveTab('history')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-slate-100 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
              title="History"
            >
              <Icons.History />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Real-Time Leaf Diagnosis</h2>
          <p className="text-slate-500">Detect disease and estimate severity in milliseconds using lightweight CNN architecture.</p>
        </div>

        <Dashboard />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interface */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'camera' && (
              <CameraView onCapture={handleAnalysis} isProcessing={isAnalyzing} />
            )}

            {activeTab === 'upload' && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center transition-all hover:border-emerald-400 group">
                <div className="mb-4 flex justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <Icons.Upload />
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Leaf Image</h3>
                <p className="text-slate-500 text-sm mb-6">Select a JPG or PNG image of an apple leaf from your device.</p>
                <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold transition-colors inline-block">
                  Browse Files
                  <input type="file" className="hidden" accept="image/*" onChange={onFileUpload} />
                </label>
              </div>
            )}

            {isAnalyzing && !currentResult && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Running lightweight CNN inference...</p>
                <p className="text-slate-400 text-xs mt-1">Normalizing pixels & feature extraction (224x224)</p>
              </div>
            )}

            {currentResult && currentImage && (
              <ResultCard result={currentResult} image={currentImage} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-amber-500"><Icons.Alert /></span>
                Deployment Mode
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveTab('camera')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'camera' ? 'bg-emerald-50 border-emerald-200 border-2 text-emerald-800' : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'}`}
                >
                  <Icons.Camera />
                  <div className="text-left">
                    <p className="font-bold text-sm">Live Capture</p>
                    <p className="text-xs opacity-70">Field-optimized camera mode</p>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-emerald-50 border-emerald-200 border-2 text-emerald-800' : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'}`}
                >
                  <Icons.Upload />
                  <div className="text-left">
                    <p className="font-bold text-sm">Upload Image</p>
                    <p className="text-xs opacity-70">Single image processing</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
              <h3 className="text-lg font-bold mb-2">Model Info</h3>
              <p className="text-slate-400 text-sm mb-4">
                Our lightweight CNN (9.6 MB) is trained on 4,000+ field-annotated apple leaves.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs border-b border-white/10 pb-1">
                  <span className="text-slate-400">Backbone</span>
                  <span className="font-mono">Custom MobileCNN</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/10 pb-1">
                  <span className="text-slate-400">Input Size</span>
                  <span className="font-mono">224 x 224 x 3</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/10 pb-1">
                  <span className="text-slate-400">Optimized For</span>
                  <span className="font-mono">Real-time Inference</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History Section */}
        {activeTab === 'history' && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Scans</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.length === 0 ? (
                <p className="col-span-full text-center text-slate-500 py-12 bg-white rounded-2xl border border-dashed">No scan history available yet.</p>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <img src={item.image} alt="Scan" className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-slate-800">{item.result.disease}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 uppercase tracking-tighter">
                          {item.result.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{new Date(item.result.timestamp).toLocaleString()}</p>
                      <button 
                        onClick={() => {
                          setCurrentResult(item.result);
                          setCurrentImage(item.image);
                          setActiveTab('camera');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-emerald-600 text-xs font-bold hover:underline"
                      >
                        View Full Details →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Navigation (Mobile) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-6 py-3 rounded-full shadow-2xl flex gap-8 items-center z-50">
        <button onClick={() => setActiveTab('camera')} className={`transition-colors ${activeTab === 'camera' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Icons.Camera />
        </button>
        <button onClick={() => setActiveTab('upload')} className={`transition-colors ${activeTab === 'upload' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Icons.Upload />
        </button>
        <button onClick={() => setActiveTab('history')} className={`transition-colors ${activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Icons.History />
        </button>
      </div>
    </div>
  );
};

export default App;
