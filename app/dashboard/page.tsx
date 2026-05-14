useEffect(() => {
  const storedBalance = localStorage.getItem('demo_balance');
  if (storedBalance) setBalance(Number(storedBalance));

  import('@/lib/firebase').then(({ auth }) => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserEmail(user.email || '');

          const rCode = user.uid;
          setRefCode(rCode);
          setRefLink(
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth?ref=${rCode}`
              : `https://example.com/auth?ref=${rCode}`
          );

          import('firebase/firestore').then(({ doc, getDoc }) => {
            import('@/lib/firebase').then(({ db }) => {
              getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
                if (docSnap.exists()) {
                  setUserName(docSnap.data().name || user.email?.split('@')[0]);
                  setRefEarnings(docSnap.data().referralEarnings || 0);
                  setRefCount(
                    docSnap.data().referralEarnings
                      ? Math.floor(docSnap.data().referralEarnings / 10)
                      : 0
                  );
                } else {
                  setUserName(user.email?.split('@')[0] || '');
                }
                setAuthLoading(false);
              });
            });
          });
        } else {
          router.push('/auth');
        }
      });
    });
  });

  const lastShareDate = localStorage.getItem('demo_share_date');
  const today = new Date().toDateString();

  if (lastShareDate !== today) {
    localStorage.setItem('demo_share_date', today);
    localStorage.setItem('demo_share_count_today', '0');
    setShareCountToday(0);
  } else {
    setShareCountToday(Number(localStorage.getItem('demo_share_count_today') || 0));
  }

  const cardTypesList = [
    { id: 'rs10', name: 'Bronze' },
    { id: 'rs20', name: 'Silver' },
    { id: 'rs50', name: 'Gold' },
    { id: 'rs100', name: 'Platinum' },
    { id: 'free', name: 'Free Card' }
  ];

  let loadedCards: { type: string; id: string; quantity: number }[] = [];

  cardTypesList.forEach((ct) => {
    const q = localStorage.getItem('demo_card_' + ct.id);
    if (q && Number(q) > 0) {
      loadedCards.push({ type: ct.name, id: ct.id, quantity: Number(q) });
    }
  });

  setMyCards(loadedCards);

  const checkTimer = () => {
    const lastClaim = localStorage.getItem('demo_free_claim_date');
    const customAdminHours = Number(
      localStorage.getItem('admin_free_card_timer') || '24'
    );

    if (lastClaim) {
      const timePassed = Date.now() - parseInt(lastClaim);
      const cooldownMs = customAdminHours * 60 * 60 * 1000;

      if (timePassed < cooldownMs) {
        setFreeTimeLeft(cooldownMs - timePassed);
      } else {
        setFreeTimeLeft(0);
      }
    } else {
      setFreeTimeLeft(0);
    }
  };

  checkTimer();
  const interval = setInterval(checkTimer, 1000);

  return () => clearInterval(interval);
}, [router]);
