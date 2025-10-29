import React, { useState, useRef, useEffect } from 'react';

// --- Icon Components ---
const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const ProfileIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ChatIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

// --- Main App Component ---
const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const chatRef = useRef<any | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const initializeChat = async () => {
    if (chatRef.current) return true;

    setIsLoading(true);
    setChatError(null);
    
    let GoogleGenAI;
    try {
        // Step 1: Try to load the module
        const module = await import('@google/genai');
        GoogleGenAI = module.GoogleGenAI;
    } catch (error) {
        console.error("Failed to load @google/genai module:", error);
        setChatError("Không thể tải thư viện AI. Vui lòng kiểm tra kết nối mạng và thử lại.");
        setIsLoading(false);
        return false;
    }

    try {
        // Step 2: Try to instantiate and configure the AI client
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are a helpful AI assistant for the "Group Assignment Final" project. You answer questions about this specific project or web development in general. Keep your answers friendly, concise and in Vietnamese.',
            },
        });

        return true; // Success
    } catch (error) {
        console.error("Failed to initialize AI Client:", error);
        const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
        
        // This error is likely related to the API key or configuration
        setChatError(`Lỗi cấu hình AI: ${errorMessage}. Vui lòng kiểm tra lại API key.`);
        return false; // Failure
    } finally {
        setIsLoading(false); 
    }
  };
  
  const handleOpenChat = async () => {
    setIsChatOpen(true);
    if (!chatRef.current) {
        await initializeChat();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading || chatError) return;
    
    if (!chatRef.current && !(await initializeChat())) {
      return;
    }
    if (!chatRef.current) return;

    const userMessage = { role: 'user' as const, text: chatInput };
    setMessages(prev => [...prev, userMessage]);
    const currentChatInput = chatInput;
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: currentChatInput });
      const aiMessage = { role: 'model' as const, text: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = { role: 'model' as const, text: 'Xin lỗi, tôi đã gặp lỗi. Vui lòng thử lại.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="bg-slate-900 min-h-screen flex items-center justify-center p-4 font-sans text-white selection:bg-cyan-500/30">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-10 max-w-3xl w-full transform transition-all duration-500 hover:shadow-cyan-500/20 hover:border-slate-600">
          
          <header className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Group Assignment Final
            </h1>
            <p className="text-slate-400 text-lg">
              Giải pháp toàn diện cho việc hợp tác nhóm.
            </p>
          </header>

          <div className="mb-8 rounded-lg overflow-hidden shadow-lg border-2 border-slate-700 group aspect-video bg-slate-700/50 flex items-center justify-center">
            {imgError ? (
              <div className="text-center text-slate-400 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p>Lỗi hiển thị ảnh xem trước</p>
              </div>
            ) : (
              <img 
                src="https://storage.googleapis.com/aistudio-hub-files/USER_UPLOAD/a380eb9a557b6f69911e8a937a0db8bd.png"
                alt="Screenshot of the Group Assignment Final web application homepage" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                onError={() => setImgError(true)}
              />
            )}
          </div>

          <section className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-3">
              Giới thiệu Dự án
            </h2>
            <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Dự án này là một nền tảng web hiện đại, giúp các nhóm sinh viên, học sinh tổ chức, cộng tác và hoàn thành bài tập nhóm một cách hiệu quả. Với giao diện trực quan và các tính năng mạnh mẽ, việc hợp tác trở nên dễ dàng hơn bao giờ hết.
            </p>
          </section>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <a
              href="https://group-assignment-final.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
            >
              <ExternalLinkIcon />
              Xem Trang Web
            </a>
            <a 
                href="https://nhut0902-pr.github.io/Profile-/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-slate-700/30 hover:shadow-slate-600/50 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
            >
                <ProfileIcon />
                Hồ sơ của tôi
            </a>
          </div>
        </div>
      </main>
      
      {/* Chat Feature */}
      <div className="fixed bottom-6 right-6">
          <button 
              onClick={handleOpenChat}
              className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-lg transform transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
              aria-label="Open AI Chat"
          >
              <ChatIcon />
          </button>
      </div>

      {isChatOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center z-50">
              <div className="bg-slate-800 border border-slate-700 text-white w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl">
                  <header className="flex items-center justify-between p-4 border-b border-slate-700">
                      <h3 className="text-lg font-semibold">Trợ lý AI</h3>
                      <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                          <CloseIcon />
                      </button>
                  </header>
                  <div className="flex-1 p-4 overflow-y-auto">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-2.5">
                            <span className="flex-shrink-0 bg-slate-700 h-8 w-8 rounded-full flex items-center justify-center font-bold">AI</span>
                            <div className="bg-slate-700/50 rounded-lg p-3 max-w-xs">
                                <p className="text-sm">Xin chào! Tôi có thể giúp gì cho bạn về dự án này?</p>
                            </div>
                        </div>
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <span className="flex-shrink-0 bg-slate-700 h-8 w-8 rounded-full flex items-center justify-center font-bold">AI</span>}
                                <div className={`${msg.role === 'user' ? 'bg-cyan-600' : 'bg-slate-700/50'} rounded-lg p-3 max-w-xs`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && !chatError && (
                            <div className="flex gap-2.5">
                                <span className="flex-shrink-0 bg-slate-700 h-8 w-8 rounded-full flex items-center justify-center font-bold">AI</span>
                                <div className="bg-slate-700/50 rounded-lg p-3 max-w-xs flex items-center gap-2">
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse"></span>
                                </div>
                            </div>
                        )}
                        {chatError && (
                           <div className="flex gap-2.5">
                               <span className="flex-shrink-0 bg-red-500 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">!</span>
                               <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 max-w-xs">
                                   <p className="text-sm text-red-200">{chatError}</p>
                               </div>
                           </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 flex items-center gap-2">
                      <input 
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={chatError ? "Trò chuyện bị vô hiệu hóa" : "Hỏi tôi bất cứ điều gì..."}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                          disabled={isLoading || !!chatError}
                      />
                      <button 
                          type="submit"
                          className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg p-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
                          disabled={isLoading || !chatInput.trim() || !!chatError}
                          aria-label="Send Message"
                      >
                          <SendIcon />
                      </button>
                  </form>
              </div>
          </div>
      )}
    </>
  );
};

export default App;
