// Wait until DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------
    // Helpers
    // -----------------------------
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // -----------------------------
    // Element References
    // -----------------------------
    const pages = $$('.page');

    const prevBtn = $('#prev-btn');
    const nextBtn = $('#next-btn');
    const pageCounter = $('#page-counter');

    const book = $('#book');

    const tocSidebar = $('#toc-sidebar');
    const tocToggle = $('#toc-toggle');
    const tocClose = $('#toc-close');
    const tocList = $('#toc-list');

    const searchModal = $('#search-modal');
    const searchToggle = $('#search-toggle');
    const searchClose = $('#search-close');
    const searchInput = $('#search-input');
    const searchResults = $('#search-results');

    const bookmarkBtns = $$('.bookmark-btn');

    // -----------------------------
    // Validation
    // -----------------------------
    if (!pages.length) {
        console.error('No .page elements found.');
        return;
    }

    // -----------------------------
    // State
    // -----------------------------
    let currentPage = 0;
    const totalPages = pages.length;

    let bookmarks = [];

    try {
        bookmarks =
            JSON.parse(localStorage.getItem('notebook-bookmarks')) || [];
    } catch (err) {
        console.warn('Failed to load bookmarks from localStorage');
        bookmarks = [];
    }

    // -----------------------------
    // Initialization
    // -----------------------------
    updatePageCounter();
    updateZIndex();
    generateTOC();
    updateBookmarkButtons();

    // -----------------------------
    // Navigation
    // -----------------------------
    function flipNext() {
        if (currentPage >= totalPages - 1) return;

        pages[currentPage].classList.add('flipped');
        currentPage++;

        updatePageCounter();
        updateZIndex();
    }

    function flipPrev() {
        if (currentPage <= 0) return;

        currentPage--;
        pages[currentPage].classList.remove('flipped');

        updatePageCounter();
        updateZIndex();
    }

    function flipToPage(pageIndex) {

        if (pageIndex < 0 || pageIndex >= totalPages) return;

        pages.forEach((page, index) => {

            if (index < pageIndex) {
                page.classList.add('flipped');
            } else {
                page.classList.remove('flipped');
            }

        });

        currentPage = pageIndex;

        updatePageCounter();
        updateZIndex();
    }

    // -----------------------------
    // UI Updates
    // -----------------------------
    function updatePageCounter() {

        if (!pageCounter) return;

        pageCounter.textContent =
            `Page ${currentPage + 1} of ${totalPages}`;
    }

    function updateZIndex() {

        pages.forEach((page, index) => {

            if (index < currentPage) {
                // Already flipped
                page.style.zIndex = index + 1;

            } else if (index === currentPage) {
                // Current visible page
                page.style.zIndex = totalPages + 100;

            } else {
                // Remaining pages
                page.style.zIndex = totalPages - index;
            }

        });
    }

    // -----------------------------
    // Event Listeners
    // -----------------------------

    // Buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', flipNext);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', flipPrev);
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {

        // Ignore typing in inputs
        const active = document.activeElement;

        if (
            active &&
            (
                active.tagName === 'INPUT' ||
                active.tagName === 'TEXTAREA'
            )
        ) {
            return;
        }

        if (e.key === 'ArrowRight') {
            flipNext();
        }

        if (e.key === 'ArrowLeft') {
            flipPrev();
        }

    });

        // Click Book Left/Right
    if (book) {

        book.addEventListener('click', (e) => {

            // Do not flip pages when clicking interactive elements.
            if (e.target.closest('a, button, input, textarea, select, label')) {
                return;
            }

            const rect = book.getBoundingClientRect();
            const clickX = e.clientX - rect.left;

            if (clickX > rect.width / 2) {
                flipNext();
            } else {
                flipPrev();
            }

        });

    }
    
    // -----------------------------
    // Table of Contents
    // -----------------------------
    if (tocToggle && tocSidebar) {

        tocToggle.addEventListener('click', () => {
            tocSidebar.classList.add('open');
        });

    }

    if (tocClose && tocSidebar) {

        tocClose.addEventListener('click', () => {
            tocSidebar.classList.remove('open');
        });

    }

    function generateTOC() {

        if (!tocList) return;

        tocList.innerHTML = '';

        // Page entries
        pages.forEach((page, index) => {

            const heading =
                page.querySelector('.front h2');

            const li = document.createElement('li');

            li.textContent =
                `Page ${index + 1}: ${
                    heading?.textContent || 'Untitled'
                }`;

            li.addEventListener('click', () => {

                flipToPage(index);

                if (tocSidebar) {
                    tocSidebar.classList.remove('open');
                }

            });

            tocList.appendChild(li);

        });

        // Bookmark section
        if (bookmarks.length) {

            const header = document.createElement('h4');
            header.textContent = 'Bookmarked Pages';

            tocList.appendChild(header);

            bookmarks.forEach((pageNum) => {

                const li = document.createElement('li');

                li.textContent = `★ Page ${pageNum}`;

                li.addEventListener('click', () => {

                    flipToPage(pageNum - 1);

                    if (tocSidebar) {
                        tocSidebar.classList.remove('open');
                    }

                });

                tocList.appendChild(li);

            });

        }

    }

    // -----------------------------
    // Bookmarks
    // -----------------------------
    bookmarkBtns.forEach((btn) => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const pageNum =
                parseInt(btn.dataset.page, 10);

            if (isNaN(pageNum)) return;

            toggleBookmark(pageNum);

        });

    });

    function toggleBookmark(pageNum) {

        const index = bookmarks.indexOf(pageNum);

        if (index === -1) {
            bookmarks.push(pageNum);
        } else {
            bookmarks.splice(index, 1);
        }

        localStorage.setItem(
            'notebook-bookmarks',
            JSON.stringify(bookmarks)
        );

        updateBookmarkButtons();
        generateTOC();
    }

    function updateBookmarkButtons() {

        bookmarkBtns.forEach((btn) => {

            const pageNum =
                parseInt(btn.dataset.page, 10);

            const isBookmarked =
                bookmarks.includes(pageNum);

            btn.classList.toggle(
                'bookmarked',
                isBookmarked
            );

            btn.textContent =
                isBookmarked ? '★' : '☆';

        });

    }

    // -----------------------------
    // Search
    // -----------------------------
    if (searchToggle && searchModal) {

        searchToggle.addEventListener('click', () => {
            searchModal.classList.add('open');

            if (searchInput) {
                searchInput.focus();
            }
        });

    }

    if (searchClose && searchModal) {

        searchClose.addEventListener('click', closeSearch);

    }

    function closeSearch() {

        if (searchModal) {
            searchModal.classList.remove('open');
        }

        if (searchInput) {
            searchInput.value = '';
        }

        if (searchResults) {
            searchResults.innerHTML = '';
        }
    }

    if (searchInput) {

        searchInput.addEventListener('input', () => {

            if (!searchResults) return;

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            searchResults.innerHTML = '';

            if (query.length < 2) return;

            pages.forEach((page, index) => {

                const content =
                    page.textContent.toLowerCase();

                if (!content.includes(query)) return;

                const result =
                    document.createElement('div');

                const title =
                    page.querySelector('.front h2')
                        ?.textContent || 'Untitled';

                result.textContent =
                    `Page ${index + 1}: ${title}`;

                result.addEventListener('click', () => {

                    flipToPage(index);

                    closeSearch();

                });

                searchResults.appendChild(result);

            });

        });

    }

});
