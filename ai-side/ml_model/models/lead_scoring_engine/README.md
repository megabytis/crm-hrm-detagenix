# Lead Temperature Scoring Model

Predicts CRM lead temperature: **HOT**, **WARM**, or **COLD**
Model: XGBoost + Isotonic Calibration | Accuracy: 91.5%

---

## Files

| File | Purpose |
|---|---|
| `lead_temperature_model.pkl` | Trained model — load for predictions |
| `label_encoder.pkl` | Decodes numeric output → HOT / WARM / COLD |
| `feature_columns.pkl` | Exact feature names and order |

---

## Quick Start

```python
import joblib, numpy as np

model   = joblib.load("lead_temperature_model.pkl")
encoder = joblib.load("label_encoder.pkl")
features= joblib.load("feature_columns.pkl")

# --- Step 1: compute derived features ---
last_contact_days = 5
budget            = 50000

recency_weight      = np.exp(-0.693 * last_contact_days / 14)
engagement_velocity = (meeting_count + interaction_count) / max(last_contact_days, 1)
intent_score        = demo_requested*0.4 + pricing_page_visits*0.01 + proposal_requested*0.5
response_quality    = response_speed * recency_weight
email_weighted      = email_open_rate * recency_weight
budget_log          = np.log1p(budget)

# --- Step 2: build input dict ---
lead = {
    "email_open_rate":        0.80,
    "meeting_count":          4,
    "website_visits":         15,
    "response_speed":         0.85,
    "followup_response_rate": 0.75,
    "call_duration":          30.0,
    "proposal_requested":     1,
    "demo_requested":         1,
    "pricing_page_visits":    8,
    "form_submissions":       2,
    "linkedin_interaction":   3,
    "last_contact_days":      last_contact_days,
    "interaction_count":      12,
    "budget_log":             budget_log,
    "recency_weight":         recency_weight,
    "engagement_velocity":    engagement_velocity,
    "intent_score":           intent_score,
    "response_quality":       response_quality,
    "email_weighted":         email_weighted,
    "budget":                 budget,
    "revenue":                500000.0,
    "company_size":           120,
}

# --- Step 3: predict ---
X     = [[lead[f] for f in features]]
label = encoder.inverse_transform(model.predict(X))[0]
probs = dict(zip(encoder.classes_, model.predict_proba(X)[0]))

print("Temperature:", label)
print("Probabilities:", probs)
```

---

## Input Features (22 total)

### Raw features — pass directly

| Feature | Type | Range | Description |
|---|---|---|---|
| `email_open_rate` | float | 0.0 – 1.0 | Ratio of emails opened |
| `meeting_count` | int | 0 – 15 | Total meetings held |
| `website_visits` | int | 0 – 80 | Website visit count |
| `response_speed` | float | 0.0 – 1.0 | How quickly lead replies (1 = instant) |
| `followup_response_rate` | float | 0.0 – 1.0 | % of follow-ups responded to |
| `call_duration` | float | 0 – 90 | Average call duration in minutes |
| `proposal_requested` | int | 0 or 1 | Lead asked for a proposal |
| `demo_requested` | int | 0 or 1 | Lead asked for a demo |
| `pricing_page_visits` | int | 0 – 40 | Pricing page view count |
| `form_submissions` | int | 0 – 12 | Number of forms submitted |
| `linkedin_interaction` | int | 0 – 10 | LinkedIn engagement count |
| `last_contact_days` | int | 0 – 120 | Days since last contact |
| `interaction_count` | int | 0 – 60 | Total CRM interactions |
| `budget` | float | raw value | Lead's budget in currency units |
| `revenue` | float | raw value | Company annual revenue |
| `company_size` | int | 1 – 5000 | Number of employees |

### Derived features — compute before passing in

| Feature | Formula |
|---|---|
| `budget_log` | `np.log1p(budget)` |
| `recency_weight` | `np.exp(-0.693 * last_contact_days / 14)` |
| `engagement_velocity` | `(meeting_count + interaction_count) / max(last_contact_days, 1)` |
| `intent_score` | `demo_requested*0.4 + pricing_page_visits*0.01 + proposal_requested*0.5` |
| `response_quality` | `response_speed * recency_weight` |
| `email_weighted` | `email_open_rate * recency_weight` |

---

## Output

```python
label = "HOT"    # or "WARM" or "COLD"

probs = {
    "HOT":  0.91,
    "WARM": 0.07,
    "COLD": 0.02
}
```

| Label | Meaning |
|---|---|
| `HOT` | High intent — prioritise immediately |
| `WARM` | Moderate signals — nurture and follow up |
| `COLD` | Low engagement — deprioritise or re-qualify |

---

## Requirements

```
xgboost
scikit-learn
joblib
numpy
```
