import { create } from 'zustand'
import { validatePlatforms, validateEventData, validateUrl } from './shared/utils/validation'
import axios from 'axios'
import config from './config'
import { getApiUrl } from './shared/utils/api'
import {
  fetchTemplates as fetchTemplatesApi,
  fetchTemplateCategories as fetchTemplateCategoriesApi,
  createTemplate as createTemplateApi,
  updateTemplate as updateTemplateApi,
  deleteTemplate as deleteTemplateApi
} from './features/templates/api/templateApi'
import type { TemplateCreateRequest } from '@eventpromoter/types'

// Debounce utility function
const debounce = <TArgs extends unknown[]>(func: (...args: TArgs) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return function executedFunction(...args: TArgs) {
    const later = () => {
      if (timeout) clearTimeout(timeout)
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

const getAxiosLikeErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') return undefined
  const errObj = error as { response?: { data?: { error?: string } }; message?: string }
  return errObj.response?.data?.error || errObj.message
}

// Workflow States - defines the current step in the event creation process
export const WORKFLOW_STATES = {
  INITIAL: 'initial',              // No files uploaded, only file upload available
  FILES_UPLOADED: 'files_uploaded', // Files uploaded, event creation possible
  EVENT_READY: 'event_ready',      // Event created, platform selection available
  PLATFORMS_SELECTED: 'platforms_selected', // Platforms selected, content editing available
  CONTENT_READY: 'content_ready',  // Content created, ready to publish
  PUBLISHING: 'publishing',        // Currently publishing
  PUBLISHED: 'published'          // Successfully published
}

// Helper function to determine workflow state based on current data
const determineWorkflowState = (state: {
  publishing?: boolean
  published?: boolean
  selectedPlatforms?: string[]
  platformContent?: Record<string, unknown>
  currentEvent?: { id?: string } | null
  uploadedFileRefs?: unknown[]
}) => {
  if (state.publishing) return WORKFLOW_STATES.PUBLISHING
  if (state.published) return WORKFLOW_STATES.PUBLISHED
  if ((state.selectedPlatforms?.length ?? 0) > 0 && Object.keys(state.platformContent || {}).length > 0) return WORKFLOW_STATES.CONTENT_READY
  if ((state.selectedPlatforms?.length ?? 0) > 0) return WORKFLOW_STATES.PLATFORMS_SELECTED
  if (state.currentEvent?.id && (state.uploadedFileRefs?.length ?? 0) > 0) return WORKFLOW_STATES.EVENT_READY
  if ((state.uploadedFileRefs?.length ?? 0) > 0) return WORKFLOW_STATES.FILES_UPLOADED
  return WORKFLOW_STATES.INITIAL
}

type StoreState = ReturnType<typeof createStoreState>
type SetStoreState = (
  partial:
    | Partial<StoreState>
    | ((state: StoreState) => Partial<StoreState>)
) => void
type GetStoreState = () => StoreState

const createStoreState = (set: SetStoreState, get: GetStoreState) => ({

  // Load event workspace from backend on init
  // ✅ Idempotent: Guards against duplicate calls (StrictMode-safe)
  initialize: async () => {
    const { initializing, initialized } = get()

    // Guard: Skip if already initializing or already initialized
    if (initializing || initialized) {
      return
    }

    set({ initializing: true })

    try {
      console.log('Loading event workspace from backend...')
      await get().loadEventWorkspace()
      console.log('Event workspace initialized successfully')
    } catch (error) {
      console.warn('Failed to load event workspace from backend, using defaults:', error)
      // Keep default empty state
    }

    // Also load app config for n8nWebhookUrl
    await get().loadAppConfig()

    // Load user preferences
    await get().loadUserPreferences()

    // Load global configurations (has its own guard)
    await get().loadGlobalConfigs()

    set({ initializing: false, initialized: true })

    // NOTE: selectedPlatforms are event-specific only, not loaded from user preferences
  },

  // Save workspace to backend whenever state changes
  saveEventWorkspace: async () => {
    const state = get()

    // Only save if we actually have a current event!
    if (!state.currentEvent) {
      console.log('Store: No current event to save - skipping workspace save')
      return
    }

    try {
      set({ autoSaving: true })
      const eventWorkspaceData = {
        currentEvent: {
          id: state.currentEvent.id,
          title: state.currentEvent.title,
          createdAt: state.currentEvent.createdAt,
          uploadedFileRefs: state.uploadedFileRefs, // File references are serializable
          selectedHashtags: state.selectedHashtags,
          selectedPlatforms: state.selectedPlatforms
        }
      }

      await axios.post(getApiUrl('event'), eventWorkspaceData)
      console.log('Store: Event workspace saved to backend successfully')
    } catch (error) {
      console.warn('Store: Failed to save event workspace to backend:', error)
    } finally {
      set({ autoSaving: false })
    }
  },

  // Debounced autosave - saves after 2 seconds of inactivity
  debouncedSave: debounce(() => {
    const state = get()
    // Only autosave if we have meaningful data and are not in initial state
    if (state.workflowState !== WORKFLOW_STATES.INITIAL &&
        (state.uploadedFileRefs.length > 0 || state.selectedPlatforms.length > 0 || Object.keys(state.platformContent).length > 0)) {
      console.log('🔄 Autosaving workspace...')
      get().saveEventWorkspace()
    }
  }, 2000),

  // User preferences
  loadUserPreferences: async () => {
    try {
      const response = await axios.get(getApiUrl('platforms/preferences'))
      const preferences = response.data.preferences
      set({
        userPreferences: preferences
      })
      console.log('User preferences loaded:', preferences)
      return preferences
    } catch (error) {
      console.warn('Failed to load user preferences:', error)
      return null
    }
  },

  saveUserPreferences: async (preferences: { defaultHashtags: string[]; uiPreferences: { darkMode: boolean } }) => {
    try {
      await axios.post(getApiUrl('platforms/preferences'), { preferences })
      set({ userPreferences: preferences })
      console.log('User preferences saved')
    } catch (error) {
      console.warn('Failed to save user preferences:', error)
    }
  },

  updateUserPreferences: async (updates: Record<string, unknown>) => {
    try {
      await axios.patch(getApiUrl('platforms/preferences'), updates)
      set(state => ({
        userPreferences: { ...state.userPreferences, ...updates }
      }))
      console.log('User preferences updated')
    } catch (error) {
      console.warn('Failed to update user preferences:', error)
    }
  },


  // Load global configurations (separate from user preferences)
  // ✅ Idempotent: Guards against duplicate calls (StrictMode-safe)
  // ✅ Abort-safe: Handles request cancellation gracefully
  // ✅ Timeout-safe: Prevents hanging requests
  loadGlobalConfigs: async () => {
    const { globalConfigsLoading, globalHashtagConfig } = get()

    // Guard: Skip if already loading or already loaded
    if (globalConfigsLoading || globalHashtagConfig) {
      return
    }

    set({ globalConfigsLoading: true })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const hashtagConfig = await axios.get(
        getApiUrl('config/hashtags'),
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      set({
        globalHashtagConfig: hashtagConfig.data,
        globalConfigsLoading: false
      })

      console.log('Global configs loaded:', {
        hashtags: hashtagConfig.data.available?.length || 0
      })
    } catch (error) {
      set({ globalConfigsLoading: false })

      // Ignore abort errors (expected in dev mode / StrictMode)
      const err = error as { code?: string; name?: string }
      if (err.code !== 'ERR_CANCELED' && err.name !== 'CanceledError') {
        console.warn('Failed to load global configs:', error)
      }
    }
  },

  // Complete event restore (only event-specific data, no global overrides)
  restoreEvent: async (eventId: string) => {
    try {
      console.log(`🔄 Starting complete restore of event ${eventId}...`)

      // Load complete event data from backend
      const response = await axios.get(getApiUrl(`event/${eventId}/restore`))
      const restoreData = response.data.event

      // Reset current state first (but keep global configs)
      get().newEvent()

      // Restore ONLY event-specific data (not global configs)
      const restoredPlatforms = restoreData.platforms || []
      set({
        currentEvent: restoreData.event,
        uploadedFileRefs: restoreData.files,
        selectedPlatforms: restoredPlatforms, // Set directly to avoid triggering save
        selectedHashtags: restoreData.hashtags || [],
        platformContent: restoreData.content || {}
      })

      // Update workflow state to reflect restored data
      get().updateWorkflowState()

      // Load parsed data and platform content separately (like in loadEventWorkspace)
      get().loadEventParsedData(eventId)
      get().loadEventPlatformContent(eventId)

      // Save the restored state (platforms are already set, so this will save them)
      get().saveEventWorkspace()

      console.log(`✅ Platforms restored:`, restoredPlatforms)

      console.log(`✅ Event ${eventId} completely restored:`, {
        files: restoreData.files?.length || 0,
        platforms: restoreData.platforms?.length || 0,
        contentKeys: Object.keys(restoreData.content || {}).length
      })

      return restoreData
    } catch (error) {
      console.error(`❌ Failed to restore event ${eventId}:`, error)
      throw error
    }
  },

  // Check if file exists on server
  checkFileExists: async (fileUrl: string) => {
    try {
      // Use the URL directly as it already contains /api/files/ from the backend
      const response = await axios.head(getApiUrl(fileUrl))
      return response.status === 200
    } catch (error) {
      return false
    }
  },

  // Check if parsed data exists for event
  checkParsedDataExists: async (eventId: string) => {
    try {
      const response = await axios.get(getApiUrl(`parsing/data/${eventId}`))
      return response.status === 200
    } catch (error) {
      return false
    }
  },

  // Load event workspace data with validation
  loadEventWorkspace: async () => {
    try {
      const response = await axios.get(getApiUrl('event'))
      const eventWorkspaceData = response.data
      const event = eventWorkspaceData.currentEvent

      if (event) {
        // Validate uploaded file references
        const validatedFileRefs = []
        if (event.uploadedFileRefs && Array.isArray(event.uploadedFileRefs)) {
          for (const fileRef of event.uploadedFileRefs) {
            const fileExists = await get().checkFileExists(fileRef.url)
            if (fileExists) {
              validatedFileRefs.push(fileRef)
            } else {
              console.warn(`File not found on server, removing from refs: ${fileRef.name}`)
            }
          }
        }

        // Load platforms from event, but don't trigger save (skipSave = true)
        const loadedPlatforms = event.selectedPlatforms || []
        
        set({
          currentEvent: event,
          uploadedFileRefs: validatedFileRefs, // Only load existing files
          selectedHashtags: event.selectedHashtags || [],
          selectedPlatforms: loadedPlatforms, // Set directly, don't use setSelectedPlatforms to avoid triggering save
          parsedData: null, // Will be loaded separately
          parsingStatus: 'idle'
        })

        // Update workflow state after loading
        get().updateWorkflowState()

        // Load parsed data and platform content separately
        get().loadEventParsedData(event.id)
        get().loadEventPlatformContent(event.id)

        console.log(`Event workspace loaded from backend:`, {
          files: validatedFileRefs.length,
          platforms: loadedPlatforms.length,
          platformsList: loadedPlatforms
        })
        return event
      } else {
        // No current event - reset to empty state
        set({
          currentEvent: null,
          uploadedFileRefs: [],
          selectedHashtags: [],
          selectedPlatforms: [],
          parsedData: null,
          parsingStatus: 'idle'
        })

        get().updateWorkflowState()
        console.log('No current event - workspace initialized empty')
        return null
      }
    } catch (error) {
      console.warn('Failed to load workspace:', error)
      return null
    }
  },

  // Create new Event (reset workspace)
  newEvent: () => {
    set({
      uploadedFileRefs: [],
      selectedHashtags: [],
      selectedPlatforms: [],
      platformContent: {},
      workflowState: WORKFLOW_STATES.INITIAL,
      publishing: false,
      published: false,
      currentEvent: null,
      parsedData: null,
      parsingStatus: 'idle',
      savingParsedData: false,
      parsedDataSaveError: null,
      lastParsedDataSave: null
    })
    // Don't save workspace when resetting to null event
    console.log('Workspace reset - no event')
  },

  // Update workflow state based on current data
  updateWorkflowState: () => {
    const state = get()
    const newWorkflowState = determineWorkflowState(state)
    if (state.workflowState !== newWorkflowState) {
      set({ workflowState: newWorkflowState })

      // Auto-collapse accordions when workflow progresses
      if (newWorkflowState !== WORKFLOW_STATES.INITIAL) {
        set({ fileUploadExpanded: false, eventHistoryExpanded: false })
      } else {
        set({ fileUploadExpanded: true, eventHistoryExpanded: true })
      }

      console.log(`Workflow state changed to: ${newWorkflowState}`)
    }
  },

  // Manually control accordion expansion
  setFileUploadExpanded: (expanded: boolean) => set({ fileUploadExpanded: expanded }),
  setEventHistoryExpanded: (expanded: boolean) => set({ eventHistoryExpanded: expanded }),

  // UI state for accordions
  fileUploadExpanded: true,
  eventHistoryExpanded: true,

  // Event state
  currentEvent: null as { id?: string; title?: string; createdAt?: string } | null,
  duplicateFound: null as null | {
    existingEventId?: string
    newParsedData?: Record<string, unknown>
    newPlatformContent?: Record<string, unknown>
  }, // For duplicate event detection

  // Workflow state
  workflowState: WORKFLOW_STATES.INITIAL,
  publishing: false,
  published: false,
  autoSaving: false,
  publishSessionId: null as string | null,
  
  // Initialization state (prevents duplicate initialization calls)
  initializing: false,
  initialized: false,

  // User preferences
  userPreferences: {
    // NOTE: lastSelectedPlatforms removed - platforms are event-specific only
    defaultHashtags: [] as string[],
    uiPreferences: {
      darkMode: false
    }
  },

  // File upload state - now stores references to uploaded files on server
  uploadedFileRefs: [] as Array<Record<string, unknown>>,
  uploadedFiles: [] as Array<Record<string, unknown>>,
  parsedData: null as Record<string, unknown> | null,
  savingParsedData: false,
  parsedDataSaveError: null as string | null,
  lastParsedDataSave: null as string | null,

  // Event-specific selections (separate from global configs)
  selectedHashtags: [] as string[],      // Selected hashtags for current event
  selectedPlatforms: [] as string[],     // Selected platforms for current event

  // Global configs loaded from backend
  globalHashtagConfig: null, // Global hashtag configuration from /config/hashtags.json
  globalConfigsLoading: false, // Loading state for global configs (prevents duplicate requests)

  // Template management state
  templates: {} as Record<string, Array<Record<string, unknown>>>,             // Templates per platform: { platform: [templates] }
  templateCategories: [] as Array<Record<string, unknown>>,    // Available template categories

  // UI state
  darkMode: false,           // Dark mode toggle
  globalPublishingMode: 'custom', // 'custom' | 'n8n' | 'api' | 'playwright'
  platformOverrides: {} as Record<string, string>,       // { platformId: 'n8n' | 'api' | 'playwright' }

  setGlobalPublishingMode: (mode: string) => {
    set({ globalPublishingMode: mode, platformOverrides: {} })
    console.log(`Global publishing mode set to: ${mode} (Overrides reset)`)
  },

  setPlatformOverride: (platformId: string, route: string) => {
    set(state => {
      const currentOverride = state.platformOverrides[platformId]
      const newOverrides = { ...state.platformOverrides }
      
      if (currentOverride === route) {
        delete newOverrides[platformId] // Toggle off -> back to global logic
      } else {
        newOverrides[platformId] = route
      }
      
      return { platformOverrides: newOverrides }
    })
  },

  setUploadedFileRefs: (fileRefs: Array<Record<string, unknown>>) => {
    set({ uploadedFileRefs: Array.isArray(fileRefs) ? fileRefs : [] })
    get().saveEventWorkspace()
  },


  // Upload files to server
  uploadFiles: async (files: File[]) => {
    try {
      set({ isProcessing: true, error: null })

      const formData = new FormData()
      // Backend entscheidet selbst über die eventId basierend auf geparsten Daten

      // Add all files to FormData
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await axios.post(getApiUrl('files/upload-multiple'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        // Update uploaded file references
        const currentRefs = get().uploadedFileRefs
        const newRefs = [...currentRefs, ...response.data.files]
        set({
          uploadedFileRefs: newRefs,
          parsedData: response.data.parsedData || null, // Use parsed data from backend
          duplicateFound: null, // Reset duplicate state
          parsingStatus: response.data.parsedData ? 'completed' : 'idle' // Set completed if parsed
        })

        // If backend created an event automatically, use it
        if (response.data.createdEvent) {
          set({ currentEvent: response.data.createdEvent })
          console.log(`Backend created event: ${response.data.createdEvent.id}`)
        }

        // If we have parsed data, generate platform content automatically
        if (response.data.parsedData) {
          get().generatePlatformContentFromParsedData(response.data.parsedData)
        }

        get().saveEventWorkspace()
        get().updateWorkflowState()
        get().debouncedSave()

        console.log('Files uploaded successfully:', response.data.files.length)
        return response.data.files
      } else {
        throw new Error('Upload failed')
      }
    } catch (error: unknown) {
      console.error('File upload error:', error)
      set({ error: getErrorMessage(error, 'Upload failed') })
      throw error
    } finally {
      set({ isProcessing: false })
    }
  },

  // Remove uploaded file
  removeUploadedFile: async (fileId: string) => {
    // ... existing implementation
  },

  // Update file metadata (visibility, etc.)
  updateFileMetadata: async (fileId: string, updates: Record<string, unknown>) => {
    try {
      const state = get()
      const eventId = state.currentEvent?.id || 'default'
      const fileRef = state.uploadedFileRefs.find(f => f.id === fileId)

      if (!fileRef) return

      const response = await axios.patch(getApiUrl(`files/${eventId}/${fileRef.filename}`), updates)

      if (response.data.success) {
        const updatedFile = response.data.file
        const updatedRefs = state.uploadedFileRefs.map(f => f.id === fileId ? { ...f, ...updatedFile } : f)
        set({ uploadedFileRefs: updatedRefs })
        get().saveEventWorkspace()
        console.log(`File metadata updated: ${fileId}`, updates)
      }
    } catch (error) {
      console.error('Update file metadata error:', error)
      set({ error: 'Failed to update file metadata' })
    }
  },


  // Apply parsed content to platform content
  // Generate platform content from parsed data
  generatePlatformContentFromParsedData: async (parsedData: Record<string, unknown>) => {
    if (!parsedData) return

    const selectedPlatforms = get().selectedPlatforms
    if (selectedPlatforms.length === 0) return

    try {
      const platformContent: Record<string, Record<string, unknown>> = {}

      // Generate content for each selected platform
      for (const platform of selectedPlatforms) {
        try {
          // Simple content generation based on parsed data
          const content = get().generateContentForPlatform(platform, parsedData)
          if (content) {
            platformContent[platform] = content
          }
        } catch (error) {
          console.warn(`Failed to generate content for ${platform}:`, error)
        }
      }

      // Apply the generated content
      get().applyParsedContent(parsedData, platformContent)

      console.log('Generated platform content from parsed data:', Object.keys(platformContent))
    } catch (error) {
      console.error('Failed to generate platform content:', error)
    }
  },

  // Generate content for a specific platform - GENERIC (no hardcoded platform logic)
  // NOTE: This is a fallback. Ideally, content generation should come from backend platform services
  generateContentForPlatform: (platform: string, parsedData: Record<string, unknown>) => {
    const baseContent = {
      eventTitle: parsedData.title || '',
      eventDate: parsedData.date || '',
      eventTime: parsedData.time || '',
      venue: parsedData.venue || '',
      city: parsedData.city || '',
      description: parsedData.description || ''
    }

    // Generic content generation - uses common fields that most platforms support
    // Platform-specific formatting should be handled by backend services
    const venueText = parsedData.venue
      ? (typeof parsedData.venue === 'string'
        ? parsedData.venue
        : ((parsedData.venue as { name?: string }).name || ''))
      : ''
    const locationText = [venueText, parsedData.city].filter(Boolean).join(', ')
    const dateTimeText = [parsedData.date, parsedData.time].filter(Boolean).join(' ')

    // Generate a generic text content that can be used by most platforms
    const genericText = [
      parsedData.title || 'Event',
      dateTimeText ? `📅 ${dateTimeText}` : '',
      locationText ? `📍 ${locationText}` : '',
      parsedData.description || ''
    ].filter(Boolean).join('\n\n').trim()

    // Return generic structure - platform-specific fields should be handled by backend
    return {
      ...baseContent,
      text: genericText, // Most platforms use 'text'
      caption: genericText, // Instagram uses 'caption'
      body: genericText, // Some platforms use 'body'
      title: parsedData.title || 'Event', // Some platforms use 'title'
      subject: parsedData.title || 'Event Invitation' // Some platforms use 'subject'
    }
  },

  applyParsedContent: (parsedData: Record<string, unknown>, platformContent: Record<string, Record<string, unknown>>) => {
    const updatedPlatformContent = { ...get().platformContent }

    // Apply platform-specific content
    Object.keys(platformContent).forEach(platform => {
      if (platformContent[platform]) {
        updatedPlatformContent[platform] = {
          ...updatedPlatformContent[platform],
          ...platformContent[platform]
        }
      }
    })

    // Apply hashtags from parsed data if available
    if (parsedData && parsedData.hashtags && Array.isArray(parsedData.hashtags) && parsedData.hashtags.length > 0) {
      const currentHashtags = get().selectedHashtags || []
      // Merge parsed hashtags with existing ones, avoiding duplicates
      const mergedHashtags = [...new Set([...currentHashtags, ...parsedData.hashtags])]
      set({ selectedHashtags: mergedHashtags })
    }

    set({ platformContent: updatedPlatformContent })
    get().saveEventWorkspace()

    console.log('Applied parsed content to platforms')
  },

  // Handle duplicate resolution
  resolveDuplicate: async (useExisting: boolean) => {
    const duplicateData = get().duplicateFound
    if (!duplicateData) return

    try {
      if (useExisting) {
        // Load existing parsed data
        const response = await axios.get(getApiUrl(`parsing/data/${duplicateData.existingEventId}`))
        if (response.data.success) {
          // Apply existing content
          get().applyParsedContent(response.data.parsedData, {}) // Platform content would need to be regenerated
        }
      } else {
        // Use new parsed content
        get().applyParsedContent(
          duplicateData.newParsedData || {},
          (duplicateData.newPlatformContent || {}) as Record<string, Record<string, unknown>>
        )
      }

      // Clear duplicate state
      set({ duplicateFound: null })

    } catch (error) {
      console.error('Duplicate resolution error:', error)
      set({ error: 'Failed to resolve duplicate' })
    }
  },

  // Hashtags state
  setSelectedHashtags: (hashtags: string[]) => {
    set({ selectedHashtags: Array.isArray(hashtags) ? hashtags : [] })
    get().saveEventWorkspace()
  },

  // Platform state
  setSelectedPlatforms: (platforms: string[], skipSave = false) => {
    const newPlatforms = Array.isArray(platforms) ? platforms : []
    set({ selectedPlatforms: newPlatforms })
    get().updateWorkflowState()
    
    // Save immediately when platforms change (unless skipSave is true, e.g., during load)
    // NOTE: selectedPlatforms are event-specific only, saved in event.json, not in user preferences
    if (!skipSave) {
      // Use debounced save to avoid too many API calls when toggling multiple platforms quickly
      get().debouncedSave()
    }
  },

  // NOTE: loadLastSelectedPlatforms removed - selectedPlatforms are event-specific only
  // Platforms are only stored in event.json, not in user preferences
  platformSettings: {} as Record<string, unknown>,
  setPlatformSettings: (settings: Record<string, unknown>) => {
    set({ platformSettings: settings })
    get().saveEventWorkspace()
  },

  // UI state
  isProcessing: false,
  setIsProcessing: (processing: boolean) => set({ isProcessing: processing }),
  error: null as string | null,
  setError: (error: string | null) => set({ error }),
  successMessage: null as string | null,
  setSuccessMessage: (message: string | null) => set({ successMessage: message }),

  // Parsing status tracking
  parsingStatus: 'idle', // 'idle', 'parsing', 'completed', 'error'
  setParsingStatus: (status: string) => set({ parsingStatus: status }),

  // N8N configuration
  n8nWebhookUrl: 'http://localhost:5678/webhook/multiplatform-publisher',
  setN8nWebhookUrl: async (url: string) => {
    set({ n8nWebhookUrl: url })
    // Save to backend config (use PATCH to only update n8nWebhookUrl, not overwrite other fields)
    try {
      await axios.patch(getApiUrl('config/app'), {
        n8nWebhookUrl: url
      })
    } catch (error) {
      console.warn('Failed to save n8nWebhookUrl to backend:', error)
    }
  },

  // Load app config (n8nWebhookUrl)
  loadAppConfig: async () => {
    try {
      const response = await axios.get(getApiUrl('config/app'))
      const config = response.data
      if (config.n8nWebhookUrl) {
        set({ n8nWebhookUrl: config.n8nWebhookUrl })
      }
    } catch (error) {
      console.warn('Failed to load app config:', error)
    }
  },

  // Platform-specific content
  platformContent: {} as Record<string, Record<string, unknown>>,
  setPlatformContent: (platform: string, content: Record<string, unknown>) => {
    set(state => ({
      platformContent: { ...state.platformContent, [platform]: content }
    }))
    // Auto-save to current event
    const state = get()
    const eventId = state.currentEvent?.id
    if (eventId) {
      get().saveEventPlatformContent(eventId, { ...state.platformContent, [platform]: content })
    }
    get().updateWorkflowState()
    get().debouncedSave()
  },

  // Save platform content changes to backend (for auto-save)
  savePlatformContent: async (platform: string, content: Record<string, unknown>) => {
    const state = get()
    const eventId = state.currentEvent?.id

    if (!eventId) {
      console.warn('No current event ID, cannot save platform content')
      return
    }

    try {
      await axios.put(getApiUrl(`parsing/platform-content/${eventId}`), {
        platform,
        content: {
          ...content,
          lastModified: new Date().toISOString()
        }
      })
      console.log(`Platform content for ${platform} saved to backend`)
    } catch (error) {
      console.warn(`Failed to save platform content for ${platform}:`, error)
      // Don't throw error for auto-save failures
    }
  },
  resetPlatformContent: () => {
    set({ platformContent: {} })
    get().saveEventWorkspace()
  },

  // Load platform content for specific event
  loadEventParsedData: async (eventId: string) => {
    try {
      const response = await axios.get(getApiUrl(`event/${eventId}/parsed-data`))
      const { parsedData } = response.data
      set({
        parsedData: parsedData || null,
        parsingStatus: parsedData ? 'completed' : 'idle'
      })
      console.log(`Parsed data loaded for event ${eventId}`)
    } catch (error) {
      console.warn('Failed to load parsed data for event:', error)
      set({ parsedData: null, parsingStatus: 'idle' })
    }
  },

  // Update parsed data and save to backend
  updateParsedData: async (updatedData: Record<string, unknown>) => {
    const state = get()
    if (!state.currentEvent?.id) {
      console.warn('No current event to update parsed data')
      return false
    }

    try {
      set({ savingParsedData: true, parsedDataSaveError: null })
      
      const response = await axios.put(
        getApiUrl(`parsing/data/${state.currentEvent.id}`),
        { parsedData: updatedData }
      )

      set({ 
        parsedData: updatedData,
        savingParsedData: false,
        parsedDataSaveError: null,
        lastParsedDataSave: new Date().toISOString()
      })

      console.log('✅ Parsed data saved successfully')
      return true
    } catch (error: unknown) {
      console.error('Failed to save parsed data:', error)
      set({ 
        savingParsedData: false,
        parsedDataSaveError: getAxiosLikeErrorMessage(error) || 'Failed to save'
      })
      return false
    }
  },

  // Debounced autosave for parsed data
  debouncedSaveParsedData: debounce((updatedData: Record<string, unknown>) => {
    get().updateParsedData(updatedData)
  }, 1500), // 1.5 seconds delay

  loadEventPlatformContent: async (eventId: string) => {
    try {
      const response = await axios.get(getApiUrl(`event/${eventId}/platform-content`))
      const { platformContent } = response.data
      set({ platformContent: platformContent || {} })
      console.log(`Platform content loaded for event ${eventId}`)
      // Update workflow state after loading content
      get().updateWorkflowState()
    } catch (error) {
      console.warn('Failed to load platform content for event:', error)
      set({ platformContent: {} })
      // Update workflow state even if loading failed
      get().updateWorkflowState()
    }
  },

  // Save platform content for specific event
  saveEventPlatformContent: async (eventId: string, platformContent: Record<string, Record<string, unknown>>) => {
    try {
      await axios.put(getApiUrl(`event/${eventId}/platform-content`), platformContent)
      console.log(`Platform content saved for event ${eventId}`)
    } catch (error) {
      console.warn('Failed to save platform content for event:', error)
    }
  },

  // Templates are now loaded from backend platform-specific templates


  // Actions
  reset: () => set({
    uploadedFiles: [],
    selectedHashtags: [],
    selectedPlatforms: [],
    platformSettings: {},
    isProcessing: false,
    error: null,
    successMessage: null,
    publishing: false,
    published: false,
    workflowState: WORKFLOW_STATES.INITIAL
  }),

  // Convert files to base64 for n8n
  convertFilesToBase64: async (files: Array<{ file: File; name?: string }>) => {
    const convertedFiles = []

    for (const fileData of files) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result !== 'string') {
              reject(new Error('Invalid file reader result'))
              return
            }
            resolve(reader.result.split(',')[1] || '') // Remove data:image/jpeg;base64, prefix
          }
          reader.onerror = reject
          reader.readAsDataURL(fileData.file)
        })

        convertedFiles.push({
          name: fileData.file.name,
          type: fileData.file.type,
          size: fileData.file.size,
          base64: base64,
          isImage: fileData.file.type.startsWith('image/')
        })
      } catch (error) {
        console.error(`Error converting file ${fileData.name}:`, error)
      }
    }

    return convertedFiles
  },

  // Platform settings mapping - defines which workspace properties to load for each platform
  platformSettingsMap: {
    reddit: [], // Reddit settings are already in platformContent
    twitter: [],
    instagram: [],
    facebook: [],
    linkedin: []
  },

  // Publish parser - finalizes content before submission by loading platform-specific settings from backend
  publishParser: async () => {
    const state = get()
    console.log('🚀 Running publish parser...')

    try {
      const finalizedContent = { ...state.platformContent }

      // For each selected platform, finalize content
      // Default values should come from platform schemas, not hardcoded here
      // If a platform needs defaults, they should be defined in the platform's schema.default
      for (const platform of state.selectedPlatforms) {
        const platformContent = finalizedContent[platform] || {}
        // Platform-specific defaults should be handled by platform service/validator
        // No hardcoded platform checks
      }

      // Update platform content with finalized data
      set({ platformContent: finalizedContent })

      console.log('✅ Publish parser completed - all platform settings loaded from backend')
      return finalizedContent
    } catch (error) {
      console.error('❌ Publish parser failed:', error)
      throw error
    }
  },

  // Submit action via backend proxy
  submit: async () => {
    const state = get()
    set({
      isProcessing: true,
      error: null,
      successMessage: null,
      publishing: true,
      workflowState: WORKFLOW_STATES.PUBLISHING
    })

    try {
      // Basic frontend validation (detailed validation happens in backend)
      if (state.uploadedFileRefs.length === 0) {
        throw new Error('Please upload at least one file')
      }

      if (state.selectedPlatforms.length === 0) {
        throw new Error('Please select at least one platform')
      }

      // ✅ Frontend sends ONLY eventId - Backend loads everything from storage
      console.log('🎯 Starting publish process...')
      
      const eventId = state.currentEvent?.id
      if (!eventId) {
        throw new Error('No current event found. Please upload files first.')
      }

      // Prepare minimal payload - Backend loads everything else
      const payload = {
        eventId: eventId
      }

      console.log('Sending submit request for event:', eventId)

      // Send to backend (which loads everything from storage and publishes)
      // Note: For long-running operations (Playwright), use SSE stream for real-time feedback
      const response = await axios.post(getApiUrl('submit'), payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000 // 5 minutes timeout for Playwright operations
      })

      console.log('Backend response:', response.data)
      
      // Return sessionId for SSE stream connection
      const sessionId = response.data?.publishSessionId
      set({ publishSessionId: sessionId })

      // Save to history after successful publish
      try {
        const historyEntry = {
          id: `published-${Date.now()}`,
          name: state.platformContent.eventTitle || 'Event Promotion',
          status: 'published',
          platforms: state.selectedPlatforms,
          publishedAt: new Date().toISOString(),
          eventData: {
            title: state.platformContent.eventTitle,
            date: state.platformContent.eventDate,
            time: state.platformContent.eventTime,
            venue: state.platformContent.venue,
            city: state.platformContent.city
          },
          stats: {} // Will be updated later with actual metrics
        }

        // Load current history and add new entry
        const historyResponse = await axios.get(getApiUrl('history'))
        const historyData = historyResponse.data
        const currentEvents = Array.isArray(historyData?.Events) ? historyData.Events : []
        const updatedHistory = {
          Events: [historyEntry, ...currentEvents]
        }

        await axios.post(getApiUrl('history'), updatedHistory)
        console.log('Event saved to history')
      } catch (historyError) {
        console.warn('Failed to save to history:', historyError)
        // Don't fail the whole submit if history save fails
      }

      // Check backend response success
      const backendSuccess = response.data.success
      const backendMessage = response.data.message || ''
      const results = response.data.results || {}

      // Extract error messages from failed platforms
      const errorMessages = []
      if (!backendSuccess && results) {
        for (const platformId in results) {
          const platformResult = results[platformId]
          if (!platformResult.success && platformResult.error && platformId) {
            const platformName = platformId.charAt(0).toUpperCase() + platformId.slice(1)
            errorMessages.push(`${platformName}: ${platformResult.error}`)
          }
        }
      }

      const finalErrorMessage = errorMessages.length > 0 
        ? errorMessages.join('\n')
        : (backendMessage || 'Some platforms failed to publish')

      set({
        isProcessing: false,
        successMessage: backendSuccess 
          ? `Content successfully submitted to ${state.selectedPlatforms.length} platform(s)!`
          : null,
        error: backendSuccess ? null : finalErrorMessage,
        publishing: false,
        published: backendSuccess,
        workflowState: backendSuccess ? WORKFLOW_STATES.PUBLISHED : state.workflowState // Keep current state on error
      })

      // Return session ID for results tracking
      return response.data.publishSessionId

    } catch (error: unknown) {
      console.error('Submission error:', error)

      let errorMessage = 'Failed to submit content'

      const err = error as {
        code?: string
        response?: { data?: { message?: string; error?: string; details?: unknown }; status?: number }
        message?: string
      }
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to backend server. Please check if backend is running.'
      } else if (err.code === 'ENOTFOUND') {
        errorMessage = 'Backend server not found. Please check if backend is running on localhost:4000'
      } else if (err.response) {
        const responseData = err.response.data || {}
        errorMessage = responseData.message || responseData.error || `Backend error: ${err.response.status}`
        
        // Include validation details if available
        if (responseData.details) {
          if (Array.isArray(responseData.details)) {
            // Format platform validation errors
            const detailMessages = responseData.details
              .filter((d) => typeof d === 'object' && d !== null && !((d as { valid?: boolean }).valid) && Array.isArray((d as { errors?: unknown[] }).errors) && ((d as { errors?: unknown[] }).errors?.length || 0) > 0)
              .map((d) => `${(d as { platform?: string }).platform}: ${((d as { errors?: string[] }).errors || []).join(', ')}`)
            if (detailMessages.length > 0) {
              errorMessage += '\n\n' + detailMessages.join('\n')
            }
          } else if (Array.isArray(responseData.details)) {
            // If details is already an array of strings
            errorMessage += '\n\n' + responseData.details.join('\n')
          }
        }
      } else if (err.message) {
        errorMessage = err.message
      }

      set({
        error: errorMessage,
        isProcessing: false
      })
    }
  },

  // Template Management
  loadTemplates: async (platform: string) => {
    try {
      const templates = await fetchTemplatesApi(platform)
      set(state => ({
        templates: {
          ...state.templates,
          [platform]: templates as unknown as Record<string, unknown>[]
        }
      }))
      return templates
    } catch (error) {
      console.warn('Failed to load templates:', error)
    }
    return []
  },

  loadTemplateCategories: async () => {
    try {
      const categories = await fetchTemplateCategoriesApi()
      set({ templateCategories: categories })
      return categories
    } catch (error) {
      console.warn('Failed to load template categories:', error)
    }
    return []
  },

  createTemplate: async (platform: string, templateData: Record<string, unknown>) => {
    try {
      const result = await createTemplateApi(platform, templateData as unknown as TemplateCreateRequest)
      if (result.success) {
        // Reload templates for this platform
        get().loadTemplates(platform)
        return { success: true, template: result.template }
      }
      return result
    } catch (error: unknown) {
      console.warn('Failed to create template:', error)
      return { success: false, error: getAxiosLikeErrorMessage(error) }
    }
  },

  updateTemplate: async (platform: string, templateId: string, updates: Record<string, unknown>) => {
    try {
      const result = await updateTemplateApi(platform, templateId, updates)
      if (result.success) {
        // Reload templates for this platform
        get().loadTemplates(platform)
        return { success: true, template: result.template }
      }
      return result
    } catch (error: unknown) {
      console.warn('Failed to update template:', error)
      return { success: false, error: getAxiosLikeErrorMessage(error) }
    }
  },

  deleteTemplate: async (platform: string, templateId: string) => {
    try {
      const result = await deleteTemplateApi(platform, templateId)
      if (result.success) {
        // Reload templates for this platform
        get().loadTemplates(platform)
        return { success: true }
      }
      return result
    } catch (error: unknown) {
      console.warn('Failed to delete template:', error)
      return { success: false, error: getAxiosLikeErrorMessage(error) }
    }
  },

  // UI functions
  setDarkMode: async (darkMode: boolean) => {
    // Update local state
    set({ darkMode })

    // Save to backend (use PATCH to only update darkMode, not overwrite other fields like n8nWebhookUrl)
    try {
      const response = await fetch(getApiUrl('config/app'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ darkMode })
      })

      if (!response.ok) {
        console.warn('Failed to save dark mode to backend')
      }
    } catch (error) {
      console.warn('Error saving dark mode:', error)
    }
  }
})

const useStore = create<StoreState>()(createStoreState)

export default useStore
export { useStore }
