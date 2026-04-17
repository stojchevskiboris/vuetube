// ==================== Database ====================
const db = new PouchDB('users_db');
const dbContrast = new PouchDB('contrast');

// ==================== Session ====================
function ensureSession() {
    if (!localStorage.getItem('sessionId')) {
        const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 10; i++) {
            id += charset[Math.floor(Math.random() * charset.length)];
        }
        localStorage.setItem('sessionId', id);
    }
}

// ==================== Layout (header / footer) ====================
async function loadLayout() {
    const [headerRes, footerRes] = await Promise.all([
        fetch('header.html'),
        fetch('footer.html')
    ]);
    const [headerHtml, footerHtml] = await Promise.all([
        headerRes.text(),
        footerRes.text()
    ]);
    const headerEl = document.getElementById('header');
    const footerEl = document.getElementById('footer');
    if (headerEl) headerEl.innerHTML = headerHtml;
    if (footerEl) footerEl.innerHTML = footerHtml;
}

// ==================== Contrast ====================
function setContrast(dark) {
    document.body.classList.toggle('darkTheme', dark);
    document.body.classList.toggle('lightTheme', !dark);

    const contrastBtn = document.getElementById('contrastLink');
    if (contrastBtn) contrastBtn.src = dark ? 'static/daylight.png' : 'static/darklight.png';

    const githubLink = document.getElementById('githubLink');
    const githubFooter = document.getElementById('githubFooter');
    if (githubLink) githubLink.src = dark ? 'static/githubLight.png' : 'static/githubDark.png';
    if (githubFooter) githubFooter.src = dark ? 'static/githubLight.png' : 'static/githubDark.png';

    document.querySelectorAll('.card').forEach(el => el.classList.toggle('dark-bg', dark));
    document.querySelectorAll('input[type="search"], .form-control').forEach(el => el.classList.toggle('fc-dark', dark));
}

async function initContrast() {
    let doc;
    try {
        doc = await dbContrast.get('contrast');
    } catch (e) {
        if (e.status === 404) {
            try {
                await dbContrast.put({ _id: 'contrast', dark: false });
                doc = { dark: false };
            } catch (conflictErr) {
                // Race condition: doc was created by another tab/context; read the existing one
                try {
                    doc = await dbContrast.get('contrast');
                } catch (_) {
                    doc = { dark: false };
                }
            }
        } else {
            doc = { dark: false };
        }
    }
    setContrast(doc.dark);
}

async function toggleContrast() {
    try {
        const doc = await dbContrast.get('contrast');
        const newDark = !doc.dark;
        try {
            await dbContrast.put({ _id: 'contrast', _rev: doc._rev, dark: newDark });
        } catch (conflictErr) {
            // Doc updated concurrently; re-read and retry once
            const fresh = await dbContrast.get('contrast');
            await dbContrast.put({ _id: 'contrast', _rev: fresh._rev, dark: newDark });
        }
        setContrast(newDark);
    } catch (e) {
        console.error('Failed to toggle contrast:', e);
    }
}

// ==================== Navigation ====================
function setupNav() {
    const homeBtn = document.getElementById('homeBtn');
    const likedVids = document.getElementById('likedVids');
    const contrastBtn = document.getElementById('contrastLink');
    if (homeBtn) homeBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
    if (likedVids) likedVids.addEventListener('click', () => { window.location.href = 'likedVideos.html'; });
    if (contrastBtn) contrastBtn.addEventListener('click', toggleContrast);
}

// ==================== Search / Autocomplete ====================
function setupSearch(inputId, btnId, searchFn) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input) return;

    const doSearch = () => {
        const q = input.value.trim();
        if (q) searchFn(q);
    };

    if (btn) btn.addEventListener('click', doSearch);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
    });

    input.addEventListener('input', async () => {
        const q = input.value.trim();
        if (!q) return;
        try {
            const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(q)}*&max=10`);
            const data = await res.json();
            const predictions = data.map(w => w.word);
            $(`#${inputId}`).autocomplete({
                source: predictions,
                select: (event, ui) => {
                    input.value = ui.item.label;
                    setTimeout(doSearch, 100);
                    return false;
                }
            });
        } catch (_) {}
    });
}

function navigateSearch(query) {
    if (!query) return;
    window.location.href = 'searchResults.html?q=' + encodeURIComponent(query);
}

// ==================== YouTube API ====================
async function fetchYouTubeResults(query, maxResults) {
    if (!maxResults) maxResults = 20;
    const apiKeys = [
        'AIzaSyB5LG4TFaO95eqkE6yRBgJgr0egwSBSy8U',
        'AIzaSyD1HX-in66XEtm57Ig6S2JJDQ56uXr5c2s',
        'AIzaSyAdv9_oNyCgRE_coy3QYLlIG05bBqznx80'
    ];
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=${maxResults}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('YouTube API error: ' + res.status);
    const data = await res.json();
    if (!data.items) throw new Error('No items in YouTube API response');
    return data.items.map(item => {
        const obj = {
            isChannel: false,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.high.url,
            publishedAt: item.snippet.publishedAt
        };
        if (item.id.kind === 'youtube#channel') {
            obj.isChannel = true;
            obj.channelURL = 'https://www.youtube.com/channel/' + item.id.channelId;
            obj.publishedAt = 'Channel';
        } else {
            obj.live = item.snippet.liveBroadcastContent;
            obj.watch = item.id.videoId;
            obj.videoURL = 'https://www.youtube.com/watch?v=' + item.id.videoId;
            obj.channelURL = 'https://www.youtube.com/channel/' + item.snippet.channelId;
            obj.chTitle = item.snippet.channelTitle;
        }
        return obj;
    }).filter(obj => obj.isChannel || obj.watch);
}

// ==================== Card builder ====================
function formatDate(dateStr) {
    if (!dateStr || dateStr === 'Channel') return dateStr;
    const d = dateStr.slice(0, 10);
    return d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + d.slice(0, 4);
}

function buildVideoCard(item, excludeWatchId) {
    if (item.watch && item.watch === excludeWatchId) return '';
    const isDark = document.body.classList.contains('darkTheme');
    const darkClass = isDark ? ' dark-bg' : '';
    const dateQS = item.live === 'live' ? 'Live' : formatDate(item.publishedAt);
    const dateBadge = item.live === 'live'
        ? '<span class="live-badge">LIVE</span>'
        : '<span class="card-date">' + (formatDate(item.publishedAt) || '') + '</span>';

    if (item.isChannel) {
        return '<div class="col-card">' +
            '<div class="card' + darkClass + '">' +
            '<a href="' + item.channelURL + '" target="_blank" rel="noopener">' +
            '<img src="' + item.thumbnailUrl + '" class="card-img-top" alt="' + item.title + '">' +
            '</a>' +
            '<div class="card-body">' +
            '<a href="' + item.channelURL + '" target="_blank" rel="noopener" class="card-title-link">' +
            '<h5 class="card-title">' + item.title + '</h5>' +
            '</a>' +
            '<p class="card-meta">Channel</p>' +
            '</div></div></div>';
    }

    const viewUrl = 'view.html?watch=' + item.watch +
        '&title=' + encodeURIComponent(item.title) +
        '&channelName=' + encodeURIComponent(item.chTitle) +
        '&publishedAt=' + encodeURIComponent(dateQS);

    return '<div class="col-card">' +
        '<div class="card' + darkClass + '">' +
        '<a href="' + viewUrl + '">' +
        '<img src="' + item.thumbnailUrl + '" class="card-img-top" alt="' + item.title + '">' +
        '</a>' +
        '<div class="card-body">' +
        '<a href="' + viewUrl + '" class="card-title-link">' +
        '<h5 class="card-title">' + item.title + '</h5>' +
        '</a>' +
        '<p class="card-meta"><a href="' + item.channelURL + '" target="_blank" rel="noopener">' + item.chTitle + '</a></p>' +
        dateBadge +
        '</div></div></div>';
}

// ==================== Page initializer ====================
async function initPage() {
    ensureSession();
    await loadLayout();
    setupNav();
    await initContrast();
}
