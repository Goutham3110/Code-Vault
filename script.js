// ===== CODE VAULT - MODERN APP ===== 

class SnippetManager {
    constructor() {
        this.allSnippets = [];
        this.savedSnippets = [];
        this.currentSnippet = null;
        this.snippetIdCounter = 1;
    }

    loadData() {
        const saved = localStorage.getItem('codevault_snippets');
        const savedItems = localStorage.getItem('codevault_saved');
        const counter = localStorage.getItem('codevault_counter');

        if (saved) this.allSnippets = JSON.parse(saved);
        if (savedItems) this.savedSnippets = JSON.parse(savedItems);
        if (counter) this.snippetIdCounter = parseInt(counter);
        
        if (this.allSnippets.length === 0) {
            this.loadDemoSnippets();
        }
    }

    loadDemoSnippets() {
        this.allSnippets = [
            {
                id: 1,
                title: 'Array Flatten Function',
                language: 'javascript',
                description: 'Recursively flatten a nested array to a single dimension',
                code: 'const flatten = (arr) => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);\n\nconst nested = [1, [2, [3, [4, 5]]], 6];\nconsole.log(flatten(nested)); // [1, 2, 3, 4, 5, 6]',
                views: 45
            },
            {
                id: 2,
                title: 'React Custom Hook - useLocalStorage',
                language: 'react',
                description: 'Custom hook for persisting state in localStorage',
                code: 'const useLocalStorage = (key, initialValue) => {\n  const [storedValue, setStoredValue] = useState(() => {\n    const item = window.localStorage.getItem(key);\n    return item ? JSON.parse(item) : initialValue;\n  });\n\n  const setValue = (value) => {\n    setStoredValue(value);\n    window.localStorage.setItem(key, JSON.stringify(value));\n  };\n\n  return [storedValue, setValue];\n};',
                views: 120
            },
            {
                id: 3,
                title: 'CSS Gradient Button',
                language: 'css',
                description: 'Modern button with animated gradient background',
                code: '.btn-gradient {\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\n  color: white;\n  padding: 0.75rem 1.5rem;\n  border: none;\n  border-radius: 0.5rem;\n}\n\n.btn-gradient:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);\n}',
                views: 89
            },
            {
                id: 4,
                title: 'Python List Comprehension',
                language: 'python',
                description: 'Efficient way to create lists from existing iterables',
                code: 'numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]\n\nresult = [x**2 for x in numbers if x % 2 == 0]\nprint(result)  # [4, 16, 36, 64]\n\nmatrix = [[j for j in range(3)] for i in range(3)]\nprint(matrix)',
                views: 156
            },
            {
                id: 5,
                title: 'Responsive Grid Layout',
                language: 'css',
                description: 'Auto-responsive CSS Grid that adapts to screen size',
                code: '.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n}\n\n@media (max-width: 768px) {\n  .grid {\n    grid-template-columns: 1fr;\n  }\n}',
                views: 203
            }
        ];
        this.snippetIdCounter = 6;
        this.saveAll();
    }

    saveAll() {
        localStorage.setItem('codevault_snippets', JSON.stringify(this.allSnippets));
        localStorage.setItem('codevault_saved', JSON.stringify(this.savedSnippets));
        localStorage.setItem('codevault_counter', this.snippetIdCounter.toString());
    }

    addSnippet(snippet) {
        const newSnippet = {
            id: this.snippetIdCounter++,
            ...snippet,
            views: 0
        };
        this.allSnippets.unshift(newSnippet);
        this.saveAll();
        return newSnippet;
    }

    deleteSnippet(id) {
        this.allSnippets = this.allSnippets.filter(s => s.id !== id);
        this.savedSnippets = this.savedSnippets.filter(s => s.id !== id);
        this.saveAll();
    }

    toggleSave(id) {
        const snippet = this.allSnippets.find(s => s.id === id);
        if (!snippet) return false;

        const index = this.savedSnippets.findIndex(s => s.id === id);
        if (index === -1) {
            this.savedSnippets.unshift({...snippet});
            this.saveAll();
            return true;
        } else {
            this.savedSnippets.splice(index, 1);
            this.saveAll();
            return false;
        }
    }

    isSaved(id) {
        return this.savedSnippets.some(s => s.id === id);
    }

    filterSnippets(search, language) {
        return this.allSnippets.filter(snippet => {
            const matchSearch = snippet.title.toLowerCase().includes(search.toLowerCase()) ||
                              snippet.description.toLowerCase().includes(search.toLowerCase());
            const matchLanguage = !language || snippet.language === language;
            return matchSearch && matchLanguage;
        });
    }
}

// Initialize Manager
const manager = new SnippetManager();

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');
const searchInput = document.getElementById('searchInput');
const languageFilter = document.getElementById('languageFilter');
const snippetsContainer = document.getElementById('snippetsContainer');
const savedContainer = document.getElementById('savedContainer');
const addSnippetForm = document.getElementById('addSnippetForm');
const codeModal = document.getElementById('codeModal');
const closeBtn = document.querySelector('.btn-close');
const saveBtn = document.getElementById('saveBtn');
const shareBtn = document.getElementById('shareBtn');
const toast = document.getElementById('toast');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    manager.loadData();
    setupEventListeners();
    updateSavedCount();
    displayBrowseSnippets();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', handleTabSwitch);
    });

    // Search & Filter
    searchInput?.addEventListener('input', handleSearch);
    languageFilter?.addEventListener('change', handleSearch);

    // Form
    addSnippetForm?.addEventListener('submit', handleAddSnippet);

    // Modal
    closeBtn?.addEventListener('click', closeModal);
    document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
    saveBtn?.addEventListener('click', handleSaveSnippet);
    shareBtn?.addEventListener('click', handleShare);

    // Copy code button
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-copy')) {
            handleCopyCode(e.target.closest('.btn-copy'));
        }
    });
}

// ===== TAB MANAGEMENT =====
function handleTabSwitch(e) {
    const tabName = e.target.getAttribute('data-tab');
    switchTab(tabName);
}

function switchTab(tabName) {
    // Update nav links
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab content
    tabContents.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName)?.classList.add('active');

    // Load content specific to tab
    if (tabName === 'browse') {
        displayBrowseSnippets();
    } else if (tabName === 'saved') {
        console.log('🔄 Switching to saved tab...');
        displaySavedSnippets();
    }
}

// ===== DISPLAY SNIPPETS =====
function displayBrowseSnippets() {
    const container = document.getElementById('snippetsContainer');
    if (!container) {
        console.error('❌ snippetsContainer not found');
        return;
    }

    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const language = document.getElementById('languageFilter')?.value || '';
    
    const snippets = manager.filterSnippets(search, language);
    console.log('🔍 Displaying browse snippets:', snippets.length, 'Search:', search, 'Lang:', language);
    
    displaySnippets(snippets, container, false);
}

function displaySavedSnippets() {
    // Always get fresh reference to container and data
    const container = document.getElementById('savedContainer');
    const savedInfo = document.getElementById('savedInfo');
    
    if (!container) {
        console.error('❌ savedContainer not found in DOM');
        return;
    }

    // Reload from localStorage to ensure fresh data
    const saved = localStorage.getItem('codevault_saved');
    const snippets = saved ? JSON.parse(saved) : [];
    
    console.log('📦 Displaying saved snippets:', snippets.length);

    // Update info text
    if (savedInfo) {
        savedInfo.textContent = `${snippets.length} ${snippets.length === 1 ? 'snippet' : 'snippets'} saved`;
    }

    // Clear container completely
    container.innerHTML = '';

    // Display snippets or empty state
    if (!snippets || snippets.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <span class="empty-icon">📚</span>
                <p>No saved snippets yet. Start exploring and save your favorites!</p>
            </div>
        `;
        return;
    }

    // Render all saved snippets
    snippets.forEach((snippet, index) => {
        const card = createSnippetCard(snippet, false, index);
        container.appendChild(card);
    });
}

function displaySnippets(snippets, container, canDelete = false) {
    if (!container) {
        console.error('❌ Container is null or undefined');
        return;
    }
    
    console.log('🎨 Rendering', snippets?.length || 0, 'snippets to', container.id);
    
    // Clear all children
    container.innerHTML = '';

    // Handle empty state
    if (!snippets || snippets.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-message';
        emptyDiv.innerHTML = `
            <span class="empty-icon">${container.id === 'snippetsContainer' ? '🔍' : '📚'}</span>
            <p>${container.id === 'snippetsContainer' ? 'No snippets found. Try adjusting your search!' : 'No saved snippets yet!'}</p>
        `;
        container.appendChild(emptyDiv);
        return;
    }

    // Add all snippet cards
    snippets.forEach((snippet, index) => {
        try {
            const card = createSnippetCard(snippet, canDelete, index);
            container.appendChild(card);
        } catch (e) {
            console.error('❌ Error creating card for snippet:', snippet, e);
        }
    });
}

function createSnippetCard(snippet, canDelete, index) {
    const card = document.createElement('div');
    card.className = 'snippet-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const isSaved = manager.isSaved(snippet.id);
    
    card.innerHTML = `
        <h3>${escapeHtml(snippet.title)}</h3>
        <span class="language-badge">${escapeHtml(snippet.language)}</span>
        <p>${escapeHtml(snippet.description)}</p>
        <div class="snippet-stats">
            <span>👁️ ${snippet.views} views</span>
        </div>
    `;

    // Click to view - attach to the entire card
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
        // Don't open modal if clicking delete button
        if (!e.target.closest('.btn-delete')) {
            openModal(snippet);
        }
    });

    // Delete button
    if (canDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.type = 'button';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            handleDeleteSnippet(snippet.id);
        });

        const container = document.createElement('div');
        container.className = 'snippet-actions';
        container.appendChild(deleteBtn);
        card.appendChild(container);
    }

    return card;
}

// ===== SEARCH & FILTER =====
function handleSearch() {
    requestAnimationFrame(() => {
        displayBrowseSnippets();
    });
}

// ===== FORM HANDLING =====
function handleAddSnippet(e) {
    e.preventDefault();

    const snippet = {
        title: document.getElementById('snippetTitle').value,
        language: document.getElementById('snippetLanguage').value,
        description: document.getElementById('snippetDesc').value,
        code: document.getElementById('snippetCode').value
    };

    const newSnippet = manager.addSnippet(snippet);
    addSnippetForm.reset();
    showToast('✨ Snippet published successfully!');
    displayBrowseSnippets();
}

// ===== MODAL HANDLING =====
function openModal(snippet) {
    if (!snippet) return;
    
    manager.currentSnippet = snippet;
    snippet.views++;
    manager.saveAll();

    // Populate modal with snippet data
    document.getElementById('popupTitle').textContent = snippet.title;
    document.getElementById('popupLanguage').textContent = snippet.language.toUpperCase();
    document.getElementById('popupDesc').textContent = snippet.description;
    document.getElementById('popupCode').textContent = snippet.code;
    document.getElementById('codeLang').textContent = snippet.language;

    // Update save button state
    const isSaved = manager.isSaved(snippet.id);
    saveBtn.textContent = isSaved ? '💾 Unsave' : '💾 Save This Snippet';

    // Show modal
    setTimeout(() => {
        codeModal.classList.add('active');
        codeModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }, 10);
}

function closeModal() {
    codeModal.classList.remove('active');
    codeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    manager.currentSnippet = null;
}

function handleSaveSnippet() {
    if (!manager.currentSnippet) return;

    const isSaving = manager.toggleSave(manager.currentSnippet.id);
    const message = isSaving ? '💾 Added to your collection!' : '✅ Removed from collection';
    
    saveBtn.textContent = isSaving ? '💾 Unsave' : '💾 Save This Snippet';
    updateSavedCount();
    showToast(message);
    
    console.log('💾 Save toggled. Saved tab active?', document.getElementById('saved')?.classList.contains('active'));
    
    // If saved tab is visible, refresh it immediately
    if (document.getElementById('saved')?.classList.contains('active')) {
        console.log('📝 Refreshing saved snippets display');
        displaySavedSnippets();
    }
}

function handleCopyCode(btn) {
    const code = document.getElementById('popupCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        btn.style.borderColor = 'var(--success)';
        btn.style.color = 'var(--success)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 2000);
    });
}

function handleShare() {
    if (!manager.currentSnippet) return;

    const text = `Check out this code snippet: ${manager.currentSnippet.title}`;
    
    if (navigator.share) {
        navigator.share({
            title: manager.currentSnippet.title,
            text: text
        }).catch(() => {});
    } else {
        showToast('📋 Copied to clipboard!');
    }
}

// ===== DELETE HANDLING =====
function handleDeleteSnippet(id) {
    const confirmed = confirm('Are you sure you want to delete this snippet? This action cannot be undone.');
    
    if (confirmed) {
        manager.deleteSnippet(id);
        updateSavedCount();
        showToast('🗑️ Snippet deleted successfully');
        
        // Refresh the current view
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab?.id === 'browse') {
            displayBrowseSnippets();
        } else if (activeTab?.id === 'saved') {
            displaySavedSnippets();
        }
        
        // Close modal if it's showing this snippet
        if (manager.currentSnippet?.id === id) {
            closeModal();
        }
    }
}

// ===== UTILITIES =====
function updateSavedCount() {
    const badge = document.getElementById('savedCount');
    if (badge) {
        badge.textContent = manager.savedSnippets.length;
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
