const APP_VERSION = window.PORTFOLIO_VERSION || '2.4.0';
const SUPPORTED_LANGS = ['es', 'en'];
const DEFAULT_LANG = 'es';

const sectionAll = document.querySelectorAll('section[id]');
const textsToChange = document.querySelectorAll('[data-section]');
const cvLink = document.getElementById('cv-link');
const goTopContainer = document.querySelector('.go-top-container');
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.querySelector('.nav_menu');
const navLinks = document.querySelectorAll('.nav_menu a');
const skillsRoot = document.getElementById('skills-root');
const experienceRoot = document.getElementById('experience-root');
const langButtons = document.querySelectorAll('[data-lang]');
const terminalTitle = document.getElementById('terminal-title');
const terminalPath = document.getElementById('terminal-path');

const TYPEWRITER_CMD_SPEED = 42;
const TYPEWRITER_OUT_SPEED = 14;
let terminalTimeouts = [];
let terminalLoopToken = 0;
let currentTexts = {};
let currentLang = DEFAULT_LANG;

const SKILL_ICONS = {
    linux: 'https://skillicons.dev/icons?i=linux',
    docker: 'https://skillicons.dev/icons?i=docker',
    kubernetes: 'https://skillicons.dev/icons?i=kubernetes',
    terraform: 'https://skillicons.dev/icons?i=terraform',
    jenkins: 'https://skillicons.dev/icons?i=jenkins',
    githubactions: 'https://skillicons.dev/icons?i=githubactions',
    aws: 'https://skillicons.dev/icons?i=aws',
    python: 'https://skillicons.dev/icons?i=python',
    bash: 'https://skillicons.dev/icons?i=bash',
    powershell: 'https://skillicons.dev/icons?i=powershell',
    git: 'https://skillicons.dev/icons?i=git',
    ansible: 'https://skillicons.dev/icons?i=ansible',
    bitbucket: 'https://skillicons.dev/icons?i=bitbucket',
    prometheus: 'https://skillicons.dev/icons?i=prometheus',
    grafana: 'https://skillicons.dev/icons?i=grafana',
    sonarqube: 'https://cdn.simpleicons.org/sonarqube/4E9BCD',
    snyk: 'https://cdn.simpleicons.org/snyk/4C4A48',
    owasp: 'https://cdn.simpleicons.org/owasp/000000',
    wireshark: 'https://cdn.simpleicons.org/wireshark/167EFB',
    zabbix: 'https://cdn.simpleicons.org/zabbix/D40000',
    elasticsearch: 'https://cdn.simpleicons.org/elasticsearch/005571',
    graylog: 'https://cdn.simpleicons.org/graylog/FF3633',
    vmware: 'https://cdn.simpleicons.org/vmware/607078',
    proxmox: 'https://cdn.simpleicons.org/proxmox/E57000',
    cloudformation: 'https://cdn.simpleicons.org/amazonaws/FF9900',
    metasploit: 'https://cdn.simpleicons.org/metasploit/DA291C',
};

const SKILL_FA = {
    trivy: 'fa-shield-halved',
    burp: 'fa-bug',
    zap: 'fa-shield-virus',
    nmap: 'fa-sitemap',
    masscan: 'fa-radar',
    pfsense: 'fa-fire-flame-curved',
    mikrotik: 'fa-network-wired',
    cisco: 'fa-network-wired',
    iam: 'fa-user-shield',
    pentesting: 'fa-user-secret',
    ai: 'fa-robot',
    windows: 'fa-windows',
    logstash: 'fa-stream',
    hyperv: 'fa-server',
    vpn: 'fa-lock',
};

function getTranslation(texts, section, value) {
    const sectionData = texts?.[section];
    if (!sectionData || sectionData[value] === undefined) {
        return null;
    }
    return sectionData[value];
}

function updateLangSwitcher(lang) {
    langButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
        btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });
}

function clearTerminalAnimation() {
    terminalLoopToken += 1;
    terminalTimeouts.forEach((id) => clearTimeout(id));
    terminalTimeouts = [];
    const output = document.getElementById('terminal-output');
    const cursorLine = document.getElementById('terminal-cursor-line');
    if (output) {
        output.innerHTML = '';
    }
    if (cursorLine) {
        cursorLine.textContent = '';
    }
}

function terminalSleep(ms) {
    return new Promise((resolve) => {
        const id = setTimeout(resolve, ms);
        terminalTimeouts.push(id);
    });
}

async function typeIntoElement(element, text, speed) {
    element.textContent = '';
    for (let i = 0; i < text.length; i += 1) {
        element.textContent += text.charAt(i);
        await terminalSleep(speed);
    }
}

async function runTerminalScript(script, loopToken) {
    const output = document.getElementById('terminal-output');
    const cursorLine = document.getElementById('terminal-cursor-line');
    if (!output || !cursorLine || !Array.isArray(script) || !script.length) {
        return;
    }

    for (const step of script) {
        if (loopToken !== terminalLoopToken) {
            return;
        }

        if (step.kind === 'cmd') {
            await typeIntoElement(cursorLine, step.text, TYPEWRITER_CMD_SPEED);
            await terminalSleep(320);

            const line = document.createElement('div');
            line.className = 'terminal-line terminal-line--cmd';
            line.textContent = `$ ${step.text}`;
            output.appendChild(line);
            cursorLine.textContent = '';
            output.scrollTop = output.scrollHeight;
            await terminalSleep(180);
            continue;
        }

        if (step.kind === 'out') {
            const line = document.createElement('div');
            line.className = `terminal-line terminal-line--out${step.dim ? ' terminal-line--dim' : ''}`;
            output.appendChild(line);
            await typeIntoElement(line, step.text, TYPEWRITER_OUT_SPEED);
            output.scrollTop = output.scrollHeight;
            await terminalSleep(step.pause || 420);
        }
    }

    if (loopToken !== terminalLoopToken) {
        return;
    }

    await terminalSleep(2800);
    if (loopToken !== terminalLoopToken) {
        return;
    }

    output.innerHTML = '';
    cursorLine.textContent = '';
    runTerminalScript(script, loopToken);
}

function startTerminalAnimation(script) {
    clearTerminalAnimation();
    const loopToken = terminalLoopToken;
    runTerminalScript(script, loopToken);
}

function resetTypewriter() {
    clearTerminalAnimation();
}

function createFaIcon(iconKey, name) {
    const fa = document.createElement('span');
    fa.className = 'skill-fa-icon';
    fa.title = name;
    const iconClass = SKILL_FA[iconKey] || 'fa-code';
    fa.innerHTML = `<i class="fas ${iconClass}"></i>`;
    return fa;
}

function createSkillIcon(iconKey, name) {
    const wrap = document.createElement('div');
    wrap.className = 'skill-icon-wrap';

    const iconUrl = SKILL_ICONS[iconKey];
    if (iconUrl) {
        const img = document.createElement('img');
        img.src = iconUrl;
        img.alt = name;
        img.loading = 'lazy';
        img.onerror = () => {
            img.remove();
            wrap.appendChild(createFaIcon(iconKey, name));
        };
        wrap.appendChild(img);
        return wrap;
    }

    wrap.appendChild(createFaIcon(iconKey, name));
    return wrap;
}

function renderSkills(lang) {
    if (!skillsRoot) {
        return;
    }

    const groups = window.PORTFOLIO_SKILLS || [];
    skillsRoot.innerHTML = '';

    if (!groups.length) {
        skillsRoot.innerHTML = '<p class="skills-empty">Stack no disponible.</p>';
        return;
    }

    groups.forEach((group) => {
        const title = document.createElement('p');
        title.className = 'skills-group-title';
        title.textContent = group.title?.[lang] || group.title?.es || '';
        skillsRoot.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'cards_container--habilidades';

        (group.skills || []).forEach((skill) => {
            const skillName = skill.name?.[lang] || skill.name?.es || skill.icon;
            const card = document.createElement('div');
            card.className = 'cards--habilidades';
            card.appendChild(createSkillIcon(skill.icon, skillName));

            const label = document.createElement('p');
            label.textContent = skillName;
            card.appendChild(label);

            grid.appendChild(card);
        });

        skillsRoot.appendChild(grid);
    });
}

function renderExperience(experiencia) {
    if (!experienceRoot) {
        return;
    }

    experienceRoot.innerHTML = '';

    if (!experiencia?.items?.length) {
        experienceRoot.innerHTML = '<p class="experience-empty">—</p>';
        return;
    }

    experiencia.items.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'experience-card';

        const role = document.createElement('h3');
        role.className = 'experience-role';
        role.textContent = item.role;

        const meta = document.createElement('p');
        meta.className = 'experience-meta';
        const companyLabel = item.url
            ? `<a href="${item.url}" target="_blank" rel="noopener">${item.company}</a>`
            : item.company;
        meta.innerHTML = `${companyLabel} · ${item.location || ''} · <span class="experience-period">${item.period}</span>`;

        const summary = document.createElement('p');
        summary.className = 'experience-summary';
        summary.textContent = item.summary || '';

        const tags = document.createElement('div');
        tags.className = 'experience-tags';
        (item.tags || []).forEach((tag) => {
            const span = document.createElement('span');
            span.className = 'experience-tag';
            span.textContent = tag;
            tags.appendChild(span);
        });

        card.appendChild(role);
        card.appendChild(meta);
        card.appendChild(summary);
        card.appendChild(tags);
        experienceRoot.appendChild(card);
    });
}

function applyStaticTranslations(texts) {
    textsToChange.forEach((element) => {
        const section = element.dataset.section;
        const value = element.dataset.value;
        const translation = getTranslation(texts, section, value);

        if (translation === null) {
            return;
        }

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.setAttribute('placeholder', translation);
        } else if (element.tagName === 'TITLE') {
            element.textContent = translation;
        } else {
            element.innerHTML = translation;
        }
    });

    if (texts.terminal?.title && terminalTitle) {
        terminalTitle.textContent = texts.terminal.title;
    }
    if (texts.terminal?.path && terminalPath) {
        terminalPath.textContent = texts.terminal.path;
    }

    if (texts.home?.cv_link && cvLink) {
        cvLink.href = texts.home.cv_link;
    }

    if (texts.home?.['home_text-2']) {
        document.title = `${texts.home['home_text-2']} | DevSecOps`;
    }
}

async function loadLanguageFile(lang) {
    const response = await fetch(`./languages/${lang}.json?v=${APP_VERSION}`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} loading ${lang}.json`);
    }
    return response.json();
}

async function setLanguage(requestedLang) {
    let lang = SUPPORTED_LANGS.includes(requestedLang) ? requestedLang : DEFAULT_LANG;

    try {
        const texts = await loadLanguageFile(lang);
        currentTexts = texts;
        currentLang = lang;

        applyStaticTranslations(texts);
        renderSkills(lang);
        renderExperience(texts.experiencia);

        if (texts.terminal?.script?.length) {
            resetTypewriter();
            startTerminalAnimation(texts.terminal.script);
        }

        document.documentElement.lang = lang;
        updateLangSwitcher(lang);
        localStorage.setItem('language', lang);
    } catch (error) {
        console.error(`Error loading language "${lang}":`, error);

        if (lang !== DEFAULT_LANG) {
            await setLanguage(DEFAULT_LANG);
            return;
        }

        renderSkills(DEFAULT_LANG);
    }
}

window.setLanguage = setLanguage;
window.getContactAlert = (type) => {
    const key = type === 'success' ? 'alert-success' : 'alert-error';
    return currentTexts?.contacto?.[key]
        || (currentLang === 'es'
            ? (type === 'success' ? 'Mensaje enviado.' : 'Error al enviar.')
            : (type === 'success' ? 'Message sent.' : 'Send failed.'));
};

langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
    });
});

window.addEventListener('load', () => {
    const loader = document.querySelector('.container--loader');
    if (loader) {
        loader.style.opacity = 0;
        loader.style.visibility = 'hidden';
    }

    const saved = localStorage.getItem('language');
    const browserLang = (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : DEFAULT_LANG;
    const initialLang = SUPPORTED_LANGS.includes(saved) ? saved : browserLang;

    setLanguage(initialLang);
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('abajo', window.scrollY > 0);

    if (window.scrollY > 100) {
        goTopContainer.classList.add('show');
    } else {
        goTopContainer.classList.remove('show');
    }
});

goTopContainer.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sectionAll.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');
        const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);

        if (!navLink) {
            return;
        }

        if (scrollY > sectionTop && scrollY < sectionTop + sectionHeight) {
            navLink.classList.add('active');
        } else {
            navLink.classList.remove('active');
        }
    });
});

hamburgerBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});
