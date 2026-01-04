import { create } from 'zustand'
import { validatePlatforms, validateEventData, validateUrl } from './utils/validation'
import axios from 'axios'
import config from './config'

// Debounce utility function
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
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
const determineWorkflowState = (state) => {
  if (state.publishing) return WORKFLOW_STATES.PUBLISHING
  if (state.published) return WORKFLOW_STATES.PUBLISHED
  if (state.selectedPlatforms?.length > 0 && Object.keys(state.platformContent || {}).length > 0) return WORKFLOW_STATES.CONTENT_READY
  if (state.selectedPlatforms?.length > 0) return WORKFLOW_STATES.PLATFORMS_SELECTED
  if (state.currentEvent?.id) return WORKFLOW_STATES.EVENT_READY
  if (state.uploadedFileRefs?.length > 0) return WORKFLOW_STATES.FILES_UPLOADED
  return WORKFLOW_STATES.INITIAL
}

const useStore = create((set, get) => ({

  // Load event workspace from backend on init
  initialize: async () => {
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

    // Load last selected platforms if no platforms are currently selected
    get().loadLastSelectedPlatforms()
  },

  // Save workspace to backend whenever state changes
  saveEventWorkspace: async () => {
    const state = get()
    try {
      set({ autoSaving: true })
      const eventWorkspaceData = {
        currentEvent: {
          id: state.currentEvent?.id || `event-${Date.now()}`,
          name: state.currentEvent?.name || 'Current Event',
          created: state.currentEvent?.created || new Date().toISOString(),
          uploadedFileRefs: state.uploadedFileRefs, // File references are serializable
          selectedHashtags: state.selectedHashtags,
          selectedPlatforms: state.selectedPlatforms,
          emailRecipients: state.emailRecipients || [],
          contentTemplates: state.contentTemplates
        }
      }

      await axios.post('http://localhost:4000/api/event', eventWorkspaceData)
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
      const response = await axios.get('http://localhost:4000/api/platforms/preferences')
      const preferences = response.data.preferences
      set({
        userPreferences: preferences,
        emailRecipients: preferences.emailRecipients || []
      })
      console.log('User preferences loaded:', preferences)
      return preferences
    } catch (error) {
      console.warn('Failed to load user preferences:', error)
      return null
    }
  },

  saveUserPreferences: async (preferences) => {
    try {
      await axios.post('http://localhost:4000/api/platforms/preferences', { preferences })
      set({ userPreferences: preferences })
      console.log('User preferences saved')
    } catch (error) {
      console.warn('Failed to save user preferences:', error)
    }
  },

  updateUserPreferences: async (updates) => {
    try {
      await axios.patch('http://localhost:4000/api/platforms/preferences', updates)
      set(state => ({
        userPreferences: { ...state.userPreferences, ...updates }
      }))
      console.log('User preferences updated')
    } catch (error) {
      console.warn('Failed to update user preferences:', error)
    }
  },

  // Complete event restore
  restoreEvent: async (eventId) => {
    try {
      console.log(`🔄 Starting complete restore of event ${eventId}...`)

      // Load complete event data from backend
      const response = await axios.get(`http://localhost:4000/api/event/${eventId}/restore`)
      const restoreData = response.data.event

      // Reset current state first
      get().newEvent()

      // Restore all data
      set({
        currentEvent: restoreData.event,
        uploadedFileRefs: restoreData.files,
        selectedPlatforms: restoreData.platforms,
        platformContent: restoreData.content,
        selectedHashtags: restoreData.hashtags,
        emailRecipients: restoreData.emailRecipients
      })

      // Update workflow state to reflect restored data
      get().updateWorkflowState()

      // Save the restored state
      get().saveEventWorkspace()

      console.log(`✅ Event ${eventId} completely restored:`, {
        files: restoreData.files.length,
        platforms: restoreData.platforms.length,
        contentKeys: Object.keys(restoreData.content).length
      })

      return restoreData
    } catch (error) {
      console.error(`❌ Failed to restore event ${eventId}:`, error)
      throw error
    }
  },

  // Check if file exists on server
  checkFileExists: async (fileUrl) => {
    try {
      const response = await axios.head(fileUrl.replace('/api/files/', 'http://localhost:4000/api/files/'))
      return response.status === 200
    } catch (error) {
      return false
    }
  },

  // Check if parsed data exists for event
  checkParsedDataExists: async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/parsing/data/${eventId}`)
      return response.status === 200
    } catch (error) {
      return false
    }
  },

  // Load event workspace data with validation
  loadEventWorkspace: async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/event')
      const eventWorkspaceData = response.data
      const event = eventWorkspaceData.currentEvent || {}

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

      set({
        currentEvent: event,
        uploadedFileRefs: validatedFileRefs, // Only load existing files
        selectedHashtags: event.selectedHashtags || [],
        selectedPlatforms: event.selectedPlatforms || [],
        emailRecipients: event.emailRecipients || state.userPreferences?.emailRecipients || [],
        contentTemplates: event.contentTemplates || []
      })

      // Update workflow state after loading
      get().updateWorkflowState()

      // Load platform content for this event
      get().loadEventPlatformContent(event.id)

      console.log(`Event workspace loaded from backend (${validatedFileRefs.length} valid files)`)
      return event
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
      contentTemplates: [],
      workflowState: WORKFLOW_STATES.INITIAL,
      publishing: false,
      published: false,
      currentEvent: null
    })
    get().saveEventWorkspace()
    console.log('New Event created')
  },

  // Update workflow state based on current data
  updateWorkflowState: () => {
    const state = get()
    const newWorkflowState = determineWorkflowState(state)
    if (state.workflowState !== newWorkflowState) {
      set({ workflowState: newWorkflowState })
      console.log(`Workflow state changed to: ${newWorkflowState}`)
    }
  },

  // Legacy removed - everything uses workspace now

  // Event state
  currentEvent: null,
  duplicateFound: null, // For duplicate event detection

  // Workflow state
  workflowState: WORKFLOW_STATES.INITIAL,
  publishing: false,
  published: false,
  autoSaving: false,

  // User preferences
  userPreferences: {
    lastSelectedPlatforms: [],
    defaultHashtags: [],
    emailRecipients: [],
    smtpConfig: null,
    uiPreferences: {
      darkMode: false
    }
  },

  // File upload state - now stores references to uploaded files on server
  uploadedFileRefs: [],

  // Email recipients (synced with user preferences)
  emailRecipients: [],
  setUploadedFileRefs: (fileRefs) => {
    set({ uploadedFileRefs: Array.isArray(fileRefs) ? fileRefs : [] })
    get().saveEventWorkspace()
  },

  setEmailRecipients: (recipients) => {
    const newRecipients = Array.isArray(recipients) ? recipients : []
    set({ emailRecipients: newRecipients })
    get().updateUserPreferences({ emailRecipients: newRecipients })
    get().saveEventWorkspace()
  },

  // Upload files to server
  uploadFiles: async (files) => {
    try {
      set({ isProcessing: true, error: null })

      const formData = new FormData()
      const eventId = get().currentEvent?.id || 'default'
      formData.append('eventId', eventId)

      // Add all files to FormData
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await axios.post('http://localhost:4000/api/files/upload-multiple', formData, {
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
          parsedData: null, // Reset parsed data when new files are uploaded
          duplicateFound: null, // Reset duplicate state
          parsingStatus: 'idle' // Reset parsing status for new files
        })
        get().saveEventWorkspace()
        get().updateWorkflowState()
        get().debouncedSave()

        console.log('Files uploaded successfully:', response.data.files.length)
        return response.data.files
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('File upload error:', error)
      set({ error: error.message || 'Upload failed' })
      throw error
    } finally {
      set({ isProcessing: false })
    }
  },

  // Remove uploaded file
  removeUploadedFile: async (fileId) => {
    try {
      const eventId = get().currentEvent?.id || 'default'
      const fileRef = get().uploadedFileRefs.find(f => f.id === fileId)

      if (fileRef) {
        // Delete from server
        await axios.delete(`http://localhost:4000/api/files/${eventId}/${fileRef.filename}`)
      }

      // Remove from local state
      const updatedRefs = get().uploadedFileRefs.filter(f => f.id !== fileId)
      set({ uploadedFileRefs: updatedRefs })
      get().saveEventWorkspace()

    } catch (error) {
      console.error('Remove file error:', error)
      set({ error: 'Failed to remove file' })
    }
  },

  // Parse uploaded files automatically
  parseUploadedFiles: async () => {
    const uploadedFiles = get().uploadedFileRefs
    if (uploadedFiles.length === 0) return

    try {
      set({ isProcessing: true, error: null, parsingStatus: 'parsing' })

      const eventId = get().currentEvent?.id || 'default'
      const selectedPlatforms = get().selectedPlatforms

      // Parse the most recent file using backend
      const latestFile = uploadedFiles[uploadedFiles.length - 1]

      console.log('Starting backend parsing for file:', latestFile.name)

      // First parse the file
      const parseResponse = await axios.post(`http://localhost:4000/api/parsing/file/${latestFile.id}`, {
        eventId: eventId,
        filename: latestFile.filename,
        name: latestFile.name,
        type: latestFile.type
      })

      if (!parseResponse.data.success) {
        set({ parsingStatus: 'error' })
        throw new Error(parseResponse.data.error || 'File parsing failed')
      }

      const { parsedData, duplicateCheck } = parseResponse.data

      // Now apply platform-specific parsing
      const platformResponse = await axios.post('http://localhost:4000/api/parsing/platforms', {
        parsedData: parsedData,
        eventId: eventId,
        platforms: selectedPlatforms
      })

      if (platformResponse.data.success) {
        const { platformContent } = platformResponse.data

        // Check for duplicates
        if (duplicateCheck.isDuplicate) {
          // Ask user what to do with duplicate
          set({
            duplicateFound: {
              existingEventId: duplicateCheck.existingEventId,
              existingEvent: duplicateCheck.existingEvent,
              newParsedData: parsedData,
              newPlatformContent: platformContent
            },
            parsingStatus: 'completed'
          })
        } else {
          // No duplicate, use the parsed content
          get().applyParsedContent(parsedData, platformContent)
          set({ parsingStatus: 'completed' })
        }

        console.log('Backend parsing completed successfully')
      } else {
        set({ parsingStatus: 'error' })
        throw new Error('Platform parsing failed')
      }

    } catch (error) {
      console.error('Backend parsing error:', error)
      set({ error: 'Failed to parse uploaded files: ' + error.message, parsingStatus: 'error' })
    } finally {
      set({ isProcessing: false })
    }
  },

  // Apply parsed content to platform content
  applyParsedContent: (parsedData, platformContent) => {
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

    set({ platformContent: updatedPlatformContent })
    get().saveEventWorkspace()

    console.log('Applied parsed content to platforms')
  },

  // Handle duplicate resolution
  resolveDuplicate: async (useExisting) => {
    const duplicateData = get().duplicateFound
    if (!duplicateData) return

    try {
      if (useExisting) {
        // Load existing parsed data
        const response = await axios.get(`http://localhost:4000/api/parsing/data/${duplicateData.existingEventId}`)
        if (response.data.success) {
          // Apply existing content
          get().applyParsedContent(response.data.parsedData, {}) // Platform content would need to be regenerated
        }
      } else {
        // Use new parsed content
        get().applyParsedContent(duplicateData.newParsedData, duplicateData.newPlatformContent)
      }

      // Clear duplicate state
      set({ duplicateFound: null })

    } catch (error) {
      console.error('Duplicate resolution error:', error)
      set({ error: 'Failed to resolve duplicate' })
    }
  },

  // Hashtags state
  selectedHashtags: [],
  setSelectedHashtags: (hashtags) => {
    set({ selectedHashtags: Array.isArray(hashtags) ? hashtags : [] })
    get().saveEventWorkspace()
  },

  // Platform state
  selectedPlatforms: [],
  setSelectedPlatforms: (platforms) => {
    const newPlatforms = Array.isArray(platforms) ? platforms : []
    set({ selectedPlatforms: newPlatforms })
    get().saveEventWorkspace()
    get().updateWorkflowState()
    get().debouncedSave()

    // Save last selected platforms to user preferences
    if (newPlatforms.length > 0) {
      get().updateUserPreferences({ lastSelectedPlatforms: newPlatforms })
    }
  },

  // Load last selected platforms from user preferences
  loadLastSelectedPlatforms: () => {
    const state = get()
    if (state.selectedPlatforms.length === 0 && state.userPreferences?.lastSelectedPlatforms?.length > 0) {
      console.log('Loading last selected platforms from preferences:', state.userPreferences.lastSelectedPlatforms)
      get().setSelectedPlatforms(state.userPreferences.lastSelectedPlatforms)
    }
  },
  platformSettings: {},
  setPlatformSettings: (settings) => {
    set({ platformSettings: settings })
    get().saveEventWorkspace()
  },

  // UI state
  isProcessing: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  error: null,
  setError: (error) => set({ error }),
  successMessage: null,
  setSuccessMessage: (message) => set({ successMessage: message }),
  darkMode: false,
  setDarkMode: (darkMode) => set({ darkMode }),

  // Parsing status tracking
  parsingStatus: 'idle', // 'idle', 'parsing', 'completed', 'error'
  setParsingStatus: (status) => set({ parsingStatus: status }),

  // N8N configuration
  n8nWebhookUrl: 'http://localhost:5678/webhook/multiplatform-publisher',
  setN8nWebhookUrl: async (url) => {
    set({ n8nWebhookUrl: url })
    // Save to backend config
    try {
      await axios.post('http://localhost:4000/api/config/app', {
        n8nWebhookUrl: url,
        darkMode: false // We don't manage darkMode in store anymore
      })
    } catch (error) {
      console.warn('Failed to save n8nWebhookUrl to backend:', error)
    }
  },

  // Load app config (n8nWebhookUrl)
  loadAppConfig: async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/config/app')
      const config = response.data
      if (config.n8nWebhookUrl) {
        set({ n8nWebhookUrl: config.n8nWebhookUrl })
      }
    } catch (error) {
      console.warn('Failed to load app config:', error)
    }
  },

  // Platform-specific content
  platformContent: {},
  setPlatformContent: (platform, content) => {
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
  savePlatformContent: async (platform, content) => {
    const state = get()
    const eventId = state.currentEvent?.id

    if (!eventId) {
      console.warn('No current event ID, cannot save platform content')
      return
    }

    try {
      await axios.put(`http://localhost:4000/api/parsing/platform-content/${eventId}`, {
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
  loadEventPlatformContent: async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/event/${eventId}/platform-content`)
      const { platformContent } = response.data
      set({ platformContent: platformContent || {} })
      console.log(`Platform content loaded for event ${eventId}`)
    } catch (error) {
      console.warn('Failed to load platform content for event:', error)
      set({ platformContent: {} })
    }
  },

  // Save platform content for specific event
  saveEventPlatformContent: async (eventId, platformContent) => {
    try {
      await axios.put(`http://localhost:4000/api/event/${eventId}/platform-content`, platformContent)
      console.log(`Platform content saved for event ${eventId}`)
    } catch (error) {
      console.warn('Failed to save platform content for event:', error)
    }
  },

  // Template system
  contentTemplates: [],
  saveTemplate: (name, content) => {
    set(state => {
      const template = {
        id: Date.now(),
        name,
        content: { ...content },
        createdAt: new Date().toISOString()
      }
      return {
        contentTemplates: [...state.contentTemplates, template]
      }
    })
    get().saveEventWorkspace()
  },
  loadTemplate: (templateId) => {
    set(state => {
      const template = state.contentTemplates.find(t => t.id === templateId)
      if (template) {
        return { platformContent: { ...template.content } }
      }
      return state
    })
    get().saveEventWorkspace()
  },
  deleteTemplate: (templateId) => {
    set(state => ({
      contentTemplates: state.contentTemplates.filter(t => t.id !== templateId)
    }))
    get().saveEventWorkspace()
  },


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
  convertFilesToBase64: async (files) => {
    const convertedFiles = []

    for (const fileData of files) {
      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1]) // Remove data:image/jpeg;base64, prefix
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
    email: [], // Recipients are managed in platformContent.email.recipients
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
      for (const platform of state.selectedPlatforms) {
        const platformContent = finalizedContent[platform] || {}

        // Email recipients are already in platformContent.email.recipients
        // No need to load from backend - they're managed in the content

        // Set defaults for missing required fields
        if (platform === 'reddit' && !platformContent.subreddit) {
          finalizedContent.reddit = {
            ...finalizedContent.reddit,
            subreddit: 'r/events'
          }
          console.log(`🟠 ${platform}: Set default subreddit`)
        }
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

      // Run publish parser to finalize content
      console.log('🎯 Starting publish process...')
      const finalizedContent = await get().publishParser()

      // Use uploaded file references (URLs) instead of converting to base64
      console.log('Using uploaded file references...')
      const processedFiles = state.uploadedFileRefs.map(fileRef => ({
        name: fileRef.name,
        url: fileRef.url,
        type: fileRef.type,
        size: fileRef.size,
        isImage: fileRef.isImage
      }))

      // Prepare publishTo object
      const publishTo = {}
      state.selectedPlatforms.forEach(platform => {
        publishTo[platform] = true
      })

      // Prepare payload for backend
      const payload = {
        files: processedFiles,
        platforms: publishTo,
        content: finalizedContent,  // Use finalized content from publish parser
        hashtags: state.selectedHashtags,
        n8nUrl: state.n8nWebhookUrl,
        eventData: {
          eventTitle: state.platformContent.eventTitle,
          eventDate: state.platformContent.eventDate,
          eventTime: state.platformContent.eventTime,
          venue: state.platformContent.venue,
          city: state.platformContent.city
        }
      }

      console.log('Sending data to backend:', payload)

      // Send to backend (which validates and forwards to N8N)
      const response = await axios.post('http://localhost:4000/api/submit', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      })

      console.log('Backend response:', response.data)

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
        const historyResponse = await axios.get('http://localhost:4000/api/history')
        const historyData = historyResponse.data
        const updatedHistory = {
          Events: [historyEntry, ...historyData.Events]
        }

        await axios.post('http://localhost:4000/api/history', updatedHistory)
        console.log('Event saved to history')
      } catch (historyError) {
        console.warn('Failed to save to history:', historyError)
        // Don't fail the whole submit if history save fails
      }

      set({
        isProcessing: false,
        successMessage: `Content successfully submitted to ${state.selectedPlatforms.length} platform(s)!`,
        publishing: false,
        published: true,
        workflowState: WORKFLOW_STATES.PUBLISHED
      })

      // Return session ID for results tracking
      return response.data.publishSessionId

    } catch (error) {
      console.error('Submission error:', error)

      let errorMessage = 'Failed to submit content'

      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to backend server. Please check if backend is running.'
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Backend server not found. Please check if backend is running on localhost:4000'
      } else if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || `Backend error: ${error.response.status}`
      } else if (error.message) {
        errorMessage = error.message
      }

      set({
        error: errorMessage,
        isProcessing: false
      })
    }
  }
}))

export default useStore
export { useStore }
