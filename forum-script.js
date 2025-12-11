// Sistema de foro HMFB
class HMFBForum {
    constructor() {
        this.init();
    }
    
    init() {
        // Verificar sesión
        const session = this.getCurrentSession();
        if (!session) {
            console.log("No hay sesión activa");
            return;
        }
        
        console.log("Inicializando foro para:", session.username);
        
        // Inicializar datos si no existen
        if (!localStorage.getItem('forumUsers')) {
            this.initDefaultData();
        }
        
        // Actualizar UI
        this.updateUI();
        
        // Cargar posts
        this.loadPosts();
        
        // Cargar estadísticas
        this.updateStats();
    }
    
    getCurrentSession() {
        try {
            return JSON.parse(localStorage.getItem('currentSession'));
        } catch (e) {
            return null;
        }
    }
    
    initDefaultData() {
        // Usuario admin por defecto
        const adminUser = {
            id: 1,
            ign: "UBZ_MASTER",
            username: "ubz",
            pin: "2025",
            email: "ubz@hmfb.com",
            role: "admin",
            avatarColor: "#800080",
            registered: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            isBanned: false,
            banReason: "",
            postsCount: 3
        };
        
        // Posts de ejemplo
        const examplePosts = [
            {
                id: 1,
                title: "¡Bienvenidos a HMFB Forum!",
                content: "Bienvenidos a nuestra comunidad. <br><br><strong>Nuevas características:</strong><br>• Todos pueden crear publicaciones<br>• Sistema de IGN y PIN de 4 dígitos<br>• Filtro por categorías<br>• Panel de Staff para moderación<br>• Roles: Admin, Staff, User<br><br>¡Disfruten el foro!",
                author: "ubz",
                authorIGN: "UBZ_MASTER",
                authorRole: "admin",
                category: "announcements",
                timestamp: new Date().toISOString(),
                likes: 15,
                comments: 5,
                views: 120
            },
            {
                id: 2,
                title: "Cómo crear publicaciones",
                content: "Instrucciones para crear posts:<br>1. Haz clic en 'Crear Post' en la barra superior<br>2. Escribe un título atractivo<br>3. Selecciona una categoría<br>4. Escribe tu contenido<br>5. Publica y comparte con la comunidad<br><br>¡Todos pueden participar!",
                author: "ubz",
                authorIGN: "UBZ_MASTER",
                authorRole: "admin",
                category: "general",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                likes: 8,
                comments: 3,
                views: 85
            },
            {
                id: 3,
                title: "Reglas del foro",
                content: "<strong>Reglas básicas:</strong><br>1. Respetar a todos los miembros<br>2. No spam ni publicidad no autorizada<br>3. Mantener contenido apropiado<br>4. Reportar problemas al staff<br>5. No compartir información personal<br><br>El incumplimiento puede resultar en ban.",
                author: "ubz",
                authorIGN: "UBZ_MASTER",
                authorRole: "admin",
                category: "announcements",
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                likes: 12,
                comments: 2,
                views: 95
            },
            {
                id: 4,
                title: "Evento semanal de clanes",
                content: "¡Nuevo evento de clanes cada sábado!<br><br><strong>Premios:</strong><br>🥇 1er lugar: 5000 gemas<br>🥈 2do lugar: 3000 gemas<br>🥉 3er lugar: 1000 gemas<br><br>Regístrate en el canal #eventos.",
                author: "ubz",
                authorIGN: "UBZ_MASTER",
                authorRole: "admin",
                category: "events",
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                likes: 25,
                comments: 8,
                views: 150
            }
        ];
        
        localStorage.setItem('forumUsers', JSON.stringify([adminUser]));
        localStorage.setItem('forumPosts', JSON.stringify(examplePosts));
    }
    
    updateUI() {
        const session = this.getCurrentSession();
        if (!session) return;
        
        // Actualizar controles de usuario
        const userControls = document.getElementById('userControls');
        
        if (userControls) {
            userControls.style.display = 'flex';
            
            // Actualizar información de usuario
            const usernameDisplay = document.getElementById('usernameDisplay');
            const roleDisplay = document.getElementById('roleDisplay');
            const staffPanelBtn = document.getElementById('staffPanelBtn');
            
            if (usernameDisplay) {
                usernameDisplay.textContent = `${session.ign} (${session.username})`;
            }
            
            if (roleDisplay) {
                roleDisplay.textContent = session.role.toUpperCase();
                roleDisplay.className = 'role-badge ' + session.role + '-badge';
            }
            
            // Mostrar botón de staff panel solo para admin/staff
            if (staffPanelBtn && (session.role === 'admin' || session.role === 'staff')) {
                staffPanelBtn.style.display = 'block';
            }
        }
    }
    
    loadPosts() {
        const postsContainer = document.getElementById('postsList');
        if (!postsContainer) return;
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        
        // Obtener categoría actual desde variable global
        const currentCategory = window.currentCategory || 'all';
        
        // Filtrar posts por categoría
        let filteredPosts = posts;
        if (currentCategory !== 'all') {
            filteredPosts = posts.filter(post => post.category === currentCategory);
        }
        
        // Guardar posts globalmente para contar
        window.allPosts = posts;
        
        // Actualizar contador de posts visibles
        const visibleCount = document.getElementById('visiblePostsCount');
        if (visibleCount) {
            visibleCount.textContent = filteredPosts.length;
        }
        
        if (filteredPosts.length === 0) {
            let message = '';
            if (currentCategory === 'all') {
                message = 'No hay publicaciones todavía. ¡Sé el primero en crear una!';
            } else {
                const categoryNames = {
                    'announcements': 'Anuncios',
                    'general': 'General',
                    'media': 'Multimedia',
                    'support': 'Soporte',
                    'clans': 'Clanes',
                    'events': 'Eventos'
                };
                message = `No hay publicaciones en ${categoryNames[currentCategory] || 'esta categoría'}.`;
            }
            
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                    <h3 style="color: #888; margin-bottom: 10px;">${message}</h3>
                    ${currentCategory !== 'all' ? 
                        '<p style="color: #666;">Prueba seleccionando "Todas las Publicaciones"</p>' : 
                        '<button onclick="openCreatePostModal()" class="create-post-btn" style="margin-top: 20px;">📝 Crear Mi Primer Post</button>'
                    }
                </div>
            `;
            return;
        }
        
        let html = '';
        filteredPosts.forEach(post => {
            const date = new Date(post.timestamp);
            const timeAgo = this.getTimeAgo(date);
            
            // Determinar color según el rol del autor
            let authorColor = '#00aaaa';
            let roleText = '';
            
            switch(post.authorRole) {
                case 'admin':
                    authorColor = '#800080';
                    roleText = '👑 Admin';
                    break;
                case 'staff':
                    authorColor = '#008080';
                    roleText = '🛡️ Staff';
                    break;
                default:
                    roleText = '👤 User';
            }
            
            // Determinar icono de categoría
            let categoryIcon = '📝';
            let categoryName = 'General';
            
            switch(post.category) {
                case 'announcements': 
                    categoryIcon = '📢'; 
                    categoryName = 'Anuncios';
                    break;
                case 'general': 
                    categoryIcon = '💬'; 
                    categoryName = 'General';
                    break;
                case 'media': 
                    categoryIcon = '🖼️'; 
                    categoryName = 'Multimedia';
                    break;
                case 'support': 
                    categoryIcon = '❓'; 
                    categoryName = 'Soporte';
                    break;
                case 'clans': 
                    categoryIcon = '⚔️'; 
                    categoryName = 'Clanes';
                    break;
                case 'events': 
                    categoryIcon = '🎉'; 
                    categoryName = 'Eventos';
                    break;
            }
            
            html += `
                <div class="post" data-category="${post.category}">
                    <div class="post-header">
                        <div class="post-author">
                            <div class="user-avatar" style="background: ${authorColor};">
                                ${post.authorIGN ? post.authorIGN.charAt(0).toUpperCase() : post.author.charAt(0).toUpperCase()}
                            </div>
                            <div class="author-info">
                                <strong style="color: ${authorColor};">
                                    ${post.authorIGN || post.author}
                                    <span style="color: #888; font-size: 13px;">(@${post.author})</span>
                                </strong>
                                <div style="color: #888; font-size: 12px;">
                                    ${roleText} • ${timeAgo}
                                </div>
                            </div>
                        </div>
                        <div class="post-date">
                            ${date.toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                    
                    <h3>${post.title}</h3>
                    
                    <div class="post-content">${post.content}</div>
                    
                    <div class="post-footer">
                        <div class="post-category">
                            ${categoryIcon} ${categoryName}
                        </div>
                        <div class="post-stats">
                            <span title="Me gusta">👍 ${post.likes || 0}</span>
                            <span title="Comentarios">💬 ${post.comments || 0}</span>
                            <span title="Vistas">👁️ ${post.views || 0}</span>
                            ${post.authorRole === 'admin' ? '<span title="Publicación oficial" style="color: #800080;">👑</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        postsContainer.innerHTML = html;
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `Hace ${days} día${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else {
            return 'Hace unos segundos';
        }
    }
    
    updateStats() {
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        
        const postsCount = document.getElementById('postsCount');
        const usersCount = document.getElementById('usersCount');
        const adminsCount = document.getElementById('adminsCount');
        const staffCount = document.getElementById('staffCount');
        
        if (postsCount) postsCount.textContent = posts.length;
        if (usersCount) usersCount.textContent = users.length;
        
        // Contar administradores
        const admins = users.filter(user => user.role === 'admin');
        if (adminsCount) adminsCount.textContent = admins.length;
        
        // Contar staff (admin + staff)
        const staff = users.filter(user => user.role === 'staff' || user.role === 'admin');
        if (staffCount) staffCount.textContent = staff.length;
    }
}

// Inicializar foro cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.forum = new HMFBForum();
    }, 500);
});
