// Sistema de logging discreto
const LOGGING_SYSTEM = {
    webhookUrl: '', // Pon tu webhook aquí si quieres
    enabled: false, // Cambia a true si agregas webhook
    
    logVisit: function() {
        // Obtener información del visitante discretamente
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const visitorData = {
                    timestamp: new Date().toISOString(),
                    ip: data.ip,
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    screen: `${screen.width}x${screen.height}`,
                    referrer: document.referrer || 'direct'
                };
                
                // Guardar localmente para estadísticas
                this.saveLocalLog(visitorData);
                
                // Enviar a webhook si está configurado
                if (this.enabled && this.webhookUrl) {
                    this.sendToWebhook(visitorData);
                }
                
                console.log('[Sistema] Visita registrada discretamente');
            })
            .catch(error => {
                console.log('[Sistema] Error en logging:', error);
            });
    },
    
    saveLocalLog: function(data) {
        try {
            let logs = JSON.parse(localStorage.getItem('hmfb_visitor_logs')) || [];
            logs.push(data);
            
            // Mantener solo últimos 100 logs
            if (logs.length > 100) {
                logs = logs.slice(-100);
            }
            
            localStorage.setItem('hmfb_visitor_logs', JSON.stringify(logs));
        } catch (e) {
            // Silenciar errores
        }
    },
    
    sendToWebhook: function(data) {
        if (!this.webhookUrl) return;
        
        const embed = {
            title: '📊 Nueva Visita al Sistema',
            color: 0x0066ff,
            fields: [
                {
                    name: '🕐 Hora',
                    value: new Date().toLocaleString('es-ES'),
                    inline: true
                },
                {
                    name: '🌐 IP',
                    value: `\`${data.ip}\``,
                    inline: true
                },
                {
                    name: '🖥️ Dispositivo',
                    value: data.platform,
                    inline: true
                },
                {
                    name: '🔠 Idioma',
                    value: data.language,
                    inline: true
                },
                {
                    name: '📱 Pantalla',
                    value: data.screen,
                    inline: true
                },
                {
                    name: '🔗 Referencia',
                    value: data.referrer === 'direct' ? 'Acceso directo' : data.referrer
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'HMFB Network Security'
            }
        };
        
        fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        }).catch(() => {
            // Silenciar errores de webhook
        });
    },
    
    getStats: function() {
        try {
            const logs = JSON.parse(localStorage.getItem('hmfb_visitor_logs')) || [];
            const today = new Date().toDateString();
            const todayVisits = logs.filter(log => 
                new Date(log.timestamp).toDateString() === today
            ).length;
            
            return {
                totalVisits: logs.length,
                todayVisits: todayVisits,
                uniqueIPs: [...new Set(logs.map(log => log.ip))].length
            };
        } catch (e) {
            return { totalVisits: 0, todayVisits: 0, uniqueIPs: 0 };
        }
    }
};

// Sistema de seguridad discreto
const SECURITY_SYSTEM = {
    init: function() {
        // Detectar herramientas de desarrollador
        this.detectDevTools();
        
        // Monitorear actividad
        this.monitorActivity();
        
        // Proteger contra bots simples
        this.antiBotMeasures();
        
        console.log('[Seguridad] Sistema activado discretamente');
    },
    
    detectDevTools: function() {
        // Detección básica de DevTools (solo para logging)
        const devToolsDetected = window.Firebug || 
            (window.console && window.console.firebug) ||
            (typeof window.__firebug__ === 'object');
            
        if (devToolsDetected) {
            console.log('[Seguridad] Herramientas de desarrollo detectadas');
        }
    },
    
    monitorActivity: function() {
        // Monitorear clicks (solo para estadísticas)
        document.addEventListener('click', (e) => {
            const target = e.target.tagName.toLowerCase();
            console.log(`[Actividad] Click en: ${target}`);
        });
        
        // Monitorear teclas importantes (solo para seguridad)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                console.log('[Seguridad] Intento de guardar página bloqueado');
            }
        });
    },
    
    antiBotMeasures: function() {
        // Verificar que sea un navegador real
        const isBot = !navigator.userAgent || 
                     navigator.userAgent.includes('bot') ||
                     navigator.userAgent.includes('crawler') ||
                     navigator.userAgent.includes('spider');
        
        if (isBot) {
            console.log('[Seguridad] Bot detectado');
        }
    }
};

// Inicializar sistemas discretamente
document.addEventListener('DOMContentLoaded', function() {
    // Iniciar logging (totalmente discreto)
    LOGGING_SYSTEM.logVisit();
    
    // Iniciar sistema de seguridad
    SECURITY_SYSTEM.init();
    
    // Inicializar estadísticas si existe el panel admin
    setTimeout(() => {
        const stats = LOGGING_SYSTEM.getStats();
        console.log('[Estadísticas]', stats);
    }, 1000);
    
    // Mensaje de sistema listo
    console.log('[Sistema] HMFB Network - Sistema de auditoría operativo');
});

// Funciones auxiliares para el panel admin
function updateVisitorStats() {
    if (typeof LOGGING_SYSTEM !== 'undefined') {
        const stats = LOGGING_SYSTEM.getStats();
        
        // Actualizar estadísticas en el panel admin si existen
        const totalVisitsElement = document.getElementById('totalVisits');
        const todayVisitsElement = document.getElementById('todayVisits');
        const uniqueVisitorsElement = document.getElementById('uniqueVisitors');
        
        if (totalVisitsElement) totalVisitsElement.textContent = stats.totalVisits;
        if (todayVisitsElement) todayVisitsElement.textContent = stats.todayVisits;
        if (uniqueVisitorsElement) uniqueVisitorsElement.textContent = stats.uniqueIPs;
    }
}

// Exportar para uso en la consola (solo desarrollo)
if (typeof window !== 'undefined') {
    window.HMFB_SYSTEM = {
        stats: LOGGING_SYSTEM.getStats,
        version: '2.0.0'
    };
}
