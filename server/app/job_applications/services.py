# job_applications/services.py
import spacy
import PyPDF2
from docx import Document
from io import BytesIO

nlp = spacy.load("en_core_web_sm")

def extract_text_from_file(file):
    content = file.read()
    text = ""
    
    if file.name.endswith('.pdf'):
        pdf_reader = PyPDF2.PdfReader(BytesIO(content))
        for page in pdf_reader.pages:
            text += page.extract_text()
    elif file.name.endswith(('.doc', '.docx')):
        doc = Document(BytesIO(content))
        text = '\n'.join([para.text for para in doc.paragraphs])
    else:
        text = content.decode('utf-8', errors='ignore')
    
    return text

def extract_skills(text):
    doc = nlp(text)
    skills = []
    
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "SKILL"]:
            skills.append(ent.text.lower())
    
    # Custom skill extraction logic
    for token in doc:
        if token.pos_ == "NOUN" and token.dep_ in ("dobj", "attr"):
            skills.append(token.text.lower())
    
    return list(set(skills))

def calculate_match_score(job_requirements, candidate_skills):
    required_skills = extract_skills(job_requirements)
    matched = len(set(candidate_skills) & set(required_skills))
    return matched / len(required_skills) if required_skills else 0