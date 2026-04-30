import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-white">Get in Touch</h1>
        <p className="text-slate-400 mb-8 text-lg">
          Have a question about a game, your account, or just want to say hi? 
          Drop us a message and our support team will get back to you within 24 hours.
        </p>

        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Mail className="w-6 h-6" /></div>
            <div>
              <p className="font-bold text-white">Email</p>
              <p className="text-slate-400">support@scratchwin.example.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Phone className="w-6 h-6" /></div>
            <div>
              <p className="font-bold text-white">Phone</p>
              <p className="text-slate-400">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><MapPin className="w-6 h-6" /></div>
            <div>
              <p className="font-bold text-white">Office</p>
              <p className="text-slate-400">123 Gaming Blvd, Neon City, CY 90210</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl">
        <form className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Your Name</label>
            <input type="text" placeholder="John Doe" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input type="email" placeholder="name@example.com" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Subject</label>
            <input type="text" placeholder="How can we help?" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Message</label>
            <textarea rows={4} placeholder="Type your message here..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500" />
          </div>
          <button type="button" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
