import sys
from pathlib import Path
import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

# Ensure internal modules (transcript_module, evaluator, etc.) are importable from this subdirectory
services_dir = Path(__file__).resolve().parent
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

from transcript_module import process_interview_transcription
from conversation_seperater import convert_to_json
from transcription_processing import process_transcript
from evaluate_candidate import evaluator

router = APIRouter(prefix="/interview", tags=["AI Interview Assistant"])

@router.post("/evaluate", summary="Transcribe and evaluate interview audio/video or notes")
async def evaluate_interview(
    audio_file: Optional[UploadFile] = File(None, description="Audio or video recording of the interview"),
    rough_notes: Optional[str] = Form(None, description="Interview rough notes or pre-extracted text transcripts")
):
    """
    Exposes the AI Interview Assistant pipeline.
    
    Can accept a recorded interview file (audio/video), transcribing it using Whisper,
    or plain-text transcripts/rough notes. Evaluates the candidate across key parameters
    (technical strength, communication score, confidence, behavior, and HIRE/HOLD/REJECT verdict)
    using OpenAI GPT models.
    """
    # 1. Validation
    if not audio_file and not rough_notes:
        raise HTTPException(
            status_code=400,
            detail="You must provide either an audio_file or rough_notes."
        )

    transcript = ""

    # 2. Extract transcript from audio/video if file is provided
    if audio_file:
        suffix = Path(audio_file.filename).suffix or ".wav"
        is_video = suffix.lower() in [".mp4", ".mov", ".avi", ".mkv", ".webm"]
        
        # Write to temporary file for Whisper pipeline processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(audio_file.file, tmp)
            tmp_path = tmp.name

        try:
            transcription = process_interview_transcription(
                media_path=tmp_path,
                is_video=is_video,
                device="cpu",
                model_size="small"
            )
            if not transcription.get("success"):
                raise HTTPException(
                    status_code=500,
                    detail=f"Transcription failure: {transcription.get('error')}"
                )
            transcript = transcription.get("transcript", "")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    else:
        transcript = rough_notes

    if not transcript or not transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="Transcribed text or rough notes content is empty."
        )

    # 3. Process transcription and run evaluations
    try:
        # Separate speaker turns
        seperated_text = convert_to_json(transcript)
        if not seperated_text:
            raise HTTPException(
                status_code=500,
                detail="Failed to structure dialogue speakers using LLM parser."
            )

        # Run text processing
        processed_text = process_transcript(seperated_text)

        # Run candidate scoring
        result = evaluator.calculate_final_score(processed_text)

        return {
            "success": True,
            "evaluations": result,
            "transcript": transcript,
            "conversation": processed_text.get("cleaned_conversation", []),
            "statistics": processed_text.get("conversation_statistics", {})
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing interview evaluation pipeline: {str(e)}"
        )
