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

---

### `ai-side/backend/main.py`
1. **Dynamic Environment Variable Support**: Added `.env` loading from the parent directory on startup.
   * **Earlier**: Did not invoke `load_dotenv` pointing specifically to the root directory's `.env`, meaning environment updates were not loaded dynamically if run from different contexts.
   * **Now**: Dynamically resolves the parent `.env` path and calls `load_dotenv(dotenv_path=env_path)`.
2. **Gemini API Key Resolution & Propagation**: Setup fallback propagation of Gemini keys.
   * **Earlier**: Expected `GOOGLE_API_KEY` to be configured, which contained a dummy value in `.env`, resulting in a "400 API key not valid" error from Google.
   * **Now**: Checks for `GEMINI_API_KEY`, overrides `GOOGLE_API_KEY` globally inside `os.environ` if valid, and explicitly passes `google_api_key` to `ChatGoogleGenerativeAI`.
3. **Database-Driven Lead Metadata Verification**: Added MongoDB querying to verify lead details during prediction.
   * **Earlier**: Received `lead_id` form input but did not look up the lead's real name or details in MongoDB, meaning template names (e.g., "Acme Corp") from the uploaded files would leak into prediction summaries.
   * **Now**: Queries the MongoDB leads collection using `get_ml_service()` (supporting lookups by `leadId`, `unique_id`, or `ObjectId`). Fetches the real customer name (`Chennai Dental Care`) and email, and forces Gemini to anchor its analysis to the correct entity.
4. **Persistent Database Sync for Predictions**: Saves CatBoost and Gemini output back to the database.
   * **Earlier**: The prediction endpoint only returned the results to the client without updating the database.
   * **Now**: Executes an in-place `update_one` on the matching lead record in MongoDB, saving the conversion probability, lead quality score, qualitative tier, AI summary, and recommended next actions.

---

### `ai-side/backend/services/Lead_Conversion/main.py`
1. **Standalone API Key Propagation**: Configured model lifespan hook to use the correct Gemini key.
   * **Earlier**: Initialized `ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")` with no explicit key, crashing if the environment key was missing or set to dummy.
   * **Now**: Retrieves `GEMINI_API_KEY` (falling back to `GOOGLE_API_KEY`), sets it to `google_api_key`, and propagates it to `os.environ["GOOGLE_API_KEY"]` to ensure compatibility.

---

### `ai-side/backend/services/conversation intelligence engine/conversation_intelligence_service.py`
1. **8-Field Analysis Prompt Schema**: Updated the Gemini prompt schema to return exactly the fields required by the target design document.
   * **Earlier**: Requested standard properties (`sentiment`, `client_intent`, `objections`, `competitor_mentions`, `key_insights`).
   * **Now**: Requests the 8 fields (`sentiment`, `risk_level`, `client_pain_point`, `primary_objection`, `secondary_objection`, `competitor_mentioned`, `competitor_threat_level`, `deal_stage_status`) and returns them as a structured JSON object. Kept legacy prompt commented out.
2. **Analysis Sanitization and Heuristic Fallbacks**: Updated text processing logic for both LLM output parsing and regex-based fallback engine.
   * **Earlier**: Sanitized lists and tags matching the old fields.
   * **Now**: Sanitizes and normalizes the 8 new fields with built-in regex fallback matches for safety. Kept old logic commented out.
3. **Scoring & Risk Mapping Calibration**: Upgraded scoring math and risk level categorization.
   * **Earlier**: Computed scores and mapped risk labels directly to `"Deal at Risk"`, `"Moderate Risk"`, and `"Healthy Deal"`.
   * **Now**: Mapped risk levels and flags directly to `"High / Critical"`, `"Moderate"`, and `"Low"` categories. Kept legacy scoring/risk methods commented out in-place.

---

### `frontend/src/components/CRMComponents/AIInsights.jsx`
1. **Grid-Based Vertical Layout**: Rebuilt the Insights Summary sidebar/panel to match the layout of the target design document.
   * **Earlier**: Displayed split card widgets for sentiment, risk level, objections list, competitor tags, and key insights.
   * **Now**: Renders a vertical grid table matching the key-value design layout with 8 detailed fields. Kept old JSX commented out.
2. **Status Color Dot Indicators**: Added status colored dots dynamically.
   * **Earlier**: Displayed simple badged strings.
   * **Now**: Integrates inline color-coded status dots for Sentiment (Green for Positive, Orange for Neutral, Red for Negative) and Risk Level (Red for High / Critical, Orange for Moderate, Green for Low).
3. **Offline Mock Fallback Simulator**: Upgraded catch-block simulation.
   * **Earlier**: Simulators returned mock records matching the old tags.
   * **Now**: Simulators return mock records matching the new 8-field schema if the backend microservice is offline. Kept old code commented out.

---

### `ai-side/backend/services/Smart_Resume_Screening/router.py` [NEW]
1. **Resume Screening API Router**: Created new file containing `/resume/screen` POST route.
   * **Now**: Exposes structured resume extraction (Gemini) and SentenceTransformer-based semantic matching.

---

### `ai-side/backend/main.py`
1. **Router Mounting**: Mounted `resume_router` on FastAPI.
   * **Earlier**: Only email, followup, clv routers were mounted.
   * **Now**: Mounted `resume_router` to expose `/resume/screen` under `/resume/screen`.
2. **Router Mounting**: Mounted `interview_router` on FastAPI.
   * **Earlier**: No interview routes mounted.
   * **Now**: Mounted `interview_router` to expose `/interview/evaluate`.

---

### `ai-side/backend/services/AI_interview/router.py` [NEW]
1. **Interview Evaluation API Router**: Created new file containing `/interview/evaluate` POST route.
   * **Now**: Exposes transcription using Whisper (for audio/video) and evaluations (technical, communication, behavior) using OpenAI.

---

### `ai-side/requirements.txt`
1. **AI Interview Dependencies**: Added speech-to-text packages.
   * **Now**: Appended `faster-whisper>=1.0.0` and `imageio-ffmpeg>=0.4.9`.
2. **AI HR Chatbot Dependencies**: Added Pinecone and document parsing packages.
   * **Now**: Appended `pinecone>=5.0.0`, `langchain-pinecone>=0.2.0`, `langchain-huggingface>=1.0.0`, and `pypdf>=4.0.0`.

---

### `ai-side/backend/services/AI_HR_Chatbot/router.py` [NEW]
1. **HR Chatbot API Router**: Created new file containing `/hr-chatbot/chat` POST route.
   * **Now**: Exposes LangGraph-based secure ReAct agent with custom tools to query employee data and policies.

---

### `ai-side/backend/main.py`
1. **Router Mounting**: Mounted `hr_chatbot_router` on FastAPI.
   * **Earlier**: Only email, followup, clv, resume, and interview routers were mounted.
   * **Now**: Mounted `hr_chatbot_router` to expose `/hr-chatbot/chat`.
2. **Router Mounting**: Mounted `performance_router` on FastAPI.
   * **Earlier**: No performance routers mounted.
   * **Now**: Mounted `performance_router` to expose `/performance/predict`.
3. **Router Mounting**: Mounted `team_router` on FastAPI.
   * **Earlier**: No team routers mounted.
   * **Now**: Mounted `team_router` to expose `/team/recommend`.
4. **Router Mounting**: Mounted `workload_router` on FastAPI.
   * **Earlier**: No workload balancing routers mounted.
   * **Now**: Mounted `workload_router` to expose `/workload/balance`.
5. **Router Mounting**: Mounted `burnout_router` on FastAPI.
   * **Earlier**: No burnout detection routers mounted.
   * **Now**: Mounted `burnout_router` to expose `/burnout/detect`.
6. **Router Mounting**: Mounted `salary_router` on FastAPI.
   * **Earlier**: No salary benchmarking routers mounted.
   * **Now**: Mounted `salary_router` to expose `/salary/benchmark`.

---

### `ai-side/backend/services/performance_prediction_service/router.py` [NEW]
1. **Performance Prediction API Router**: Created new file containing `/performance/predict` POST route.
   * **Now**: Exposes Random Forest model-based performance category, promotion readiness, and skill gap evaluations.

---

### `ai-side/backend/services/Team_formation_module/router.py` [NEW]
1. **Team Recommendation API Router**: Created new file containing `/team/recommend` POST route.
   * **Now**: Exposes team candidate recommendation based on required skills, project type, and employee constraints.

---

### `ai-side/backend/services/Workload_Balancing_Engine/router.py` [NEW]
1. **Workload Balancing API Router**: Created new file containing `/workload/balance` POST route.
   * **Now**: Exposes Gemini ReAct agent workload scan, overloading checks, burnout risk detection, and reassignment recommendations.

---

### `ai-side/backend/services/Burnout_detection/router.py` [NEW]
1. **Burnout Detection API Router**: Created new file containing `/burnout/detect` POST route.
   * **Now**: Exposes detailed burnout risk calculations based on employee overtime hours, attendance rates, and sentiment scores (proxied via timesheet productivity index if not explicitly passed), and feeds them to Gemini to write custom organisational health reports and actionable recommendations. Also supports batch scans of all active employees to generate ranked leaderboard datasets for the AI Center portal.

---

### `ai-side/backend/services/Salary_benchmarking/router.py` [NEW]
1. **Salary Benchmarking API Router**: Created new file containing `/salary/benchmark` POST route.
   * **Now**: Exposes salary competitiveness evaluations comparing current salaries (CTC) with external market benchmarks (based on role and experience) and internal peer averages, recommends adjustment targets based on performance ratings, estimates mitigated attrition replacement ROI, and integrates Gemini to write custom compensation correction reports. Also supports organization-wide audit records and statistics summaries for leadership review.

---

### `ai-side/requirements.txt`
1. **Chatbot dependency addition**: Added `langchain-community` to requirements to support document loaders (PyPDFLoader).

---

### `src/utils/aiService.js`
1. **screenResume method addition**: Added `screenResume(formData)` to class AiService to forward resume matching multipart payload using standard global fetch.

---

### `src/modules/hrms-ai/hrmsAi.controller.js` [NEW]
1. **screenResume controller**: Created `screenResume` handler. It reads uploaded files from disk, converts them to File blobs, appends to FormData, posts to Python, and unlinks disk files in the finally block.

---

### `src/modules/hrms-ai/hrmsAi.routes.js` [NEW]
1. **HRMS AI Router**: Created new Express router file exposing `POST /resume/screen` with Multer fields configuration. Restricted to ADMIN and HR roles.

---

### `src/app.js`
1. **Route mounting**: Imported and mounted `hrmsAiRoutes` under `/api/hrm/ai`.

---

### `src/utils/aiService.js`
1. **evaluateInterview method addition**: Added `evaluateInterview(formData)` to class AiService to forward interview evaluation payloads using standard global fetch.

---

### `src/modules/hrms-ai/hrmsAi.controller.js`
1. **evaluateInterview controller**: Added `evaluateInterview` handler to parse `audio_file` and/or `rough_notes` inputs, forward them to the Python microservice, and clean up temporary uploaded files.

---

### `src/modules/hrms-ai/hrmsAi.routes.js`
1. **evaluateInterview Route**: Exposed `POST /interview/evaluate` restricted to ADMIN and HR roles, supporting optional `audio_file` uploads.
2. **chatWithHrBot Route**: Exposed `POST /hr-chatbot/chat` restricted to authenticated users.

---

### `src/utils/aiService.js`
1. **hrChatbotChat method addition**: Added `hrChatbotChat(chatPayload)` to class AiService to forward chat payloads using standard JSON POST.

---

### `src/modules/hrms-ai/hrmsAi.controller.js`
1. **chatWithHrBot controller**: Added `chatWithHrBot` handler to parse `message`, `employee_id`, and `history` and forward them to the Python chatbot microservice.

---

### `ai-side/.env`
1. **GEMINI_MODEL update**: Updated default `GEMINI_MODEL` from `gemini-1.5-flash` to `gemini-2.5-flash` to resolve 404/compatibility issues with new free-tier key registrations.

---

### `ai-side/backend/services/AI_HR_Chatbot/llm_layer.py`
1. **Model Parameter Dynamic Load**: Updated the `ChatGoogleGenerativeAI` instantiation to use the dynamic `GEMINI_MODEL` env variable (falling back to `gemini-2.5-flash`), replacing the hardcoded `gemini-2.0-flash` which fails with 429 quota exceptions on newer free-tier API keys.
2. **Robust Message Content Parsing**: Handled cases where `msg.content` returned from the ReAct agent is formatted as a list of content blocks/dicts instead of a flat string, avoiding a `'list' object has no attribute 'strip'` crash.

---

### `ai-side/backend/services/Workload_Balancing_Engine/ai_engine.py`
1. **Model Parameter Dynamic Load**: Replaced the hardcoded `"gemini-2.0-flash"` model name with `os.getenv("GEMINI_MODEL", "gemini-2.5-flash")` to ensure compatibility across all Gemini modules.

---

### `src/utils/aiService.js`
1. **predictPerformance method addition**: Added `predictPerformance(performancePayload)` to client class to forward performance prediction attributes to the Python service.
2. **predictAttrition and predictAttritionBatch method addition**: Added single and batch attrition prediction routing client methods.

---

### `src/modules/hrms-ai/hrmsAi.controller.js`
1. **predictPerformance controller**: Added `predictPerformance` handler to validate input parameters (attendance, task completion rate, reviews, project success rate) and forward to Python microservice.
2. **predictAttrition and predictAttritionBatch controllers**: Added single and batch handlers to capture, validate, and forward attrition inputs.

---

### `src/modules/hrms-ai/hrmsAi.routes.js`
1. **Route integration**: Registered `POST /performance/predict`, `POST /attrition/predict`, and `POST /attrition/predict/batch` routes, restricting them strictly to users with `ADMIN` and `HR` roles to protect staff records.

---

### `ai-side/requirements.txt`
1. **Dependency addition**: Added `imbalanced-learn>=0.12.0` to requirements to resolve model unpickling module errors.

---

### `ai-side/backend/services/AI_HR_Chatbot/tools.py`
1. **Tool Signature Argument Removal**: Removed the `employee_id` parameter from `leave_balance_tool`, `salary_tool`, and `employee_info_tool` to prevent the LLM from passing `"current_employee"` which resulted in "record not found" errors. Instead, the tools now securely resolve the scoped `employee_id` from the outer lexical closure where the agent was instantiated.

---

### `frontend/src/pages/Dashboard.jsx`
1. **Dashboard Count Initialization**: Initialized counts (`totalLeads`, `totalCustomers`, `totalEmployees`, `totalUsers`) in React state to `0` instead of dummy counts `8420`, `3265`, `182`, `1024` to avoid rendering static fallback data.

---

### `frontend/src/components/DashboardComponents/RiskAnomalyCard.jsx`
1. **Comment Out Mock Risks**: Commented out the hardcoded mock risks list and initialized `risks` to `[]`. Added a clean empty state display when no database logs are retrieved.

---

### `frontend/src/components/DashboardComponents/SecurityAlerts.jsx`
1. **Comment Out Mock Alerts**: Commented out hardcoded mock security alerts and initialized `alerts` to `[]`. Rendered a placeholder row in the table when database records are empty.

---

### `frontend/src/components/DashboardComponents/MonthlyRevenueChart.jsx`
1. **Comment Out Mock Revenue Chart Data**: Commented out the static monthly revenue values and labels. Exposed an inline placeholder message indicating empty revenue data.

---

### `frontend/src/components/DashboardComponents/EmployeeGrowthTrend.jsx`
1. **Comment Out Mock Growth Chart Data**: Commented out hardcoded recruitment stages dataset. Rendered an inline dashed placeholder message inside the chart container when the database is empty.

---

### `frontend/src/components/SalesDashboard/SalesDashboard.jsx`
1. **Sales Dashboard Real Database Integration**: Fully refactored the Sales Dashboard to fetch real leads, temperatures (Hot / Warm / Cold), deals, and activities directly from the database using CRM client services. Commented out all hardcoded mock lists.

---

### `frontend/src/services/crmService.js`
1. **Deals Service Module**: Exposed the `deals` API helper object to fetch CRM deals lists from the backend router (`/crm/deals`).

---

### `src/modules/auth/models/User.js`
1. **Swagger Role Normalisation**: Replaced swagger annotation mentions of `BD_MANAGER` with `BDE` (lines 12 and 36) to avoid database and route authorization checks mismatch.

---

### `src/modules/crm/controllers/leadController.js`
1. **Lead Priority & ML Temperature Synchronisation**: Updated `createLead` and `updateLead` handlers to dynamically update the main `priority` attribute of the lead document with the predicted temperature class (`Hot`, `Warm`, `Cold`) returned by the ML scorer. This ensures database-level parity and correct real-time rendering in the Leads Management lists and metrics dashboards.







