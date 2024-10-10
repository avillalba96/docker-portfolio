const btn = document.getElementById('button');
const sectionAll = document.querySelectorAll('section[id]');
const flagsElement = document.getElementById('flags');
const textsToChange = document.querySelectorAll('[data-section]');
const cvLink = document.getElementById('cv-link');
let index = 0;
const speed = 25;  // Velocidad de escritura en milisegundos
let isTyping = false;  // Bandera para evitar múltiples ejecuciones
let typewriterTimeout; // Variable para guardar el timeout de escritura

// Función para el efecto de escritura
function typewriter_bash(text) {
    const typewriterElement = document.getElementById("typewriter_bash");

    if (index < text.length) {
        typewriterElement.textContent += text.charAt(index);
        index++;
        typewriterTimeout = setTimeout(() => typewriter_bash(text), speed);
    } else {
        isTyping = false;  // Resetea la bandera cuando termina de escribir
    }
}

// Reiniciar el efecto de escritura
function resetTypewriter() {
    clearTimeout(typewriterTimeout); // Limpiar cualquier timeout previo
    index = 0; // Reiniciar el índice
    document.getElementById("typewriter_bash").textContent = ''; // Limpiar el texto
}

// Modificación en la función de cambio de idioma para reiniciar el efecto de escritura
const changeLanguage = async (language) => {
    try {
        const requestJson = await fetch(`./languages/${language}.json`);
        const texts = await requestJson.json();

        if (!texts) {
            console.error(`No se pudo cargar el archivo de idioma: ${language}`);
            return;
        }

        // Actualizar el contenido de la página según el idioma seleccionado
        for (const textToChange of textsToChange) {
            const section = textToChange.dataset.section;
            const value = textToChange.dataset.value;

            if (textToChange.tagName === "INPUT" || textToChange.tagName === "TEXTAREA") {
                textToChange.setAttribute("placeholder", texts[section][value]);
            } else {
                textToChange.innerHTML = texts[section][value];
            }
        }

        // Actualiza el enlace del CV
        if (texts.home && texts.home.cv_link) {
            cvLink.href = texts.home.cv_link;
        }

        // Reiniciar el efecto de escritura y comenzar a escribir el nuevo texto traducido
        if (texts.home && texts.home["parrafo-info"]) {
            resetTypewriter(); // Reinicia la escritura y limpia el texto previo
            isTyping = true;  // Marca que está escribiendo
            typewriter_bash(texts.home["parrafo-info"]); // Escribe el nuevo texto traducido
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

    // Cargar idioma por defecto (español si no hay otro guardado)
    const savedLanguage = localStorage.getItem('language') || 'es';
    
    // Asegúrate de que el idioma se cargue al inicio
    changeLanguage(savedLanguage).then(() => {
        console.log(`Idioma ${savedLanguage} cargado por defecto.`);
    }).catch(error => {
        console.error('Error al cargar el idioma por defecto:', error);
    });
});

/*===== Header =====*/
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('abajo', window.scrollY > 0);
});

/*===== Boton Menu =====*/
btn.addEventListener('click', function() {
    if (this.classList.contains('active')) {
        this.classList.remove('active');
        this.classList.add('not-active');
        document.querySelector('.nav_menu').classList.remove('active');
        document.querySelector('.nav_menu').classList.add('not-active');
    } else {
        this.classList.add('active');
        this.classList.remove('not-active');
        document.querySelector('.nav_menu').classList.remove('not-active');
        document.querySelector('.nav_menu').classList.add('active');
    }
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

/*===== Boton y función ir arriba =====*/
window.onscroll = function() {
    if (document.documentElement.scrollTop > 100) {
        document.querySelector('.go-top-container').classList.add('show');
    } else {
        document.querySelector('.go-top-container').classList.remove('show');
    }
};

document.querySelector('.go-top-container').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
