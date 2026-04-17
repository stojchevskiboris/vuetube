document.addEventListener('DOMContentLoaded', async () => {
    await initPage();
    setupSearch('searchInput', 'bt1', navigateSearch);
    await renderLikedVideos();
});

async function renderLikedVideos() {
    const resultsEl = document.getElementById('results');
    if (!resultsEl) return;

    let rows;
    try {
        const result = await db.allDocs({ include_docs: true, descending: true });
        rows = result.rows;
    } catch (e) {
        resultsEl.innerHTML = '<p class="no-results">Failed to load liked videos.</p>';
        return;
    }

    if (rows.length === 0) {
        resultsEl.innerHTML = '<p class="no-results">You don\'t have any liked videos yet.</p>';
        return;
    }

    const isDark = document.body.classList.contains('darkTheme');
    const darkClass = isDark ? ' dark-bg' : '';

    const cards = rows.map(row => {
        const { _id: id, title, channelName, publishedAt } = row.doc;
        const isLive = publishedAt === 'Live';
        const liveClass = isLive ? ' live-badge' : '';
        const viewUrl = 'view.html?watch=' + id +
            '&title=' + encodeURIComponent(title || '') +
            '&channelName=' + encodeURIComponent(channelName || '') +
            '&publishedAt=' + encodeURIComponent(publishedAt || '');

        return '<div class="col-card">' +
            '<div class="card' + darkClass + '">' +
            '<a href="' + viewUrl + '">' +
            '<img src="https://img.youtube.com/vi/' + id + '/0.jpg" class="card-img-top" alt="' + (title || '') + '">' +
            '</a>' +
            '<div class="card-body">' +
            '<a href="' + viewUrl + '" class="card-title-link"><h5 class="card-title">' + (title || '') + '</h5></a>' +
            '<p class="card-meta">' + (channelName || '') + '</p>' +
            '<span class="card-date' + liveClass + '">' + (publishedAt || '') + '</span>' +
            '</div></div></div>';
    });

    resultsEl.innerHTML = cards.join('');
}
