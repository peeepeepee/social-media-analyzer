import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services import pdf_parser, ocr_extractor, llm_analyzer
from models.schemas import ExtractionResponse, AnalysisRequest, AnalysisResponse

app = FastAPI(title="Social Media Content Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

# --- ENDPOINT 1: File Upload & Extraction ---
@app.post("/api/extract", response_model=ExtractionResponse)
async def process_document(file: UploadFile = File(...)):
    allowed_content_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_content_types:
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    temp_file_path = os.path.join(TEMP_DIR, file.filename)
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    extracted_text = ""
    try:
        if file.content_type == "application/pdf":
            extracted_text = pdf_parser.extract_from_pdf(temp_file_path)
        elif file.content_type.startswith("image/"):
            extracted_text = ocr_extractor.extract_from_image(temp_file_path)
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

    if os.path.exists(temp_file_path):
        os.remove(temp_file_path)

    return ExtractionResponse(
        filename=file.filename,
        extracted_text=extracted_text,
        file_type=file.content_type,
        status="success"
    )

# --- ENDPOINT 2: AI Analysis ---
@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest):
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="No text provided for analysis.")
    
    # Call your Gemini service
    analysis_result = llm_analyzer.analyze_content(request.text)
    
    if "error" in analysis_result:
        raise HTTPException(status_code=500, detail=analysis_result["error"])
        
    return AnalysisResponse(
        summary=analysis_result.get("summary", ""),
        sentiment=analysis_result.get("sentiment", ""),
        improvement_suggestions=analysis_result.get("improvement_suggestions", []),
        status="success"
    )