/**
 * EcoHero — App Engine 4.0
 * Multi-page state management and UI rendering
 */

const INITIAL_DATA = {
    user: {
        name: "Dheeraj",
        avatar: "🦸",
        points: 3200,
        level: 4,
        cleanups: 15,
        location: "Mallapura, Karnataka",
        rank: "Elite Hero",
        isLoggedIn: false
    },
    challenges: [
        { id: 1, title: "Plastic at Sunset Beach", location: "Sunset Beach", status: "active", image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80", points: 25, lat: 15.35, lon: 73.76 },
        { id: 2, title: "City Park Debris", location: "Central Park", status: "active", image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80", points: 30, lat: 15.39, lon: 73.81 },
        { id: 3, title: "River Side Trash", location: "Zuari River", status: "completed", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80", points: 20, lat: 15.41, lon: 73.85 }
    ],
    leaderboard: [
        { rank: 1, name: "EcoSentinel", cleanups: 45, points: 1200 },
        { rank: 2, name: "PlanetGuardian", cleanups: 38, points: 950 },
        { rank: 3, name: "GreenPath", cleanups: 32, points: 820 },
        { rank: 4, name: "WasteWarrior", cleanups: 28, points: 710 },
        { rank: 5, name: "Eco Hero", cleanups: 5, points: 450, isUser: true }
    ],
    badges: [
        { name: "Starter Hero", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913564.png", unlocked: true, desc: "Joined the movement" },
        { name: "Waste Warrior", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913604.png", unlocked: true, desc: "Completed 5 cleanups" },
        { name: "Nature Guardian", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913520.png", unlocked: false, desc: "Restored a major park" },
        { name: "Elite Scout", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913444.png", unlocked: false, desc: "Reported 10 polluted areas" }
    ],
    communities: [
        { id: 1, name: "Goa Beach Warriors", location: "North Goa", members: 125, description: "Dedicated to coastal cleanup and marine protection.", isJoined: true },
        { id: 2, name: "Urban Foresters", location: "Margao", members: 45, description: "Tree plantation and urban gardening initiatives.", isJoined: false }
    ],
    avatars: ["👤", "🦊", "🌿", "🦸", "🌲", "🦁", "🐢", "🐳", "🐨", "🍄", "🍃", "🧤", "🏔️", "🐾", "🦋"]
};

let appState = JSON.parse(localStorage.getItem('eco_hero_state')) || INITIAL_DATA;
if (!localStorage.getItem('eco_hero_state')) {
    localStorage.setItem('eco_hero_state', JSON.stringify(appState));
}

function getRankBadge(level) {
    if (level >= 20) return { name: 'Platinum', class: 'rank-platinum', icon: '💎' };
    if (level >= 10) return { name: 'Gold', class: 'rank-gold', icon: '🥇' };
    if (level >= 5) return { name: 'Silver', class: 'rank-silver', icon: '🥈' };
    return { name: 'Bronze', class: 'rank-bronze', icon: '🥉' };
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Auth check
        const url = window.location.href.toLowerCase();
        const isLoginPage = url.includes('login.html');
        
        if (!appState.user.isLoggedIn && !isLoginPage) {
            window.location.href = 'login.html';
            return;
        } else if (appState.user.isLoggedIn && isLoginPage) {
            window.location.href = 'index.html';
            return;
        }

        initApp();
    } catch (error) {
        console.error("App Initialization Failed:", error);
    }
});

function initApp() {
    updateCommonUI();
    
    // Determine which page we are on
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    if (page === "index.html" || page === "") {
        renderDashboard();
        initMap();
    } else if (page === "profile.html") {
        renderProfile();
        initMap();
    } else if (page === "challenges.html") {
        renderChallengesPage();
        initMap();
    } else if (page === "leaderboard.html") {
        renderLeaderboardPage();
    } else if (page === "community.html") {
        renderCommunityPage();
        initMap();
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
    const rank = getRankBadge(user.level);
    
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

    // Add logout listener if button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            appState.user.isLoggedIn = false;
            saveState();
            window.location.href = 'login.html';
        };
    }
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

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Initialize map
    const map = L.map('map').setView([15.38, 73.80], 12);

    // Satellite View (Esri World Imagery)
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // Add Labels on top (Esri World Transportation/Labels)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Labels &copy; Esri'
    }).addTo(map);

    // Add challenge markers
    appState.challenges.forEach(c => {
        if (c.lat && c.lon) {
            const marker = L.marker([c.lat, c.lon]).addTo(map);
            marker.bindPopup(`
                <div style="width: 150px;">
                    <img src="${c.image}" style="width: 100%; border-radius: 8px; margin-bottom: 5px;">
                    <h4 style="margin: 0; font-size: 0.9rem;">${c.title}</h4>
                    <p style="margin: 5px 0; font-size: 0.75rem; color: #666;">${c.location}</p>
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">+${c.points} PTS</span>
                </div>
            `);
        }
    });

    // Try to get user location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            const userLat = pos.coords.latitude;
            const userLon = pos.coords.longitude;
            
            map.setView([userLat, userLon], 15); // Zoom in more for satellite
            
            // Custom blue pulsing live marker
            const userIcon = L.divIcon({
                html: '<div class="user-location-marker"></div>',
                className: 'custom-div-icon',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            L.marker([userLat, userLon], {icon: userIcon}).addTo(map).bindPopup("<b>You are here</b><br>Live Tracking Active");

            // Add 10km region circle
            L.circle([userLat, userLon], {
                color: 'var(--primary)',
                fillColor: 'var(--primary)',
                fillOpacity: 0.1,
                radius: 10000 // 10km
            }).addTo(map).bindPopup("Your Local Region (10km)");
        }, (err) => {
            console.log("Location access denied or error:", err);
        });
    }
}

function renderProfile() {
    const user = appState.user;
    const rank = getRankBadge(user.level);
    
    const pName = document.getElementById('profile-name');
    if (pName) pName.textContent = user.name;
    
    const pLocation = document.getElementById('profile-location');
    if (pLocation) pLocation.textContent = user.location;

    const pAvatar = document.getElementById('profile-avatar');
    const pImg = document.getElementById('profile-img');
    const pEmoji = document.getElementById('profile-emoji');
    
    if (pAvatar) {
        if (user.avatar.length > 2) { // Image path or Base64
            if (pImg) {
                pImg.src = user.avatar;
                pImg.style.display = 'block';
            }
            if (pEmoji) pEmoji.style.display = 'none';
        } else { // Emoji
            if (pEmoji) {
                pEmoji.textContent = user.avatar;
                pEmoji.style.display = 'block';
            }
            if (pImg) pImg.style.display = 'none';
        }
    }

    const pPoints = document.getElementById('profile-points');
    if (pPoints) pPoints.textContent = user.points.toLocaleString();

    const pCleanups = document.getElementById('profile-cleanups');
    if (pCleanups) pCleanups.textContent = user.cleanups;

    // Rank Badge in profile
    const pRankContainer = document.getElementById('profile-rank-container');
    if (pRankContainer) {
        pRankContainer.innerHTML = `<span class="rank-badge ${rank.class}">${rank.icon} ${rank.name} Hero</span>`;
    }

    // Mystery Gifts
    const giftGrid = document.getElementById('mystery-gift-grid');
    if (giftGrid) {
        const nextGiftLevel = Math.ceil((user.level + 0.1) / 10) * 10;
        const isUnlocked = user.level >= 10;
        
        giftGrid.innerHTML = `
            <div class="mystery-gift-card ${isUnlocked ? 'gift-unlocked' : 'gift-locked'}">
                <i class="fas fa-gift" style="font-size: 3rem; color: var(--primary); margin-bottom: 15px;"></i>
                <h3 style="color: #fff; margin-bottom: 5px;">${isUnlocked ? 'Gift Available!' : 'Mystery Reward'}</h3>
                <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px;">
                    ${isUnlocked ? 'You reached Level 10! Open your environmental impact kit.' : `Unlocks at Level ${nextGiftLevel}`}
                </p>
                <button class="btn ${isUnlocked ? 'btn-primary' : 'btn-outline'}" ${!isUnlocked ? 'disabled' : ''} style="width: 100%;">
                    ${isUnlocked ? 'Claim Reward' : `Locked (${user.level}/${nextGiftLevel})`}
                </button>
            </div>
        `;
    }

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

async function detectLocation(inputId) {
    const locInput = document.getElementById(inputId);
    if (!locInput) return;
    
    locInput.placeholder = "Detecting...";
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await response.json();
                const city = data.address.city || data.address.town || data.address.village || "Unknown Location";
                const state = data.address.state || "";
                locInput.value = `${city}, ${state}`;
            } catch (error) {
                locInput.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            }
        }, (error) => {
            alert("Location access denied. Please type manually.");
            locInput.placeholder = "City or GPS coords";
        });
    } else {
        alert("Geolocation not supported by your browser.");
    }
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
        points: 25
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
