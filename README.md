# RegulAI Sentinel

AI-Powered Compliance Review System for automated document analysis and regulatory compliance checking.

## 🎯 Overview

RegulAI Sentinel is an intelligent compliance review platform that uses IBM Granite AI models to automatically scan documents, detect regulatory violations, assess risks, and generate remediation recommendations. The system supports both text input and PDF document uploads with automatic text extraction.

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **API Server** (`sentinel/api/api_server.py`) - FastAPI REST API endpoints
- **AI Agents** - Specialized agents for different compliance tasks:
  - `agent_doc_ingest.py` - Document ingestion and preprocessing
  - `agent_violation_detector.py` - Detects regulatory violations
  - `agent_risk_scorer.py` - Calculates risk scores for violations
  - `agent_remediation_writer.py` - Generates compliance fixes
  - `agent_pattern_miner.py` - Analyzes historical violation patterns
  - `agent_audit_logger.py` - Logs audit trails
  - `agent_reg_map.py` - Maps regulations to document clauses
- **Granite Client** (`sentinel/core/granite_client.py`) - IBM Granite AI integration
- **Pipeline** (`sentinel/pipeline/pipeline.py`) - Orchestrates the compliance workflow

### Frontend (React/Vite)
- **Modern React UI** with Tailwind CSS
- **Dark Navy Theme** - Professional compliance dashboard
- **PDF Upload & Viewer** - Visual PDF display with silent text extraction
- **Real-time Progress** - Step-by-step processing visualization
- **Interactive Results** - Violations, risk scores, and remediations

## 🚀 Features

### 1. Document Input Methods
- **PDF Upload**: Upload PDF documents with automatic text extraction using PDF.js
- **Text Paste**: Direct text input for quick analysis
- **Silent Processing**: PDF text extraction happens in background without showing raw text

### 2. Compliance Scanning
- Multi-step AI pipeline processing
- Regulatory violation detection
- Risk scoring and prioritization
- Automated remediation suggestions

### 3. Pattern Analysis
- Historical violation tracking
- Trend analysis (increasing/decreasing/stable)
- Top violations identification
- Repeat offender detection
- AI-generated insights

### 4. Results Dashboard
- Violation cards with severity levels (HIGH/MEDIUM/LOW)
- Risk assessment table
- Side-by-side original vs. remediated text
- Audit ID tracking
- Timestamp logging

## 📋 How It Works

### PDF Upload Flow

1. **User uploads PDF**
   - Click "📄 Upload PDF" button
   - Select PDF file from file system

2. **PDF Display**
   - PDF renders in iframe viewer (400px height, full width)
   - Filename displayed at top
   - Dark border with rounded corners matching theme

3. **Silent Text Extraction** (Background)
   - PDF.js library loads the PDF
   - Loops through all pages using `pdfjsLib.getDocument()`
   - Extracts text content from each page
   - Concatenates all text into single string
   - Stores in `documentText` state

4. **Extraction Indicators**
   - Yellow spinner: "Extracting text..." (during processing)
   - Green checkmark: "✓ Text extracted" (when complete)

5. **Scan Document**
   - User clicks "Scan Document" button
   - System uses extracted text from `documentText` state
   - User never sees the raw extracted text
   - Same workflow as text paste method

### Compliance Scanning Pipeline

```
Document Input → Ingestion → Violation Detection → Risk Scoring → Remediation → Results
```

**Step 1: Document Ingestion**
- Preprocesses and structures document text
- Identifies sections and clauses

**Step 2: Regulatory Mapping**
- Maps document clauses to regulatory requirements
- Identifies applicable compliance frameworks

**Step 3: Violation Detection**
- AI analyzes each clause for compliance issues
- Categorizes violations by severity (HIGH/MEDIUM/LOW)
- Provides detailed explanations

**Step 4: Risk Scoring**
- Calculates risk scores for each violation
- Assigns priority levels
- Considers severity, impact, and likelihood

**Step 5: Remediation Generation**
- AI generates compliant rewrites
- Provides original vs. fixed text comparison
- Maintains document context and intent

**Step 6: Audit Logging**
- Records complete audit trail
- Stores results for pattern analysis
- Generates unique audit ID

### Pattern Analysis

- Aggregates data from all historical audits
- Identifies most common violations
- Tracks severity distribution
- Detects repeat offender documents
- Calculates risk trends over time
- Generates AI summary of findings

## 🛠️ Technology Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern async web framework
- **IBM Granite AI** - Large language models for compliance analysis
- **Pydantic** - Data validation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **PDF.js 3.11.174** - PDF rendering and text extraction
- **IBM Design Language** - Color palette and design system

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- IBM Granite API credentials

### Backend Setup

```bash
# Install Python dependencies (using pyproject.toml)
pip install -e .

# Or using poetry (if available)
poetry install

# Configure environment variables
cp .env.example .env
# Edit .env with your IBM Granite API credentials

# Run the API server
python -m sentinel.api.api_server
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with API URL (default: http://localhost:8000)

# Run development server
npm run dev
```

## 🔧 Configuration

### Backend Configuration (`sentinel/config/settings.py`)
- IBM Granite API endpoint
- Model selection
- Temperature and token limits
- Logging levels

### Frontend Configuration (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

## 📡 API Endpoints

### POST `/scan`
Scan a document for compliance violations

**Request:**
```json
{
  "text": "Document text content..."
}
```

**Response:**
```json
{
  "audit_id": "uuid",
  "timestamp": 1234567890,
  "violations": [...],
  "scored_violations": [...],
  "remediations": [...]
}
```

### GET `/patterns`
Analyze historical violation patterns

**Response:**
```json
{
  "total_documents_analyzed": 42,
  "total_violations": 156,
  "severity_breakdown": {...},
  "top_violations": [...],
  "repeat_offenders": [...],
  "trend": "increasing",
  "ai_summary": "...",
  "analyzed_at": 1234567890
}
```

## 🎨 UI Components

### Home Page
- **Scan Document Tab**: PDF upload + text paste
- **Patterns Tab**: Historical analysis

### Loading View
- Step-by-step progress indicators
- Animated transitions

### Results View
- Violations grid with severity badges
- Risk assessment table
- Remediation panels (original vs. fixed)
- Audit metadata

## 🔐 Security Considerations

- PDF files processed client-side (no upload to server)
- Text extraction happens in browser
- API authentication via environment variables
- CORS configured for frontend origin
- Audit trails for compliance tracking

## 📊 Data Flow

```
User → PDF Upload → PDF.js Extraction → documentText State → Scan API → 
AI Pipeline → Violations + Risks + Remediations → Results Display
```

## 🐛 Troubleshooting

### PDF Upload Issues
- Ensure PDF.js scripts are loaded in `index.html`
- Check browser console for errors
- Verify PDF file is valid and not corrupted

### API Connection Issues
- Verify `VITE_API_URL` in frontend `.env`
- Check backend server is running
- Confirm CORS settings allow frontend origin

### Text Extraction Failures
- Large PDFs may take longer to process
- Scanned PDFs (images) won't extract text - OCR required
- Check browser console for PDF.js errors

## 📝 Development

### Adding New Agents
1. Create agent file in `sentinel/agents/`
2. Implement agent logic with Granite client
3. Add to pipeline in `sentinel/pipeline/pipeline.py`
4. Update API endpoints if needed

### Customizing UI
- Modify Tailwind config in `frontend/tailwind.config.js`
- Update components in `frontend/src/components/`
- Adjust theme colors in `frontend/src/index.css`

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

Internal project - contact team lead for contribution guidelines

## 📞 Support

For issues or questions, contact the development team.

---

**Built with IBM Granite AI and modern web technologies**