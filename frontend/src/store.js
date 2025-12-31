import { create } from 'zustand'
import { validatePlatforms, validateEventData, validateUrl } from './utils/validation'
import axios from 'axios'
import config from './config'

const useStore = create((set, get) => ({

  // Load workspace from backend on init
  initialize: async () => {
    try {
      console.log('Loading workspace from backend...')
      const response = await axios.get('http://localhost:4000/api/workspace')
      const workspaceData = response.data

      // Load current project data
      const project = workspaceData.currentProject || {}
      set({
        uploadedFiles: project.uploadedFiles || [],
        selectedHashtags: project.selectedHashtags || [],
        selectedPlatforms: project.selectedPlatforms || [],
        platformContent: project.platformContent || {},
        contentTemplates: project.contentTemplates || []
      })

      console.log('Workspace loaded:', workspaceData)
    } catch (error) {
      console.warn('Failed to load workspace from backend, using defaults:', error)
      // Keep default empty state
    }

    // Also load app config for n8nWebhookUrl
    await get().loadAppConfig()
  },

  // Save workspace to backend whenever state changes
  saveWorkspace: async () => {
    const state = get()
    try {
      const workspaceData = {
        currentProject: {
          id: `project-${Date.now()}`, // Generate new ID if needed
          name: 'Current Event Project',
          created: new Date().toISOString(),
          // uploadedFiles are not serializable, skip them
          selectedHashtags: state.selectedHashtags,
          selectedPlatforms: state.selectedPlatforms,
          platformContent: state.platformContent,
          contentTemplates: state.contentTemplates
        }
      }

      await axios.post('http://localhost:4000/api/workspace', workspaceData)
      console.log('Store: Workspace saved to backend successfully')
    } catch (error) {
      console.warn('Store: Failed to save workspace to backend:', error)
    }
  },

  // Load workspace data
  loadWorkspace: async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/workspace')
      const workspaceData = response.data
      const project = workspaceData.currentProject || {}

      set({
        // uploadedFiles are not serializable, keep current state
        selectedHashtags: project.selectedHashtags || [],
        selectedPlatforms: project.selectedPlatforms || [],
        platformContent: project.platformContent || {},
        contentTemplates: project.contentTemplates || []
      })

      console.log('Workspace loaded from backend')
      return project
    } catch (error) {
      console.warn('Failed to load workspace:', error)
      return null
    }
  },

  // Create new project (reset workspace)
  newProject: () => {
    set({
      uploadedFiles: [],
      selectedHashtags: [],
      selectedPlatforms: [],
      platformContent: {},
      contentTemplates: []
    })
    get().saveWorkspace()
    console.log('New project created')
  },

  // Legacy removed - everything uses workspace now

  // File upload state
  uploadedFiles: [],
  setUploadedFiles: (files) => {
    set({ uploadedFiles: Array.isArray(files) ? files : [] })
    // Don't save workspace for files - they're not serializable
  },

  // Hashtags state
  selectedHashtags: [],
  setSelectedHashtags: (hashtags) => {
    set({ selectedHashtags: Array.isArray(hashtags) ? hashtags : [] })
    get().saveWorkspace()
  },

  // Platform state
  selectedPlatforms: [],
  setSelectedPlatforms: (platforms) => {
    set({ selectedPlatforms: Array.isArray(platforms) ? platforms : [] })
    get().saveWorkspace()
  },
  platformSettings: {},
  setPlatformSettings: (settings) => {
    set({ platformSettings: settings })
    get().saveWorkspace()
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
    get().saveWorkspace()
  },
  resetPlatformContent: () => {
    set({ platformContent: {} })
    get().saveWorkspace()
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
    get().saveWorkspace()
  },
  loadTemplate: (templateId) => {
    set(state => {
      const template = state.contentTemplates.find(t => t.id === templateId)
      if (template) {
        return { platformContent: { ...template.content } }
      }
      return state
    })
    get().saveWorkspace()
  },
  deleteTemplate: (templateId) => {
    set(state => ({
      contentTemplates: state.contentTemplates.filter(t => t.id !== templateId)
    }))
    get().saveWorkspace()
  },


  // Actions
  reset: () => set({
    uploadedFiles: [],
    selectedHashtags: [],
    selectedPlatforms: [],
    platformSettings: {},
    isProcessing: false,
    error: null,
    successMessage: null
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
        console.error(`Error converting file ${fileData.file.name}:`, error)
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
    set({ isProcessing: true, error: null, successMessage: null })

    try {
      // Basic frontend validation (detailed validation happens in backend)
      if (state.uploadedFiles.length === 0) {
        throw new Error('Please upload at least one file')
      }

      if (state.selectedPlatforms.length === 0) {
        throw new Error('Please select at least one platform')
      }

      // Run publish parser to finalize content
      console.log('🎯 Starting publish process...')
      const finalizedContent = await get().publishParser()

      // Convert files to base64
      console.log('Converting files to base64...')
      const processedFiles = await state.convertFilesToBase64(state.uploadedFiles)

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
          projects: [historyEntry, ...historyData.projects]
        }

        await axios.post('http://localhost:4000/api/history', updatedHistory)
        console.log('Project saved to history')
      } catch (historyError) {
        console.warn('Failed to save to history:', historyError)
        // Don't fail the whole submit if history save fails
      }

      set({
        isProcessing: false,
        successMessage: `Content successfully submitted to ${state.selectedPlatforms.length} platform(s)!`
      })

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
