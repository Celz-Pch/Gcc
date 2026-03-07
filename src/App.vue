<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { subjects, session, type Subject } from './config'

const selectedSubject = ref<Subject | null>(null)
function openSubject(subject: Subject) { selectedSubject.value = subject }
function close() { selectedSubject.value = null }

const search = ref('')

type DiffFilter = 'Tous' | Subject['difficulty']
const diffFilter = ref<DiffFilter>('Tous')
const diffFilters: DiffFilter[] = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé']

type SortMode = 'default' | 'az' | 'za' | 'diff-asc' | 'diff-desc'
const sortMode = ref<SortMode>('default')
const diffOrder = { 'Débutant': 0, 'Intermédiaire': 1, 'Avancé': 2 }

const favorites = ref<Set<string>>(new Set())
function loadFavorites() {
    try {
        const raw = localStorage.getItem('cc-favorites')
        if (raw) favorites.value = new Set(JSON.parse(raw))
    } catch {}
}
function toggleFavorite(e: Event, name: string) {
    e.stopPropagation()
    const next = new Set(favorites.value)
    next.has(name) ? next.delete(name) : next.add(name)
    favorites.value = next
    localStorage.setItem('cc-favorites', JSON.stringify([...next]))
}
const showFavOnly = ref(false)

type ViewMode = 'grid' | 'list'
const viewMode = ref<ViewMode>('grid')

const activeFiltersCount = computed(() => {
    let c = 0
    if (search.value) c++
    if (diffFilter.value !== 'Tous') c++
    if (showFavOnly.value) c++
    if (sortMode.value !== 'default') c++
    return c
})
function resetFilters() {
    search.value = ''
    diffFilter.value = 'Tous'
    showFavOnly.value = false
    sortMode.value = 'default'
}

const copiedSubject = ref<string | null>(null)
function copyLink(e: Event, name: string) {
    e.stopPropagation()
    const url = `${window.location.origin}${window.location.pathname}?sujet=${encodeURIComponent(name)}`
    navigator.clipboard.writeText(url)
    copiedSubject.value = name
    setTimeout(() => { copiedSubject.value = null }, 2000)
}

const filteredSubjects = computed(() => {
    let list = [...subjects]

    if (showFavOnly.value) list = list.filter(s => favorites.value.has(s.name))
    if (diffFilter.value !== 'Tous') list = list.filter(s => s.difficulty === diffFilter.value)
    if (search.value)
        list = list.filter(s =>
            s.name.toLowerCase().includes(search.value.toLowerCase()) ||
            s.tags.some(t => t.toLowerCase().includes(search.value.toLowerCase()))
        )

    if (sortMode.value === 'az') list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortMode.value === 'za') list.sort((a, b) => b.name.localeCompare(a.name))
    else if (sortMode.value === 'diff-asc') list.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty])
    else if (sortMode.value === 'diff-desc') list.sort((a, b) => diffOrder[b.difficulty] - diffOrder[a.difficulty])

    return list
})

const clock = ref('')
let clockInterval: ReturnType<typeof setInterval>
function updateClock() {
    const now = new Date()
    clock.value = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
}

function difficultyColor(d: Subject['difficulty']) {
    if (d === 'Débutant') return '#4ade80'
    if (d === 'Intermédiaire') return '#facc15'
    return '#f87171'
}

const totalFiles = computed(() => subjects.reduce((acc, s) => acc + s.files.length, 0))

onMounted(() => {
    loadFavorites()
    updateClock()
    clockInterval = setInterval(updateClock, 1000)
    window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
    clearInterval(clockInterval)
    window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <div class="container">
        <div class="header-container">
            <img src="/public/epitech_white_logo.png" alt="E-Logo">
            <div class="header-brand">
                <span class="brand-coding">Coding</span><span class="brand-club">Club</span>
                <span class="brand-epitech">Epitech</span>
            </div>
            <div class="header-clock">
                <FontAwesomeIcon :icon="['fas', 'clock']" />
                <span>{{ clock }}</span>
            </div>
        </div>
        <div class="stock-container">
            <div class="left-container">
                <div class="nav-container">                    
                    <h1>OVERVIEW<span>_</span></h1>
                    <div class="btn-container">
                        <button class="btn">
                            <FontAwesomeIcon :icon="['fas', 'book']" />
                            Ressources
                        </button>
                    </div>
                </div>
            </div>
            <div class="main-container">
                <div class="session-banner">
                    <div class="session-banner-left">
                        <h2 class="session-title">{{ session.title }}</h2>
                        <p class="session-desc">{{ session.description }}</p>
                    </div>
                    <div class="session-banner-right">
                        <div class="session-meta">
                            <FontAwesomeIcon :icon="['fas', 'calendar']" />
                            <span>{{ session.date }}</span>
                        </div>
                        <div class="session-meta">
                            <FontAwesomeIcon :icon="['fas', 'location-dot']" />
                            <span>{{ session.location }}</span>
                        </div>
                        <div class="session-stats">
                            <div class="session-stat">
                                <FontAwesomeIcon :icon="['fas', 'book']" />
                                <span>{{ subjects.length }} sujet{{ subjects.length > 1 ? 's' : '' }}</span>
                            </div>
                            <div class="session-stat">
                                <FontAwesomeIcon :icon="['fas', 'file']" />
                                <span>{{ totalFiles }} fichier{{ totalFiles > 1 ? 's' : '' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="search-bar">
                    <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" class="search-icon" />
                    <input v-model="search" type="text" placeholder="Rechercher un sujet ou un tag..." />
                    <button v-if="search" class="search-clear" @click="search = ''">
                        <FontAwesomeIcon :icon="['fas', 'xmark']" />
                    </button>
                </div>
                <div class="toolbar">
                    <div class="diff-filters">
                        <button
                            v-for="f in diffFilters"
                            :key="f"
                            class="diff-filter-btn"
                            :class="{ active: diffFilter === f }"
                            :style="f !== 'Tous' ? { '--diff-color': difficultyColor(f as any) } : {}"
                            @click="diffFilter = f"
                        >{{ f }}</button>
                        <button
                            class="diff-filter-btn fav-btn"
                            :class="{ active: showFavOnly }"
                            @click="showFavOnly = !showFavOnly"
                        >Favoris</button>
                    </div>
                    <div class="sort-wrapper">
                        <FontAwesomeIcon :icon="['fas', 'arrow-up-wide-short']" class="sort-icon" />
                        <select v-model="sortMode" class="sort-select">
                            <option value="default">Par défaut</option>
                            <option value="az">Nom A → Z</option>
                            <option value="za">Nom Z → A</option>
                            <option value="diff-asc">Difficulté ↑</option>
                            <option value="diff-desc">Difficulté ↓</option>
                        </select>
                    </div>
                    <div class="view-toggle">
                        <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="Vue grille">
                            <FontAwesomeIcon :icon="['fas', 'grip']" />
                        </button>
                        <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="Vue liste">
                            <FontAwesomeIcon :icon="['fas', 'list']" />
                        </button>
                    </div>
                    <button v-if="activeFiltersCount > 0" class="reset-filters-btn" @click="resetFilters">
                        <FontAwesomeIcon :icon="['fas', 'xmark']" />
                        Réinitialiser ({{ activeFiltersCount }})
                    </button>
                </div>
                <div class="subjects-grid" :class="viewMode">
                    <div
                        class="subject-card"
                        v-for="subject in filteredSubjects"
                        :key="subject.name"
                        @click="openSubject(subject)"
                    >
                        <div class="subject-card-header">
                            <FontAwesomeIcon :icon="['fas', 'book']" class="subject-icon" />
                            <span class="subject-name">{{ subject.name }}</span>
                            <span v-if="subject.isNew" class="new-badge">NEW</span>
                            <span class="difficulty-badge" :style="{ color: difficultyColor(subject.difficulty), borderColor: difficultyColor(subject.difficulty) }">
                                {{ subject.difficulty }}
                            </span>
                            <button
                                class="star-btn"
                                :class="{ starred: favorites.has(subject.name) }"
                                @click="(e) => toggleFavorite(e, subject.name)"
                                :title="favorites.has(subject.name) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                            >
                                <FontAwesomeIcon :icon="['fas', 'star']" />
                            </button>
                        </div>
                        <div class="subject-tags">
                            <span class="tag" v-for="tag in subject.tags" :key="tag">{{ tag }}</span>
                        </div>
                        <div class="subject-footer">
                            <FontAwesomeIcon :icon="['fas', 'file']" />
                            <span>{{ subject.files.length }} fichier{{ subject.files.length > 1 ? 's' : '' }}</span>
                            <span class="subject-hint">
                                <FontAwesomeIcon :icon="['fas', 'circle-info']" /> Cliquer pour voir les détails
                            </span>
                        </div>
                    </div>
                    <div class="no-results" v-if="filteredSubjects.length === 0">
                        <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" />
                        <span>Aucun sujet trouvé pour "{{ search }}"</span>
                    </div>
                </div>
                <div class="detail-overlay" v-if="selectedSubject" @click.self="close">
                    <div class="detail-panel">
                        <div class="detail-header">
                            <div class="detail-title">
                                <FontAwesomeIcon :icon="['fas', 'book']" class="subject-icon" />
                                <h2>{{ selectedSubject.name }}</h2>
                            </div>
                            <div class="detail-header-actions">
                                <button class="copy-link-btn" @click="(e) => copyLink(e, selectedSubject!.name)">
                                    <FontAwesomeIcon :icon="copiedSubject === selectedSubject.name ? ['fas', 'check'] : ['fas', 'link']" />
                                    {{ copiedSubject === selectedSubject.name ? 'Copié !' : 'Lien' }}
                                </button>
                                <button class="close-btn" @click="close">
                                    <FontAwesomeIcon :icon="['fas', 'xmark']" />
                                </button>
                            </div>
                        </div>
                        <p class="detail-desc">{{ selectedSubject.description }}</p>
                        <div class="detail-tags">
                            <span class="tag" v-for="tag in selectedSubject.tags" :key="tag">{{ tag }}</span>
                            <span class="difficulty-badge" :style="{ color: difficultyColor(selectedSubject.difficulty), borderColor: difficultyColor(selectedSubject.difficulty) }">
                                {{ selectedSubject.difficulty }}
                            </span>
                        </div>
                        <div class="detail-divider"></div>
                        <h3 class="detail-files-title">
                            <FontAwesomeIcon :icon="['fas', 'download']" /> Ressources
                        </h3>
                        <div class="detail-files">
                            <div class="detail-file" v-for="file in selectedSubject.files" :key="file">
                                <div class="detail-file-info">
                                    <FontAwesomeIcon :icon="['fas', 'file']" class="file-icon" />
                                    <span class="file-name">{{ file }}</span>
                                </div>
                                <div class="file-actions">
                                    <a :href="`/data/${file}`" target="_blank" class="view-btn">
                                        <FontAwesomeIcon :icon="['fas', 'eye']" />
                                        Voir
                                    </a>
                                    <a :href="`/data/${file}`" :download="file" class="download-btn">
                                        <FontAwesomeIcon :icon="['fas', 'download']" />
                                        Télécharger
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.container {
    width: 100%;
    height: 100vh;
}

.header-container {
    display: flex;  
    align-items: center;
    width: 100%;
    height: 6%;
    background-color: #242424;
    border: solid 1px #424242;
}

.header-container img {
    height: 50%;
    margin-left: 20px;
}

.header-brand {
    margin-left: auto;
    margin-right: 24px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 1px;
}

.brand-coding {
    color: #fff;
}

.brand-club {
    color: #809dfd;
}

.brand-epitech {
    color: #aaa;
    font-size: 13px;
    letter-spacing: 2px;
}

.header-clock {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-left: 24px;
    margin-right: 24px;
    font-family: 'Inter', monospace;
    font-size: 13px;
    color: #aaa;
    letter-spacing: 1px;
}

.header-clock svg {
    color: #809dfd;
    font-size: 13px;
}

.stock-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 94%;
}

.left-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 16%;
    height: 100%;
    background-color: #242424;
    border: solid 1px #424242;
}

.left-container h1 {
    font-family: 'Bebas Neue', cursive;
    color: #fff;
    font-size: 20px;
}

.left-container h1 span {
    color: #ff0000;
}

.nav-container {
    display: flex;
    flex-direction: column;
    width: 85%;
    height: 100%;
    margin-top: 20px;
}

.btn-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 10px;
    margin-top: 10px;
}

.btn-container button {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 5%;
    color: #fff;
    border: none;
    cursor: pointer;
    background: none;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 14px;
    transition: 0.3s;
}

.btn-container svg {
    margin-left: 15px;
    transition: 0.3s;
}

.btn-container button:hover {
    background-color: #809dfd;
}

.btn-container button:hover svg {
    color: #fff;
}

.btn-container button svg {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    flex-shrink: 0;
    color: #809dfd;
    transition: 0.3s;
}

.main-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #1f1f1f;
    padding: 30px;
    overflow-y: auto;
}

/* Session banner */
.session-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-left: 3px solid #809dfd;
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 24px;
    gap: 20px;
}

.session-banner-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.session-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    color: #fff;
    letter-spacing: 1px;
}

.session-desc {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #aaa;
}

.session-banner-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
}

.session-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #809dfd;
}

.session-meta span {
    color: #ccc;
}

.session-stats {
    display: flex;
    gap: 14px;
    margin-top: 4px;
}

.session-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #555;
}

.session-stat svg {
    color: #809dfd;
    font-size: 11px;
}

/* Search bar */
.search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 20px;
    transition: 0.2s;
}

.search-bar:focus-within {
    border-color: #809dfd;
}

.search-icon {
    color: #555;
    font-size: 14px;
    flex-shrink: 0;
}

.search-bar input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
}

.search-bar input::placeholder {
    color: #555;
}

.search-clear {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    font-size: 14px;
    transition: 0.2s;
    padding: 0;
}

.search-clear:hover {
    color: #fff;
}

/* Tags & difficulty */
.subject-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 4px;
}

.detail-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag {
    background-color: #1f1f1f;
    color: #809dfd;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #2e2e2e;
}

.difficulty-badge {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid;
    margin-left: auto;
    flex-shrink: 0;
}

/* No results */
.no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #555;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    margin-top: 60px;
    width: 100%;
}

.no-results svg {
    font-size: 32px;
    color: #3a3a3a;
}

/* Toolbar */
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 12px;
    flex-wrap: wrap;
}

.diff-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.diff-filter-btn {
    background: none;
    border: 1px solid #3a3a3a;
    color: #aaa;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.diff-filter-btn:hover {
    border-color: #809dfd;
    color: #fff;
}

.diff-filter-btn.active {
    background-color: var(--diff-color, #809dfd);
    border-color: var(--diff-color, #809dfd);
    color: #111;
}

.fav-btn svg {
    color: #facc15;
}

.fav-btn.active {
    background-color: #facc15;
    border-color: #facc15;
    color: #111;
}

.sort-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    padding: 6px 12px;
    transition: 0.2s;
}

.sort-wrapper:focus-within {
    border-color: #809dfd;
}

.sort-icon {
    color: #809dfd;
    font-size: 13px;
    flex-shrink: 0;
}

.sort-select {
    background: none;
    border: none;
    outline: none;
    color: #ccc;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    cursor: pointer;
}

.sort-select option {
    background-color: #2a2a2a;
    color: #fff;
}

/* Star button */
.star-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #3a3a3a;
    font-size: 14px;
    margin-left: 6px;
    padding: 0;
    transition: 0.2s;
    flex-shrink: 0;
}

.star-btn:hover {
    color: #facc15;
    transform: scale(1.2);
}

.star-btn.starred {
    color: #facc15;
}

/* View toggle */
.view-toggle {
    display: flex;
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    overflow: hidden;
}

.view-toggle button {
    background: none;
    border: none;
    color: #555;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 13px;
    transition: 0.2s;
}

.view-toggle button.active {
    background-color: #809dfd;
    color: #fff;
}

.view-toggle button:hover:not(.active) {
    color: #fff;
}

/* Reset filters button */
.reset-filters-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1px solid #f87171;
    color: #f87171;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: 0.2s;
}

.reset-filters-btn:hover {
    background-color: #f87171;
    color: #fff;
}

/* NEW badge */
.new-badge {
    background-color: #809dfd;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 1px;
    flex-shrink: 0;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* List mode */
.subjects-grid.list {
    flex-direction: column;
    gap: 10px;
}

.subjects-grid.list .subject-card {
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 12px 16px;
    gap: 16px;
}

.subjects-grid.list .subject-tags {
    margin-bottom: 0;
    flex-shrink: 0;
}

.subjects-grid.list .subject-footer {
    margin-left: auto;
    flex-shrink: 0;
}

.subjects-grid.list .subject-hint {
    display: none;
}

/* Detail header actions */
.detail-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* Copy link button */
.copy-link-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1px solid #3a3a3a;
    color: #aaa;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;
}

.copy-link-btn:hover {
    border-color: #809dfd;
    color: #809dfd;
}

.copy-link-btn svg {
    color: inherit;
}

.subjects-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.subject-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 10px;
    padding: 20px;
    width: calc(33.333% - 14px);
    min-width: 200px;
    cursor: pointer;
    transition: 0.2s;
}

.subject-card:hover {
    border-color: #809dfd;
    background-color: #2f2f2f;
    transform: translateY(-2px);
}

.subject-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.subject-icon {
    color: #809dfd;
    font-size: 18px;
    flex-shrink: 0;
}

.subject-name {
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 15px;
}

.subject-desc {
    color: #aaa;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    flex: 1;
}

.subject-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #809dfd;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
}

.subject-hint {
    margin-left: auto;
    color: #555;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: 0.2s;
}

.subject-card:hover .subject-hint {
    color: #809dfd;
}

/* Detail overlay */
.detail-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: flex-end;
    z-index: 100;
}

.detail-panel {
    width: 420px;
    height: 100%;
    background-color: #242424;
    border-left: 1px solid #3a3a3a;
    padding: 30px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: slideIn 0.25s ease;
}

@keyframes slideIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
}

.detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.detail-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.detail-title h2 {
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 18px;
}

.close-btn {
    background: none;
    border: none;
    color: #aaa;
    font-size: 18px;
    cursor: pointer;
    transition: 0.2s;
}

.close-btn:hover {
    color: #fff;
}

.detail-desc {
    color: #aaa;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 1.6;
}

.detail-divider {
    height: 1px;
    background-color: #3a3a3a;
}

.detail-files-title {
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-files-title svg {
    color: #809dfd;
}

.detail-files {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.detail-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    padding: 12px 14px;
    gap: 10px;
    transition: 0.2s;
}

.detail-file:hover {
    border-color: #809dfd;
}

.detail-file-info {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
}

.file-icon {
    color: #809dfd;
    font-size: 16px;
    flex-shrink: 0;
}

.file-name {
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.view-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: transparent;
    color: #809dfd;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #809dfd;
    flex-shrink: 0;
    transition: 0.2s;
}

.view-btn:hover {
    background-color: #809dfd;
    color: #fff;
}

.download-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #809dfd;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 6px;
    flex-shrink: 0;
    transition: 0.2s;
}

.download-btn:hover {
    background-color: #6b8afc;
}
</style>
