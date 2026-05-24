        const demoButton = document.getElementById('demoIronBtn');
        if (demoButton) {
            demoButton.addEventListener('click', function (event) {
                event.preventDefault();
                alert("🙏 Tribute to Sardar Vallabhbhai Patel 🙏\n\n\"Today, India stands as one strong nation because of Patel’s iron will and diplomatic genius. He taught us that unity is the highest ideal. Jai Hind!\"\n\nExplore his life — an inspiration for generations.");
            });
        }
        // additional safety for any other '#' demo links
        const allHashLinks = document.querySelectorAll('a[href="#"]');
        allHashLinks.forEach(link => {
            if (link.id !== 'demoIronBtn') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert("✨ 'My only desire is that India should be a good producer, and no one should be unemployed.' — Sardar Patel ✨");
                });
            }
        });
