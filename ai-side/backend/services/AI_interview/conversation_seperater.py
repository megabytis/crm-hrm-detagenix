import os
import re
import json
from dotenv import load_dotenv

load_dotenv()

openai_key = os.getenv("OPENAI_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

use_openai = False
openai_client = None
gemini_client = None

if openai_key and "dummy" not in openai_key.lower() and openai_key.strip():
    from openai import OpenAI
    try:
        openai_client = OpenAI(api_key=openai_key)
        use_openai = True
    except Exception as e:
        print(f"⚠️ Failed to init OpenAI client: {e}. Falling back to Gemini.")

if not use_openai:
    import google.genai as genai
    gemini_client = genai.Client(api_key=gemini_key)

# -----------------------------
# JSON CLEANER
# -----------------------------
def extract_json(text: str):
    try:
        match = re.search(r"\[.*\]", text, re.DOTALL)

        if not match:
            print("❌ No JSON found")
            return []

        raw_json = match.group()
        raw_json = raw_json.replace("\n", " ")

        # Fix broken quotes inside words
        raw_json = re.sub(r'(\w)"(\w)', r"\1'\2", raw_json)

        # Fix unquoted keys
        raw_json = re.sub(
            r'([{,]\s*)(\w+)(\s*:)',
            r'\1"\2"\3',
            raw_json
        )

        return json.loads(raw_json)

    except Exception as e:
        print(f"❌ JSON PARSE ERROR: {e}")
        return []


# -----------------------------
# MAIN FUNCTION (WITH GEMINI FALLBACK)
# -----------------------------
def convert_to_json(transcript: str):
    prompt = f"""
You are a strict data structuring system.

Convert this interview into a Python-style JSON list.

RULES:
- Output ONLY valid JSON
- No markdown
- No explanation
- No extra text

FORMAT MUST BE EXACT:
[
  {{"speaker": "Interviewer", "text": "..."}},
  {{"speaker": "candidate", "text": "..."}},
  {{"speaker": "Interviewer", "text": "..."}}
]

CONVERSATION:
{transcript}
"""
    if use_openai:
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",   # fast + cheap + good for structured output
                messages=[
                    {"role": "system", "content": "You strictly output valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0
            )
            raw = response.choices[0].message.content
            parsed = extract_json(raw)
            if parsed:
                return parsed
        except Exception as e:
            print(f"⚠️ OpenAI Error in convert_to_json: {e}. Falling back to Gemini.")
            return _convert_to_json_gemini(prompt)
    else:
        return _convert_to_json_gemini(prompt)

    return []

def _convert_to_json_gemini(prompt: str):
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config={"temperature": 0}
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.replace("```json", "").replace("```", "").strip()
        return extract_json(raw)
    except Exception as e:
        print(f"❌ Gemini Error in convert_to_json fallback: {e}")
        return []