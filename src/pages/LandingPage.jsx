import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Upload, Share2, Sparkles, Lock, Zap, ArrowRight,
  Brain, Mail, Folder, FileSearch, Eye, Activity, Server, Globe,
} from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    description: 'Military-grade encryption secures every file before storage. Your data is protected end-to-end.',
    color: 'from-blue-500 to-cyan-500',
    iconColor: 'text-blue-400',
  },
  {
    icon: Share2,
    title: 'Secure Sharing',
    description: 'Password-protected share links with expiry dates, download limits, and QR code generation.',
    color: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-400',
  },
  {
    icon: Brain,
    title: 'AI Document Intelligence',
    description: 'Smart classification, auto-tagging, document explanation, and AI-powered semantic search.',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-400',
  },
  {
    icon: Mail,
    title: 'Email Sharing',
    description: 'Share files via email with AI-generated messages. One click to open Gmail or your mail client.',
    color: 'from-orange-500 to-red-500',
    iconColor: 'text-orange-400',
  },
  {
    icon: Eye,
    title: 'In-Browser Preview',
    description: 'Preview images, PDFs, videos, audio, and code files directly without downloading.',
    color: 'from-cyan-500 to-blue-500',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Folder,
    title: 'Smart Organization',
    description: 'Nested folders, file versioning, trash & restore, and AI-powered duplicate detection.',
    color: 'from-yellow-500 to-orange-500',
    iconColor: 'text-yellow-400',
  },
];

const stats = [
  { value: 'AES-256', label: 'Encryption Standard', icon: Lock },
  { value: '6+', label: 'AI Features', icon: Sparkles },
  { value: '∞', label: 'File Types Supported', icon: FileSearch },
  { value: '100%', label: 'Open Source', icon: Globe },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 mesh-gradient">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="animate-fade-in inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm mb-10"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI-Enhanced Secure File Sharing Platform</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.05] tracking-tight animate-slide-up">
            <span style={{ color: 'var(--text-primary)' }}>Secure Your Files.</span>
            <br />
            <span className="gradient-text">Share Smartly.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in"
            style={{ color: 'var(--text-secondary)', animationDelay: '200ms' }}>
            Upload, encrypt, and share files with AI-powered intelligence.
            Document explanation, smart tagging, email sharing, and
            enterprise-grade security — all in one platform.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-lg px-10 py-4 flex items-center gap-3 animate-pulse-glow">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-10 py-4 flex items-center gap-3">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-4 border-y" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-indigo mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything you need for <span className="gradient-text">secure file management</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              From encryption to AI analysis, every feature keeps your files safe and organized.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {features.map((feat) => (
              <div key={feat.title} className="card-glow group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} p-[1px] mb-5`}>
                  <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <feat.icon className={`w-5 h-5 ${feat.iconColor}`} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 mesh-gradient">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-green mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Three steps to <span className="gradient-text">secure sharing</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              { step: '01', icon: Upload, title: 'Upload & Encrypt', desc: 'Drop your file — it\'s instantly encrypted with AES-256 and stored securely.', color: 'text-blue-400', gradient: 'from-blue-500 to-indigo-500' },
              { step: '02', icon: Brain, title: 'AI Analyzes', desc: 'AI classifies, tags, explains your document, and provides security recommendations.', color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
              { step: '03', icon: Mail, title: 'Share Anywhere', desc: 'Generate a secure link, share via email or QR code, with custom access controls.', color: 'text-green-400', gradient: 'from-green-500 to-emerald-500' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${item.gradient} p-[1px] mx-auto mb-5`}>
                  <div className="w-full h-full rounded-3xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <item.icon className={`w-7 h-7 ${item.color} group-hover:scale-110 transition-transform`} />
                  </div>
                </div>
                <span className="text-xs font-bold tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>STEP {item.step}</span>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="badge badge-yellow mb-4">Technology</span>
          <h2 className="text-3xl font-bold mb-12" style={{ color: 'var(--text-primary)' }}>
            Built with modern <span className="gradient-text">microservices</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {[
              { name: 'Go + Gin', desc: 'Backend Services', icon: Server },
              { name: 'React + Vite', desc: 'Frontend UI', icon: Zap },
              { name: 'PostgreSQL', desc: 'Database', icon: Activity },
              { name: 'Gemini AI', desc: 'Intelligence', icon: Brain },
            ].map((tech) => (
              <div key={tech.name} className="card text-center py-5">
                <tech.icon className="w-8 h-8 mx-auto mb-3 text-indigo-400" />
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{tech.name}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 mesh-gradient">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-float mb-6">
            <Shield className="w-16 h-16 mx-auto text-indigo-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to secure your files?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Join SecureVault and experience AI-powered file management with military-grade encryption.
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-3">
              Open Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-3 animate-pulse-glow">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="font-bold gradient-text">SecureVault</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Built with Go Microservices, React & Google Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
