/* ════════════════════════════════════════════════
   THEME
════════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ════════════════════════════════════════════════
   CONTENT LOADER
════════════════════════════════════════════════ */
async function loadContent() {
  try {
    const res = await fetch('/data/content.yml');
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    const d = jsyaml.load(text);
    renderAll(d);
  } catch (e) {
    console.error('Could not load content.yml:', e);
    document.getElementById('hero-render').innerHTML =
      '<p style="color:var(--muted);padding:2rem;text-align:center">Content unavailable — check data/content.yml</p>';
  }
}

function renderAll(d) {
  renderHero(d.hero);
  renderAbout(d.about);
  renderSkills(d.skills);
  renderProjects(d.projects);
  renderExperience(d.experience, d.education);
  renderCertifications(d.certifications);
  renderContact(d.contact);
  renderFooter(d.hero);

  const hire = document.getElementById('nav-hire');
  if (hire) hire.href = 'mailto:' + d.contact.email;

  requestAnimationFrame(() => {
    initTypewriter(d.hero.roles);
    initScrollReveal();
    initSkillBars();
    initNavHighlight();
    initContactForm();
    fadeIn();
  });
}

/* ════════════════════════════════════════════════
   RENDER FUNCTIONS
════════════════════════════════════════════════ */

function renderHero(h) {
  const nameParts = h.name.split(' ');
  const first = nameParts[0];
  const rest  = nameParts.slice(1).join(' ');

  const photoBlock = h.photo
    ? `<div class="hero-photo-wrap"><img src="${h.photo}" alt="${h.name}" /></div>`
    : '';

  document.getElementById('hero-render').innerHTML = `
    <div class="hero-badge">
      <span class="pulse-dot"></span>
      ${h.available ? 'Available for opportunities' : 'Open to select projects'}
    </div>
    ${photoBlock}
    <h1 class="hero-name">
      <span>${first}</span>
      <span class="grad-text">${rest}</span>
    </h1>
    <p class="hero-role">
      <span class="role-prefix">I am a&nbsp;</span>
      <span id="typewriter"></span>
      <span class="cursor-blink">|</span>
    </p>
    <p class="hero-tagline">${h.tagline}</p>
    <div class="hero-btns">
      <a href="#projects" class="btn-primary">View My Work</a>
      <a href="#contact"  class="btn-ghost">Get In Touch</a>
    </div>
    <div class="hero-stats">
      ${h.stats.map((s, i) => `
        ${i > 0 ? '<div class="hstat-sep"></div>' : ''}
        <div class="hstat">
          <span class="hstat-n">${s.number}</span>
          <span class="hstat-l">${s.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAbout(a) {
  const domains = (a.domains || []).map(d => {
    const name = typeof d === 'string' ? d : d.name;
    return `<span class="dtag">${name}</span>`;
  }).join('');

  document.getElementById('about-render').innerHTML = `
    <div class="about-grid">
      <div class="about-left">
        <div class="avatar-wrap">
          <div class="avatar-ring r1"></div>
          <div class="avatar-ring r2"></div>
          <div class="avatar-core">TA</div>
        </div>
        <div class="location-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Lagos, Nigeria
        </div>
      </div>
      <div class="about-right">
        <p class="about-p">${a.bio_1.replace(/data, systems, and execution/i, '<strong>data, systems, and execution</strong>')}</p>
        <p class="about-p">${a.bio_2}</p>
        <div class="phil-row">
          <div class="phil-card"><span class="phil-icon">🪞</span><span>A mirror for organizations</span></div>
          <div class="phil-card"><span class="phil-icon">🧭</span><span>A compass for decisions</span></div>
          <div class="phil-card"><span class="phil-icon">📐</span><span>A discipline</span></div>
        </div>
        <div class="domain-row">
          <p class="domain-label">Domains & Clients</p>
          <div class="tag-row">${domains}</div>
        </div>
      </div>
    </div>
  `;
}

function renderSkills(s) {
  const bars = s.competencies.map(c => `
    <div class="bar-item reveal">
      <div class="bar-label"><span>${c.name}</span><span>${c.level}%</span></div>
      <div class="bar-track"><div class="bar-fill" data-w="${c.level}"></div></div>
    </div>
  `).join('');

  const tools = s.tools.map(t => `
    <div class="tech-card reveal">
      <div class="tech-badge ${t.color}">${t.badge}</div>
      <span class="tech-name">${t.name}</span>
      <span class="tech-lvl">${t.level}</span>
    </div>
  `).join('');

  const prof = s.professional.map(p => {
    const name = typeof p === 'string' ? p : p.name;
    return `<span class="stag">${name}</span>`;
  }).join('');

  document.getElementById('skills-render').innerHTML = `
    <div class="skills-layout">
      <div class="skills-left">
        <h3 class="skills-subtitle">Core Competencies</h3>
        <div class="bar-list">${bars}</div>
      </div>
      <div class="skills-right">
        <h3 class="skills-subtitle">Technical Stack</h3>
        <div class="tech-grid">${tools}</div>
      </div>
    </div>
    <div class="soft-row">
      <h3 class="skills-subtitle">Professional Skills</h3>
      <div class="soft-tags">${prof}</div>
    </div>
  `;
}

function renderProjects(projects) {
  const svgs = [
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  ];
  const iconCls = ['icon-hr', 'icon-sales', 'icon-store'];

  const cards = projects.map((p, i) => {
    const tools = (p.tools || []).map(t => {
      const n = typeof t === 'string' ? t : t.name;
      return `<span class="ttag">${n}</span>`;
    }).join('');

    const features = (p.features || []).map(f => {
      const text = typeof f === 'string' ? f : f.text;
      return `<li>${text}</li>`;
    }).join('');

    const imgBlock = p.image
      ? `<div class="proj-img"><img src="${p.image}" alt="${p.title}" loading="lazy" /></div>`
      : '';

    const linkBtn = p.link
      ? `<a href="${p.link}" target="_blank" rel="noopener" class="proj-link-btn">View Project →</a>`
      : '';

    return `
      <div class="proj-card ${p.featured ? 'featured' : ''} reveal">
        ${p.featured ? '<div class="proj-featured-badge">Featured</div>' : ''}
        ${imgBlock}
        <div class="proj-top">
          <div class="proj-icon ${iconCls[i % 3]}">${svgs[i % 3]}</div>
          <div class="proj-tools">${tools}</div>
        </div>
        <h3 class="proj-title">${p.title}</h3>
        <p class="proj-desc">${p.description}</p>
        <ul class="proj-features">${features}</ul>
        ${linkBtn}
      </div>
    `;
  }).join('');

  document.getElementById('projects-render').innerHTML =
    `<div class="projects-grid">${cards}</div>`;
}

function renderExperience(exp, edu) {
  const expItems = (exp || []).map((e, i) => {
    const isLast = i === exp.length - 1 && (!edu || edu.length === 0);
    const tools = (e.tools || []).map(t => {
      const n = typeof t === 'string' ? t : t.name;
      return `<span class="ttag sm">${n}</span>`;
    }).join('');
    return `
      <div class="tl-item reveal">
        <div class="tl-spine">
          <div class="tl-dot ${e.current ? 'active' : ''}"></div>
          ${!isLast ? '<div class="tl-line"></div>' : ''}
        </div>
        <div class="tl-body">
          <div class="tl-header">
            <div><h3 class="tl-role">${e.role}</h3><p class="tl-org">${e.company}</p></div>
            <div class="tl-meta"><span class="tl-date">${e.period}</span><span class="tl-loc">${e.location}</span></div>
          </div>
          <div class="tl-tools">${tools}</div>
        </div>
      </div>`;
  }).join('');

  const eduItems = (edu || []).map((e, i) => {
    const isLast = i === edu.length - 1;
    return `
      <div class="tl-item reveal">
        <div class="tl-spine">
          <div class="tl-dot edu"></div>
          ${!isLast ? '<div class="tl-line"></div>' : ''}
        </div>
        <div class="tl-body">
          <div class="tl-header">
            <div><h3 class="tl-role">${e.degree}</h3><p class="tl-org">${e.school}</p></div>
            <div class="tl-meta"><span class="tl-date">${e.period}</span><span class="tl-loc">${e.location}</span></div>
          </div>
          ${e.note ? `<p class="tl-note">${e.note}</p>` : ''}
        </div>
      </div>`;
  }).join('');

  document.getElementById('experience-render').innerHTML =
    `<div class="timeline">${expItems}${eduItems}</div>`;
}

function getCertLogo(name, issuer) {
  const text = (name + ' ' + issuer).toLowerCase();
  if (text.includes('google'))                        return 'https://logo.clearbit.com/google.com';
  if (text.includes('mckinsey'))                      return 'https://logo.clearbit.com/mckinsey.com';
  if (text.includes('macquarie') || text.includes('coursera')) return 'https://logo.clearbit.com/coursera.org';
  if (text.includes('superhuman'))                    return 'https://logo.clearbit.com/superhuman.com';
  return null;
}

function renderCertifications(certs) {
  const badgeText = (type) => ({ g:'G', xl:'XL', mk:'M', ai:'AI', pbi:'PBI', py:'Py' }[type] || type.toUpperCase());

  document.getElementById('certs-render').innerHTML = `
    <div class="cert-grid">
      ${certs.map(c => {
        const logo = c.logo || getCertLogo(c.name, c.issuer);
        return `
          <div class="cert-card reveal">
            <div class="cert-ico ${logo ? 'has-logo' : c.type}">
              ${logo
                ? `<img src="${logo}" alt="${c.issuer}" class="cert-logo-img" data-fallback="${badgeText(c.type)}" data-type="${c.type}" />`
                : badgeText(c.type)
              }
            </div>
            <div class="cert-info"><h4>${c.name}</h4><p>${c.issuer}</p></div>
            <div class="cert-tick">✓</div>
          </div>`;
      }).join('')}
    </div>`;

  // Graceful fallback if a logo fails to load
  document.querySelectorAll('.cert-logo-img').forEach(img => {
    img.addEventListener('error', () => {
      const wrap = img.parentElement;
      wrap.classList.remove('has-logo');
      wrap.classList.add(img.dataset.type);
      wrap.textContent = img.dataset.fallback;
    });
  });
}

function renderContact(c) {
  document.getElementById('contact-render').innerHTML = `
    <div class="contact-grid">
      <div class="contact-left">
        <div class="cinfo-item">
          <div class="cinfo-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          <div><p class="cinfo-label">Email</p><a href="mailto:${c.email}" class="cinfo-val">${c.email}</a></div>
        </div>
        <div class="cinfo-item">
          <div class="cinfo-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
          <div><p class="cinfo-label">WhatsApp</p><a href="https://wa.me/${c.whatsapp.replace(/\D/g,'')}" class="cinfo-val">${c.whatsapp}</a></div>
        </div>
        <div class="cinfo-item">
          <div class="cinfo-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <div><p class="cinfo-label">Location</p><span class="cinfo-val">${c.location}</span></div>
        </div>
        <div class="social-row">
          ${c.linkedin ? `<a href="${c.linkedin}" target="_blank" rel="noopener" class="soc-link" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>` : ''}
          ${c.twitter  ? `<a href="${c.twitter}"  target="_blank" rel="noopener" class="soc-link" aria-label="X / Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>` : ''}
          ${c.facebook ? `<a href="${c.facebook}" target="_blank" rel="noopener" class="soc-link" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>` : ''}
        </div>
      </div>
      <form class="contact-form" id="contactForm" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="contact" />
        <input type="hidden" name="bot-field" />
        <div class="form-row">
          <div class="form-group"><input type="text"  name="name"    placeholder="Your Name"  required class="finput" /></div>
          <div class="form-group"><input type="email" name="email"   placeholder="Your Email" required class="finput" /></div>
        </div>
        <div class="form-group"><input type="text" name="subject" placeholder="Subject" class="finput" /></div>
        <div class="form-group"><textarea name="message" placeholder="Your Message" rows="5" required class="finput ftextarea"></textarea></div>
        <div class="form-status" id="formStatus"></div>
        <button type="submit" class="btn-primary full" id="formSubmit">Send Message</button>
      </form>
    </div>`;
}

function renderFooter(hero) {
  document.getElementById('footer-name').textContent = `${hero.name} · ${hero.title}`;
  document.getElementById('footer-copy').textContent = `© ${new Date().getFullYear()} ${hero.name}. All rights reserved.`;
}

/* ════════════════════════════════════════════════
   INTERACTIONS
════════════════════════════════════════════════ */

function initNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  if (!btn) return;
  btn.addEventListener('click', () => document.body.classList.toggle('nav-open'));
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => document.body.classList.remove('nav-open'))
  );
}

function initTypewriter(rolesData) {
  const el = document.getElementById('typewriter');
  if (!el || !rolesData || !rolesData.length) return;
  const roles = rolesData.map(r => typeof r === 'string' ? r : r.title);
  let ri = 0, ci = 0, deleting = false;
  function tick() {
    const word = roles[ri];
    el.textContent = word.substring(0, deleting ? ci-- : ci++);
    let delay = deleting ? 55 : 95;
    if (!deleting && ci === word.length + 1) { delay = 1800; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 400; }
    setTimeout(tick, delay);
  }
  tick();
}

function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 70);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initSkillBars() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.w + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.bar-fill').forEach(b => obs.observe(b));
}

function initNavHighlight() {
  const links = document.querySelectorAll('.nav-links a');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.style.color = '');
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.style.color = 'var(--accent)';
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
}

function initContactForm() {
  document.addEventListener('submit', async (e) => {
    if (!e.target.matches('#contactForm')) return;
    e.preventDefault();

    const btn    = document.getElementById('formSubmit');
    const status = document.getElementById('formStatus');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = '';

    try {
      const body = new URLSearchParams(new FormData(e.target)).toString();
      const res  = await fetch('/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (res.ok) {
        status.className  = 'form-status success';
        status.textContent = '✓ Message sent! I\'ll get back to you soon.';
        e.target.reset();
      } else {
        throw new Error(res.status);
      }
    } catch {
      status.className  = 'form-status error';
      status.textContent = '✗ Something went wrong. Please email me directly.';
    } finally {
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }
  });
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function fadeIn() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  requestAnimationFrame(() => { document.body.style.opacity = '1'; });
}

/* ════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════ */
initTheme();
initNavScroll();
initHamburger();
initBackToTop();
loadContent();
