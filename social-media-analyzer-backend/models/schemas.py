from pydantic import BaseModel
from typing import Optional

# Output for the Extract endpoint
class ExtractionResponse(BaseModel):
    filename: str
    extracted_text: str
    file_type: str
    status: str

# Input for the Analyze endpoint
class AnalysisRequest(BaseModel):
    text: str

# Output for the Analyze endpoint
class AnalysisResponse(BaseModel):
    summary: str
    sentiment: str
    improvement_suggestions: list[str]
    status: str