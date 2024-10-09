const btn = document.getElementById('button');
const sectionAll = document.querySelectorAll('section[id]');
const flagsElement = document.getElementById('flags');
const textsToChange = document.querySelectorAll('[data-section]');

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

/*===== Cambio de idioma =====*/
const changeLanguage = async (language) => {
    try {
        const requestJson = await fetch(`./languages/${language}.json`);
        const texts = await requestJson.json();

        // Verificar que los textos fueron cargados correctamente
        if (!texts) {
            console.error(`No se pudo cargar el archivo de idioma: ${language}`);
            return;
        }
    
        for (const textToChange of textsToChange) {
            const section = textToChange.dataset.section;
            const value = textToChange.dataset.value;

            // Verificar si existe el texto correspondiente en el JSON
            if (texts[section] && texts[section][value]) {
                textToChange.innerHTML = texts[section][value];
            } else {
                // Si el texto no existe en el JSON, mostrar un mensaje de error en la consola
                textToChange.innerHTML = "Texto no disponible";
                console.error(`Texto no encontrado para la sección ${section} y valor ${value} en ${language}.json`);
            }
        }

        // Guardar el idioma seleccionado en localStorage
        localStorage.setItem('language', language);
    } catch (error) {
        console.error('Error cargando el archivo de idioma:', error);
    }
};

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
