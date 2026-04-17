document.addEventListener('DOMContentLoaded', async () => {
    await initPage();
    setupSearch('searchInput', 'bt1', navigateSearch);
});
