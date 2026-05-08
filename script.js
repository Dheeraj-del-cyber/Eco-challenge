/**
 * EcoHero — App Engine 4.0
 * Multi-page state management and UI rendering
 */

const INITIAL_DATA = {
    user: {
        name: "Eco Hero",
        avatar: "👤",
        points: 1950,
        level: 4,
        cleanups: 13,
        location: "Margao, Goa",
        rank: "Elite Scout"
    },
    challenges: [
        { id: 1, title: "Plastic at Sunset Beach", location: "Sunset Beach", status: "active", image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80", points: 500 },
        { id: 2, title: "City Park Debris", location: "Central Park", status: "active", image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80", points: 750 },
        { id: 3, title: "River Side Trash", location: "Zuari River", status: "completed", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80", points: 400 }
    ],
    leaderboard: [
        { rank: 1, name: "EcoSentinel", cleanups: 156, points: 24500 },
        { rank: 2, name: "PlanetGuardian", cleanups: 124, points: 18200 },
        { rank: 3, name: "GreenPath", cleanups: 98, points: 15600 },
        { rank: 4, name: "WasteWarrior", cleanups: 82, points: 12400 },
        { rank: 5, name: "Eco Hero", cleanups: 13, points: 1950, isUser: true }
    ],
    badges: [
        { name: "Starter Hero", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913564.png", unlocked: true, desc: "Joined the movement" },
        { name: "Waste Warrior", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913604.png", unlocked: true, desc: "Completed 5 cleanups" },
        { name: "Nature Guardian", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913520.png", unlocked: true, desc: "Restored a major park" },
        { name: "Elite Scout", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913444.png", unlocked: true, desc: "Reported 10 polluted areas" }
    ],
    communities: [
        { id: 1, name: "Goa Beach Warriors", location: "North Goa", members: 1250, description: "Dedicated to coastal cleanup and marine protection.", isJoined: true },
        { id: 2, name: "Urban Foresters", location: "Margao", members: 450, description: "Tree plantation and urban gardening initiatives.", isJoined: false }
    ],
    avatars: ["👤", "🦊", "🌿", "🦸", "🌲", "🦁", "🐢", "🐳", "🐨", "🍄", "🍃", "🧤", "🏔️", "🐾", "🦋"]
};

let appState = JSON.parse(localStorage.getItem('eco_hero_state')) || INITIAL_DATA;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateCommonUI();
    
    // Determine which page we are on
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    if (page === "index.html" || page === "") {
        renderDashboard();
    } else if (page === "profile.html") {
        renderProfile();
    } else if (page === "challenges.html") {
        renderChallengesPage();
    } else if (page === "leaderboard.html") {
        renderLeaderboardPage();
    } else if (page === "community.html") {
        renderCommunityPage();
    }

    // Attach global form listeners if they exist on the page
    const challengeForm = document.getElementById('challenge-form');
    if (challengeForm) challengeForm.addEventListener('submit', handleCreateChallenge);

    const profileForm = document.getElementById('profile-form');
    if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);

    const communityForm = document.getElementById('community-form');
    if (communityForm) communityForm.addEventListener('submit', handleCreateCommunity);
}

function updateCommonUI() {
    const user = appState.user;
    
    // Sidebar update
    const sidebarName = document.getElementById('sidebar-name');
    if (sidebarName) sidebarName.textContent = user.name;
    
    const sidebarPoints = document.getElementById('sidebar-points');
    if (sidebarPoints) sidebarPoints.textContent = user.points.toLocaleString();
    
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    if (sidebarAvatar) {
        if (user.avatar.length > 2) { // Is URL
            sidebarAvatar.src = user.avatar;
        } else { // Is Emoji/Initial
            sidebarAvatar.src = `https://ui-avatars.com/api/?name=${user.name}&background=14532d&color=fff`;
        }
    }

    // Welcome text on dashboard
    const welcomeName = document.getElementById('welcome-name');
    if (welcomeName) welcomeName.textContent = user.name;
}

function renderDashboard() {
    // Stats
    const dashPoints = document.getElementById('dash-points');
    if (dashPoints) dashPoints.textContent = appState.user.points.toLocaleString();
    
    const dashCleanups = document.getElementById('dash-cleanups');
    if (dashCleanups) dashCleanups.textContent = appState.user.cleanups;

    // Challenges
    const grid = document.getElementById('dash-challenges-grid');
    if (grid) {
        const activeChallenges = appState.challenges.filter(c => c.status === 'active').slice(0, 3);
        grid.innerHTML = activeChallenges.map(c => renderChallengeCard(c)).join('');
    }

    // Leaderboard snippet
    const lbList = document.getElementById('dash-leaderboard-list');
    if (lbList) {
        lbList.innerHTML = appState.leaderboard.slice(0, 5).map((u, i) => renderLeaderboardItem(u, i)).join('');
    }
}

function renderProfile() {
    const user = appState.user;
    
    const pName = document.getElementById('profile-name');
    if (pName) pName.textContent = user.name;
    
    const pLocation = document.getElementById('profile-location');
    if (pLocation) pLocation.textContent = user.location;
    
    const pPoints = document.getElementById('profile-points');
    if (pPoints) pPoints.textContent = user.points.toLocaleString();
    
    const pCleanups = document.getElementById('profile-cleanups');
    if (pCleanups) pCleanups.textContent = user.cleanups;
    
    const pAvatar = document.getElementById('profile-avatar');
    if (pAvatar) pAvatar.textContent = user.avatar;

    // Badges
    const badgeGrid = document.getElementById('profile-badges');
    if (badgeGrid) {
        badgeGrid.innerHTML = appState.badges.map(b => `
            <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon-container">
                    <img src="${b.icon}" style="width: 40px;">
                </div>
                <h4>${b.name}</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted);">${b.desc}</p>
            </div>
        `).join('');
    }

    // Avatar Grid in Modal
    const avatarGrid = document.getElementById('avatar-grid');
    if (avatarGrid) {
        avatarGrid.innerHTML = appState.avatars.map(a => `
            <div class="avatar-option" onclick="selectAvatar(this, '${a}')" style="cursor:pointer; font-size:1.5rem; padding:10px; border-radius:8px; border:1px solid var(--border); ${a === user.avatar ? 'border-color:var(--primary); background:var(--primary-light);' : ''}">${a}</div>
        `).join('');
    }
}

function renderChallengesPage() {
    const grid = document.getElementById('challenges-grid');
    if (grid) {
        grid.innerHTML = appState.challenges.map(c => renderChallengeCard(c)).join('');
    }
}

function renderLeaderboardPage() {
    const list = document.getElementById('leaderboard-list');
    if (list) {
        list.innerHTML = appState.leaderboard.map((u, i) => renderLeaderboardItem(u, i)).join('');
    }
}

function renderCommunityPage() {
    const grid = document.getElementById('communities-grid');
    if (grid) {
        grid.innerHTML = appState.communities.map(c => `
            <div class="card">
                <div class="card-content">
                    <span class="badge badge-green">${c.location}</span>
                    <h3 style="margin-bottom: 10px;">${c.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">${c.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; font-weight: 600;">${c.members.toLocaleString()} members</span>
                        <button class="btn ${c.isJoined ? 'btn-outline' : 'btn-primary'}" onclick="toggleJoinCommunity(${c.id})">
                            ${c.isJoined ? 'Joined' : 'Join'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderChallengeCard(c) {
    return `
        <div class="card">
            <img src="${c.image}" class="card-img">
            <div class="card-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <span class="badge ${c.status === 'active' ? 'badge-yellow' : 'badge-green'}">${c.status}</span>
                    <span style="font-weight: 800; color: var(--primary);">+${c.points} PTS</span>
                </div>
                <h3 style="margin-bottom: 5px;">${c.title}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;"><i class="fas fa-map-marker-alt"></i> ${c.location}</p>
                ${c.status === 'active' ? `
                    <button class="btn btn-primary" style="width: 100%;" onclick="openCompleteModal(${c.id})">Complete Cleanup</button>
                ` : `
                    <div style="text-align: center; color: var(--primary); font-weight: 700; background: var(--primary-light); padding: 10px; border-radius: 8px;">
                        <i class="fas fa-check-circle"></i> Verified
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderLeaderboardItem(u, i) {
    const rank = i + 1;
    const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid var(--border); ${u.isUser ? 'background: #f0fdf4;' : ''}">
            <div style="display: flex; align-items: center; gap: 20px;">
                <span style="font-weight: 800; width: 30px;">${rankIcon}</span>
                <img src="https://ui-avatars.com/api/?name=${u.name}&background=random" style="width: 40px; height: 40px; border-radius: 50%;">
                <div>
                    <h4 style="font-size: 1rem;">${u.name} ${u.isUser ? '(You)' : ''}</h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted);">${u.cleanups} cleanups</p>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="font-weight: 800; color: var(--primary); font-size: 1.1rem;">${u.points.toLocaleString()}</span>
                <p style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">POINTS</p>
            </div>
        </div>
    `;
}

/* Handlers */
function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

function selectAvatar(el, a) {
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.style.borderColor = 'var(--border)';
        opt.style.background = 'transparent';
    });
    el.style.borderColor = 'var(--primary)';
    el.style.background = 'var(--primary-light)';
    document.getElementById('profile-emoji-input').value = a;
}

function handleProfileUpdate(e) {
    e.preventDefault();
    appState.user.name = document.getElementById('profile-name-input').value || appState.user.name;
    appState.user.location = document.getElementById('profile-location-input').value || appState.user.location;
    appState.user.avatar = document.getElementById('profile-emoji-input').value || appState.user.avatar;
    
    saveState();
    location.reload();
}

function handleCreateChallenge(e) {
    e.preventDefault();
    const newC = {
        id: Date.now(),
        title: document.getElementById('task-name-input').value,
        location: document.getElementById('task-location-input').value,
        status: 'active',
        image: document.getElementById('before-preview').src || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
        points: 500
    };
    appState.challenges.unshift(newC);
    saveState();
    location.reload();
}

function handleCreateCommunity(e) {
    e.preventDefault();
    const newComm = {
        id: Date.now(),
        name: document.getElementById('comm-name-input').value,
        location: document.getElementById('comm-location-input').value,
        description: document.getElementById('comm-desc-input').value,
        members: 1,
        isJoined: true
    };
    appState.communities.unshift(newComm);
    saveState();
    location.reload();
}

function openCompleteModal(id) {
    window.currentChallengeId = id;
    toggleModal('complete-modal', true);
}

document.getElementById('complete-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const c = appState.challenges.find(ch => ch.id === window.currentChallengeId);
    if (c) {
        c.status = 'completed';
        appState.user.points += c.points;
        appState.user.cleanups += 1;
        saveState();
        alert("Cleanup Verified! You earned points.");
        location.reload();
    }
});

function toggleJoinCommunity(id) {
    const c = appState.communities.find(ch => ch.id === id);
    if (c) {
        c.isJoined = !c.isJoined;
        c.members += c.isJoined ? 1 : -1;
        saveState();
        location.reload();
    }
}

function previewImage(input, imgId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById(imgId);
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function saveState() {
    localStorage.setItem('eco_hero_state', JSON.stringify(appState));
}
