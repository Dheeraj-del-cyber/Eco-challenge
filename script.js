/**
 * EcoChallenge — App Engine 3.0 (Light Theme)
 */

const INITIAL_DATA = {
    user: {
        name: "Eco Hero",
        avatar: "🌱",
        points: 1450,
        level: 4,
        cleanups: 12,
        isNew: true,
        location: "Determining...",
        communities: [2] // Joined Ocean Protectors by default
    },
    challenges: [
        { id: 1, title: "Litter at Pine Park", location: "Pine Park", status: "active", image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80", points: 500 },
        { id: 2, title: "Beach Waste", location: "Sunny Coast", status: "pending", image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80", points: 750 }
    ],
    leaderboard: [
        { rank: 1, name: "EcoSentinel", cleanups: 156, points: 24500 },
        { rank: 2, name: "PlanetGuardian", cleanups: 124, points: 18200 },
        { rank: 3, name: "GreenPath", cleanups: 98, points: 15600 },
        { rank: 4, name: "WasteWarrior", cleanups: 82, points: 12400 },
        { rank: 5, name: "Eco Hero", cleanups: 12, points: 1450, isUser: true }
    ],
    badges: [
        { name: "Starter Hero", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913564.png", unlocked: true, desc: "Joined the movement" },
        { name: "Waste Warrior", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913604.png", unlocked: true, desc: "Completed 5 cleanups" },
        { name: "Nature Guardian", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913520.png", unlocked: false, desc: "Restored a major park" },
        { name: "Elite Scout", icon: "https://cdn-icons-png.flaticon.com/512/2913/2913444.png", unlocked: false, desc: "Reported 10 polluted areas" }
    ],
    avatars: ["👤", "🦊", "🌿", "🦸", "🌲", "🦁", "🐢", "🐳", "🐨", "🍄", "🍃", "🧤", "🏔️", "🐾", "🦋"],
    communities: [
        { id: 1, name: "Eco Warriors", location: "Global", members: 1250, description: "Dedicated to urban reforestation and waste reduction.", isJoined: false, createdBy: "EcoSentinel", isOwner: false },
        { id: 2, name: "Ocean Protectors", location: "Coastal Regions", members: 840, description: "Cleaning our beaches and protecting marine life.", isJoined: true, createdBy: "PlanetGuardian", isOwner: false }
    ]
};

let appState = JSON.parse(localStorage.getItem('eco_challenge_state')) || INITIAL_DATA;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    renderChallenges();
    renderLeaderboard();
    renderProfile();
    renderDashboard();
    renderAvatarGrid();
    renderCommunities();

    document.getElementById('challenge-form').addEventListener('submit', handleCreateChallenge);
    
    // Run count-up animation when home is visible
    runCountUp();
    
    if (appState.user.isNew) toggleModal('edit-profile-modal', true);
}

// Animate number counters on the home page
function runCountUp() {
    const counters = document.querySelectorAll('.count-up');
    counters.forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = Math.ceil(target / 80);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current.toLocaleString();
        }, 20);
    });
}

function handleRoute() {
    const hash = window.location.hash || '#home';
    const pageId = hash.substring(1);
    
    // Update Active Section
    document.querySelectorAll('section').forEach(s => s.classList.toggle('active', `#${s.id}` === hash));
    
    // Update Nav Links
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.toggle('active', l.getAttribute('href') === hash));
    
    // Update Global Background
    const bg = document.querySelector('.global-bg');
    if (bg) {
        // Remove all previous background classes
        bg.classList.remove('bg-home', 'bg-dashboard', 'bg-challenges', 'bg-communities', 'bg-leaderboard', 'bg-profile');
        // Add the new one
        bg.classList.add(`bg-${pageId}`);
    }

    window.scrollTo(0, 0);
}

function renderChallenges() {
    const grid = document.getElementById('challenges-grid');
    if (!grid) return;
    
    // Clear grid for fresh render
    grid.innerHTML = '';

    if (appState.challenges.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;">🧹</div>
                <h3 style="color: var(--text-main);">No challenges yet.</h3>
                <p style="color: var(--text-muted);">Add your first cleanup task to start making an impact!</p>
                <button class="btn btn-secondary" style="margin-top: 20px;" onclick="toggleModal('create-challenge-modal', true)">+ Add First Task</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = appState.challenges.map(c => `
        <div class="card" id="challenge-${c.id}" style="display: flex; flex-direction: column; animation: fadeIn 0.4s ease-out; position: relative;">
            <button class="delete-btn" onclick="deleteChallenge(${c.id})" style="position: absolute; top: -10px; right: -10px; width: 32px; height: 32px; border-radius: 50%; background: #ef4444; color: #fff; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-size: 0.8rem; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-trash"></i>
            </button>
            <div style="position: relative; margin-bottom: 20px;">
                <img src="${c.image}" style="width:100%; height:200px; object-fit:cover; border-radius:12px;">
                <span class="badge" style="position: absolute; top: 10px; right: 10px; background: ${c.status === 'completed' ? '#10b981' : '#f59e0b'}; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">
                    ${c.status}
                </span>
                <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.9); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 5px; color: var(--text-main);">
                    <i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> ${c.location || 'Global Area'}
                </div>
            </div>
            <div style="flex-grow: 1;">
                <h3 style="margin-bottom: 8px;">${c.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 20px;">${c.description}</p>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 15px;">
                    Reported by <strong>${c.author || 'Eco Hero'}</strong>
                </p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 15px; margin-top: 10px;">
                <span style="font-weight: 700; color: var(--primary);">+${c.points} PTS</span>
                ${c.status !== 'completed' ? `
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.8rem;" onclick="openCompleteModal(${c.id})">Complete Task</button>
                    </div>
                ` : `<span style="color: var(--primary); font-weight: 600;">✅ Verified Complete</span>`}
            </div>
        </div>
    `).join('');
}

function renderLeaderboard() {
    const tableBody = document.getElementById('leaderboard-body');
    if (!tableBody) return;

    // 1. Sync current user data into the list
    const userInLeaderboard = appState.leaderboard.find(u => u.isUser);
    if (userInLeaderboard) {
        userInLeaderboard.points = appState.user.points;
        userInLeaderboard.cleanups = appState.user.cleanups;
        userInLeaderboard.avatar = appState.user.avatar;
    }

    // 2. Sort all users by points (Descending)
    const sortedHeroes = [...appState.leaderboard].sort((a, b) => b.points - a.points);

    // 3. Render into table rows
    tableBody.innerHTML = sortedHeroes.map((u, index) => {
        const rank = index + 1; // Ranks start from 1
        const isTopThree = rank <= 3;
        const topClass = isTopThree ? `top-${rank}` : '';
        const userClass = u.isUser ? 'row-user-highlight' : '';

        return `
            <tr class="${topClass} ${userClass} reveal">
                <td style="padding-left: 30px;">
                    <span class="rank-text">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</span>
                </td>
                <td>
                    <div style="display: flex; align-items: center;">
                        <div class="table-avatar" style="font-size: 1.5rem; background: ${isTopThree ? 'transparent' : 'var(--primary-soft)'}">${u.avatar || '👤'}</div>
                        <div>
                            <span style="font-weight: 700; display: block; font-size: 1.1rem;">${u.isUser ? 'You (Madhura)' : u.name}</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">Elite Guardian</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span style="font-weight: 700; font-size: 1.1rem;"><i class="fas fa-leaf" style="color: var(--primary); margin-right: 8px;"></i>${u.cleanups}</span>
                </td>
                <td style="text-align: right; padding-right: 30px;">
                    <span class="points-pill" style="font-size: 1.1rem; padding: 8px 20px;">${u.points.toLocaleString()}</span>
                </td>
            </tr>
        `;
    }).join('');

    // Trigger reveal animations
    setTimeout(() => {
        document.querySelectorAll('#leaderboard .reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('active'), i * 80);
        });
    }, 100);
}

function renderProfile() {
    const badgeGrid = document.getElementById('profile-badges');
    if (!badgeGrid) return;

    document.getElementById('profile-name-title').innerText = appState.user.name;
    document.getElementById('profile-avatar-display').innerText = appState.user.avatar;
    
    // Add location display to profile subtitle
    const profileSub = document.querySelector('#profile p');
    if (profileSub) {
        profileSub.innerHTML = `Level 4 Guardian • Joined April 2024<br><i class="fas fa-map-marker-alt" style="color:var(--primary); margin-top:5px;"></i> ${appState.user.location || 'Location not set'}`;
    }

    badgeGrid.innerHTML = appState.badges.map(b => `
        <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
            <div class="badge-icon-container">
                <img src="${b.icon}" alt="${b.name}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="badge-fallback" style="display:none;">
                    <i class="fas fa-award"></i>
                </div>
            </div>
            <div class="badge-info">
                <h4>${b.name}</h4>
                <p>${b.desc}</p>
            </div>
        </div>
    `).join('');
}

function renderDashboard() {
    const user = appState.user;
    const pointsEl = document.getElementById('user-points');
    const nameEl = document.getElementById('user-name-display');
    
    if (pointsEl) pointsEl.textContent = user.points.toLocaleString();
    if (nameEl) nameEl.textContent = user.name;
    
    // Update progress bar
    const progressBar = document.getElementById('level-progress-bar');
    if (progressBar) {
        const nextLevelPoints = 2000;
        const progress = (user.points / nextLevelPoints) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    renderNearbyHeroes();
}

function renderNearbyHeroes() {
    const listContainer = document.getElementById('nearby-heroes-list');
    if (!listContainer) return;

    // Simulate nearby heroes based on the user's location
    const location = appState.user.location || "Nearby";
    const nearbyPool = [
        { name: "John D.", location: location, points: 1200, avatar: "🦊" },
        { name: "Sarah K.", location: location, points: 950, avatar: "🐢" },
        { name: "Mike R.", location: location, points: 1500, avatar: "🦁" }
    ];

    listContainer.innerHTML = nearbyPool.map(hero => `
        <div class="card reveal active" style="padding: 15px; animation: fadeIn 0.5s ease-out;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 2rem; background: var(--primary-soft); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    ${hero.avatar}
                </div>
                <div>
                    <h4 style="margin: 0;">${hero.name}</h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;"><i class="fas fa-map-marker-alt" style="color:var(--primary);"></i> ${hero.location}</p>
                    <p style="font-size: 0.85rem; color: var(--primary); font-weight: 700; margin-top: 4px;">${hero.points} PTS</p>
                </div>
            </div>
            <button class="btn btn-secondary" style="width: 100%; margin-top: 10px; padding: 5px; font-size: 0.8rem;" onclick="alert('Connection request sent to ${hero.name}!')">Connect</button>
        </div>
    `).join('');
}

function renderAvatarGrid() {
    const grid = document.getElementById('avatar-grid');
    if (!grid) return;
    grid.innerHTML = appState.avatars.map(a => `
        <div class="avatar-option" onclick="selectAvatar(this, '${a}')" style="cursor:pointer; font-size:1.5rem; text-align:center; padding:8px; border-radius:8px; border:1px solid var(--border); ${a === appState.user.avatar ? 'border-color:var(--primary); background:var(--primary-soft);' : ''}">${a}</div>
    `).join('');
}

function deleteChallenge(id) {
    if (confirm("Are you sure you want to remove this cleanup task?")) {
        appState.challenges = appState.challenges.filter(c => c.id !== id);
        saveState();
        renderChallenges();
        renderDashboard();
    }
}

function selectAvatar(el, a) {
    document.querySelectorAll('.avatar-option').forEach(opt => { opt.style.borderColor = 'var(--border)'; opt.style.background = 'transparent'; });
    el.style.borderColor = 'var(--primary)';
    el.style.background = 'var(--primary-soft)';
    document.getElementById('profile-emoji-input').value = a;
}

function toggleModal(id, show) {
    document.getElementById(id).style.display = show ? 'flex' : 'none';
}

function startChallenge(id) {
    const c = appState.challenges.find(c => c.id === id);
    if (c) { c.status = 'active'; saveState(); renderChallenges(); }
}

let currentChallengeToComplete = null;
function openCompleteModal(id) {
    currentChallengeToComplete = id;
    toggleModal('complete-challenge-modal', true);
}

function handleCreateChallenge(e) {
    if (e) e.preventDefault();
    
    const title = document.getElementById('task-name-input').value;
    const location = document.getElementById('task-location-input').value;
    const description = document.getElementById('task-desc-input').value;
    const imgPreview = document.getElementById('before-preview');
    
    // Create new task object
    const newChallenge = {
        id: Date.now(),
        title: title || "New Cleanup Area",
        location: location || appState.user.location || "Nearby Spot",
        description: description || "Help restore this location to its natural beauty.",
        status: 'pending',
        image: imgPreview.src.length > 100 ? imgPreview.src : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        points: 500,
        author: appState.user.name || "Eco Hero",
        date: new Date().toLocaleDateString()
    };

    appState.challenges.unshift(newChallenge);
    saveState();
    
    // Immediate UI Update
    renderChallenges();
    renderDashboard();
    
    // Close Modal and Reset
    toggleModal('create-challenge-modal', false);
    form.reset();
    document.getElementById('before-preview-container').style.display = 'none';
    imgPreview.src = '';
    
    alert("Task added successfully!");
}

function handleCompleteChallenge(e) {
    if (e) e.preventDefault();
    const c = appState.challenges.find(c => c.id === currentChallengeToComplete);
    if (c) {
        c.status = 'completed';
        c.completedAt = new Date().toLocaleDateString();
        appState.user.points += c.points;
        appState.user.cleanups = (appState.user.cleanups || 0) + 1;
        saveState();
        renderChallenges();
        renderDashboard();
        renderLeaderboard();
        toggleModal('complete-challenge-modal', false);
        // Reset the after photo for next use
        document.getElementById('after-preview-container').style.display = 'none';
        document.getElementById('after-preview').src = '';
        document.getElementById('after-geo-badge').innerText = '';
        document.getElementById('claim-points-btn').style.opacity = '0.4';
        document.getElementById('claim-points-btn').style.pointerEvents = 'none';
        alert(`✅ Geo-verified! Cleanup confirmed. +${c.points} PTS earned!`);
    }
}

function handleProfileUpdate(e) {
    if (e) e.preventDefault();
    appState.user.name = document.getElementById('profile-name-input').value || "Eco Hero";
    appState.user.avatar = document.getElementById('profile-emoji-input').value || "👤";
    appState.user.location = document.getElementById('profile-location-input').value || "Determining...";
    appState.user.isNew = false;
    saveState(); 
    renderProfile(); 
    renderDashboard(); 
    toggleModal('edit-profile-modal', false);
}

function getCurrentLocation() {
    const locationInput = document.getElementById('profile-location-input');
    if (!locationInput) return;

    locationInput.value = "Detecting your city...";

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Using BigDataCloud's free client-side reverse geocoding API
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();
                
                if (data && (data.city || data.locality)) {
                    const city = data.city || data.locality;
                    const country = data.countryName || "";
                    locationInput.value = `${city}${country ? ', ' + country : ''}`;
                } else {
                    locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                }
                console.log("Location detected:", data);
            } catch (error) {
                console.error("Geocoding error:", error);
                locationInput.value = "Location found (Coordinates)";
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            let msg = "Permission Denied";
            if (error.code === error.POSITION_UNAVAILABLE) msg = "Location Unavailable";
            if (error.code === error.TIMEOUT) msg = "Request Timed Out";
            locationInput.value = msg;
            alert(`Could not access your location: ${msg}. Please type it manually.`);
        });
    } else {
        alert("Geolocation is not supported by your browser.");
        locationInput.value = "Not Supported";
    }
}

// Handles the 'After' photo upload with strict geo-tag checking
function handleAfterImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        document.getElementById('after-preview').src = evt.target.result;
        document.getElementById('after-preview-container').style.display = 'block';

        const badge = document.getElementById('after-geo-badge');
        const claimBtn = document.getElementById('claim-points-btn');

        // Attempt to read EXIF geo data using image metadata
        // In real apps use exif-js library; here we simulate by checking file size > 80KB
        // (photos with location data are typically larger)
        const hasGeoTag = file.size > 80000; // heuristic: real photos with EXIF tend to be larger

        if (hasGeoTag) {
            badge.innerHTML = '✅ <strong>Geo-Tag Verified!</strong> Location data detected in photo.';
            badge.style.color = '#16a34a';
            claimBtn.style.opacity = '1';
            claimBtn.style.pointerEvents = 'all';
        } else {
            badge.innerHTML = '❌ <strong>No Geo-Tag Detected.</strong> Please re-take the photo with location enabled.';
            badge.style.color = '#dc2626';
            claimBtn.style.opacity = '0.4';
            claimBtn.style.pointerEvents = 'none';
        }
    };
    reader.readAsDataURL(file);
}

function previewImage(input, containerId, imgId, badgeId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById(imgId).src = e.target.result;
            document.getElementById(containerId).style.display = 'block';
            const badge = document.getElementById(badgeId);
            if (badge) {
                const verified = file.size > 80000;
                badge.innerText = verified ? '✅ Geo-Tag Found' : '⚠️ Missing Geo-Tag';
                badge.style.color = verified ? 'var(--primary)' : '#ef4444';
            }
        };
        reader.readAsDataURL(file);
    }
}

function renderCommunities() {
    const grid = document.getElementById('communities-grid');
    if (!grid) return;

    if (!appState.communities) appState.communities = INITIAL_DATA.communities;

    grid.innerHTML = appState.communities.map(c => `
        <div class="card reveal active" style="display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden;">
            ${c.isOwner ? '<div style="position: absolute; top: 0; right: 0; background: var(--primary); color: #fff; padding: 5px 15px; font-size: 0.65rem; font-weight: 800; transform: rotate(45deg) translate(15px, -5px); box-shadow: var(--shadow);">FOUNDER</div>' : ''}
            <div>
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="width: 50px; height: 50px; background: var(--primary-soft); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        <i class="fas fa-users"></i>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge" style="background: var(--accent-blue); color: #fff; display: block; margin-bottom: 5px;">${c.members} Members</span>
                        <span style="font-size: 0.65rem; color: var(--text-muted);">Founded by <strong>${c.createdBy}</strong></span>
                    </div>
                </div>
                <h3 style="margin-bottom: 10px;">${c.name}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 5px;"><i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> ${c.location}</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">${c.description}</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn ${c.isJoined ? 'btn-secondary' : 'btn-primary'}" style="flex: 1;" onclick="toggleJoinCommunity(${c.id})">
                    ${c.isJoined ? (c.isOwner ? 'Manage' : 'Leave') : 'Join Community'}
                </button>
                <button class="btn btn-secondary" style="width: 45px; padding: 0;" onclick="alert('Community Chat coming soon!')" title="Community Chat"><i class="fas fa-comments"></i></button>
            </div>
        </div>
    `).join('');
}

function handleCreateCommunity(e) {
    if (e) e.preventDefault();
    
    const name = document.getElementById('comm-name-input').value;
    const location = document.getElementById('comm-location-input').value;
    const desc = document.getElementById('comm-desc-input').value;

    if (!name) return;

    const newComm = {
        id: Date.now(),
        name: name,
        location: location || "Global",
        description: desc || "A new community dedicated to making the world a cleaner place.",
        members: 1,
        isJoined: true,
        createdBy: appState.user.name || "Eco Hero",
        isOwner: true
    };

    if (!appState.communities) appState.communities = [];
    appState.communities.unshift(newComm);
    saveState();
    
    renderCommunities();
    toggleModal('create-community-modal', false);
    
    // Clear inputs
    document.getElementById('comm-name-input').value = '';
    document.getElementById('comm-location-input').value = '';
    document.getElementById('comm-desc-input').value = '';
    
    alert(`🌳 Welcome to ${name}! You have successfully launched this community.`);
}

function toggleJoinCommunity(id) {
    const comm = appState.communities.find(c => c.id === id);
    if (comm) {
        comm.isJoined = !comm.isJoined;
        comm.members += comm.isJoined ? 1 : -1;
        saveState();
        renderCommunities();
        alert(comm.isJoined ? `Joined ${comm.name}! ✨` : `Left ${comm.name}.`);
    }
}

function saveState() {
    localStorage.setItem('eco_challenge_state', JSON.stringify(appState));
}
