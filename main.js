const API_ROOT = 'https://api.github.com';


const qs = sel => document.querySelector(sel);
const usernameInput = qs('#username');
const searchBtn = qs('#searchBtn');
const reposEl = qs('#repos');
const profileEl = qs('#profile');
const statusEl = qs('#status');

function setStatus(msg, isError = false) {
    statusEl.textContent = msg || '';
    statusEl.style.color = isError ? '#ff7b7b' : '';
}


async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}


function clearResults() {
    reposEl.innerHTML = '';
    profileEl.classList.add('hidden');
    profileEl.innerHTML = '';
    setStatus('');
}

function renderProfile(profile) {
    profileEl.classList.remove('hidden');
    profileEl.innerHTML = `
<img src="${profile.avatar_url}" alt="Avatar" />
<div class="profile-meta">
<h2>${profile.name || profile.login}</h2>
<p>@${profile.login} · ${profile.bio ? profile.bio : ''}</p>
<p class="muted">Repos públicos: ${profile.public_repos} · Followers: ${profile.followers}</p>
</div>
`;
}


function renderRepo(repo) {
    const div = document.createElement('article');
    div.className = 'repo';
    div.innerHTML = `
<div>
<h3>${repo.name}</h3>
<p>${repo.description || ''}</p>
</div>
<div>
<div class="meta">
<span>⭐ ${repo.stargazers_count}</span>
<span>🍴 ${repo.forks_count}</span>
<span>${repo.language || ''}</span>
</div>
<a href="${repo.html_url}" target="_blank" rel="noopener">Ver en GitHub</a>
</div>
`;
    reposEl.appendChild(div);
}

async function searchUser(username) {
    clearResults();
    if (!username) return setStatus('Escribe un nombre de usuario para buscar.', true);
    setStatus('Cargando...');


    try {
        const profile = await fetchJSON(`${API_ROOT}/users/${username}`);
        renderProfile(profile);


        // obtener repos — los más recientes primero
        const repos = await fetchJSON(`${API_ROOT}/users/${username}/repos?per_page=100&sort=updated`);
        if (!repos.length) {
            setStatus('Este usuario no tiene repositorios públicos.');
            return;
        }


        repos.slice(0, 40).forEach(renderRepo);
        setStatus(`Mostrando ${Math.min(repos.length, 40)} repositorios (ordenados por actualización).`);
    } catch (err) {
        console.error(err);
        setStatus('Error: ' + err.message, true);
    }
}

// Eventos
searchBtn.addEventListener('click', () => searchUser(usernameInput.value.trim()));
usernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchUser(usernameInput.value.trim()) });


// carga un ejemplo por defecto
window.addEventListener('load', () => {
    usernameInput.value = 'octocat';
    searchUser('octocat');
});