import os
import json
import re
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
        print(f"⚠️ Failed to init OpenAI client in evaluate_candidate: {e}. Falling back to Gemini.")

if not use_openai:
    import google.genai as genai
    gemini_client = genai.Client(api_key=gemini_key)


class FinalScoreEvaluator:

    def __init__(self):
        pass

    # -----------------------------
    # LLM CALL (WITH GEMINI FALLBACK)
    # -----------------------------
    def llm_score(self, prompt: str) -> float:
        if use_openai:
            try:
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",   # fast + cost-effective
                    messages=[
                        {"role": "system", "content": "Return ONLY a numeric score between 0 and 100. No explanation."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0
                )
                output = response.choices[0].message.content.strip()
                return self._parse_score(output)
            except Exception as e:
                print(f"⚠️ OpenAI Error in llm_score: {e}. Falling back to Gemini.")
                return self._llm_score_gemini(prompt)
        else:
            return self._llm_score_gemini(prompt)

    def _llm_score_gemini(self, prompt: str) -> float:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=f"System: Return ONLY a numeric score between 0 and 100. No explanation.\n\nUser Prompt: {prompt}",
                config={"temperature": 0}
            )
            output = response.text.strip()
            if output.startswith("```"):
                output = output.replace("```json", "").replace("```", "").strip()
            return self._parse_score(output)
        except Exception as e:
            print(f"❌ Gemini Error in llm_score fallback: {e}")
            return 50.0

    def _parse_score(self, output: str) -> float:
        # Try JSON parsing first
        try:
            data = json.loads(output)
            return float(data.get("score", 50))
        except:
            pass

        # Fallback: extract number
        match = re.search(r"\d+(\.\d+)?", output)
        return float(match.group()) if match else 50.0



    # -----------------------------
    # TECHNICAL EVALUATION
    # -----------------------------
    def evaluate_technical(self, technical_input: str):
        prompt = f"""
You are an expert technical interviewer evaluating a candidate.

Evaluate TWO dimensions:

1. TECHNICAL KNOWLEDGE (0–100)
2. CONFIDENCE (0–100)

Return ONLY a number between 0 and 100 (average of both).

Transcript:
{technical_input}
"""
        return self.llm_score(prompt)


    # -----------------------------
    # COMMUNICATION
    # -----------------------------
    def evaluate_communication(self, communication_input: str):
        prompt = f"""
Score communication from 0 to 100.

Evaluate ONLY:
- grammar
- clarity
- fluency
- vocabulary

Do NOT evaluate confidence or technical skills.

Transcript:
{communication_input}

Return ONLY a number.
"""
        return self.llm_score(prompt)


    # -----------------------------
    # BEHAVIOR
    # -----------------------------
    def evaluate_behavior(self, behavioral_input: str):
        prompt = f"""
Score behavior from 0 to 100.

Evaluate:
- confidence
- professionalism
- attitude
- engagement

Do NOT evaluate grammar or technical knowledge.

Transcript:
{behavioral_input}

Return ONLY a number.
"""
        return self.llm_score(prompt)


    # -----------------------------
    # JD MATCH
    # -----------------------------
    def evaluate_jd_match(self, jd_input: str):
        prompt = f"""
Evaluate job description match (0–100).

Check:
- skill alignment
- relevance
- missing skills

Transcript:
{jd_input}

Return ONLY a number.
"""
        return self.llm_score(prompt)


    # -----------------------------
    # FINAL SCORE
    # -----------------------------
    def calculate_final_score(self, data: dict):

        jd_input = data.get("jd_input")

        tech = self.evaluate_technical(data["technical_analysis_input"])
        comm = self.evaluate_communication(data["communication_analysis_input"])
        beh = self.evaluate_behavior(data["confidence_analysis_input"])

        if jd_input:
            jd = self.evaluate_jd_match(jd_input)

            final_score = (
                tech * 0.30 +
                comm * 0.25 +
                beh * 0.20 +
                jd * 0.25
            )
        else:
            jd = 0.0

            final_score = (
                tech * 0.40 +
                comm * 0.30 +
                beh * 0.30
            )

        recommendation = self.get_recommendation(final_score)

        return {
            "technical_score": round(tech, 2),
            "communication_score": round(comm, 2),
            "behavior_score": round(beh, 2),
            "jd_match_score": round(jd, 2),
            "final_score": round(final_score, 2),
            "recommendation": recommendation
        }


    # -----------------------------
    # RECOMMENDATION
    # -----------------------------
    def get_recommendation(self, score):
        if score >= 75:
            return "HIRE"
        elif score >= 55:
            return "HOLD"
        else:
            return "REJECT"


# -----------------------------
# USAGE
# -----------------------------
evaluator = FinalScoreEvaluator()