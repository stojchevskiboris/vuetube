document.addEventListener('DOMContentLoaded', async () => {
    await initPage();
    setupSearch('searchInput', 'bt1', navigateSearch);
    setupSearch('searchInput2', 'bt2', navigateSearch);
});
