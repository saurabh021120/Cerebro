import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import FeaturesCarousel from "../components/FeaturesCarousel";
import Testimonials from "../components/Testimonials";
import LogoImage from "../assets/Images/Logo_Image.png";
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle,
  Play
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Courses",
    description: "Generate personalized learning paths tailored to your goals and timeline."
  },
  {
    icon: BookOpen,
    title: "Smart Quizzes",
    description: "Test your knowledge with AI-generated quizzes and get instant feedback."
  },
  {
    icon: Users,
    title: "Mock Interviews",
    description: "Practice interviews with AI and receive constructive feedback."
  },
  {
    icon: Zap,
    title: "AI Tutor",
    description: "Get help anytime with an intelligent tutor that understands your learning style."
  }
];

const benefits = [
  "Personalized learning at your own pace",
  "AI-generated content from reliable sources",
  "Interactive quizzes after each module",
  "Real-time progress tracking",
  "Expert AI tutoring support",
  "Mock interviews for job preparation"
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2" data-testid="logo">
              <img src={LogoImage} alt="Cerebro Logo" className="w-10 h-10 rounded-xl" />
              <span className="text-xl font-bold font-['Outfit'] tracking-tight">Cerebro</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/courses">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="nav-my-courses">
                  My Courses - Mobile View
                </Button>
              </Link>
              <Link to="/create">
                <Button className="rounded-full btn-glow" data-testid="get-started-btn">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background glow */}
        <div className="absolute inset-0 hero-glow" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1764263996452-d8498c9b0ce8?w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(100px)'
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
              data-testid="hero-title"
            >
              Learn Anything with
              <span className="gradient-text block mt-2">AI-Powered Courses</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              data-testid="hero-description"
            >
              Tell us what you want to learn, and our AI will create a personalized curriculum 
              with lessons, quizzes, and resources tailored just for you.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/create">
                <Button size="lg" className="rounded-full px-8 py-6 text-lg btn-glow" data-testid="cta-create-course">
                  Create Your Course
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-white/10 hover:bg-white/5" data-testid="cta-browse-courses">
                  <Play className="w-5 h-5 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <section className="py-12 lg:py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover what makes Cerebro the ultimate learning platform
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FeaturesCarousel />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4" data-testid="features-title">
              Everything You Need to
              <span className="gradient-text"> Master Any Skill</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need for effective learning.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 feature-card"
                  data-testid={`feature-card-${index}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6" data-testid="benefits-title">
                Why Choose
                <span className="gradient-text"> Cerebro?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our platform combines cutting-edge AI technology with proven learning methodologies 
                to deliver an unmatched educational experience.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="glass-card rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1614793351079-11dd79b922ba?w=800"
                  alt="Student learning"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Start Learning Today</p>
                      <p className="text-sm text-muted-foreground">Create your first course in minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 hero-glow" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6" data-testid="cta-title">
              Ready to Start Your
              <span className="gradient-text"> Learning Journey?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are mastering new skills with personalized AI courses.
            </p>
            <Link to="/create">
              <Button size="lg" className="rounded-full px-10 py-6 text-lg btn-glow" data-testid="final-cta">
                Create Your First Course
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={LogoImage} alt="Cerebro Logo" className="w-5 h-5 rounded" />
              <span className="font-semibold">Cerebro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Cerebro.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
