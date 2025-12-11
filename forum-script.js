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
            lastLogin: new Date().toISOString()
        };
        
        // Posts de ejemplo
        const examplePosts = [
            {
                id: 1,
                title: "¡Bienvenidos a HMFB Forum!",
                content: "Bienvenidos a nuestra comunidad. Solo administradores pueden crear posts.",
                author: "ubz",
                authorRole: "admin",
                category: "announcements",
                timestamp: new Date().toISOString(),
                likes: 10
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
            
            // Actualizar nombre
            const usernameDisplay = document.getElementById('usernameDisplay');
            if (usernameDisplay) {
                usernameDisplay.textContent = session.role === 'admin' ? `[Admin] ${session.username}` : session.username;
                usernameDisplay.style.color = session.role === 'admin' ? '#800080' : '#00ffff';
            }
        }
    }
    
    loadPosts() {
        const postsContainer = document.getElementById('postsList');
        if (!postsContainer) return;
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        
        let html = '';
        posts.forEach(post => {
            const date = new Date(post.timestamp);
            
            html += `
                <div class="post">
                    <div class="post-header">
                        <div class="post-author">
                            <div class="user-avatar" style="background: ${post.authorRole === 'admin' ? '#800080' : '#00ffff'}">
                                ${post.author.charAt(0)}
                            </div>
                            <div>
                                <strong style="color: ${post.authorRole === 'admin' ? '#800080' : '#00ffff'}">
                                    ${post.authorRole === 'admin' ? '[Admin] ' : ''}${post.author}
                                </strong>
                            </div>
                        </div>
                        <div class="post-date">
                            ${date.toLocaleDateString()}
                        </div>
                    </div>
                    <h3>${post.title}</h3>
                    <div class="post-content">${post.content}</div>
                </div>
            `;
        });
        
        postsContainer.innerHTML = html || '<p style="color: #888; text-align: center;">No hay posts todavía</p>';
    }
}

// Inicializar foro cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que todo cargue
    setTimeout(() => {
        window.forum = new HMFBForum();
    }, 500);
});
