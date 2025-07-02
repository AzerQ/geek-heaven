# Task 7: Update Settings UI for Provider Selection

## Overview
Update the settings UI to allow users to:
1. Select active Kinopoisk provider
2. Configure API keys for each provider
3. Set fallback providers
4. View provider status and health
5. Test API key validity

## Requirements

### 1. Provider Selection Section
- Add a new section "Kinopoisk Providers" in settings
- Dropdown to select primary provider
- List of available providers with:
  - Provider name and description
  - API key input field
  - Enable/disable toggle
  - Test API key button
  - Status indicator (working/error)
  - Links to documentation and registration

### 2. Fallback Configuration
- Multi-select for fallback providers
- Drag-and-drop to reorder fallback priority
- Option to set retry attempts
- Health check interval setting

### 3. Provider Status Display
- Real-time status indicators
- Last successful request timestamp
- Error messages if any
- Response time metrics

### 4. Migration Notice
- Show migration notice for users with legacy API key
- One-click migration from old to new system
- Backup/restore settings functionality

## Implementation Plan

### Files to Update
1. `src/routes/settings/+page.svelte` - Main settings page
2. `src/lib/components/settings/` - New provider settings components:
   - `ProviderSelector.svelte`
   - `ProviderConfig.svelte`
   - `ProviderStatus.svelte`
   - `FallbackConfig.svelte`

### New Components

#### ProviderSelector.svelte
- Dropdown for primary provider selection
- Integration with settings store
- Real-time validation

#### ProviderConfig.svelte
- API key input with validation
- Enable/disable toggle
- Test connection button
- Provider information display

#### ProviderStatus.svelte
- Health status indicators
- Performance metrics
- Error display

#### FallbackConfig.svelte
- Multi-select for fallback providers
- Drag-and-drop reordering
- Retry and health check settings

### Integration Points
1. Use `ProviderFactory` for provider metadata
2. Use `ProviderManager` for status and health checks
3. Use settings store for persistence
4. Add validation using provider validation methods

### UI/UX Considerations
1. Clear visual hierarchy
2. Intuitive provider switching
3. Helpful error messages
4. Loading states for async operations
5. Responsive design
6. Accessibility compliance

## Testing Requirements
1. Test provider switching
2. Test API key validation
3. Test fallback configuration
4. Test migration from legacy settings
5. Test error handling and recovery

## Success Criteria
- Users can easily select and configure providers
- API key validation works correctly
- Fallback system is configurable
- Provider status is clearly visible
- Migration from legacy system is seamless
- All settings persist correctly