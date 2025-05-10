import json
import spacy
from docx import Document
from PyPDF2 import PdfReader
from typing import Tuple, List
from jobs.models import Job

nlp = spacy.load("en_core_web_lg")

class CVAnalyzer:
    def __init__(self):
        with open('applications/skills.json') as f:
            self.skills_db = json.load(f)
            
    def extract_text(self, file) -> str:
        try:
            if file.name.endswith('.pdf'):
                reader = PdfReader(file)
                return " ".join([page.extract_text() for page in reader.pages])
            elif file.name.endswith(('.doc', '.docx')):
                doc = Document(file)
                return " ".join([para.text for para in doc.paragraphs])
            return file.read().decode('utf-8')
        except Exception as e:
            raise ValueError(f"File parsing failed: {str(e)}")

    def extract_skills(self, text: str) -> List[str]:
        doc = nlp(text)
        skills = set()
        
        # Pattern matching
        for token in doc:
            if token.text in self.skills_db['technical'] + self.skills_db['soft']:
                skills.add(token.text)
                
        # NER extraction
        for ent in doc.ents:
            if ent.label_ in ["SKILL", "ORG", "PRODUCT"]:
                skills.add(ent.text)
        
        return list(skills)

    def analyze_job_requirements(self, job: Job) -> List[str]:
        requirements = job.requirements if isinstance(job.requirements, str) else "\n".join(job.requirements)
        doc = nlp(requirements)
        return list(set([
            token.text for token in doc 
            if token.text in self.skills_db['technical']
        ]))

class EligibilityCalculator:
    @staticmethod
    def calculate_match(cv_skills: List[str], job_skills: List[str]) -> Tuple[float, List[str]]:
        if not job_skills:
            return 100.0, []
            
        required = set(job_skills)
        possessed = set(cv_skills)
        missing = required - possessed
        match_score = (len(required - missing) / len(required)) * 100
        
        return round(match_score, 2), list(missing)