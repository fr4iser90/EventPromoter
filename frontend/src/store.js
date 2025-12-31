import { create } from 'zustand'
import axios from 'axios'
import config from './config'

const useStore = create((set, get) => ({
  // File upload state
  uploadedFiles: [],
  setUploadedFiles: (files) => set({ uploadedFiles: Array.isArray(files) ? files : [] }),

  // Hashtags state
  selectedHashtags: [],
  setSelectedHashtags: (hashtags) => set({ selectedHashtags: Array.isArray(hashtags) ? hashtags : [] }),

  // Platform state
  selectedPlatforms: [],
  setSelectedPlatforms: (platforms) => set({ selectedPlatforms: Array.isArray(platforms) ? platforms : [] }),
  platformSettings: {},
  setPlatformSettings: (settings) => set({ platformSettings: settings }),

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
  setN8nWebhookUrl: (url) => set({ n8nWebhookUrl: url }),


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

  // Submit action with n8n integration
  submit: async () => {
    const state = get()
    set({ isProcessing: true, error: null, successMessage: null })

    try {
      // Validate input
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

      // Prepare the payload for n8n
      const payload = {
        files: processedFiles,
        hashtags: state.selectedHashtags,
        publishTo: publishTo,
        platformSettings: state.platformSettings,
        metadata: {
          timestamp: new Date().toISOString(),
          totalFiles: processedFiles.length,
          platforms: state.selectedPlatforms,
          hashtagCount: state.selectedHashtags.length
        }
      }

      console.log('Sending data to n8n:', payload)

      // Send to n8n webhook
      const response = await axios.post(state.n8nWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      })

      console.log('n8n response:', response.data)

      set({
        isProcessing: false,
        successMessage: `Content successfully submitted to ${state.selectedPlatforms.length} platform(s)!`
      })

      // Optional: Reset form after successful submission
      // setTimeout(() => get().reset(), 3000)

    } catch (error) {
      console.error('Submission error:', error)

      let errorMessage = 'Failed to submit content'

      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to n8n server. Please check if n8n is running and the webhook URL is correct.'
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'n8n server not found. Please check the webhook URL in config.js'
      } else if (error.response) {
        errorMessage = `n8n server error: ${error.response.status} - ${error.response.statusText}`
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
