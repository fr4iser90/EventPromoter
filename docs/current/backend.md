# ⚙️ Backend (Node.js/Express/TypeScript)

## 📍 **Aktuelle Verteilung (AS-IS):**

### ✅ **Implementiert:**
- **API Endpoints:**
  - Config CRUD Operations (`/api/config/*`)
  - Health Check (`/api/health`)
  - Generic JSON File Management

- **Configuration Management:**
  - JSON File Persistence
  - Dynamic Config Loading
  - App Settings (Dark Mode, N8N URL)
  - Platform Settings (Emails, Social Media)

- **Security & Middleware:**
  - CORS Configuration
  - Helmet Security Headers
  - Express JSON Parsing
  - Basic Error Handling

### ❌ **Fehlend/Unterentwickelt:**
- **Business Logic** - Keine Verarbeitung
- **File Processing** - PDF Parsing, OCR
- **Data Validation** - Server-side Validation
- **Authentication** - API Security
- **Rate Limiting** - Request Throttling
- **Logging** - Request/Response Logging
- **Database Integration** - Persistent Storage

## 🎯 **Ziel-Architektur (TO-BE):**

### **Core Responsibilities:**

#### **API Layer:**
- **RESTful Endpoints** - Resource Management
- **Authentication & Authorization** - API Keys, Sessions
- **Request/Response Handling** - JSON Schema Validation
- **Error Handling** - Structured Error Responses
- **Rate Limiting** - DDoS Protection

#### **Business Logic Layer:**
- **File Processing:**
  - PDF Text Extraction
  - OCR Processing (Tesseract)
  - Image Format Conversion
  - File Validation & Sanitization

- **Data Processing:**
  - Base64 Encoding/Decoding
  - Event Data Parsing & Validation
  - Hashtag Processing
  - Metadata Extraction

#### **Integration Layer:**
- **External API Communication** - N8N Webhooks, Platform APIs
- **Queue Management** - Async Processing
- **Webhook Handling** - Incoming Webhooks
- **Notification System** - Email, Push Notifications

#### **Data Layer:**
- **Configuration Management** - JSON/YAML Config Files
- **Caching** - Redis/Memory Cache
- **Logging** - Structured Logging (Winston)
- **Metrics** - Performance Monitoring

### **Service Architecture:**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Routes    │ -> │ Business Logic   │ -> │ External APIs   │
│                 │    │                  │    │                 │
│ - REST Endpoints│    │ - File Processing│    │ - N8N Webhooks  │
│ - Auth          │    │ - Validation     │    │ - Platform APIs │
│ - Validation    │    │ - Transformation │    │ - Email Service │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Data Layer     │
                    │                  │
                    │ - Config Files   │
                    │ - Caching        │
                    │ - Logging        │
                    └──────────────────┘
```

### **Security Requirements:**
- **Input Validation** - XSS, Injection Prevention
- **File Upload Security** - Type, Size, Content Validation
- **API Authentication** - JWT, API Keys
- **CORS Configuration** - Proper Origin Handling
- **Rate Limiting** - Brute Force Protection

### **Performance Requirements:**
- **File Processing** - Async Processing for Large Files
- **Caching** - Config, Processed Data
- **Load Balancing** - Multiple Instances
- **Monitoring** - Health Checks, Metrics

## 🔄 **Migration Plan:**

### **Phase 1: Core API**
- [ ] Authentication System
- [ ] Request Validation Middleware
- [ ] Error Handling Framework
- [ ] Logging System

### **Phase 2: File Processing**
- [ ] PDF Parsing Service
- [ ] OCR Service
- [ ] File Validation
- [ ] Base64 Processing

### **Phase 3: Integration**
- [ ] N8N Webhook Client
- [ ] Platform API Clients
- [ ] Queue System
- [ ] Notification Service

### **Phase 4: Data & Monitoring**
- [ ] Database Integration
- [ ] Caching Layer
- [ ] Metrics & Monitoring
- [ ] Backup & Recovery
