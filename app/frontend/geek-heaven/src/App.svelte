<script lang="ts">
  import { Header, SideNav, MobileNav } from './widgets';
  import { Dashboard } from './pages/Dashboard';
  import { Search } from './pages/Search';
  import { Library } from './pages/Library';
  import { Settings } from './pages/Settings';
  import { MovieDetails } from './pages/MovieDetails';
  import { settings } from './shared/stores/settings';
  import type { Movie } from './shared/services/kinopoisk';

  import './app/styles/global.scss';

  let currentPage: 'dashboard' | 'search' | 'library' | 'settings' | 'movie-details' = 'dashboard';
  let selectedMovie: Movie | null = null;
  let selectedMovieId: number | null = null;
  let searchCategory: string = '';
  let searchContentType: string = '';
  let searchQuery: string = '';

  // Settings are loaded automatically when the store is created
  // No need for manual loading in onMount

  function handleNavigation(event: CustomEvent) {
    const { page, category, contentType, query } = event.detail;
    currentPage = page;
    
    // Set category and content type for search page
    if (page === 'search' && category) {
      searchCategory = category;
      searchContentType = contentType || '';
    } else if (page !== 'search') {
      searchCategory = '';
      searchContentType = '';
    }
    
    // Set search query if provided
    if (page === 'search' && query) {
      searchQuery = query;
    } else if (page !== 'search') {
      searchQuery = '';
    }
    
    // Clear movie selection when navigating away from movie details
    if (page !== 'movie-details') {
      selectedMovie = null;
      selectedMovieId = null;
    }
  }

  function handleMovieSelect(event: CustomEvent) {
    const { movie } = event.detail;
    selectedMovie = movie;
    selectedMovieId = movie.id;
    currentPage = 'movie-details';
  }

  function handleBackFromMovie() {
    selectedMovie = null;
    selectedMovieId = null;
    currentPage = 'search'; // Go back to search by default
  }
</script>

<div class="app">
  <Header on:navigate={handleNavigation} />
  <SideNav {currentPage} on:navigate={handleNavigation} />
  
  <main class="main-content">
    {#if currentPage === 'dashboard'}
      <Dashboard on:navigate={handleNavigation} on:movieSelect={handleMovieSelect} />
    {:else if currentPage === 'search'}
      <Search category={searchCategory} contentType={searchContentType} query={searchQuery} on:navigate={handleNavigation} on:movieSelect={handleMovieSelect} />
    {:else if currentPage === 'library'}
      <Library on:navigate={handleNavigation} on:movieSelect={handleMovieSelect} />
    {:else if currentPage === 'settings'}
      <Settings on:navigate={handleNavigation} />
    {:else if currentPage === 'movie-details' && selectedMovieId}
      <MovieDetails 
        movieId={selectedMovieId} 
        movie={selectedMovie}
        on:back={handleBackFromMovie}
      />
    {/if}
  </main>
  
  <MobileNav {currentPage} on:navigate={handleNavigation} />
</div>

<style lang="scss">
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .main-content {
    margin-top: 70px; /* Header height */
    margin-left: 240px; /* SideNav width */
    min-height: calc(100vh - 70px);
    background-color: var(--color-background);
    
    @media (max-width: 768px) {
      margin-left: 0;
      margin-bottom: 60px; /* MobileNav height */
      min-height: calc(100vh - 70px - 60px);
    }
  }
</style>
