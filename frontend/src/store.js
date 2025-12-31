import { create } from 'zustand'
import { validatePlatforms, validateEventData, validateUrl } from './utils/validation'
import axios from 'axios'
import config from './config'

const useStore = create((set, get) => ({
  // Email recipients state (now in session)
  emailRecipients: [],

  setEmailRecipients: (recipients) => {
    set({ emailRecipients: Array.isArray(recipients) ? recipients : [] })
    get().saveSession()
  },

  // Load session from backend on init
  initialize: async () => {
    try {
      console.log('Loading session from backend...')
      const response = await axios.get('http://localhost:4000/api/session/state')
      const sessionData = response.data

      set({
        uploadedFiles: sessionData.uploadedFiles || [],
        selectedHashtags: sessionData.selectedHashtags || [],
        selectedPlatforms: sessionData.selectedPlatforms || [],
        platformContent: sessionData.platformContent || {},
        contentTemplates: sessionData.contentTemplates || [],
        emailRecipients: sessionData.emailRecipients || []  // Load email recipients from session
      })

      console.log('Session loaded:', sessionData)
    } catch (error) {
      console.warn('Failed to load session from backend, using defaults:', error)
      // Keep default empty state
    }

    // Also load app config for n8nWebhookUrl
    await get().loadAppConfig()
  },

  // Save session to backend whenever state changes
  saveSession: async () => {
    const state = get()
    try {
      const sessionData = {
        uploadedFiles: state.uploadedFiles,
        selectedHashtags: state.selectedHashtags,
        selectedPlatforms: state.selectedPlatforms,
        platformContent: state.platformContent,
        contentTemplates: state.contentTemplates,
        emailRecipients: state.emailRecipients  // Save email recipients to session
      }

      await axios.post('http://localhost:4000/api/session/state', sessionData)
      console.log('Session saved to backend')
    } catch (error) {
      console.warn('Failed to save session to backend:', error)
    }
  },

  // File upload state
  uploadedFiles: [],
  setUploadedFiles: (files) => {
    set({ uploadedFiles: Array.isArray(files) ? files : [] })
    get().saveSession()
  },

  // Hashtags state
  selectedHashtags: [],
  setSelectedHashtags: (hashtags) => {
    set({ selectedHashtags: Array.isArray(hashtags) ? hashtags : [] })
    get().saveSession()
  },

  // Platform state
  selectedPlatforms: [],
  setSelectedPlatforms: (platforms) => {
    set({ selectedPlatforms: Array.isArray(platforms) ? platforms : [] })
    get().saveSession()
  },
  platformSettings: {},
  setPlatformSettings: (settings) => {
    set({ platformSettings: settings })
    get().saveSession()
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
    get().saveSession()
  },
  resetPlatformContent: () => {
    set({ platformContent: {} })
    get().saveSession()
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
    get().saveSession()
  },
  loadTemplate: (templateId) => {
    set(state => {
      const template = state.contentTemplates.find(t => t.id === templateId)
      if (template) {
        return { platformContent: { ...template.content } }
      }
      return state
    })
    get().saveSession()
  },
  deleteTemplate: (templateId) => {
    set(state => ({
      contentTemplates: state.contentTemplates.filter(t => t.id !== templateId)
    }))
    get().saveSession()
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
        content: state.platformContent,
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
