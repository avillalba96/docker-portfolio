const sectionAll = document.querySelectorAll('section[id]');
const flagsElement = document.getElementById('flags');
const textsToChange = document.querySelectorAll('[data-section]');
const cvLink = document.getElementById('cv-link');
const goTopContainer = document.querySelector('.go-top-container'); 
const hamburgerBtn = document.getElementById('hamburger-btn'); // Botón de hamburguesa
const navMenu = document.querySelector('.nav_menu'); // Menú de navegación
const navLinks = document.querySelectorAll('.nav_menu a'); // Seleccionar todos los enlaces del menú
let index = 0;
const speed = 25;  
let typewriterTimeout; 

// Función para el efecto de escritura
function typewriter_bash(text) {
    const typewriterElement = document.getElementById("typewriter_bash");

    if (index < text.length) {
        typewriterElement.textContent += text.charAt(index);
        index++;
        const textoBashContainer = document.querySelector('.texto_bash');
        textoBashContainer.style.height = 'auto';  
        typewriterTimeout = setTimeout(() => typewriter_bash(text), speed);
    }
}

// Reiniciar el efecto de escritura
function resetTypewriter() {
    clearTimeout(typewriterTimeout); 
    index = 0; 
    document.getElementById("typewriter_bash").textContent = ''; 
}

// Función para cambiar de idioma
const changeLanguage = async (language) => {
    try {
        const requestJson = await fetch(`./languages/${language}.json`);
        const texts = await requestJson.json();

        textsToChange.forEach(textToChange => {
            const section = textToChange.dataset.section;
            const value = textToChange.dataset.value;

            if (textToChange.tagName === "INPUT" || textToChange.tagName === "TEXTAREA") {
                textToChange.setAttribute("placeholder", texts[section][value]);
            } else {
                textToChange.innerHTML = texts[section][value];
            }
        });

        if (texts.home && texts.home.cv_link) {
            cvLink.href = texts.home.cv_link;
        }

        if (texts.home && texts.home["parrafo-info"]) {
            resetTypewriter(); 
            typewriter_bash(texts.home["parrafo-info"]);
        }

        localStorage.setItem('language', language);
    } catch (error) {
        console.error('Error cargando el archivo de idioma:', error);
    }
};

/* ===== Loader =====*/
window.addEventListener('load', () => {
    const contenedorLoader = document.querySelector('.container--loader');
    contenedorLoader.style.opacity = 0;
    contenedorLoader.style.visibility = 'hidden';

    const savedLanguage = localStorage.getItem('language') || 'es';
    changeLanguage(savedLanguage);
});

/*===== Mostrar/Ocultar el botón de "ir arriba" y el cambio de clase en el header =====*/
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('abajo', window.scrollY > 0);

    if (window.scrollY > 100) {
        goTopContainer.classList.add('show');
    } else {
        goTopContainer.classList.remove('show');
    }
});

/*===== Botón y función ir arriba =====*/
goTopContainer.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

/*===== Cambiar idioma al hacer clic en la bandera =====*/
flagsElement.addEventListener('click', (e) => {
    if (e.target.parentElement.dataset.language) {
        changeLanguage(e.target.parentElement.dataset.language);
    }
});

/*===== class active por secciones =====*/
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sectionAll.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY < sectionTop + sectionHeight) {
            document.querySelector('nav a[href*=' + sectionId + ']').classList.add('active');
        } else {
            document.querySelector('nav a[href*=' + sectionId + ']').classList.remove('active');
        }
    });
});

/*===== Mostrar/Ocultar el menú al hacer clic en el ícono de hamburguesa =====*/
hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active'); // Mostrar/Ocultar menú
});

/*===== Cerrar el menú hamburguesa después de hacer clic en un enlace =====*/
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active'); // Cerrar el menú
    });
});
