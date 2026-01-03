import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const LandingPage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: "🎯",
      title: "Smart Project Matching",
      description:
        "Get personalized project recommendations based on your actual skills, not just your connections. Our algorithm analyzes your expertise to show you opportunities that truly fit.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: "💬",
      title: "Real-Time Communication",
      description:
        "Built-in chat powered by Socket.io and WebSockets. Connect instantly with collaborators, discuss projects, and build relationships—all in one place.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: "🤝",
      title: "Verified Connections",
      description:
        "Send and manage connection requests with confidence. Only chat with accepted connections, ensuring meaningful and secure professional relationships.",
      gradient: "from-blue-600 to-purple-600",
    },
    {
      icon: "💾",
      title: "Persistent Chat History",
      description:
        "All your conversations are safely stored in MongoDB. Pick up where you left off and never lose important project discussions.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: "🔍",
      title: "Skill-First Discovery",
      description:
        "Unlike traditional platforms that prioritize random content, SkillMate shows you what matters—projects aligned with your capabilities.",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "Built with modern web technologies for a seamless, responsive experience. Real-time updates keep you connected without delays.",
      gradient: "from-red-500 to-pink-600",
    },
  ];

  const problems = [
    {
      type: "problem",
      icon: "❌",
      title: "LinkedIn",
      description:
        "Cluttered with irrelevant content, corporate posts, and vanity metrics. Finding actual project opportunities is like searching for a needle in a haystack.",
      color: "red",
    },
    {
      type: "problem",
      icon: "❌",
      title: "Freelancer.com",
      description:
        "Race-to-the-bottom pricing, overwhelming competition, and projects that don't match your expertise. Your skills get lost in the crowd.",
      color: "red",
    },
    {
      type: "solution",
      icon: "✅",
      title: "SkillMate",
      description:
        "Intelligent matching that puts your skills first. Connect with the right projects and the right people, without the noise.",
      color: "green",
    },
  ];

  const techStack = [
    { emoji: "⚛️", name: "React.js" },
    { emoji: "🟢", name: "Node.js" },
    { emoji: "🚀", name: "Express.js" },
    { emoji: "🍃", name: "MongoDB" },
    { emoji: "⚡", name: "Socket.io" },
    { emoji: "🔌", name: "WebSockets" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setShowMenu(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-slate-800 shadow-lg" : "bg-slate-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-white cursor-pointer">
                SkillMate
              </h1>
              <span className="hidden md:block text-xl text-gray-300">
                : Let's Trade Talent!!!
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("features")}
                className="text-white hover:text-gray-300 transition text-sm font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("solution")}
                className="text-white hover:text-gray-300 transition text-sm font-medium"
              >
                Solution
              </button>
              <button
                onClick={() => scrollToSection("tech")}
                className="text-white hover:text-gray-300 transition text-sm font-medium"
              >
                Technology
              </button>
              <a
                href="/home"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                Launch App
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden text-white p-2 hover:bg-slate-700 rounded-lg transition"
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="md:hidden pb-4 space-y-2">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-slate-700 rounded transition"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("solution")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-slate-700 rounded transition"
              >
                Solution
              </button>
              <button
                onClick={() => scrollToSection("tech")}
                className="block w-full text-left px-4 py-2 text-white hover:bg-slate-700 rounded transition"
              >
                Technology
              </button>
              <a
                href="/home"
                className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold mt-2"
              >
                Launch App
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 via-blue-900 to-purple-900 pt-16">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="animate-fadeIn">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Let's Trade{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Talent
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
              The intelligent social platform that matches your skills with the
              right projects. No more endless scrolling—just meaningful
              connections and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/home"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-bold shadow-2xl transition-all transform hover:scale-105 w-full sm:w-auto"
              >
                Get Started Free
              </a>
              <a
                href="https://github.com/Aayushbhatt06/SkillMate-Lets_Trade_Talent"
                className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 px-8 py-4 rounded-full text-lg font-bold shadow-2xl transition-all transform hover:scale-105 w-full sm:w-auto"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Developers, By Developers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SkillMate combines the best of professional networking with
              intelligent project matching
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg text-3xl`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Solution Section */}
      <section
        id="solution"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-100 to-blue-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              The Problem with Current Platforms
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Traditional platforms fall short for developers seeking meaningful
              collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {problems.map((item, index) => (
              <div
                key={index}
                className={`${
                  item.type === "solution"
                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 shadow-2xl"
                    : "bg-white border-l-4 border-red-500 shadow-lg"
                } rounded-2xl p-8 transition-all`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <h3
                    className={`text-2xl font-bold ${
                      item.type === "solution" ? "text-white" : "text-red-600"
                    }`}
                  >
                    {item.title}
                  </h3>
                </div>
                <p
                  className={`leading-relaxed ${
                    item.type === "solution" ? "text-white" : "text-gray-700"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section
        id="tech"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-800 via-blue-900 to-purple-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              A robust, scalable stack for real-time collaboration
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center hover:bg-white/20 transition-all transform hover:scale-110 border border-white/20"
              >
                <div className="text-5xl mb-4">{tech.emoji}</div>
                <h4 className="text-white font-bold text-lg">{tech.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Trade Talent?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join SkillMate today and connect with projects that match your
            expertise
          </p>
          <a
            href="/home"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-full text-lg font-bold shadow-2xl transition-all transform hover:scale-105"
          >
            Get Started Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2026 SkillMate. Built by{" "}
            <a
              href="https://github.com/Aayushbhatt06"
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Aayush Bhatt
            </a>
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Open source on{" "}
            <a
              href="https://github.com/Aayushbhatt06/SkillMate-Lets_Trade_Talent"
              className="text-purple-400 hover:text-purple-300 transition"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
