"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Box, Triangle, Loader2, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AnalysisResult {
  summary: string;
  sentiment: string;
  improvement_suggestions: string[];
}

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'extracting' | 'analyzing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [extractedText, setExtractedText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetApp = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus('idle');
    setExtractedText('');
    setAnalysis(null);
    setErrorMessage('');
  };

  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('idle');
    setExtractedText('');
    setAnalysis(null);
    setErrorMessage('');

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const newPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(newPreviewUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };

  const handleAnalyzeFile = async () => {
    if (!file) return;

    try {
      setStatus('extracting');
      const formData = new FormData();
      formData.append('file', file);

      const extractRes = await fetch('http://localhost:8000/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!extractRes.ok) {
        const errData = await extractRes.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to extract text from the file.');
      }
      
      const extractData = await extractRes.json();
      const text = extractData.extracted_text;
      setExtractedText(text);

      setStatus('analyzing');
      
      const analyzeRes = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.detail || 'AI Analysis failed.');
      }

      const analyzeData = await analyzeRes.json();
      setAnalysis(analyzeData);
      setStatus('success');

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <main className="grow flex flex-col items-center py-12 px-4">
        
        {status === 'idle' && !file && (
          <div className="text-center mb-10 mt-10">
            <h1 className="text-4xl md:text-5xl font-bold text-[#33333b] mb-4">
              Analyse Social Media Post
            </h1>
            <p className="text-[#47474f] text-lg md:text-xl max-w-2xl mx-auto">
              Upload a PDF or image of your social media post to extract text, analyze sentiment, and get engagement improvements.
            </p>
          </div>
        )}

        {status === 'idle' && (
          <div className="w-full max-w-3xl flex justify-center mb-12">
            {isDragging ? (
              <div className="w-full h-64 rounded-xl flex items-center justify-center bg-[#1e293b] border-2 border-[#3b82f6] border-dashed shadow-2xl pointer-events-none">
                <div className="flex flex-col items-center justify-center text-blue-500">
                  <Paperclip className="w-10 h-10 mb-3" />
                  <span className="text-2xl font-semibold text-[#3b82f6]">Drop file here</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center z-10">
                <div className="flex items-center space-x-3">
                  <label className="bg-[#1e293b] hover:bg-red-700 text-white text-2xl md:text-3xl font-semibold py-6 px-10 md:px-14 rounded-xl cursor-pointer transition-colors shadow-lg flex items-center">
                    <span>{file ? 'Change file' : 'Select file'}</span>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,image/png,image/jpeg,image/jpg" />
                  </label>
                </div>
                {!file && <p className="text-[#47474f] mt-5 font-medium text-lg tracking-wide">or drop file here</p>}
              </div>
            )}
          </div>
        )}

        {file && status === 'idle' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="bg-white px-6 py-4 rounded-lg border shadow-sm flex items-center space-x-4 mb-6">
              <FileText className="text-blue-500 w-8 h-8" />
              <div>
                <p className="font-bold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={handleAnalyzeFile}
              className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <span>Analyze Content</span>
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {status !== 'idle' && (
          <div className="w-full max-w-7xl mt-8 mx-auto flex flex-col items-center">
            
            {/* 1/3 and 2/3 Split Grid Layout */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: Document Preview (1/3 Width) */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-md border overflow-hidden flex flex-col h-150">
                <div className="bg-gray-50 border-b px-3 py-3 font-semibold text-gray-700">Document Preview</div>
                <div className="grow bg-gray-100 flex items-center justify-center p-4 relative">
                  {previewUrl && file?.type.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded shadow-sm" />
                  ) : previewUrl && file?.type === 'application/pdf' ? (
                    <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full rounded shadow-sm bg-white" title="PDF Preview" />
                  ) : (
                    <p className="text-gray-400">Preview not available</p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Analysis & Actions (2/3 Width) */}
              <div className="lg:col-span-2 flex flex-col space-y-6">
                
                {/* Analysis Results Block */}
                <div className="bg-white rounded-xl shadow-md border overflow-hidden flex flex-col h-150">
                  <div className="bg-gray-50 border-b px-4 py-3 font-semibold text-gray-700 flex justify-between items-center">
                    <span>Analysis Results</span>
                    {status === 'extracting' && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full animate-pulse">Running OCR / PDF Parser...</span>}
                    {status === 'analyzing' && <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full animate-pulse">Gemini AI Analyzing...</span>}
                  </div>
                  
                  <div className="grow p-6 overflow-y-auto">
                    
                    {(status === 'extracting' || status === 'analyzing') && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                        <p className="text-lg font-medium">
                          {status === 'extracting' ? 'Extracting text from document...' : 'AI is analyzing your content...'}
                        </p>
                      </div>
                    )}

                    {status === 'error' && (
                      <div className="h-full flex flex-col items-center justify-center text-red-500 space-y-4">
                        <AlertCircle className="w-12 h-12" />
                        <p className="text-lg font-bold">Analysis Failed</p>
                        <p className="text-sm text-center px-4 font-mono bg-red-50 text-red-800 p-2 rounded w-full">{errorMessage}</p>
                      </div>
                    )}

                    {status === 'success' && analysis && (
                      <div className="space-y-6 animate-fade-in">
                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">AI Summary</h3>
                          <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border">{analysis.summary}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Overall Sentiment</h3>
                          <span className="inline-block bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-full border border-blue-200">
                            {analysis.sentiment}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Engagement Improvements</h3>
                          <ul className="space-y-3">
                            {analysis.improvement_suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-3 bg-purple-50 p-4 rounded-lg border border-purple-100">
                                <span className="text-purple-500 font-black mt-0.5">{index + 1}.</span>
                                <span className="text-gray-800">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extra Actions Block (Raw Text & Start Over) */}
                <div className="flex flex-col space-y-4 animate-fade-in">
                  
                  {/* Raw Text Accordion */}
                  {extractedText && (
                    <details className="group w-full bg-white border rounded-lg shadow-sm">
                      <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 p-4 rounded-lg group-open:rounded-b-none  outline-none flex justify-center items-center">
                        <span className="mr-2 text-[10px]">▼</span> View Raw Extracted Text
                      </summary>
                      <div className="p-4 bg-[#ffffff] text-green-400 font-mono text-xs whitespace-pre-wrap max-h-64 overflow-y-auto rounded-b-lg shadow-inner">
                        {extractedText}
                      </div>
                    </details>
                  )}

                  {/* Start Over Button */}
                  {(status === 'success' || status === 'error') && (
                    <button 
                      onClick={resetApp} 
                      className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 py-4 rounded-lg transition-colors shadow-sm font-semibold"
                    >
                      <RefreshCw className="w-5 h-5 text-gray-500" />
                      <span>Analyze Another File</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </main>


    </div>
  );
}