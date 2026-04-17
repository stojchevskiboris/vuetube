document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const watchID = urlParams.get('watch');
    const title = urlParams.get('title') || '';
    const channelName = urlParams.get('channelName') || '';
    const publishedAt = urlParams.get('publishedAt') || '';

    if (!watchID) {
        window.location.href = 'index.html';
        return;
    }

    await initPage();
    setupSearch('searchInput', 'bt1', navigateSearch);

    // Set video player and metadata
    document.getElementById('player').src = 'https://www.youtube.com/embed/' + watchID;
    document.getElementById('watchTitle').textContent = title;
    document.getElementById('channelName').textContent = channelName;
    document.getElementById('publishedAt').textContent = publishedAt ? 'Published: ' + publishedAt : '';

    // Set up like / unlike buttons
    const likeBtn = document.getElementById('like');
    const unlikeBtn = document.getElementById('unlike');

    async function refreshLikeState() {
        try {
            await db.get(watchID);
            likeBtn.style.display = 'none';
            unlikeBtn.style.display = 'inline-block';
        } catch (e) {
            likeBtn.style.display = 'inline-block';
            unlikeBtn.style.display = 'none';
        }
    }

    await refreshLikeState();

    likeBtn.addEventListener('click', async () => {
        const video = {
            _id: watchID,
            title,
            channelName,
            publishedAt,
            dateAdded: new Date().toLocaleString(),
            userSession: localStorage.getItem('sessionId')
        };
        try {
            await db.put(video);
        } catch (e) {
            if (e.status === 409) {
                // Already exists, ignore
            } else {
                console.error('Failed to like video:', e);
                return;
            }
        }
        await refreshLikeState();
    });

    unlikeBtn.addEventListener('click', async () => {
        try {
            const doc = await db.get(watchID);
            await db.remove(doc);
        } catch (e) {
            console.error('Failed to unlike video:', e);
            return;
        }
        await refreshLikeState();
    });

    // Load suggested videos
    await loadSuggestedVideos(title, watchID);
});

async function loadSuggestedVideos(query, excludeWatchId) {
    const resultsEl = document.getElementById('results');
    if (!resultsEl) return;

    resultsEl.innerHTML = '<div class="loading-wrap"><img id="loadingGIF" src="static/loading.gif" alt="Loading..."></div>';

    try {
        const items = await fetchYouTubeResults(query, 12);
        const cards = items
            .map(item => buildVideoCard(item, excludeWatchId))
            .filter(Boolean);

        if (cards.length === 0) {
            resultsEl.innerHTML = '<p class="no-results">No suggestions found.</p>';
        } else {
            resultsEl.innerHTML = cards.join('');
            setContrast(document.body.classList.contains('darkTheme'));
        }
    } catch (e) {
        console.error('Suggestions error:', e);
        resultsEl.innerHTML = '<p class="no-results">Failed to load suggestions.</p>';
    }
}
