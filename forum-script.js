// Modificar la clase ELKForum para usar usuario simple

init() {
    // Verificar si hay usuario
    const username = localStorage.getItem('hmfbUsername');
    if (!username) {
        console.log("Esperando que el usuario ingrese nombre...");
        return; // No inicializar hasta que haya usuario
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

ensureCurrentUserExists() {
    const username = localStorage.getItem('hmfbUsername');
    const userDataStr = localStorage.getItem('hmfbUserData');
    
    if (!username) return;
    
    let users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    const userExists = users.find(u => u.username === username);
    
    if (!userExists && userDataStr) {
        const userData = JSON.parse(userDataStr);
        
        const newUser = {
            id: Date.now(),
            username: username,
            email: `${username.toLowerCase()}@hmfb.forum`,
            password: this.hashPassword(username), // Password simple basado en username
            role: userData.role || 'user',
            avatarColor: userData.avatarColor || '#800080',
            registered: userData.joinDate || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            postsCount: 0,
            likesCount: 0,
            commentsCount: 0
        };
        
        users.push(newUser);
        localStorage.setItem('forumUsers', JSON.stringify(users));
        
        // Actualizar sesión
        const session = {
            userId: newUser.id,
            username: username,
            role: newUser.role,
            avatarColor: newUser.avatarColor,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentSession', JSON.stringify(session));
    }
}

// Modificar login para aceptar cualquier usuario
login(username, password = null) {
    let users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    
    // Buscar usuario
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    // Si no existe, crearlo automáticamente
    if (!user) {
        user = {
            id: Date.now(),
            username: username,
            email: `${username.toLowerCase()}@hmfb.forum`,
            password: this.hashPassword(username),
            role: 'user',
            avatarColor: this.getRandomColor(),
            registered: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            postsCount: 0,
            likesCount: 0,
            commentsCount: 0
        };
        
        users.push(user);
        localStorage.setItem('forumUsers', JSON.stringify(users));
    }
    
    // Actualizar último login
    user.lastLogin = new Date().toISOString();
    user.lastSeen = new Date().toISOString();
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

// Nueva función para actualizar último visto
updateLastSeen() {
    const session = this.getCurrentSession();
    if (!session) return;
    
    let users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    const userIndex = users.findIndex(u => u.id === session.userId);
    
    if (userIndex !== -1) {
        users[userIndex].lastSeen = new Date().toISOString();
        localStorage.setItem('forumUsers', JSON.stringify(users));
    }
}
