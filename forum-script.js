// Modificar init() para verificar sesión
init() {
    // Verificar si hay sesión activa
    const session = this.getCurrentSession();
    if (!session || !session.username) {
        console.log("Esperando que el usuario inicie sesión...");
        return; // No inicializar hasta que haya sesión
    }
    
    // Inicializar datos si no existen
    if (!localStorage.getItem('forumUsers')) {
        this.initializeDefaultData();
    }
    
    // Asegurar que el usuario actual esté en la lista
    this.ensureCurrentUserExists();
    
    // Actualizar controles de usuario
    this.updateUserControls();
    
    // Cargar posts
    this.loadPosts();
    
    // Actualizar estadísticas
    this.updateStats();
    
    // Actualizar cada 30 segundos para usuarios online
    setInterval(() => this.updateOnlineUsers(), 30000);
    
    // Actualizar último visto
    setInterval(() => this.updateLastSeen(), 60000);
}

// Modificar ensureCurrentUserExists para usar la sesión actual
ensureCurrentUserExists() {
    const session = this.getCurrentSession();
    if (!session || !session.username) return;
    
    let users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    const userExists = users.find(u => u.username === session.username);
    
    if (!userExists) {
        const newUser = {
            id: session.userId || Date.now(),
            username: session.username,
            email: `${session.username.toLowerCase()}@hmfb.forum`,
            password: this.hashPassword(session.username),
            role: session.role || 'user',
            avatarColor: session.avatarColor || '#00ffff',
            registered: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            postsCount: 0,
            likesCount: 0,
            commentsCount: 0,
            isAquaUser: true
        };
        
        users.push(newUser);
        localStorage.setItem('forumUsers', JSON.stringify(users));
    }
}

// Modificar login() para no crear usuarios automáticamente
// (Ahora el login se maneja en el HTML principal)
