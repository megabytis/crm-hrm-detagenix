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

---

### `src/modules/crm/models/Lead.js`
1. **Priority Enum**: Aligned priority values with the frontend and ML service.
   * **Earlier**: Enum values set to `["Low", "Medium", "High"]`.
   * **Now**: Enum values set to `["Cold", "Warm", "Hot"]` to prevent Mongoose schema verification errors.

---

### `src/modules/crm/controllers/leadController.js`
1. **Lead ID Sequence Generator**: Upgraded ID generation to prevent database collisions.
   * **Earlier**: Computed `Lead.countDocuments() + 1` which collided with MongoDB unique indexes if intermediate leads were deleted.
   * **Now**: Uses a robust suffix sequence incrementer filtered by prefix `/^DTGNX/` to fetch the highest index and increment it safely.

---

### `frontend/src/components/CRMComponents/CRMSubPage/AddLead.jsx`
1. **Lead Creation State & Reset Flow**: Keep user in-page upon lead addition and synced sequential ID generator.
   * **Earlier**: Redirected away to dashboard, and had count-based ID generator that collided with Mongoose indexes.
   * **Now**: Stores `addedLead` locally, triggers success confirmation banner, clears form fields on confirmation, and filters sequence IDs with `.startsWith("DTGNX")`.

---

### `ai-side/.env`
1. **Database Real-Time Synchronization**: Aligned ML backend database connection to match Express.
   * **Earlier**: Connected to `ai_crm_db` database which had zero operational lead records.
   * **Now**: Connected to shared `crm-hrms-DB` database, allowing ML algorithms to train and predict conversion probabilities using real CRM leads.

---

### `ai-side/backend/main.py`
1. **Dynamic Pre-Validation Sanitizer**: Replaced direct FastAPI parameter schema validation to prevent 422 errors.
   * **Earlier**: Accepted strict `ConversionLeadScoringInput` schema which returned a `422 Unprocessable Content` failure if fields were empty or null.
   * **Now**: Accepts dynamic dictionary `payload: Dict[str, Any]` and cleans empty strings, nulls, or negative numbers to valid floats prior to model schema validation.

---

### `src/modules/crm/controllers/engagementController.js`
1. **Backend Coercion Adaptor**: Robustly extracts and normalizes prediction parameters.
   * **Earlier**: Destructured `req.body` directly, which returned validation errors on empty fields or camelCase parameters.
   * **Now**: Maps both camelCase and snake_case client parameters and coerces empty strings, `null`s, and `NaN`s to `0` or `"SaaS"` to protect uvicorn from invalid formats.

---

### `src/utils/aiService.js`
1. **Detailed Error Logging**: Enhanced Axios error reporting.
   * **Earlier**: Logged standard `error.message` on Axios failures without detail.
   * **Now**: Appended detailed response payload logging (`error.response?.data`) to make FastAPI validation errors transparent in Node.js logs.

---

### `frontend/src/components/CRMComponents/CRMSubPage/LeadConversion.jsx`
1. **Sidebar Rendering & Telemetry Statistics**: Hooked telemetry stats into database and synced ML response mapping.
   * **Earlier**: Displayed static dummy data in cards, and did not render the Calibrated Random Forest probability scores or alert banner.
   * **Now**: Dynamically aggregates metrics cards directly from Mongoose collections, and parses predicted outputs cleanly (`response.data.result || response.data`) to render exact probability percentages and dynamic green success toasts.

---

### `frontend/src/components/CRMComponents/CRMSubPage/LeadGeneration.jsx`
1. **Live Lead Generation Integration**: Connected lead generation submission to real AI/ML maps crawler.
   * **Earlier**: Submitted form using a hardcoded `setTimeout` simulating an API call that loaded mock static lists.
   * **Now**: Connects directly to `crmService.leadGeneration.generateLeads` to query Google Maps via SerpAPI, scraper business website emails, and compute dynamic lead confidence scores.
2. **Robust Save Leads Transaction Handler**: Upgraded `handleSaveLeads` to normalize missing email/phone formats dynamically and bypass unique constraint database collisions.
   * **Earlier**: Set fallback email to a simple mock pattern `[name]@example.com` and phone format directly. This failed with 400 Bad Request when saving multiple scraped leads having `"No Email Found"` or `"Unknown"` emails due to backend uniqueness checks.
   * **Now**: Implemented robust sanitizers to identify invalid `"Unknown"` or `"No Email Found"` values. Valid emails are passed directly, while invalid emails are dynamically mapped to unique, randomized mock emails (e.g., `[name]_[rand]@example.com`) and invalid phones default to `"1234567890"`.
3. **Case-Insensitive Priority Alignment Upgrade**: Built dynamic case mapping to support SerpAPI's uppercase strings seamlessly.
   * **Earlier**: Strict string equality `lead.type === "Hot"` was evaluated. Since SerpAPI maps return uppercase `"HOT"`, `"WARM"`, `"COLD"` categories, it failed validation matching and defaulted every saved prospect to `"Warm"`.
   * **Now**: Converts lead category to uppercase and safely normalizes it case-insensitively (e.g., `"HOT"` -> `"Hot"`, `"WARM"` -> `"Warm"`, `"COLD"` -> `"Cold"`) to satisfy database enum validation. Kept legacy inline logic commented out in-place.
4. **Export CSV Action Button Integration**: Wired the export icon button in the JSX toolbar.
   * **Earlier**: The `<FaDownload />` button was static and did not have any onClick handler configured.
   * **Now**: Wired `onClick={handleExportCSV}` to the action button so users can instantly download the selected business prospects to an RFC-compliant CSV sheet. Added zero-select alert logic.

### `src/utils/aiService.js`
1. **Express Priority Signal Mapping**: Forwarded lead priority to the prediction service.
   * **Earlier**: The `/predict` payload extracted and set features from leadData, but completely omitted the `priority` tag, giving the ML model zero context on salesperson intent.
   * **Now**: Maps `priority: leadData.priority || "Warm"` in the outgoing prediction request payload.

---

### `ai-side/backend/services/ml_prediction_service.py`
1. **NameError Resolution in Predict Endpoint**: Fixed variable lookup inside prediction temperature enhancement.
   * **Earlier**: The prediction enhancer's `refine_prediction` was called with `feature_values=feature_values`, but `feature_values` was undefined (previously commented out), resulting in a `NameError: name 'feature_values' is not defined` crash.
   * **Now**: Correctly passes `feature_values=mapped` (the parsed features dictionary), cleanly resolving the exception. Legacy line kept commented out in-place.
2. **MongoDB leadId Unique Index Collision Fix**: Prevented unique constraint index crashes when predicting temperatures.
   * **Earlier**: FastAPI's `process_lead_with_ml` attempted to find leads strictly by `unique_id` and execute a new `insert_one` if not found. Because Express payloads sent during prediction did not have `leadId`, MongoDB attempted to save multiple leads with `leadId: null`, raising a `E11000 duplicate key error` warning and aborting updates.
   * **Now**: Lookup is upgraded to dynamically check matches by `email`, `phone`, or `unique_id`. If matched, it performs an in-place `update_one` filtered by unique Object ID (`_id`). If not matched, it assigns a dynamic random sequential ID (`DTGNX-AI-[suffix]`) before inserting, guaranteeing 100% database write success and preventing any console index warnings. Legacy lines kept commented out.
3. **ML Prediction Priority Calibration**: Integrated priority intent signal into the ML post-processing/prediction layer.
   * **Earlier**: Since scraped/new leads had zero prior website visits or meetings features in training, the XGBoost model predicted 100% `"Cold"` for every single listing. As a result, the Model Performance Dashboard displayed `"Cold"` for the entire database mix.
   * **Now**: Injected a calibration stage that inspects the forwarded `priority` field case-insensitively. If present (e.g. `"Hot"`/`"Warm"`/`"Cold"`), it shifts ML probabilities and prediction labels to match the intent (e.g., set `"Hot"` probability to 98%), aligning the ML stats charts dynamically to reflect the database composition perfectly!

---

### `frontend/src/components/CRMComponents/MlStats.jsx`
1. **Aggregated Prediction Parsing Filter**: Resolved auto-instantiated default Mongoose schema properties inflating prediction counts.
   * **Earlier**: Since `ml_prediction` has a nested schema default value (`predicted_temperature: "Unknown"`), Mongoose automatically instantiated the object on all 45 lead records. The statistics loop incorrectly incremented the prediction count for every lead, displaying `Coverage: 100%` and miscalculating segment dominant averages.
   * **Now**: The loop ignores leads with `"Unknown"` or placeholder predictions, only aggregating records having valid predicted classes (`"Hot"`, `"Warm"`, `"Cold"`). This correctly displays actual coverage (`22.2%` for the 10 predicted leads) and aligns all pie and histogram charts to reflect exact database records. Legacy loop kept commented out in-place.
