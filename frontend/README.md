# Multi-Platform Publisher Interface

A modern React-based web interface for the n8n Multi-Platform Social Media Publisher workflow.

## 🚀 Features

- **File Upload**: Drag-and-drop upload for JPG images and TXT/MD text files
- **Live Preview**: Real-time preview of uploaded content
- **Hashtag Builder**: Manual input and predefined hashtag selection
- **Platform Selection**: Enable/disable social media platforms with individual settings
- **Responsive Design**: Mobile-first design that works on all devices

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with JSX
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand
- **File Upload**: React Dropzone
- **Build Tool**: Vite
- **Package Manager**: npm

## 📦 Installation

1. Navigate to the interface directory:
   ```bash
   cd workflows/multiplatform-publisher/interface
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### File Upload
- Drag and drop files or click to browse
- Supported formats: JPG, PNG, GIF, WebP images and TXT, MD text files
- Maximum file size: 10MB per file

### Hashtag Management
- Add custom hashtags manually (comma-separated)
- Click predefined hashtags from categories (Event, Music, Location, General)
- Remove hashtags individually or clear all

### Platform Configuration
- Check/uncheck platforms to enable/disable them
- Click the settings button for each platform to configure:
  - **Twitter/X**: API credentials
  - **Instagram**: Login credentials
  - **Facebook**: Page ID and access token
  - **LinkedIn**: Profile/company settings
  - **Reddit**: Subreddit selection and credentials
  - **Email**: Recipients and SMTP settings

### Publishing
- Click "Publish Content" to send data to the n8n workflow
- Monitor the publishing progress
- Reset the form to start over

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the interface root:

```env
VITE_N8N_WEBHOOK_URL=http://your-n8n-instance.com/webhook/your-webhook-id
VITE_API_BASE_URL=http://localhost:3000
```

### Platform Settings
Platform credentials are stored locally in the browser. In production, implement secure server-side storage.

## 📁 Event Structure

```
interface/
├── src/
│   ├── components/
│   │   ├── FileUpload/
│   │   ├── Preview/
│   │   ├── HashtagBuilder/
│   │   └── PlatformSelector/
│   ├── store.js              # Global state management
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
├── public/
├── package.json
├── vite.config.js
└── README.md
```

## 🔌 n8n Integration

The interface is fully integrated with the Multi-Platform Social Media Publisher n8n workflow. When you click "Publish Content", the following happens:

### Data Flow
1. **File Conversion**: Uploaded files are converted to base64 format
2. **Data Packaging**: All data (files, hashtags, platform settings) is packaged into JSON
3. **Webhook Submission**: Data is sent to the n8n webhook endpoint
4. **Workflow Processing**: n8n processes the data through the existing workflow pipeline

### Webhook Payload
```json
{
  "files": [
    {
      "name": "event-image.jpg",
      "type": "image/jpeg",
      "size": 245760,
      "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
      "isImage": true
    }
  ],
  "hashtags": ["#event", "#party", "#techno"],
  "publishTo": {
    "twitter": true,
    "instagram": true,
    "facebook": false
  },
  "platformSettings": {
    "reddit": {
      "subreddit": "r/djsets",
      "flair": "Event"
    }
  },
  "metadata": {
    "timestamp": "2024-12-30T10:30:00.000Z",
    "totalFiles": 1,
    "platforms": ["twitter", "instagram"],
    "hashtagCount": 3
  }
}
```

### Configuration
Update the webhook URL in `src/config.js`:
```javascript
n8nWebhookUrl: 'http://your-n8n-instance:5678/webhook/multiplatform-publisher'
```

### Error Handling
- **Connection Issues**: Clear error messages for network problems
- **Server Errors**: Detailed HTTP error status information
- **Validation Errors**: Client-side validation with immediate feedback
- **Success Confirmation**: Visual confirmation when content is submitted successfully

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Docker**: Build container with nginx
- **Traditional Server**: Serve built files from any web server

## 🔒 Security Considerations

- File uploads are validated client-side only
- Implement server-side validation in production
- Store credentials securely (not in localStorage for production)
- Use HTTPS in production
- Implement rate limiting for API calls

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This Event is part of the Multi-Platform Social Media Publisher and follows the same license terms.
