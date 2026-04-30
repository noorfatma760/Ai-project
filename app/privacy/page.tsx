export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="text-4xl font-bold mb-6 text-white">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: October 2023</p>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information to provide better services to all our users. Information collected includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, physical address, and payment information.</li>
              <li><strong>Usage Data:</strong> Pages visited, games played, winnings, and interactios with our UI.</li>
              <li><strong>Device Information:</strong> Hardware model, OS version, and network information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
            <p className="mb-4">We use the information we collect from all of our services to provide, maintain, protect and improve them, to develop new ones, and to protect ScratchWin and our users.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p>
              We work hard to protect ScratchWin and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold. In particular we encrypt many of our services using SSL and encrypt sensitive data at rest.
            </p>
          </section>

          <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-slate-800">
            This is a mock UI template. No real data collection or backend services are attached to this specific implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
