# Node Categories and Structure

## 📁 New Folder Structure

```
workflows/multiplatform-publisher/
├── 📁 core/                    # Core Workflow Logic
│   ├── config.json            # Main workflow configuration
│   └── build.js              # Build script
├── 📁 platforms/              # Platform Implementations
│   ├── hybrid-poster.js      # Unified API + Playwright posting
│   ├── 📁 api/               # API-based implementations
│   │   ├── twitter.js        # Twitter API client
│   │   ├── instagram.js      # Instagram API client
│   │   ├── facebook.js       # Facebook API client
│   │   └── linkedin.js       # LinkedIn API client
│   └── 📁 playwright/        # Browser automation
│       ├── core.js           # Playwright base functionality
│       ├── anti-detection.js # Anti-bot detection measures
│       ├── facebook.js       # Facebook browser automation
│       └── instagram.js      # Instagram browser automation
├── 📁 processors/             # Data Processing Scripts
│   ├── validate-input.js     # Input validation
│   ├── validate-platforms.js # Platform requirement checks
│   ├── validate-urls.js      # URL validation
│   ├── format-content.js     # Content formatting for platforms
│   ├── generate-hashtags.js  # Hashtag generation
│   ├── collect-results.js    # Result aggregation
│   ├── enhanced-logging.js   # Detailed logging
│   └── send-notifications.js # Discord/Telegram notifications
├── 📁 utils/                  # Utility Functions
│   ├── parse-manual-input.js # Manual input parsing
│   └── transform-form-data.js # Form data transformation
├── 📁 docs/                   # Documentation
│   ├── README.md             # Main documentation
│   ├── PLAYWRIGHT_GUIDE.md   # Browser automation guide
│   └── NODES.md              # This file
└── 📁 config/                 # Configuration Files
    └── environments.json     # Environment-specific configs
```

## 🔗 Node Categories

### 🎯 **Input/Trigger Nodes**
- **On form submission** - Web form trigger for event data
- **📁 Manual File Path Input** - Manual trigger with file path input
- **📄 Read File from Path** - File reading from manual path
- **📎 File Upload (PDF/PNG/JPG)** - Direct file upload endpoint
- **📥 Webhook Trigger (API)** - REST API endpoint for external systems

### 🔍 **Validation & Processing Nodes**
- **🔍 Validate & Prepare Data** - Input validation and data preparation
- **✅ Validate Platforms** - Check platform requirements and credentials
- **🔗 Validate URLs** - Verify image and ticket URL accessibility
- **✏️ Format Content for Platforms** - Format content for each platform's requirements
- **🏷️ Generate Hashtags** - Generate relevant hashtags for platforms

### 📱 **Platform Posting Nodes**
- **🐦 Post to Twitter/X** - Twitter API posting
- **📷 Post to Instagram** - Instagram API posting
- **👤 Post to Facebook Page** - Facebook Graph API posting
- **💼 Post to LinkedIn** - LinkedIn API posting
- **🔴 Post to Reddit** - Reddit API posting
- **📧 Send Email** - SMTP email sending

### 📊 **Result Processing Nodes**
- **📊 Collect Results** - Aggregate posting results from all platforms
- **📋 Enhanced Logging** - Generate detailed execution logs
- **📢 Send Notifications** - Send results to Discord/Telegram

### 🎛️ **Control Flow Nodes**
- **🐦 Post to Twitter/X?** - Conditional Twitter posting
- **📷 Post to Instagram?** - Conditional Instagram posting
- **👤 Post to Facebook?** - Conditional Facebook posting
- **💼 Post to LinkedIn?** - Conditional LinkedIn posting
- **📧 Send Email?** - Conditional email sending
- **🔴 Post to Reddit?** - Conditional Reddit posting

### 🔀 **Output Nodes**
- **🔀 Merge Results** - Combine all results into final output
- **✅ Webhook Response** - Return results to caller

### 📢 **Notification Nodes**
- **Discord** - Send results to Discord webhook
- **Telegram** - Send results to Telegram bot

## 🎭 **Playwright Integration**

### **Available Platforms**
- ✅ **Facebook** - Full browser automation with anti-detection
- ✅ **Instagram** - Browser automation (API available but unreliable)
- 🚧 **Twitter** - API preferred, Playwright as backup
- 🚧 **LinkedIn** - API preferred, Playwright as backup
- 🚧 **Reddit** - Hybrid approach possible

### **Anti-Detection Features**
- Human-like mouse movements and clicking
- Realistic typing patterns with variable delays
- Browser fingerprint masking
- Random delays between actions
- Webdriver flag removal
- Permission and plugin mocking

## 🔄 **Data Flow**

```
Input Triggers
    ↓
Data Validation & Preparation
    ↓
Platform-Specific Posting (Parallel)
    ↓
Result Collection & Logging
    ↓
Notifications (Discord/Telegram)
    ↓
Final Response
```

## 📋 **Configuration Options**

### **Posting Modes**
- **API-Only**: Fastest, most reliable for stable APIs
- **Playwright-Only**: Maximum compatibility, slower
- **Hybrid**: API first, Playwright fallback (recommended)

### **Platform Settings**
Each platform can be configured individually:
```json
{
  "platform": "facebook",
  "mode": "playwright",
  "retries": 3,
  "timeout": 45000
}
```

### **Environment Configurations**
- **development**: Visible browser, faster execution
- **production**: Headless browser, optimized timing
- **testing**: API-only mode for quick testing

## 🚨 **Error Handling**

### **Retry Logic**
- API failures → Automatic retry with backoff
- Playwright failures → Screenshot capture + retry
- Complete failures → Detailed error logging

### **Fallback Strategies**
- API timeout → Switch to Playwright
- Rate limiting → Exponential backoff
- Authentication errors → Manual intervention required

## 📊 **Monitoring & Logging**

### **Success Metrics**
- Posting success rate per platform
- Execution time tracking
- Error categorization

### **Notification Channels**
- **Discord**: Rich embeds with results summary
- **Telegram**: Formatted messages with statistics
- **Console**: Detailed execution logs
