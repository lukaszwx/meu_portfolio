(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = document.getElementById('intro');
  const skip = document.getElementById('skip-intro');
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const seen = sessionStorage.getItem('raven-vice-intro-seen') === 'true' || new URLSearchParams(window.location.search).get('intro') === 'off';
  let timeline;
  function finishIntro() {
    if (!intro || intro.classList.contains('is-hidden')) return;
    sessionStorage.setItem('raven-vice-intro-seen', 'true');
    timeline?.kill(); intro.classList.add('is-hidden'); document.body.classList.remove('intro-open');
    setTimeout(() => { intro.hidden = true; }, 800);
  }
  if (seen || reduced || !window.gsap) { intro.hidden = true; intro.classList.add('is-hidden'); document.documentElement.classList.add('is-ready'); }
  else {
    document.body.classList.add('intro-open');
    timeline = gsap.timeline({ onComplete: finishIntro });
    timeline.to('.intro__lightning', { opacity: 1, duration: .12, ease: 'steps(1)' }, .25)
      .to('.intro__lightning', { opacity: 0, duration: .38 }, .42)
      .to('.intro__logo', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, .65)
      .to('.intro__name, .intro__city', { opacity: 1, duration: .65, stagger: .18 }, 1.35)
      .to('.intro__progress i', { width: '100%', duration: 7.2, ease: 'none' }, 0);
    skip.addEventListener('click', finishIntro);
    document.documentElement.classList.add('is-ready');
  }
  skip?.addEventListener('click', finishIntro);
  function closeMenu() { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Abrir menu'); document.body.classList.remove('menu-open'); }
  menuButton?.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu'); nav.classList.toggle('is-open',open); document.body.classList.toggle('menu-open',open); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown',e => { if(e.key==='Escape') closeMenu(); });
  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){ nav.querySelectorAll('a').forEach(a=>a.classList.toggle('is-active',a.hash===`#${entry.target.id}`)); }}),{rootMargin:'-35% 0px -55% 0px'}).observe && sections.forEach(s=>new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>a.classList.toggle('is-active',a.hash===`#${entry.target.id}`));}}),{rootMargin:'-35% 0px -55% 0px'}).observe(s));
  document.querySelectorAll('.filters button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filters button').forEach(b=>b.classList.toggle('is-active',b===button));document.querySelectorAll('[data-category]').forEach(card=>{const filter=button.dataset.filter;card.hidden=filter!=='all'&&card.dataset.category!==filter;});}));
  if (window.gsap && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.site-header .brand',{y:-16,opacity:0,duration:.85,ease:'power3.out',delay:seen?.08:2.25});
    gsap.from('.main-nav a',{y:-12,opacity:0,duration:.65,stagger:.07,ease:'power3.out',delay:seen?.12:2.35});
    gsap.from('.header-cta',{x:16,opacity:0,duration:.75,ease:'power3.out',delay:seen?.35:2.55});
    gsap.from('.hero__content>*',{y:26,opacity:0,duration:.8,stagger:.12,ease:'power3.out',delay:seen?.15:2.8});
    gsap.from('.hero__raven',{opacity:0,x:50,scale:.9,duration:1.4,ease:'power2.out',delay:seen?.2:3.1});
    gsap.utils.toArray('.section-shell').forEach(section=>gsap.from(section.querySelectorAll('.section-intro,.featured-project,.project-card,.skills__heading,.skill-cards article,.about__copy,.about__visual,.contact__copy,.contact-form'),{y:25,opacity:0,duration:.7,stagger:.1,ease:'power2.out',scrollTrigger:{trigger:section,start:'top 78%',once:true}}));
    gsap.to('.hero__backdrop',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  }
})();
