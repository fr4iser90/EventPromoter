# 🏗️ **EventPromoter - System Architecture**

## 📊 **Aktuelle Verteilung (AS-IS Analysis)**

### **🎨 Frontend (React/TypeScript) - CURRENT:**
- **UI Components:** FileUpload, EventParser, HashtagBuilder, PlatformSelector, SettingsModal
- **State Management:** File handling, UI states, N8N URL configuration
- **Business Logic:** PDF parsing, OCR processing, regex patterns, base64 encoding
- **Validation:** File types, sizes, required fields, URL formats
- **Data Flow:** Payload building, N8N API communication

**Problems:** Overloaded with business logic, PDF processing in browser

### **⚙️ Backend (Node.js/Express) - CURRENT:**
- **API Endpoints:** Config CRUD operations (`/api/config/*`)
- **Configuration:** JSON file management for app/platform settings
- **Security:** Basic CORS, Helmet headers
- **Persistence:** File-based config storage

**Problems:** Minimal functionality, no business logic, no advanced validation

### **🤖 N8N (Workflow Engine) - CURRENT:**
- **Webhook Receiver:** Basic POST endpoint for data
- **Workflow:** Form-based event creation, basic routing
- **Platform Integration:** Email sending, basic social media logic
- **Processing:** Simple data handling

**Problems:** Limited platform integration, basic error handling, no advanced validation

---

## 🎯 **Ziel-Architektur (TO-BE)**

### **🏛️ Clean Architecture Principles:**
- **Single Responsibility** - Each layer has clear boundaries
- **Defense in Depth** - Multiple validation layers
- **Separation of Concerns** - UI, Business Logic, Data, Integration
- **Scalability** - Horizontal scaling capabilities

### **🎨 Frontend (React/TypeScript) - TARGET: Content Control Center**
**Responsibilities:**
- **Content Creation & Formatting** - Platform-specific content formatting
- **Real-Time Preview & Editing** - Live previews, character counters, image editing
- **Publishing Control** - Final approval, queue management, status tracking
- **Template Management** - Save/load templates, bulk operations
- **User Experience** - Intuitive editing, drag & drop, WYSIWYG editors

**Key Features:**
- Platform-specific editors (Twitter 280 chars, Instagram captions, etc.)
- Media processing tools (crop, resize, alt-text)
- Content scheduling and approval workflows
- Template system and bulk operations
- Performance analytics dashboard

### **⚙️ Backend (Node.js/Express/TypeScript) - TARGET: Data Processing Hub**
**Responsibilities:**
- **File Processing** - PDF parsing, OCR, media conversion, validation
- **Data Transformation** - Event data structuring, hashtag processing, sanitization
- **API Integration** - N8N webhooks, external services, caching
- **Configuration Management** - Settings, user preferences, API keys
- **Security & Validation** - Input sanitization, authentication, rate limiting

**Services:**
- **File Processing Service** - PDF/OCR processing, media handling
- **Content Validation Service** - Security scanning, business rules
- **N8N Integration Service** - Webhook management, payload handling
- **Configuration Service** - Settings persistence, secrets management

### **🤖 N8N (API Integration Layer) - TARGET: Platform API Executor**
**Responsibilities:**
- **Receive Pre-formatted Content** - No content processing, content arrives ready
- **Execute Platform API Calls** - Direct API integration with formatted data
- **Error Handling & Recovery** - Retry logic, fallback mechanisms, status reporting
- **Monitoring & Analytics** - API performance, success/failure tracking

**Key Principle:** **Content arrives pre-formatted from Frontend** - N8N only executes API calls!

**Workflow Pattern:**
```
Receive Formatted Content → Select Platform → Execute API Call → Handle Response → Report Status
```

---

## 🛡️ **Validation Strategy - Defense in Depth**

### **Layer 1: Frontend Validation**
```javascript
// User Experience Layer
- File format validation (immediate feedback)
- Size limits (<10MB)
- Required field checking
- Input format validation (URLs, dates)
- Real-time UI feedback
```

### **Layer 2: Backend Validation**
```javascript
// Security & Data Integrity Layer
- Authentication & authorization
- Input sanitization (XSS, injection prevention)
- File content validation
- Business rule validation
- Rate limiting & abuse prevention
```

### **Layer 3: N8N Validation**
```javascript
// Business Logic Layer
- Platform-specific limits (280 chars Twitter)
- Content appropriateness checking
- API authentication validation
- Media format compliance
- Scheduling constraint validation
```

---

## 🔄 **Migration Strategy**

### **Phase 1: Foundation (Week 1-2)**
- [ ] **Backend Core:** API structure, authentication, basic validation
- [ ] **Frontend Cleanup:** Remove PDF processing, simplify components
- [ ] **N8N Setup:** Basic webhook processing, routing structure

### **Phase 2: File Processing (Week 3-4)**
- [ ] **Backend File Service:** PDF parsing, OCR, base64 processing
- [ ] **Frontend Integration:** API calls for file processing
- [ ] **Error Handling:** Comprehensive error management

### **Phase 3: Platform Integration (Week 5-8)**
- [ ] **N8N Platform Workflows:** Twitter, Instagram, Facebook APIs
- [ ] **Content Processing:** Media transformation, text formatting
- [ ] **Monitoring:** Success/failure tracking, analytics

### **Phase 4: Advanced Features (Week 9-12)**
- [ ] **Smart Features:** A/B testing, scheduling optimization
- [ ] **Analytics:** Performance metrics, reporting dashboard
- [ ] **Enterprise Features:** User management, team collaboration

---

## 📈 **Benefits of Target Architecture**

### **Maintainability:**
- **Clear Separation:** Each layer has defined responsibilities
- **Independent Deployment:** Services can be updated separately
- **Testability:** Each layer can be tested in isolation

### **Scalability:**
- **Horizontal Scaling:** Backend and N8N can scale independently
- **Load Distribution:** File processing can be offloaded
- **Resource Optimization:** Heavy processing moves to server

### **Reliability:**
- **Error Isolation:** Failures in one layer don't affect others
- **Fallback Mechanisms:** Multiple validation and processing paths
- **Monitoring:** Comprehensive logging and alerting

### **Security:**
- **Defense in Depth:** Multiple validation layers
- **Input Sanitization:** Server-side security validation
- **Access Control:** Proper authentication and authorization

---

## 🚀 **Next Steps**

1. **Review & Approve** target architecture
2. **Create Implementation Roadmap** with priorities
3. **Start Phase 1** - Foundation work
4. **Establish CI/CD** for independent deployments
5. **Set up Monitoring** and logging infrastructure

**Ready to implement this clean architecture?** 🎯