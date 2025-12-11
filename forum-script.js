// Sistema de foro básico
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
        
        // Inicializar datos
        if (!localStorage.getItem('forumUsers')) {
            this.initDefaultData();
        }
        
        // Actualizar UI
        this.updateUI();
        
        // Cargar posts
        this.loadPosts();
        
        // Cargar estadísticas
        this.updateStats();
        
        // Actualizar usuarios online
        this.updateOnlineUsers();
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
            username: "ubz",
            email: "ubz@hmfb.com",
            password: btoa("HMFB"),
            role: "admin",
            avatarColor: "#800080",
            registered: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };
        
        // Posts de ejemplo
        const examplePosts = [
            {
                id: 1,
                title: "¡Bienvenidos a HMFB Forum!",
                content: "Bienvenidos a nuestra comunidad. Este es un foro privado donde los administradores pueden crear publicaciones y los usuarios pueden ver el contenido.<br><br>Características:<br>• Sistema de login<br>• Roles de usuario (admin/user)<br>• Posts con categorías<br>• Interfaz moderna y responsive<br>• Panel de estadísticas",
                author: "ubz",
                authorRole: "admin",
                category: "announcements",
                timestamp: new Date().toISOString(),
                likes: 10,
                comments: 3
            },
            {
                id: 2,
                title: "Cómo usar el foro",
                content: "Instrucciones básicas:<br>1. Inicia sesión con tu usuario<br>2. Explora las publicaciones existentes<br>3. Solo administradores pueden crear nuevos posts<br>4. Los usuarios pueden ver todo el contenido",
                author: "ubz",
                authorRole: "admin",
                category: "general",
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
                likes: 5,
                comments: 1
            },
            {
                id: 3,
                title: "Reglas del foro",
                content: "Por favor, sigue estas reglas:<br>• Respeta a todos los miembros<br>• No compartas contenido inapropiado<br>• Mantén las discusiones en el tema correspondiente<br>• Reporta cualquier problema a los administradores",
                author: "ubz",
                authorRole: "admin",
                category: "announcements",
                timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
                likes: 8,
                comments: 0
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
        const guestControls = document.getElementById('guestControls');
        
        if (userControls && guestControls) {
            guestControls.style.display = 'none';
            userControls.style.display = 'flex';
            
            // Actualizar nombre con badge
            const usernameDisplay = document.getElementById('usernameDisplay');
            if (usernameDisplay) {
                if (session.role === 'admin') {
                    usernameDisplay.innerHTML = `
                        <span style="color: #800080; font-weight: bold;">👑 ${session.username}</span>
                        <span style="background: #800080; color: gold; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 5px;">ADMIN</span>
                    `;
                } else {
                    usernameDisplay.innerHTML = `
                        <span style="color: #00ffff;">👤 ${session.username}</span>
                        <span style="background: #008080; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 5px;">USER</span>
                    `;
                }
            }
        }
    }
    
    loadPosts() {
        const postsContainer = document.getElementById('postsList');
        if (!postsContainer) return;
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                    <h3 style="color: #888; margin-bottom: 10px;">No hay publicaciones todavía</h3>
                    <p style="color: #666;">Los administradores pueden crear nuevas publicaciones</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        posts.forEach(post => {
            const date = new Date(post.timestamp);
            const timeAgo = this.getTimeAgo(date);
            
            // Determinar color según el rol del autor
            const authorColor = post.authorRole === 'admin' ? '#800080' : '#00ffff';
            
            // Determinar icono de categoría
            let categoryIcon = '📝';
            switch(post.category) {
                case 'announcements': categoryIcon = '📢'; break;
                case 'general': categoryIcon = '💬'; break;
                case 'media': categoryIcon = '🖼️'; break;
                default: categoryIcon = '📝';
            }
            
            html += `
                <div class="post">
                    <div class="post-header">
                        <div class="post-author">
                            <div class="user-avatar" style="background: ${authorColor}; border: ${post.authorRole === 'admin' ? '2px solid gold' : '2px solid #00ffff'}">
                                ${post.author.charAt(0).toUpperCase()}
                            </div>
                            <div class="author-info">
                                <strong style="color: ${authorColor};">
                                    ${post.authorRole === 'admin' ? '👑 ' : '👤 '}${post.author}
                                    ${post.authorRole === 'admin' ? '<span style="color: gold; font-size: 12px; margin-left: 5px;">(Admin)</span>' : ''}
                                </strong>
                                <div style="color: #888; font-size: 12px;">${timeAgo}</div>
                            </div>
                        </div>
                        <div class="post-date">
                            ${date.toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                    
                    <h3>${post.title}</h3>
                    
                    <div class="post-content">${post.content}</div>
                    
                    <div class="post-footer">
                        <div class="post-category">
                            ${categoryIcon} ${this.getCategoryName(post.category)}
                        </div>
                        <div class="post-stats">
                            <span>👍 ${post.likes || 0}</span>
                            <span>💬 ${post.comments || 0}</span>
                            <span>👁️ ${Math.floor(Math.random() * 50) + 10}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        postsContainer.innerHTML = html;
    }
    
    getCategoryName(category) {
        const categories = {
            'announcements': 'Anuncios',
            'general': 'General',
            'media': 'Multimedia',
            'support': 'Soporte'
        };
        return categories[category] || 'General';
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
            return 'Ahora mismo';
        }
    }
    
    updateStats() {
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        
        const postsCount = document.getElementById('postsCount');
        const usersCount = document.getElementById('usersCount');
        
        if (postsCount) postsCount.textContent = posts.length;
        if (usersCount) usersCount.textContent = users.length;
    }
    
    updateOnlineUsers() {
        const onlineUsersDiv = document.getElementById('onlineUsers');
        if (!onlineUsersDiv) return;
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const session = this.getCurrentSession();
        
        // Actualizar lastSeen del usuario actual
        if (session) {
            const userIndex = users.findIndex(u => u.id === session.userId);
            if (userIndex !== -1) {
                users[userIndex].lastSeen = new Date().toISOString();
                localStorage.setItem('forumUsers', JSON.stringify(users));
            }
        }
        
        // Contar usuarios "online" (vistos en los últimos 15 minutos)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const onlineUsers = users.filter(user => 
            new Date(user.lastSeen) > fifteenMinutesAgo
        );
        
        let onlineHTML = '';
        onlineUsers.forEach(user => {
            const isAdmin = user.role === 'admin';
            onlineHTML += `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #4CAF50;"></div>
                    <span style="color: ${isAdmin ? '#800080' : '#b4b4b4'}; font-size: 13px;">
                        ${isAdmin ? '👑 ' : '👤 '}${user.username}
                    </span>
                </div>
            `;
        });
        
        onlineUsersDiv.innerHTML = onlineHTML || '<div style="color: #888;">No hay usuarios online</div>';
    }
}

// Inicializar foro cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que todo cargue
    setTimeout(() => {
        window.forum = new HMFBForum();
    }, 500);
});
