// Sistema de Staff para HMFB Forum
class HMFBStaffPanel {
    constructor() {
        this.currentStaff = null;
        this.init();
    }
    
    init() {
        // Verificar sesión de staff/admin
        const session = this.getCurrentSession();
        
        if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
            console.error("Acceso denegado: Se requiere rol de staff o administrador");
            return;
        }
        
        this.currentStaff = session;
        console.log("Panel de staff inicializado para:", session.username);
    }
    
    getCurrentSession() {
        try {
            return JSON.parse(localStorage.getItem('currentSession'));
        } catch (e) {
            return null;
        }
    }
    
    // ========== GESTIÓN DE USUARIOS ==========
    
    loadUsersForTable(searchTerm = '') {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        
        // Filtrar usuarios si hay término de búsqueda
        let filteredUsers = users;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredUsers = users.filter(user => 
                user.username.toLowerCase().includes(term) ||
                (user.ign && user.ign.toLowerCase().includes(term))
            );
        }
        
        if (filteredUsers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #888;">
                        No se encontraron usuarios
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        filteredUsers.forEach(user => {
            const registrationDate = new Date(user.registered);
            const lastLogin = new Date(user.lastLogin);
            const isCurrentUser = this.currentStaff && user.id === this.currentStaff.userId;
            
            // Determinar clase del rol
            let roleClass = 'role-user';
            let roleText = 'Usuario';
            
            switch(user.role) {
                case 'admin':
                    roleClass = 'role-admin';
                    roleText = 'Admin';
                    break;
                case 'staff':
                    roleClass = 'role-staff';
                    roleText = 'Staff';
                    break;
            }
            
            // Estado
            let statusBadge = '';
            if (user.isBanned) {
                statusBadge = '<span class="banned-badge">BANEADO</span>';
            } else {
                statusBadge = '<span style="color: #4CAF50;">● Activo</span>';
            }
            
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td><strong>${user.ign || 'N/A'}</strong></td>
                    <td>${user.username}</td>
                    <td><span class="user-role-badge ${roleClass}">${roleText}</span></td>
                    <td>${user.postsCount || 0}</td>
                    <td>${statusBadge}</td>
                    <td>${registrationDate.toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            ${!isCurrentUser ? `
                                ${user.role !== 'admin' ? 
                                    `<button class="btn-small btn-promote" onclick="staffPanel.promoteUser(${user.id})">Promover</button>` : 
                                    `<button class="btn-small btn-demote" onclick="staffPanel.demoteUser(${user.id})">Degradar</button>`
                                }
                                ${!user.isBanned ? 
                                    `<button class="btn-small btn-ban" onclick="staffPanel.openBanModal(${user.id})">Ban</button>` : 
                                    `<button class="btn-small btn-unban" onclick="staffPanel.unbanUser(${user.id})">Unban</button>`
                                }
                            ` : `
                                <span style="color: #888; font-size: 11px;">Tu usuario</span>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    }
    
    loadUsersForBan() {
        const select = document.getElementById('banUsername');
        if (!select) return;
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        
        let html = '<option value="">Seleccionar usuario...</option>';
        users.forEach(user => {
            if (!user.isBanned && user.id !== this.currentStaff.userId) {
                html += `<option value="${user.id}">${user.ign || user.username} (@${user.username})</option>`;
            }
        });
        
        select.innerHTML = html;
    }
    
    loadUsersForRoles() {
        const select = document.getElementById('roleUsername');
        if (!select) return;
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        
        let html = '<option value="">Seleccionar usuario...</option>';
        users.forEach(user => {
            // No permitir cambiar el rol del propio usuario si no es admin
            if (this.currentStaff.role === 'admin' || user.id !== this.currentStaff.userId) {
                html += `<option value="${user.id}">${user.ign || user.username} (@${user.username}) - ${user.role}</option>`;
            }
        });
        
        select.innerHTML = html;
    }
    
    // ========== SISTEMA DE BANEOS ==========
    
    loadBannedUsers() {
        const container = document.getElementById('bannedUsersList');
        if (!container) return;
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const bannedUsers = users.filter(user => user.isBanned);
        
        if (bannedUsers.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">No hay usuarios baneados</p>';
            return;
        }
        
        let html = '';
        bannedUsers.forEach(user => {
            html += `
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #ff4444;">${user.ign || user.username}</strong>
                            <div style="color: #888; font-size: 12px;">@${user.username}</div>
                        </div>
                        <button class="btn-small btn-unban" onclick="staffPanel.unbanUser(${user.id})">
                            Desbanear
                        </button>
                    </div>
                    <div style="margin-top: 10px; color: #b4b4b4; font-size: 13px;">
                        <strong>Razón:</strong> ${user.banReason || 'Sin razón especificada'}<br>
                        <strong>Baneado el:</strong> ${new Date(user.banDate || user.lastLogin).toLocaleDateString()}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    banUser() {
        const userId = parseInt(document.getElementById('banUsername').value);
        const reason = document.getElementById('banReason').value;
        const duration = document.getElementById('banDuration').value;
        const notes = document.getElementById('banNotes').value.trim();
        
        if (!userId) {
            showMessage('Selecciona un usuario', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            showMessage('Usuario no encontrado', 'error');
            return;
        }
        
        // Verificar que no sea admin (staff no puede banear admin)
        if (users[userIndex].role === 'admin' && this.currentStaff.role !== 'admin') {
            showMessage('No puedes banear a un administrador', 'error');
            return;
        }
        
        // Verificar que no sea a sí mismo
        if (users[userIndex].id === this.currentStaff.userId) {
            showMessage('No puedes banear tu propia cuenta', 'error');
            return;
        }
        
        // Aplicar ban
        users[userIndex].isBanned = true;
        users[userIndex].banReason = reason + (notes ? ` - ${notes}` : '');
        users[userIndex].banDate = new Date().toISOString();
        users[userIndex].banDuration = duration;
        
        localStorage.setItem('forumUsers', JSON.stringify(users));
        
        // Mostrar mensaje de éxito
        showMessage(`✅ Usuario "${users[userIndex].username}" baneado exitosamente`, 'success');
        
        // Actualizar listas
        this.loadUsersForTable();
        this.loadUsersForBan();
        this.loadBannedUsers();
        
        // Registrar acción
        this.logStaffAction('ban', userId, users[userIndex].username, reason);
        
        // Limpiar formulario
        document.getElementById('banUsername').value = '';
        document.getElementById('banNotes').value = '';
    }
    
    unbanUser(userId) {
        if (!confirm('¿Desbanear a este usuario?')) {
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            showMessage('Usuario no encontrado', 'error');
            return;
        }
        
        // Remover ban
        users[userIndex].isBanned = false;
        users[userIndex].banReason = '';
        users[userIndex].banDate = '';
        users[userIndex].banDuration = '';
        
        localStorage.setItem('forumUsers', JSON.stringify(users));
        
        // Mostrar mensaje de éxito
        showMessage(`✅ Usuario "${users[userIndex].username}" desbaneado`, 'success');
        
        // Actualizar listas
        this.loadUsersForTable();
        this.loadUsersForBan();
        this.loadBannedUsers();
        
        // Registrar acción
        this.logStaffAction('unban', userId, users[userIndex].username);
    }
    
    openBanModal(userId) {
        document.getElementById('banUsername').value = userId;
        switchTab('ban');
    }
    
    // ========== GESTIÓN DE ROLES ==========
    
    changeUserRole() {
        const userId = parseInt(document.getElementById('roleUsername').value);
        const newRole = document.getElementById('newRole').value;
        const reason = document.getElementById('roleReason').value.trim();
        
        if (!userId) {
            showMessage('Selecciona un usuario', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            showMessage('Usuario no encontrado', 'error');
            return;
        }
        
        const user = users[userIndex];
        
        // Verificaciones de permisos
        if (newRole === 'admin' && this.currentStaff.role !== 'admin') {
            showMessage('Solo administradores pueden asignar rol de admin', 'error');
            return;
        }
        
        if (user.role === 'admin' && this.currentStaff.role !== 'admin') {
            showMessage('Solo administradores pueden cambiar roles de otros admins', 'error');
            return;
        }
        
        // Verificar que no se esté cambiando a sí mismo si no es admin
        if (user.id === this.currentStaff.userId && this.currentStaff.role !== 'admin') {
            showMessage('No puedes cambiar tu propio rol', 'error');
            return;
        }
        
        // Verificar que no sea el último admin
        if (user.role === 'admin' && newRole !== 'admin') {
            const adminCount = users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                showMessage('No puedes degradar al último administrador', 'error');
                return;
            }
        }
        
        // Cambiar rol
        const oldRole = user.role;
        user.role = newRole;
        
        // Actualizar color del avatar según rol
        switch(newRole) {
            case 'admin':
                user.avatarColor = '#800080';
                break;
            case 'staff':
                user.avatarColor = '#008080';
                break;
            default:
                user.avatarColor = '#00aaaa';
        }
        
        localStorage.setItem('forumUsers', JSON.stringify(users));
        
        // Actualizar sesión si el usuario está logueado
        const currentSession = this.getCurrentSession();
        if (currentSession && currentSession.userId === userId) {
            currentSession.role = newRole;
            currentSession.avatarColor = user.avatarColor;
            localStorage.setItem('currentSession', JSON.stringify(currentSession));
        }
        
        // Mostrar mensaje de éxito
        showMessage(`✅ Rol cambiado: ${user.username} de ${oldRole} a ${newRole}`, 'success');
        
        // Actualizar listas
        this.loadUsersForTable();
        this.loadUsersForRoles();
        
        // Registrar acción
        this.logStaffAction('change_role', userId, user.username, `${oldRole} → ${newRole}: ${reason}`);
        
        // Limpiar formulario
        document.getElementById('roleUsername').value = '';
        document.getElementById('roleReason').value = '';
    }
    
    promoteUser(userId) {
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return;
        
        const user = users[userIndex];
        let newRole = 'staff';
        
        // Solo admin puede promover a admin
        if (this.currentStaff.role === 'admin' && user.role === 'user') {
            if (confirm('¿Promover a administrador?\n\nSolo para usuarios de confianza.')) {
                newRole = 'admin';
            }
        }
        
        // Cambiar rol
        document.getElementById('roleUsername').value = userId;
        document.getElementById('newRole').value = newRole;
        this.changeUserRole();
    }
    
    demoteUser(userId) {
        if (!confirm('¿Degradar a usuario normal?')) {
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return;
        
        const user = users[userIndex];
        
        // Verificar que no sea el último admin
        if (user.role === 'admin') {
            const adminCount = users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                showMessage('No puedes degradar al último administrador', 'error');
                return;
            }
        }
        
        // Cambiar rol
        document.getElementById('roleUsername').value = userId;
        document.getElementById('newRole').value = 'user';
        this.changeUserRole();
    }
    
    // ========== MODERACIÓN DE POSTS ==========
    
    loadPostsForModeration() {
        const container = document.getElementById('postsList');
        if (!container) return;
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        
        if (posts.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">No hay publicaciones</p>';
            return;
        }
        
        // Tomar los 20 posts más recientes
        const recentPosts = [...posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
        
        let html = '';
        recentPosts.forEach(post => {
            const date = new Date(post.timestamp);
            
            html += `
                <div style="background: #333; padding: 20px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong style="color: white;">${post.title}</strong>
                            <div style="color: #888; font-size: 13px;">
                                Por: ${post.authorIGN || post.author} (@${post.author}) • ${date.toLocaleDateString()}
                            </div>
                        </div>
                        <div class="action-buttons">
                            <button class="btn-small btn-edit" onclick="staffPanel.viewPost(${post.id})">
                                Ver
                            </button>
                            <button class="btn-small btn-ban" onclick="staffPanel.deletePost(${post.id}, '${post.title}')">
                                Eliminar
                            </button>
                        </div>
                    </div>
                    <div style="color: #b4b4b4; font-size: 14px; line-height: 1.5;">
                        ${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}
                    </div>
                    <div style="margin-top: 10px; color: #888; font-size: 12px;">
                        Categoría: ${post.category} • 👍 ${post.likes || 0} • 💬 ${post.comments || 0}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    viewPost(postId) {
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            alert(`📝 ${post.title}\n\n👤 Autor: ${post.authorIGN || post.author} (@${post.author})\n📅 Fecha: ${new Date(post.timestamp).toLocaleString()}\n\n${post.content}`);
        }
    }
    
    deletePost(postId, postTitle) {
        if (!confirm(`¿Eliminar la publicación "${postTitle}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) {
            showMessage('Publicación no encontrada', 'error');
            return;
        }
        
        // Obtener autor para actualizar su contador
        const post = posts[postIndex];
        const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
        const userIndex = users.findIndex(u => u.username === post.author);
        
        if (userIndex !== -1) {
            users[userIndex].postsCount = Math.max(0, (users[userIndex].postsCount || 0) - 1);
            localStorage.setItem('forumUsers', JSON.stringify(users));
        }
        
        // Eliminar post
        posts.splice(postIndex, 1);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        
        showMessage(`✅ Publicación "${postTitle}" eliminada`, 'success');
        
        // Recargar posts
        this.loadPostsForModeration();
        
        // Registrar acción
        this.logStaffAction('delete_post', postId, postTitle);
    }
    
    // ========== UTILIDADES ==========
    
    logStaffAction(action, targetId, targetName, details = '') {
        const session = this.currentStaff;
        if (!session) return;
        
        const log = {
            staffId: session.userId,
            staffName: session.username,
            action: action,
            targetId: targetId,
            targetName: targetName,
            details: details,
            timestamp: new Date().toISOString(),
            ip: 'N/A'
        };
        
        // Guardar en localStorage
        const staffLogs = JSON.parse(localStorage.getItem('staffLogs')) || [];
        staffLogs.push(log);
        localStorage.setItem('staffLogs', JSON.stringify(staffLogs));
        
        console.log(`📝 Staff Action: ${session.username} ${action} ${targetName}`);
    }
    
    // ========== BÚSQUEDA ==========
    
    searchUsers() {
        const searchTerm = document.getElementById('userSearch').value.trim();
        this.loadUsersForTable(searchTerm);
    }
}

// Inicializar panel de staff
let staffPanel;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        staffPanel = new HMFBStaffPanel();
    }, 500);
});

// Funciones globales para los botones
function refreshStaffData() {
    if (staffPanel) {
        staffPanel.loadUsersForTable();
        staffPanel.loadUsersForBan();
        staffPanel.loadUsersForRoles();
        staffPanel.loadBannedUsers();
        staffPanel.loadPostsForModeration();
        
        if (typeof loadDashboardStats === 'function') {
            loadDashboardStats();
        }
        
        showMessage('✅ Datos actualizados correctamente', 'success');
    }
}

function searchUsers() {
    if (staffPanel) {
        staffPanel.searchUsers();
    }
}

function resetSearch() {
    document.getElementById('userSearch').value = '';
    if (staffPanel) {
        staffPanel.loadUsersForTable();
    }
}
