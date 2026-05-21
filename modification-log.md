# AI Integration Modification Log

---

### `ai-side/backend/main.py`
1. **Line 382**: Updated Conversation Intelligence service path.
   * **Earlier**: `service_path = service_dir / "conversation intelligence engine" / ...`
   * **Now**: `service_path = service_dir / "services" / "conversation intelligence engine" / ...`
2. **Lines 885-900**: Switch `/ai-insights/generate` payload from Multipart Form to JSON.
   * **Earlier**: Endpoint accepted `Form(...)` parameters and `UploadFile(...)`.
   * **Now**: Endpoint accepts `payload: Dict[str, Any]` JSON body to match Express call format.

---

### `ai-side/backend/services/email_generator.py`
1. **Line 153 & 305**: Upgraded Groq model from legacy `llama3` to `llama-3.1-8b-instant`.
   * **Earlier**: Model was configured as `"llama3-8b-8192"`.
   * **Now**: Model was configured as `"llama-3.1-8b-instant"`.
2. **Line 312**: Added API response error logging for Groq call failures.
   * **Earlier**: Raised standard HTTP exception directly without backend logs.
   * **Now**: Logs error message `[EmailGen] Groq API error ...` before raising HTTP exception.

---

### `ai-side/backend/services/lead_scoring_service/model_loader.py`
1. **Line 12**: Corrected space-to-underscore folder naming in `CANONICAL_ARTIFACT_DIR`.
   * **Earlier**: `/ml_model/models/lead scoring engine`
   * **Now**: `/ml_model/models/lead_scoring_engine`

---

### `ai-side/backend/services/ml_prediction_service.py`
1. **Line 25**: Added class attribute `label_encoder`.
   * **Earlier**: Only `self.model_metadata = None` was initialized.
   * **Now**: Initialized `self.label_encoder = None`.
2. **Lines 77-88**: Updated model artifact paths to `lead_scoring_engine` and loaded `label_encoder.pkl`.
   * **Earlier**: Loaded model from generic `models` folder without loading a label encoder.
   * **Now**: Loads model, metadata, and label encoder from `/models/lead_scoring_engine/`.
3. **Lines 134-192**: Replaced old lead features with new 22 numeric CRM-engagement feature mappings.
   * **Earlier**: Mappings suited for legacy course-education schema (e.g., `Specialization`, `Lead Origin`).
   * **Now**: Numeric mappings suited for the 22 CRM metrics (e.g., `email_open_rate`, `budget_log`, `intent_score`).
4. **Lines 355+**: Added `prepare_features` function.
   * **Earlier**: Function did not exist.
   * **Now**: Added `prepare_features` to compute derived attributes and cast inputs to correct numeric types.
5. **Lines 413-433**: Integrated `prepare_features` and label decoding into `predict_lead_temperature`.
   * **Earlier**: Used DataFrame predictions directly with raw model output classes.
   * **Now**: Prepares features with `prepare_features` and decodes prediction index to `"Hot"/"Warm"/"Cold"` using `label_encoder`.

---

### `ai-side/backend/services/smart lead summary/ai_insights_service.py`
1. **Lines 12-14**: Added imports for dotenv file loading and path configuration.
   * **Earlier**: Generic `load_dotenv()` import only.
   * **Now**: Added `Path`, `dotenv_values`, and helper LLM configuration routines.
2. **Lines 212-218**: Added Groq and Gemini generation methods.
   * **Earlier**: Methods did not exist.
   * **Now**: Added `_generate_with_groq` and `_generate_with_gemini` functions.
3. **Lines 270-272**: Implemented LLM fallback sequence.
   * **Earlier**: Called only `_generate_with_llm`.
   * **Now**: Sequential try-except blocks: OpenAI -> Groq -> Gemini.

---

### `ai-side/requirements.txt`
1. **Lines 43-48**: Added prediction engine packages.
   * **Earlier**: Empty lines at EOF.
   * **Now**: Appended `xgboost`, `scikit-learn`, `joblib`, `numpy`.

---

### `src/modules/crm/controllers/leadController.js` (Caller Integration)
1. **Lines 120-125**: Switched AI insights caller to pass JSON payload.
   * **Earlier**: Passed `leadData` as an object to `aiService.generateInsights`.
   * **Now**: Passes `source_type: "meeting_notes"` and stringified `conversation_text` in a JSON request.

---

### `frontend/src/components/CRMComponents/CRMSubPage/AddLead.jsx`
1. **Status Dropdown**: Synced options with backend schema.
   * **Earlier**: Missing "Proposal Sent" and "Won".
   * **Now**: Fully matches `Lead.js` enum requirements.

---

### `frontend/src/components/CRMComponents/ClientLTV.jsx`
1. **Industry Dropdown**: Synced options with Python ML service.
   * **Earlier**: Missing "technology" category.
   * **Now**: Added "technology" option to match model weighting.

---

### `frontend/src/components/CRMComponents/SalesActivities.jsx`
1. **Activity Type Dropdown & IP Address**: Synced UI constraints.
   * **Earlier**: Included invalid options ("WhatsApp", "Other"), missing "Follow-up", and allowed manual IP entry.
   * **Now**: Enum locked to "Call, Meeting, Email, Follow-up" and IP input set to readOnly (backend handled).

---

### `frontend/src/components/CRMComponents/CustomerManagement.jsx`
1. **AssignedTo Field**: Added missing user interface control.
   * **Earlier**: Initialized as null with no form inputs.
   * **Now**: Added text input for Employee ID in both Create and Edit modals.

---

### `frontend/src/components/Users.jsx`
1. **User Form Inputs**: Synced with backend `user.model.js` schema.
   * **Earlier**: Missing required `phone`, `department`, and `reportingTo` fields.
   * **Now**: Fields added to `newUser` state block, state resets, and physical modal UI.

---

### `frontend/src/services/dashboardService.js`
1. **API Endpoints**: Connected to backend Manager routes.
   * **Earlier**: Only contained generic `getDashboard`.
   * **Now**: Added `getManagerDashboard`, `getManagerGraph`, `getProductivity`, and `getRiskAnalysis`.

---

### `frontend/src/components/ManagerDashboard/ManagerDashboard.jsx`
1. **Data Binding**: Ripped out static/fake data and hooked into live API.
   * **Earlier**: Displayed hardcoded Recharts data and static KPI numbers.
   * **Now**: Executes `Promise.all` via `dashboardService` on mount, parsing and injecting live attendance, productivity, and risk data into Recharts and cards.

---

### `.gitignore`
1. **ML Tracking**: Ignored local ML training files.
   * **Earlier**: Pkl files tracked.
   * **Now**: Appended `ml_model/` to block auto-generated pipeline files.
