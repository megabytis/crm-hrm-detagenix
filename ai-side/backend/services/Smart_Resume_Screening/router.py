import sys
from pathlib import Path
import io
import hashlib
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

# Ensure internal modules (schemas, matcher, etc.) are importable from this subdirectory
services_dir = Path(__file__).resolve().parent
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

from text_extractor import extract_text_from_pdf
from jd_parser import parse_jd
from resume_parser import parse_resume
from matcher import match_resume_to_jd, get_cached_jd

router = APIRouter(prefix="/resume", tags=["Resume Screening"])

@router.post("/screen", summary="Screen and match a resume PDF against a Job Description")
async def screen_resume(
    resume: UploadFile = File(..., description="Candidate resume PDF file"),
    jd_text: Optional[str] = Form(None, description="Raw Job Description text"),
    jd_file: Optional[UploadFile] = File(None, description="Job Description PDF file")
):
    """
    Exposes the Resume Screening & Smart Hiring pipeline.
    
    Takes candidate resume PDF and matching JD (either as raw text or PDF file),
    extracts details, parses skills/experience using Gemini, scores semantic similarities
    using SentenceTransformers, and returns a detailed matching scorecard.
    """
    # 1. Validation
    if not jd_text and not jd_file:
        raise HTTPException(
            status_code=400,
            detail="You must provide either jd_text or a jd_file."
        )

    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Resume must be a PDF file."
        )

    # 2. Extract resume text
    try:
        resume_content = await resume.read()
        resume_file_like = io.BytesIO(resume_content)
        resume_text = extract_text_from_pdf(resume_file_like)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse resume PDF: {str(e)}"
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Extracted resume text is empty. Verify that the PDF contains readable text."
        )

    # 3. Extract Job Description text
    extracted_jd_text = ""
    if jd_file:
        if not jd_file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Job description file must be a PDF."
            )
        try:
            jd_content = await jd_file.read()
            jd_file_like = io.BytesIO(jd_content)
            extracted_jd_text = extract_text_from_pdf(jd_file_like)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse Job Description PDF: {str(e)}"
            )
    else:
        extracted_jd_text = jd_text

    if not extracted_jd_text or not extracted_jd_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Job Description text is empty."
        )

    # 4. Process pipeline
    try:
        parsed_jd = parse_jd(extracted_jd_text)
        parsed_resume = parse_resume(resume_text)

        jd_id = hashlib.md5(extracted_jd_text.encode()).hexdigest()
        jd_cached = get_cached_jd(jd_id, parsed_jd)

        match_result = match_resume_to_jd(parsed_resume, jd_cached)
        match_result["resume"] = resume.filename
        match_result["status"] = "ok"

        return {
            "success": True,
            "match_results": match_result,
            "parsed_resume": parsed_resume,
            "parsed_jd": parsed_jd
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing resume matching pipeline: {str(e)}"
        )
