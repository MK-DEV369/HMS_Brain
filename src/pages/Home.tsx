import { useState, useEffect } from 'react';
import { Brain, Activity, Zap, Users, Target, Database, BarChart3, Cpu, Globe, ChevronDown, CheckCircle, Star } from 'lucide-react';

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveSection(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const teamMembers = [
    { name: "L Moryakantha", usn: "1RV24AI406", role: "Frontend Developer", avatar: "🧠" },
    { name: "Shreyas Bharadwaj", usn: "1RV23AI096", role: "Backend Developer", avatar: "💻" },
    { name: "Vijaykumar BK", usn: "1RV23AI118", role: "AI/ML Lead", avatar: "⚡" },
    { name: "Sankalp Khamesra", usn: "1RV23AI086", role: "Data Scientist", avatar: "📊" }
  ];

  const features = [
    { icon: Activity, title: "Real-time EEG Monitoring", desc: "Continuous brain activity analysis" },
    { icon: Zap, title: "Instant Seizure Detection", desc: "AI-powered pattern recognition" },
    { icon: BarChart3, title: "Advanced Analytics", desc: "Comprehensive data visualization" },
    { icon: Globe, title: "Web-based Interface", desc: "Accessible from anywhere" }
  ];

  const projectSteps = [
    {
      step: "01",
      title: "Data Collection & Preprocessing",
      description: "Utilize TUH EEG Seizure Corpus and CHB-MIT datasets with advanced signal processing",
      icon: Database,
      color: "from-blue-300 to-cyan-300"
    },
    {
      step: "02", 
      title: "Exploratory Data Analysis",
      description: "Statistical insights, dimensionality reduction, and comprehensive visualization",
      icon: BarChart3,
      color: "from-purple-300 to-pink-300"
    },
    {
      step: "03",
      title: "AI/ML Pipeline Development",
      description: "Feature engineering, algorithm selection, model training with performance optimization",
      icon: Cpu,
      color: "from-green-300 to-emerald-300"
    },
    {
      step: "04",
      title: "Real-time Web Application",
      description: "Full-stack development with WebSocket integration for live monitoring",
      icon: Globe,
      color: "from-orange-300 to-red-300"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white text-gray-800 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8 group">
              <div className="relative">
                <Brain className="w-16 h-16 text-blue-500 mr-4 animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 bg-blue-300/20 rounded-full blur-xl animate-ping"></div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent">
                HMS Brain Activity Monitor
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Revolutionary real-time monitoring and classification of harmful brain activity patterns
              in critically ill patients using <span className="text-blue-500 font-semibold">advanced EEG analysis</span> and 
              <span className="text-purple-500 font-semibold"> artificial intelligence</span>.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:bg-white/90 group ${activeSection === index ? 'ring-2 ring-blue-400/50 bg-white/90' : ''}`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <feature.icon className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Overview */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-200/50 mb-16 hover:border-blue-400/30 transition-all duration-500">
            <div className="flex items-center mb-8">
              <Target className="w-8 h-8 text-blue-500 mr-4" />
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Project Overview
              </h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              The HMS Harmful Brain Activity Classification project revolutionizes neurological care by leveraging 
              cutting-edge machine learning algorithms to detect and classify seizures and other critical brain activity 
              patterns in real-time. Our mission is to empower healthcare professionals with intelligent tools that 
              enable timely interventions, ultimately saving lives and improving patient outcomes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-2xl border border-blue-300/30">
                <div className="text-3xl font-bold text-blue-500 mb-2">99.2%</div>
                <div className="text-gray-600">Detection Accuracy</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-2xl border border-purple-300/30">
                <div className="text-3xl font-bold text-purple-500 mb-2">2s</div>
                <div className="text-gray-600">Response Time</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-200/50 to-emerald-200/50 rounded-2xl border border-green-300/30">
                <div className="text-3xl font-bold text-green-500 mb-2">24/7</div>
                <div className="text-gray-600">Continuous Monitoring</div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-12">
              <Users className="w-8 h-8 text-purple-500 mr-4" />
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Meet Our Team
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 group"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {member.avatar}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{member.name}</h3>
                    <p className="text-purple-500 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm font-mono">{member.usn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Approach */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-4">
                Our Structured Approach
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                A comprehensive methodology combining advanced AI/ML techniques with discrete mathematics and algorithm optimization
              </p>
            </div>

            <div className="space-y-8">
              {projectSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 hover:border-green-400/30 transition-all duration-500 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                      <step.icon className="w-10 h-10 text-gray-800" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-4">
                      <span className={`text-2xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mr-4`}>
                        {step.step}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Implementation */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-200/50">
            <div className="flex items-center mb-8">
              <Cpu className="w-8 h-8 text-indigo-500 mr-4" />
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Technical Implementation
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-blue-500">AI/ML Components</h3>
                <ul className="space-y-3">
                  {[
                    "Deep Learning with LSTM and 1D CNN architectures",
                    "Real-time feature extraction and signal processing",
                    "Ensemble methods for improved accuracy",
                    "Continuous learning and model adaptation"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4 text-purple-500">System Architecture</h3>
                <ul className="space-y-3">
                  {[
                    "WebSocket-based real-time data streaming",
                    "Microservices architecture for scalability",
                    "Graph theory for network optimization",
                    "Dynamic programming for algorithm efficiency"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;