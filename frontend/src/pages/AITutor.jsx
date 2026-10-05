import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "sonner";
import axios from "axios";
import MarkdownContent from "../components/MarkdownContent";
import {
  ArrowLeft,
  Send,
  Sparkles,
  User,
  Loader2,
  BookOpen
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AITutor() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}`);
      setCourse(response.data);
      
      // Add initial greeting
      setMessages([{
        role: "assistant",
        content: `Hello! I'm your AI tutor for "${response.data.title}". I'm here to help you understand any concepts, answer questions, or explain anything from the course. What would you like to learn about today?`
      }]);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }));

      const response = await axios.post(`${API}/chat/tutor`, {
        course_id: courseId,
        message: userMessage,
        conversation_history: conversationHistory
      });

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response.data.response 
      }]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response");
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={`/course/${courseId}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" data-testid="tutor-title">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Tutor - Mobile View
            </h1>
            <p className="text-sm text-muted-foreground">{course?.title}</p>
          </div>
        </div>
        
        <Link to={`/course/${courseId}`}>
          <Button variant="outline" className="rounded-full">
            <BookOpen className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </Link>
      </div>

      {/* Chat Container */}
      <div className="glass-card rounded-2xl flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" 
                    ? "bg-primary/20 text-primary" 
                    : "bg-accent/20 text-accent"
                }`}>
                  {message.role === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
                <div className={`max-w-[80%] ${
                  message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                } p-4`}>
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <MarkdownContent content={message.content} />
                  )}
                </div>
              </motion.div>
            ))}
            
            {sending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="chat-bubble-ai p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about the course..."
              className="flex-1 h-12 bg-input/50 border-transparent focus:border-primary"
              disabled={sending}
              data-testid="tutor-input"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="h-12 px-6 rounded-xl btn-glow"
              data-testid="btn-send"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            • Ask questions about concepts, examples, or explanations
          </p>
        </div>
      </div>
    </div>
  );
}
