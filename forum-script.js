// En la función loadPosts() de forum-script.js, modificar la parte que muestra el autor:

// Buscar esta sección en loadPosts() y modificar:
html += `
    <div class="post" data-post-id="${post.id}">
        <div class="post-header">
            <div class="post-author">
                <div class="user-avatar" style="background: ${post.authorRole === 'admin' ? '#800080' : '#00ffff'};">
                    ${post.author.charAt(0).toUpperCase()}
                </div>
                <div>
                    <strong style="color: ${post.authorRole === 'admin' ? '#800080' : '#00ffff'};">${post.authorRole === 'admin' ? '[Admin] ' : ''}${post.author}</strong>
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
`;

// También modificar la función updateUserControls() para mostrar admins en violeta:
updateUserControls() {
    const session = this.getCurrentSession();
    const guestControls = document.getElementById('guestControls');
    const userControls = document.getElementById('userControls');
    const adminControls = document.getElementById('adminControls');
    const floatCreateBtn = document.getElementById('floatCreateBtn');
    
    if (session) {
        guestControls.style.display = 'none';
        userControls.style.display = 'flex';
        
        document.getElementById('usernameDisplay').textContent = session.role === 'admin' ? `[Admin] ${session.username}` : session.username;
        document.getElementById('usernameDisplay').style.color = session.role === 'admin' ? '#800080' : '#00ffff';
        document.getElementById('userAvatar').textContent = session.username.charAt(0).toUpperCase();
        document.getElementById('userAvatar').style.background = session.role === 'admin' ? '#800080' : '#00ffff';
        
        const roleBadge = document.getElementById('userRoleBadge');
        roleBadge.textContent = session.role === 'admin' ? 'ADMIN' : 'USUARIO';
        roleBadge.className = `role-badge ${session.role === 'admin' ? 'admin-badge' : 'user-badge'}`;
        
        if (session.role === 'admin') {
            adminControls.style.display = 'flex';
            if (floatCreateBtn) floatCreateBtn.style.display = 'block';
            
            // Estilo especial para admin
            document.querySelector('.user-avatar').style.border = '2px solid gold';
            document.querySelector('.user-avatar').style.boxShadow = '0 0 10px gold';
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

// Modificar la función ensureCurrentUserExists() para asignar color aqua por defecto:
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
            password: this.hashPassword(username),
            role: 'user', // Siempre usuario normal al registrarse
            avatarColor: '#00ffff', // Color aqua fijo para usuarios normales
            registered: userData.joinDate || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            postsCount: 0,
            likesCount: 0,
            commentsCount: 0,
            isAquaUser: true
        };
        
        users.push(newUser);
        localStorage.setItem('forumUsers', JSON.stringify(users));
        
        // Actualizar sesión
        const session = {
            userId: newUser.id,
            username: username,
            role: newUser.role,
            avatarColor: newUser.avatarColor,
            loginTime: new Date().toISOString(),
            displayName: username
        };
        
        localStorage.setItem('currentSession', JSON.stringify(session));
    }
}
