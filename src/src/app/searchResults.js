document.addEventListener('DOMContentLoaded', async () => {
    await initPage();

    const urlParams = new URLSearchParams(window.location.search);
    const queryFromUrl = urlParams.get('q');
    const searchInput = document.getElementById('searchInput');

    if (queryFromUrl && searchInput) {
        searchInput.value = queryFromUrl;
    }

    setupSearch('searchInput', 'bt1', runSearch);

    await runSearch(queryFromUrl || 'programming');
});

async function runSearch(query) {
    if (!query || !query.trim()) return;
    const resultsEl = document.getElementById('results');
    if (!resultsEl) return;

    resultsEl.innerHTML = '<div class="loading-wrap"><img id="loadingGIF" src="static/loading.gif" alt="Loading..."></div>';

    try {
        const items = await fetchYouTubeResults(query.trim(), 20);
        if (!items || items.length === 0) {
            resultsEl.innerHTML = '<p class="no-results">No results found.</p>';
            return;
        }
        resultsEl.innerHTML = items.map(item => buildVideoCard(item, null)).join('');
        setContrast(document.body.classList.contains('darkTheme'));
    } catch (e) {
        console.error('Search error:', e);
        resultsEl.innerHTML = '<p class="no-results">Failed to load results. Please try again.</p>';
    }
}
