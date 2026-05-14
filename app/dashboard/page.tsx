useEffect(() => {
  let interval: NodeJS.Timeout;

  const init = async () => {
    // 1. Local storage fast load
    const storedBalance = localStorage.getItem('demo_balance');
    if (storedBalance) setBalance(Number(storedBalance));

    const lastShareDate = localStorage.getItem('demo_share_date');
    const today = new Date().toDateString();

    if (lastShareDate !== today) {
      localStorage.setItem('demo_share_date', today);
      localStorage.setItem('demo_share_count_today', '0');
      setShareCountToday(0);
    } else {
      setShareCountToday(Number(localStorage.getItem('demo_share_count_today') || 0));
    }

    // 2. Firebase lazy load (non-blocking)
    const [{ auth }, { onAuthStateChanged }, { db }, { doc, getDoc }] =
      await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth'),
        import('@/lib/firebase'),
        import('firebase/firestore'),
      ]);

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setUserEmail(user.email || '');

      const rCode = user.uid;
      setRefCode(rCode);

      setRefLink(
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth?ref=${rCode}`
          : `https://example.com/auth?ref=${rCode}`
      );

      const snap = await getDoc(doc(db, 'users', user.uid));

      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.name || user.email?.split('@')[0]);
        setRefEarnings(data.referralEarnings || 0);
        setRefCount(data.referralEarnings ? Math.floor(data.referralEarnings / 10) : 0);
      } else {
        setUserName(user.email?.split('@')[0] || '');
      }

      setAuthLoading(false);
    });

    // 3. Load cards fast (no blocking loops inside render)
    const cardTypesList = [
      { id: 'rs10', name: 'Bronze' },
      { id: 'rs20', name: 'Silver' },
      { id: 'rs50', name: 'Gold' },
      { id: 'rs100', name: 'Platinum' },
      { id: 'free', name: 'Free Card' },
    ];

    const loadedCards: { type: string; id: string; quantity: number }[] = [];

    for (const ct of cardTypesList) {
      const q = localStorage.getItem('demo_card_' + ct.id);
      if (q && Number(q) > 0) {
        loadedCards.push({
          type: ct.name,
          id: ct.id,
          quantity: Number(q),
        });
      }
    }

    setMyCards(loadedCards);

    // 4. Timer optimized
    const checkTimer = () => {
      const lastClaim = localStorage.getItem('demo_free_claim_date');
      const customAdminHours = Number(localStorage.getItem('admin_free_card_timer') || '24');

      if (!lastClaim) {
        setFreeTimeLeft(0);
        return;
      }

      const timePassed = Date.now() - Number(lastClaim);
      const cooldownMs = customAdminHours * 60 * 60 * 1000;

      setFreeTimeLeft(Math.max(0, cooldownMs - timePassed));
    };

    checkTimer();
    interval = setInterval(checkTimer, 1000);
  };

  init();

  return () => {
    if (interval) clearInterval(interval);
  };
}, [router]);
