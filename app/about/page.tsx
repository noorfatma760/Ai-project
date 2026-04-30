export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="text-4xl font-bold mb-6 text-white text-center">About ScratchWin</h1>
        
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>
            Welcome to ScratchWin, the premier digital destination for modern scratch card games. 
            Our mission is to bring the timeless thrill of instant win tickets to the digital age, 
            combining gorgeous aesthetics with cutting-edge fairness algorithms.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">Our Vision</h2>
          <p>
            We believe that online gaming should be transparent, secure, and beautiful. 
            By leveraging advanced cryptographic techniques, we ensure that every scratch card 
            originates from a provably fair system where the outcome is verifiable and tamper-proof.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Instant Payouts:</strong> Withdraw your winnings to your wallet securely and immediately.</li>
            <li><strong>Stunning Graphics:</strong> We collaborate with top-tier designers to provide a premium feel.</li>
            <li><strong>Fairness First:</strong> Our entire system revolves around transparent probability pools.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
