
"use strict";

/* ============================================================
   UTILITY: Safe element selector (no throws)
   ============================================================ */

function qs(selector, ctx) {
    return (ctx || document).querySelector(selector);
}

function qsAll(selector, ctx) {
    return (ctx || document).querySelectorAll(selector);
}


/* ============================================================
   1. NAVBAR — scroll-aware visibility, 850ms morphing ribbon,
      & footer-triggered left-collapse animation
   ============================================================ */

(function initNavbar() {

    const navbar      = qs(".navbar");
    const heroEl      = qs(".hero");
    const heroLogo    = qs("#hero-logo");
    const footerEl    = qs("#footer");

    if (!navbar) return;

    let inHeroZone    = true;
    let inFooterZone  = false;

    /* ─── Hero-zone logic ─── */
    function updateNavbar() {
        const heroHeight      = heroEl ? heroEl.offsetHeight : 800;
        const scrollY         = window.scrollY;
        const scrollThreshold = heroHeight * 0.65;

        if (scrollY < scrollThreshold) {
            inHeroZone = true;
            navbar.classList.add("hero-zone");
            navbar.classList.remove("scrolled");
            if (heroLogo) heroLogo.classList.remove("hidden");

            // Close expanded menu if user scrolls back into upper hero section
            if (navbar.classList.contains("menu-expanded")) {
                navbar.classList.remove("menu-expanded");
                const backdrop = qs("#nav-backdrop");
                if (backdrop) backdrop.classList.remove("active");
                document.body.classList.remove("menu-open");
                const menuBtnLabel = qs(".menu-btn-label");
                if (menuBtnLabel) menuBtnLabel.textContent = "MENU";
            }
        } else {
            inHeroZone = false;
            navbar.classList.remove("hero-zone");
            navbar.classList.add("scrolled");
            if (heroLogo) heroLogo.classList.add("hidden");
        }
    }

    window.addEventListener("scroll", updateNavbar, { passive: true });
    updateNavbar(); // initial call

    /* ─── Footer-zone logic via IntersectionObserver ─── */
    if (!footerEl) return;

    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Footer entered viewport — collapse navbar to menu-only pill
                inFooterZone = true;
                navbar.classList.add("footer-collapsed");

                // Close expanded menu if open
                if (navbar.classList.contains("menu-expanded")) {
                    navbar.classList.remove("menu-expanded");
                    const backdrop = qs("#nav-backdrop");
                    if (backdrop) backdrop.classList.remove("active");
                    document.body.classList.remove("menu-open");
                    const menuBtnLabel = qs(".menu-btn-label");
                    if (menuBtnLabel) menuBtnLabel.textContent = "MENU";
                    const menuPanel = qs("#nav-menu-panel");
                    if (menuPanel) menuPanel.setAttribute("aria-hidden", "true");
                    const menuBtn = qs("#nav-menu-btn");
                    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
                }
            } else {
                // Footer left viewport — restore full-width navbar
                inFooterZone = false;
                navbar.classList.remove("footer-collapsed");
            }
        });
    }, {
        // Trigger when the very top edge of the footer enters viewport
        threshold: 0,
        rootMargin: "0px 0px 0px 0px"
    });

    footerObserver.observe(footerEl);

})();


/* ============================================================
   1B. EXPANDING PILL CONTAINER MENU INTERACTION
   ============================================================ */

(function initExpandingMenu() {

    const navbar       = qs("#navbar");
    const menuBtn      = qs("#nav-menu-btn");
    const menuBtnLabel = qs(".menu-btn-label");
    const menuPanel    = qs("#nav-menu-panel");
    const navLinks     = qsAll(".menu-nav-link");
    const footerEl     = qs("#footer");

    if (!navbar || !menuBtn) return;

    // Create backdrop overlay for clicking outside
    let backdrop = qs("#nav-backdrop");
    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "nav-backdrop";
        backdrop.className = "nav-backdrop";
        document.body.appendChild(backdrop);
    }

    // Check whether footer is currently visible
    function isFooterVisible() {
        if (!footerEl) return false;
        const rect = footerEl.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    function openMenu() {
        // Temporarily lift footer-collapsed so menu can expand from full-width center
        navbar.classList.remove("footer-collapsed");
        navbar.classList.add("menu-expanded");
        backdrop.classList.add("active");
        menuBtn.setAttribute("aria-expanded", "true");
        if (menuPanel) menuPanel.setAttribute("aria-hidden", "false");
        document.body.classList.add("menu-open");

        if (menuBtnLabel) {
            menuBtnLabel.style.opacity = "0";
            setTimeout(() => {
                menuBtnLabel.textContent = "CLOSE";
                menuBtnLabel.style.opacity = "1";
            }, 120);
        }
    }

    function closeMenu() {
        navbar.classList.remove("menu-expanded");
        backdrop.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
        if (menuPanel) menuPanel.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-open");

        // Re-apply footer-collapsed if footer is still in view
        if (isFooterVisible()) {
            navbar.classList.add("footer-collapsed");
        }

        if (menuBtnLabel) {
            menuBtnLabel.style.opacity = "0";
            setTimeout(() => {
                menuBtnLabel.textContent = "MENU";
                menuBtnLabel.style.opacity = "1";
            }, 120);
        }
    }

    function toggleMenu() {
        if (navbar.classList.contains("menu-expanded")) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // Toggle menu on button click
    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close when clicking outside on backdrop
    backdrop.addEventListener("click", () => {
        closeMenu();
    });

    // Close when clicking links
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            closeMenu();
        });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navbar.classList.contains("menu-expanded")) {
            closeMenu();
        }
    });

})();


/* ============================================================
   2. SMOOTH SCROLL — anchor links
   ============================================================ */

(function initSmoothScroll() {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const target = qs(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }

        });

    });

})();


/* ============================================================
   3. SIDEBAR NAV — active state on scroll
   ============================================================ */

(function initSidebarNav() {

    const sidebarItems = qsAll(".sidebar li");
    const sections = {
        home:     qs("#home"),
        work:     qs("#work"),
        services: qs("#services"),
        process:  qs("#process"),
        about:    qs("#about"),
        contact:  qs("#contact")
    };

    // Click: set active & scroll to section
    sidebarItems.forEach(item => {

        item.addEventListener("click", () => {

            const target = sections[item.dataset.section];
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            sidebarItems.forEach(li => li.classList.remove("active"));
            item.classList.add("active");

        });

    });

    // Scroll: update active sidebar item (class only — bullet via CSS ::before)
    function updateSidebarOnScroll() {

        const scrollY = window.scrollY + window.innerHeight / 3;

        let current = "home";

        for (const [id, el] of Object.entries(sections)) {
            if (el && el.offsetTop <= scrollY) {
                current = id;
            }
        }

        sidebarItems.forEach(li => {
            li.classList.toggle("active", li.dataset.section === current);
        });

    }

    window.addEventListener("scroll", updateSidebarOnScroll, { passive: true });

})();


/* ============================================================
   4. HERO — fade in on load, parallax background, arrow anim
   ============================================================ */

(function initHero() {

    const heroContent = qs(".hero-content");
    const sidebar     = qs(".sidebar");

    // Fade in on load
    window.addEventListener("load", () => {

        if (heroContent) {
            heroContent.style.opacity = "0";
            heroContent.style.transform = "translate(-20%, -45%)";

            setTimeout(() => {
                heroContent.style.transition = "all 1.2s cubic-bezier(.16,.84,.44,1)";
                heroContent.style.opacity = "1";
                heroContent.style.transform = "translate(-20%, -50%)";
            }, 200);
        }

        if (sidebar) {
            sidebar.style.opacity = "0";
            setTimeout(() => {
                sidebar.style.transition = "opacity 1s ease";
                sidebar.style.opacity = "1";
            }, 400);
        }

    });

    // Parallax background on mousemove
    const hero = qs(".hero");
    if (hero) {
        hero.addEventListener("mousemove", (e) => {
            const x = (window.innerWidth  / 2 - e.clientX) / 90;
            const y = (window.innerHeight / 2 - e.clientY) / 90;
            hero.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
        });
    }

    // Scroll arrow bounce animation
    const scrollArrow = qs(".scroll-arrow");
    if (scrollArrow) {
        setInterval(() => {
            scrollArrow.animate(
                [
                    { transform: "translateY(0px)" },
                    { transform: "translateY(8px)" },
                    { transform: "translateY(0px)" }
                ],
                { duration: 1500, iterations: 1 }
            );
        }, 1500);
    }

    // Hero button hover (VIEW OUR WORK, LET'S TALK)
    const heroBtns = qsAll(".work-btn, .hero-talk-btn a");
    heroBtns.forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            btn.style.transform   = "translateX(6px)";
            btn.style.transition  = ".3s ease";
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "translateX(0px)";
        });
    });

    // Hero social hover
    qsAll(".hero-social-icons a").forEach(icon => {
        icon.addEventListener("mouseenter", () => { icon.style.transform = "translateY(-3px)"; });
        icon.addEventListener("mouseleave", () => { icon.style.transform = "translateY(0px)";  });
    });

})();


/* ============================================================
   5. WORK SECTION — filter tabs, card reveal, card hover
   ============================================================ */

(function initWork() {

    // Filter active state
    const filterButtons = qsAll(".filters button");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Project cards scroll-reveal
    const projectCards = qsAll(".project-card");

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.15 });

    projectCards.forEach(card => {
        cardObserver.observe(card);
    });

    // Smooth header/content/filter fade-in on load
    window.addEventListener("load", () => {

        const workContent = qs(".top-content");
        const filters     = qs(".filters");

        if (workContent) {
            workContent.style.opacity  = "0";
            workContent.style.transform = "translateY(30px)";
            setTimeout(() => {
                workContent.style.transition = "all 1s ease";
                workContent.style.opacity    = "1";
                workContent.style.transform  = "translateY(0)";
            }, 300);
        }

        if (filters) {
            filters.style.opacity  = "0";
            filters.style.transform = "translateY(20px)";
            setTimeout(() => {
                filters.style.transition = "all 1s ease";
                filters.style.opacity    = "1";
                filters.style.transform  = "translateY(0)";
            }, 500);
        }

    });

})();


/* ============================================================
   6. SERVICES SECTION — card hover arrows, fade-in reveal
   ============================================================ */

(function initServices() {

    // Fade-in reveal for service cards using IntersectionObserver
    const serviceCards = qsAll(".service-card");

    const svcObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity   = "1";
                    entry.target.style.transform = "translateY(0)";
                }, idx * 80);
                svcObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    serviceCards.forEach(card => {
        card.style.opacity   = "0";
        card.style.transform = "translateY(25px)";
        card.style.transition = "all 0.8s cubic-bezier(.22,.61,.36,1)";
        svcObserver.observe(card);
    });

    // Arrow micro-animation on service cards
    qsAll(".card-arrow").forEach(arrow => {
        const icon = arrow.querySelector("i");
        if (!icon) return;
        arrow.addEventListener("mouseenter", () => { icon.style.transform = "translateX(6px)"; });
        arrow.addEventListener("mouseleave", () => { icon.style.transform = "translateX(0px)"; });
    });

})();


/* ============================================================
   7. PROCESS SECTION — scroll reveal, hover, click select,
      arrow interaction, stagger delay
   ============================================================ */

(function initProcess() {

    const revealEls = qsAll(
        ".process-label, .process-heading, .process-description, .process-item"
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.12 });

    revealEls.forEach(el => revealObserver.observe(el));

    // Stagger delay on process items
    const processItems = qsAll(".process-item");

    processItems.forEach((item, idx) => {
        item.style.transitionDelay = `${idx * 0.12}s`;
    });

    // Hover: hovered class
    processItems.forEach(item => {
        item.addEventListener("mouseenter", () => item.classList.add("hovered"));
        item.addEventListener("mouseleave", () => item.classList.remove("hovered"));
    });

    // Click: selected class
    processItems.forEach(item => {
        item.addEventListener("click", () => {
            processItems.forEach(r => r.classList.remove("selected"));
            item.classList.add("selected");
        });
    });

    // Arrow micro-interaction
    qsAll(".process-arrow").forEach(arrow => {
        arrow.addEventListener("mouseenter", () => { arrow.style.transform = "translateX(10px)"; });
        arrow.addEventListener("mouseleave", () => { arrow.style.transform = "translateX(0px)";  });
    });

    // Subtle parallax on heading
    const processHeading = qs(".process-heading");
    window.addEventListener("scroll", () => {
        if (processHeading) {
            const scrollValue = window.scrollY;
            processHeading.style.transform = `translateY(${scrollValue * 0.02}px)`;
        }
    }, { passive: true });

})();


/* ============================================================
   8. ABOUT SECTION — navbar blur, team hover, work btn hover
   ============================================================ */

(function initAbout() {

    // Navbar blur on scroll (already handled in initNavbar)

    // Team cards hover
    qsAll(".team-card").forEach(card => {
        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-6px)";
            card.style.transition = "all .4s ease";
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0px)";
        });
    });

    // About work button hover
    const aboutWorkBtn = qs("#about-work-btn");
    if (aboutWorkBtn) {
        const icon = aboutWorkBtn.querySelector("i");
        if (icon) {
            aboutWorkBtn.addEventListener("mouseenter", () => {
                icon.style.transform = "translateX(8px)";
                icon.style.transition = ".3s ease";
            });
            aboutWorkBtn.addEventListener("mouseleave", () => {
                icon.style.transform = "translateX(0px)";
            });
        }
    }

})();


/* ============================================================
   9. CONTACT SECTION — form validation, info card hover
   ============================================================ */

(function initContact() {

    // Contact form submission
    const form = qs("#contact-form");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name    = qs("#contact-name")?.value.trim();
            const email   = qs("#contact-email-field")?.value.trim();
            const message = qs("#contact-message")?.value.trim();

            if (!name || !email || !message) {
                alert("Please fill all required fields.");
                return;
            }

            alert("Message Sent Successfully!");
            form.reset();
        });
    }

    // Info card hover
    qsAll(".info-card").forEach(card => {
        card.addEventListener("mouseenter", () => { card.style.transform = "translateY(-6px)"; });
        card.addEventListener("mouseleave", () => { card.style.transform = "translateY(0)";    });
    });

    // Contact socials hover
    qsAll(".contact-socials a").forEach(icon => {
        icon.addEventListener("mouseenter", () => { icon.style.transform = "translateY(-4px)"; });
        icon.addEventListener("mouseleave", () => { icon.style.transform = "translateY(0)";    });
    });

    // Send button hover
    const sendBtn = qs(".send-btn");
    if (sendBtn) {
        sendBtn.addEventListener("mouseenter", () => { sendBtn.style.transform = "translateX(8px)"; });
        sendBtn.addEventListener("mouseleave", () => { sendBtn.style.transform = "translateX(0)";   });
    }

})();


/* ============================================================
   10. FOOTER — back-to-top, newsletter, CTA hover, social hover
   ============================================================ */

(function initFooter() {

    // Back to top
    const backBtn = qs("#back-top-btn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Newsletter form
    const newsletterForm = qs("#newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = qs("#newsletter-email");
            const email = emailInput?.value.trim() || "";

            if (!email) {
                alert("Please enter your email.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            alert("Thank you for subscribing!");
            if (emailInput) emailInput.value = "";
        });
    }

    // CTA hover
    const cta = qs("#footer-cta");
    if (cta) {
        cta.addEventListener("mouseenter", () => { cta.style.transform = "translateX(8px)"; });
        cta.addEventListener("mouseleave", () => { cta.style.transform = "translateX(0)";   });
    }

    // Footer social links hover
    qsAll(".footer-social-links a").forEach(link => {
        link.addEventListener("mouseenter", () => { link.style.transform = "translateY(-4px)"; });
        link.addEventListener("mouseleave", () => { link.style.transform = "translateY(0)";    });
    });

    // Footer column links hover
    qsAll(".footer-column a").forEach(link => {
        link.addEventListener("mouseenter", () => { link.style.opacity = "0.6"; });
        link.addEventListener("mouseleave", () => { link.style.opacity = "1";   });
    });

})();
