export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="text-4xl font-bold mb-6 text-white">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last updated: October 2023</p>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the ScratchWin service, you agree to be bound by these Terms. 
              If you disagree with any part of the terms then you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old (or the legal age of majority in your jurisdiction) 
              to use our platform and participate in games. By creating an account, you represent 
              and warrant that you meet this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Accounts and Security</h2>
            <p className="mb-4">
              When you create an account with us, you must provide information that is accurate, 
              complete, and current at all times. Failure to do so constitutes a breach of the Terms.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for safeguarding the password that you use.</li>
              <li>You agree not to disclose your password to any third party.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Virtual Currency & Payouts</h2>
            <p>
              Purchases of tickets are final. Any winnings generated from our provably fair algorithms 
              will be credited to your wallet balance, which can be withdrawn subject to verification checks.
            </p>
          </section>

          <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-slate-800">
            This is a mock UI template. This does not represent actual legal terms.
          </p>
        </div>
      </div>
    </div>
  );
}
