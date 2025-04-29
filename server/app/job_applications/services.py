import spacy
import logging
import re
from pdfminer.high_level import extract_text
from docx import Document
from io import BytesIO

logger = logging.getLogger(__name__)
nlp = spacy.load("en_core_web_sm")

def extract_text_from_file(file):
    try:
        content = file.read()
        file.seek(0)  # Reset file pointer
        
        if file.name.lower().endswith('.pdf'):
            return extract_text_from_pdf(BytesIO(content))
        elif file.name.lower().endswith(('.doc', '.docx')):
            return extract_text_from_docx(BytesIO(content))
        else:
            return content.decode('utf-8', errors='ignore')
            
    except Exception as e:
        logger.error(f"File extraction error: {str(e)}")
        raise ValueError("Failed to process file")

def extract_text_from_pdf(file_stream):
    try:
        return extract_text(file_stream)
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise ValueError("Invalid PDF file")

def extract_text_from_docx(file_stream):
    try:
        doc = Document(file_stream)
        return '\n'.join([para.text for para in doc.paragraphs])
    except Exception as e:
        logger.error(f"DOCX extraction error: {str(e)}")
        raise ValueError("Invalid Word document")

def extract_skills(text):
    try:
        doc = nlp(text.lower())
        skills = set()
        
        # Entity recognition
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT", "SKILL"]:
                skills.add(ent.text.strip())
        
        # POS tagging and dependency parsing
        for chunk in doc.noun_chunks:
            if chunk.root.dep_ in ("dobj", "attr"):
                skills.add(chunk.text.strip())
        
        # Custom patterns
        patterns = [
            r"\b(?:proficient in|experienced with|skilled in)\s+([\w\s]+)",
            r"\b(?:knowledge of)\s+([\w\s]+)"
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                skills.update(m.strip() for m in match.split(','))
                
        return list(skills)
    
    except Exception as e:
        logger.error(f"Skill extraction error: {str(e)}")
        return []

def calculate_match_score(job_text, candidate_skills, threshold=0.6):
    try:
        required_skills = extract_skills(job_text)
        
        if not required_skills:
            return True, 1.0  # No requirements specified
        
        matched = len(set(candidate_skills) & set(required_skills))
        score = matched / len(required_skills)
        
        return score >= threshold, score
    
    except Exception as e:
        logger.error(f"Match calculation error: {str(e)}")
        return False, 0.0