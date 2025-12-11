// Sistema de Foro Completo
class ELKForum {
    constructor() {
        this.init();
    }
    
    init() {
        // Inicializar datos si no existen
        if (!localStorage.getItem('forumUsers')) {
            this.initializeDefaultData();
        }
        
        // Actualizar controles de usuario
        this.updateUserControls();
        
        // Cargar posts
        this.loadPosts();
        
        // Actualizar estadísticas
        this.updateStats();
        
        // Actualizar cada 30 segundos para usuarios online
        setInterval(() => this.updateOnlineUsers(), 30000);
        
        // Verificar sesión expirada cada minuto
        setInterval(() => this.checkSession(), 60000);
    }
    
    initializeDefaultData() {
        // Usuario admin por defecto
        const adminUser = {
            id: 1,
            username: "ubz",
            email: "ubz@hmfb.com",
            password: this.hashPassword("HMFB"), // Cambia esta contraseña
            role: "admin",
            avatarColor: "#800080",
            registered: new Date().toISOString(),
            lastLogin: null
        };
        
        // Posts de ejemplo
        const examplePosts = [
            {
                id: 1,
                title: "¡Bienvenidos a HMFB Forum",
                content: "Bienvenidos a nuestra comunidad. Aquí podrán compartir contenido, discutir temas y mucho más. Solo los administradores pueden crear posts para mantener la calidad del contenido.",
                author: "admin",
                authorRole: "admin",
                category: "announcements",
                image: null,
                timestamp: new Date().toISOString(),
                likes: 42,
                comments: [
                    {
                        id: 1,
                        author: "Usuario1",
                        content: "¡Excelente iniciativa!",
                        timestamp: new Date(Date.now() - 3600000).toISOString()
                    }
                ]
            },
            {
                id: 2,
                title: "Normas de la comunidad",
                content: "Por favor, lean las normas antes de participar:\n\n1. Respeto mutuo\n2. No spam\n3. Contenido apropiado\n4. Reportar problemas a los admins",
                author: "admin",
                authorRole: "admin",
                category: "announcements",
                image: null,
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                likes: 35,
                comments: []
            }
        ];
        
        // Guardar datos iniciales
        localStorage.setItem('forumUsers', JSON.stringify([adminUser]));
        localStorage.setItem('forumPosts', JSON.stringify(examplePosts));
        localStorage.setItem('onlineUsers', JSON.stringify([]));
    }
    
    hashPassword(password) {
        // Hash simple (en producción usar bcrypt)
        return btoa(password);
    }
    
    // Sistema de usuarios
    register(username, email, password) {
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        
        // Verificar si usuario ya existe
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, error: "El usuario ya existe" };
        }
        
        if (users.find(u => u.email === email)) {
            return { success: false, error: "El email ya está registrado" };
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: this.hashPassword(password),
            role: "user",
            avatarColor: this.getRandomColor(),
            registered: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(newUser);
        localStorage.setItem('forumUsers', JSON.stringify(users));
        
        return { success: true, user: newUser };
    }
    
    login(username, password) {
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const hashedPassword = this.hashPassword(password);
        
        const user = users.find(u => 
            (u.username.toLowerCase() === username.toLowerCase() || u.email === username) &&
            u.password === hashedPassword
        );
        
        if (user) {
            // Actualizar último login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('forumUsers', JSON.stringify(users));
            
            // Guardar sesión
            const session = {
                userId: user.id,
                username: user.username,
                role: user.role,
                avatarColor: user.avatarColor,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('currentSession', JSON.stringify(session));
            
            // Agregar a usuarios online
            this.addOnlineUser(user.id);
            
            return { success: true, user: session };
        }
        
        return { success: false, error: "Credenciales incorrectas" };
    }
    
    logout() {
        const session = this.getCurrentSession();
        if (session) {
            this.removeOnlineUser(session.userId);
        }
        
        localStorage.removeItem('currentSession');
        this.updateUserControls();
        this.loadPosts();
    }
    
    getCurrentSession() {
        return JSON.parse(localStorage.getItem('currentSession'));
    }
    
    getCurrentUser() {
        const session = this.getCurrentSession();
        if (!session) return null;
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        return users.find(u => u.id === session.userId);
    }
    
    // Posts
    createPost(title, content, category, imageData = null) {
        const session = this.getCurrentSession();
        if (!session || session.role !== 'admin') {
            return { success: false, error: "Solo administradores pueden crear posts" };
        }
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            author: session.username,
            authorRole: session.role,
            category: category,
            image: imageData,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        posts.unshift(newPost);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        
        this.loadPosts();
        this.updateStats();
        
        return { success: true, post: newPost };
    }
    
    deletePost(postId) {
        const session = this.getCurrentSession();
        if (!session || session.role !== 'admin') {
            return { success: false, error: "No autorizado" };
        }
        
        let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        posts = posts.filter(post => post.id !== postId);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        
        this.loadPosts();
        this.updateStats();
        
        return { success: true };
    }
    
    addComment(postId, content) {
        const session = this.getCurrentSession();
        if (!session) {
            return { success: false, error: "Debes iniciar sesión para comentar" };
        }
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) {
            return { success: false, error: "Post no encontrado" };
        }
        
        const newComment = {
            id: Date.now(),
            author: session.username,
            content: content,
            timestamp: new Date().toISOString()
        };
        
        if (!posts[postIndex].comments) {
            posts[postIndex].comments = [];
        }
        
        posts[postIndex].comments.push(newComment);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        
        this.loadPosts();
        
        return { success: true, comment: newComment };
    }
    
    loadPosts() {
        const postsList = document.getElementById('postsList');
        if (!postsList) return;
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        
        if (posts.length === 0) {
            postsList.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">No hay posts todavía</p>';
            return;
        }
        
        let html = '';
        
        posts.forEach(post => {
            const postDate = new Date(post.timestamp);
            const timeAgo = this.getTimeAgo(postDate);
            const categoryIcon = this.getCategoryIcon(post.category);
            
            html += `
                <div class="post" data-post-id="${post.id}">
                    <div class="post-header">
                        <div class="post-author">
                            <div class="user-avatar" style="background: ${this.getAvatarColor(post.author)};">
                                ${post.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <strong>${post.author}</strong>
                                <span class="role-badge ${post.authorRole === 'admin' ? 'admin-badge' : 'user-badge'}">
                                    ${post.authorRole === 'admin' ? 'ADMIN' : 'USUARIO'}
                                </span>
                            </div>
                        </div>
                        <div class="post-date">
                            ${categoryIcon} ${timeAgo}
                        </div>
                    </div>
                    <h3 style="color: #aaaaaa; margin: 10px 0;">${post.title}</h3>
                    <div class="post-content">${this.formatContent(post.content)}</div>
                    
                    ${post.image ? `
                        <img src="${post.image}" class="post-image" alt="Imagen del post">
                    ` : ''}
                    
                    <div class="post-actions">
                        <button onclick="forum.likePost(${post.id})">
                            👍 Like (${post.likes || 0})
                        </button>
                        <button onclick="showCommentModal(${post.id})">
                            💬 Comentar (${post.comments ? post.comments.length : 0})
                        </button>
                        ${this.getCurrentSession() && this.getCurrentSession().role === 'admin' ? `
                            <button style="color: #ff4444;" onclick="forum.deletePost(${post.id})">
                                🗑️ Eliminar
                            </button>
                        ` : ''}
                    </div>
                    
                    ${post.comments && post.comments.length > 0 ? `
                        <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 15px;">
                            <h4 style="color: #888; margin-bottom: 10px;">Comentarios:</h4>
                            ${post.comments.slice(0, 3).map(comment => `
                                <div style="background: #2a2a2a; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                                    <div style="display: flex; justify-content: space-between;">
                                        <strong style="color: #b4b4b4;">${comment.author}</strong>
                                        <small style="color: #666;">${this.getTimeAgo(new Date(comment.timestamp))}</small>
                                    </div>
                                    <p style="color: #888; margin-top: 5px;">${comment.content}</p>
                                </div>
                            `).join('')}
                            ${post.comments.length > 3 ? `
                                <p style="color: #666; text-align: center;">
                                    ... y ${post.comments.length - 3} comentarios más
                                </p>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        postsList.innerHTML = html;
    }
    
    likePost(postId) {
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
            if (!posts[postIndex].likes) {
                posts[postIndex].likes = 0;
            }
            posts[postIndex].likes++;
            localStorage.setItem('forumPosts', JSON.stringify(posts));
            this.loadPosts();
        }
    }
    
    // Usuarios online
    addOnlineUser(userId) {
        let onlineUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];
        
        if (!onlineUsers.includes(userId)) {
            onlineUsers.push(userId);
            localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
            this.updateOnlineUsers();
        }
    }
    
    removeOnlineUser(userId) {
        let onlineUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];
        onlineUsers = onlineUsers.filter(id => id !== userId);
        localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
        this.updateOnlineUsers();
    }
    
    updateOnlineUsers() {
        // Limpiar usuarios inactivos (más de 5 minutos)
        let onlineUsers = JSON.parse(localStorage.getItem('onlineUsers')) || [];
        const onlineCount = onlineUsers.length;
        
        document.getElementById('onlineUsers').textContent = onlineCount;
        
        // Actualizar cada minuto
        setTimeout(() => this.updateOnlineUsers(), 60000);
    }
    
    // UI Updates
    updateUserControls() {
        const session = this.getCurrentSession();
        const guestControls = document.getElementById('guestControls');
        const userControls = document.getElementById('userControls');
        const adminControls = document.getElementById('adminControls');
        const floatCreateBtn = document.getElementById('floatCreateBtn');
        
        if (session) {
            guestControls.style.display = 'none';
            userControls.style.display = 'flex';
            
            document.getElementById('usernameDisplay').textContent = session.username;
            document.getElementById('userAvatar').textContent = session.username.charAt(0).toUpperCase();
            document.getElementById('userAvatar').style.background = session.avatarColor;
            
            const roleBadge = document.getElementById('userRoleBadge');
            roleBadge.textContent = session.role === 'admin' ? 'ADMIN' : 'USUARIO';
            roleBadge.className = `role-badge ${session.role === 'admin' ? 'admin-badge' : 'user-badge'}`;
            
            if (session.role === 'admin') {
                adminControls.style.display = 'flex';
                if (floatCreateBtn) floatCreateBtn.style.display = 'block';
            } else {
                adminControls.style.display = 'none';
                if (floatCreateBtn) floatCreateBtn.style.display = 'none';
            }
        } else {
            guestControls.style.display = 'block';
            userControls.style.display = 'none';
            adminControls.style.display = 'none';
            if (floatCreateBtn) floatCreateBtn.style.display = 'none';
        }
    }
    
    updateStats() {
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        
        document.getElementById('totalPosts').textContent = posts.length;
        document.getElementById('totalUsers').textContent = users.length;
        
        if (document.getElementById('adminTotalPosts')) {
            document.getElementById('adminTotalPosts').textContent = posts.length;
            document.getElementById('adminTotalUsers').textContent = users.length;
        }
    }
    
    loadAdminUsers() {
        const usersList = document.getElementById('adminUsersList');
        if (!usersList) return;
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        
        let html = '<div style="display: grid; gap: 10px;">';
        
        users.forEach(user => {
            const regDate = new Date(user.registered);
            const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
            
            html += `
                <div style="background: #333; padding: 15px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="user-avatar" style="background: ${user.avatarColor}; width: 30px; height: 30px;">
                                    ${user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <strong style="color: #b4b4b4;">${user.username}</strong>
                                    <span class="role-badge ${user.role === 'admin' ? 'admin-badge' : 'user-badge'}" style="margin-left: 10px;">
                                        ${user.role === 'admin' ? 'ADMIN' : 'USUARIO'}
                                    </span>
                                </div>
                            </div>
                            <div style="color: #666; font-size: 12px; margin-top: 5px;">
                                Registrado: ${regDate.toLocaleDateString()}
                                ${lastLogin ? ` | Último login: ${this.getTimeAgo(lastLogin)}` : ''}
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                                onclick="forum.changeUserRole(${user.id}, '${user.role === 'admin' ? 'user' : 'admin'}')">
                                ${user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        usersList.innerHTML = html;
    }
    
    changeUserRole(userId, newRole) {
        const session = this.getCurrentSession();
        if (!session || session.role !== 'admin') {
            alert("Solo administradores pueden cambiar roles");
            return;
        }
        
        let users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].role = newRole;
            localStorage.setItem('forumUsers', JSON.stringify(users));
            
            // Si es el usuario actual, actualizar sesión
            if (session.userId === userId) {
                session.role = newRole;
                localStorage.setItem('currentSession', JSON.stringify(session));
                this.updateUserControls();
            }
            
            this.loadAdminUsers();
            this.loadPosts(); // Para actualizar badges en posts
        }
    }
    
    // Utilidades
    getRandomColor() {
        const colors = ['#800080', '#008080', '#808000', '#000080', '#800000'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getAvatarColor(username) {
        const colors = ['#800080', '#008080', '#808000', '#000080', '#800000', '#008000'];
        const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    }
    
    getCategoryIcon(category) {
        const icons = {
            'announcements': '📢',
            'general': '💬',
            'multimedia': '🖼️',
            'gaming': '🎮'
        };
        return icons[category] || '📝';
    }
    
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " años";
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " meses";
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " días";
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " horas";
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutos";
        
        return Math.floor(seconds) + " segundos";
    }
    
    formatContent(content) {
        // Convertir saltos de línea a <br>
        return content.replace(/\n/g, '<br>');
    }
    
    checkSession() {
        // Verificar si la sesión debe expirar (24 horas)
        const session = this.getCurrentSession();
        if (session) {
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                this.logout();
                alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
            }
        }
    }
}

// Inicializar foro
const forum = new ELKForum();

// Funciones globales para los modales
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        if (modalId === 'adminPanelModal') {
            forum.loadAdminUsers();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Limpiar formularios
        const form = modal.querySelector('form');
        if (form) form.reset();
        
        // Limpiar errores
        const errorDiv = modal.querySelector('[id$="Error"]');
        if (errorDiv) errorDiv.style.display = 'none';
    }
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!username || !password) {
        errorDiv.textContent = "Por favor completa todos los campos";
        errorDiv.style.display = 'block';
        return;
    }
    
    const result = forum.login(username, password);
    
    if (result.success) {
        closeModal('loginModal');
        forum.updateUserControls();
        forum.loadPosts();
        forum.updateStats();
        
        // Limpiar formulario
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    } else {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
    }
}

function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    // Validaciones
    if (!username || !email || !password || !confirmPassword) {
        errorDiv.textContent = "Por favor completa todos los campos";
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = "La contraseña debe tener al menos 6 caracteres";
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = "Las contraseñas no coinciden";
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
        errorDiv.textContent = "Por favor ingresa un email válido";
        errorDiv.style.display = 'block';
        return;
    }
    
    const result = forum.register(username, email, password);
    
    if (result.success) {
        closeModal('registerModal');
        
        // Auto-login después del registro
        const loginResult = forum.login(username, password);
        if (loginResult.success) {
            forum.updateUserControls();
            forum.loadPosts();
            forum.updateStats();
        }
        
        // Limpiar formulario
        document.getElementById('registerUsername').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerConfirmPassword').value = '';
    } else {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
    }
}

function logout() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        forum.logout();
    }
}

function createPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const category = document.getElementById('postCategory').value;
    const imageInput = document.getElementById('postImage');
    const errorDiv = document.getElementById('createPostError');
    
    if (!title || !content) {
        errorDiv.textContent = "Por favor completa título y contenido";
        errorDiv.style.display = 'block';
        return;
    }
    
    let imageData = null;
    
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            const result = forum.createPost(title, content, category, imageData);
            
            if (result.success) {
                closeModal('createPostModal');
                
                // Limpiar formulario
                document.getElementById('postTitle').value = '';
                document.getElementById('postContent').value = '';
                document.getElementById('postImage').value = '';
                document.getElementById('imagePreview').innerHTML = '';
            } else {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
            }
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        const result = forum.createPost(title, content, category, null);
        
        if (result.success) {
            closeModal('createPostModal');
            
            // Limpiar formulario
            document.getElementById('postTitle').value = '';
            document.getElementById('postContent').value = '';
        } else {
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
        }
    }
}

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                <p style="color: #888; font-size: 12px; margin-top: 5px;">
                    ${input.files[0].name} (${Math.round(input.files[0].size / 1024)} KB)
                </p>
            `;
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '';
    }
}

function showCommentModal(postId) {
    const session = forum.getCurrentSession();
    if (!session) {
        alert("Debes iniciar sesión para comentar");
        showModal('loginModal');
        return;
    }
    
    const comment = prompt("Escribe tu comentario:");
    if (comment && comment.trim()) {
        const result = forum.addComment(postId, comment.trim());
        if (!result.success) {
            alert(result.error);
        }
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Permitir Enter en formularios
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (document.getElementById('loginModal').style.display === 'flex') {
            login();
        } else if (document.getElementById('registerModal').style.display === 'flex') {
            register();
        }
    }
});
