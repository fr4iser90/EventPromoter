# 🎨 Frontend (React/TypeScript)

## 📍 **Aktuelle Verteilung (AS-IS):**

### ✅ **Implementiert:**
- **UI/UX Komponenten:**
  - FileUpload (Drag & Drop, Multi-File)
  - EventParser (PDF Parsing, 3-Tab Interface)
  - HashtagBuilder (Tag Management)
  - PlatformSelector (Platform Auswahl)
  - SettingsModal (N8N URL Konfiguration)
  - Preview (File Display)

- **State Management (Zustand):**
  - File Upload State
  - Hashtag Management
  - Platform Selection
  - UI States (Loading, Error, Success)
  - N8N Webhook URL
  - Dark Mode

- **Business Logic:**
  - PDF Text Extraction (pdfjs-dist)
  - OCR Processing (tesseract.js)
  - Regex Pattern Matching (Event Data)
  - Base64 File Encoding
  - Confidence Scoring

- **Validation:**
  - File Type Validation (PDF, Images)
  - File Size Validation (<10MB)
  - Required Field Validation (Platform Selection)
  - URL Format Validation

- **Data Flow:**
  - Payload Building (Files → Base64, Hashtags, Platform Settings)
  - N8N API Communication
  - Error Handling & User Feedback

### ❌ **Problematisch/Überladen:**
- **PDF Parsing Logic** (sollte evtl. Backend/N8N)
- **Complex Regex Patterns** (Event Extraction)
- **OCR Processing** (könnte Backend)
- **Base64 Encoding** (könnte Backend)

## 🎯 **Ziel-Architektur (TO-BE):**

### **Core Responsibilities:**
- **UI/UX Management** - Forms, Navigation, Visual Feedback
- **User Input Handling** - File Upload, Form Validation
- **Local State Management** - UI State, User Preferences
- **Data Preparation** - Simple Transformations, UI-specific Formatting
- **API Communication** - REST Calls to Backend/N8N

### **Validation Layer:**
- **Input Validation** - Format, Size, Required Fields
- **UI Validation** - Real-time Feedback, Error States
- **User Experience** - Loading States, Progress Indicators

### **Data Flow:**
```
User Input → Frontend Validation → Backend API → N8N Processing → Platform APIs
```

### **Should NOT contain:**
- Complex Business Logic (PDF Parsing, OCR)
- Platform-specific API Calls
- Server-side Validation
- Data Persistence Logic

## 🔄 **Migration Needed:**

### **Move to Backend:**
- PDF Text Extraction
- OCR Processing
- File Base64 Encoding
- Advanced Validation

### **Move to N8N:**
- Platform-specific Processing
- Email Template Rendering
- Social Media API Integration
- Workflow Orchestration

### **Keep in Frontend:**
- UI Components
- Basic Input Validation
- User Experience Logic
- Settings Management
