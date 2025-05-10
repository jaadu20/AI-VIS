import re
import nltk
import spacy
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import docx
import io
import os

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Initialize spaCy NLP model
try:
    nlp = spacy.load('en_core_web_sm')
except:
    # If the model is not installed, download it
    os.system('python -m spacy download en_core_web_sm')
    nlp = spacy.load('en_core_web_sm')

class CVAnalyzer:
    def __init__(self):
        self.stopwords = set(nltk.corpus.stopwords.words('english'))
        # Common technical skills and keywords
        self.common_skills = [
            "python", "javascript", "java", "c++", "c#", "html", "css", 
            "react", "angular", "vue", "node", "express", "django", "flask",
            "sql", "mysql", "postgresql", "mongodb", "nosql", "aws", "azure",
            "gcp", "docker", "kubernetes", "git", "jenkins", "ci/cd", "agile",
            "scrum", "data analysis", "machine learning", "ai", "nlp", "devops",
            "frontend", "backend", "full stack", "mobile", "android", "ios",
            "swift", "kotlin", "typescript", "php", "laravel", "ruby", "rails",
            "golang", "rust", "scala", "hadoop", "spark", "tableau", "power bi",
            "excel", "project management", "leadership", "communication",
            # Add more general skills here
        ]
        
    def extract_text_from_pdf(self, pdf_file):
        """Extract text from a PDF file"""
        text = ""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
        return text
    
    def extract_text_from_docx(self, docx_file):
        """Extract text from a DOCX file"""
        text = ""
        try:
            doc = docx.Document(docx_file)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
        return text
    
    def extract_text_from_file(self, file):
        """Extract text from uploaded file based on file type"""
        file_content = file.read()
        file_type = file.name.split('.')[-1].lower()
        
        if file_type == 'pdf':
            # Convert bytes to file-like object for PDF reading
            file_like = io.BytesIO(file_content)
            text = self.extract_text_from_pdf(file_like)
        elif file_type in ['docx', 'doc']:
            # Convert bytes to file-like object for DOCX reading
            file_like = io.BytesIO(file_content)
            text = self.extract_text_from_docx(file_like)
        else:
            # If not PDF or DOCX, try to decode as text
            try:
                text = file_content.decode('utf-8')
            except UnicodeDecodeError:
                text = "Unsupported file format or encoding"
        
        # Rewind the file for potential future use
        file.seek(0)
        return text
    
    def preprocess_text(self, text):
        """Clean and preprocess the text"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\d+', ' ', text)
        
        # Tokenize the text
        tokens = nltk.word_tokenize(text)
        
        # Remove stopwords
        filtered_tokens = [token for token in tokens if token not in self.stopwords]
        
        # Join tokens back to text
        cleaned_text = ' '.join(filtered_tokens)
        
        return cleaned_text
    
    def extract_skills(self, text):
        """Extract skills from text using NER and keyword matching"""
        # Process with spaCy for NER
        doc = nlp(text.lower())
        
        # Extract entities that might represent skills
        entities = [(ent.text.lower(), ent.label_) for ent in doc.ents]
        
        # Extract skills using keyword matching
        skills = []
        for skill in self.common_skills:
            if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text.lower()):
                skills.append(skill)
        
        # Add ORG and PRODUCT entities as potential skills/technologies
        for entity, label in entities:
            if label in ['ORG', 'PRODUCT']:
                if any(token.is_alpha for token in nlp(entity)):
                    skills.append(entity)
        
        # Clean and deduplicate skills
        clean_skills = []
        for skill in skills:
            skill = skill.strip()
            if len(skill) > 1 and skill not in clean_skills:
                clean_skills.append(skill)
        
        return clean_skills
    
    def calculate_match_score(self, cv_skills, job_description, job_requirements):
        """Calculate match score between CV skills and job requirements"""
        # Combine job description and requirements
        job_text = f"{job_description} {' '.join(job_requirements)}"
        
        # Extract skills from job text
        job_skills = self.extract_skills(job_text)
        
        # Calculate skill match
        matched_skills = set(cv_skills).intersection(set(job_skills))
        if len(job_skills) == 0:
            skill_match_ratio = 0
        else:
            skill_match_ratio = len(matched_skills) / len(job_skills)
        
        # Calculate text similarity using cosine similarity
        vectorizer = CountVectorizer()
        try:
            cv_skills_text = ' '.join(cv_skills)
            job_skills_text = ' '.join(job_skills)
            
            if not cv_skills_text.strip() or not job_skills_text.strip():
                cosine_sim = 0
            else:
                X = vectorizer.fit_transform([cv_skills_text, job_skills_text])
                cosine_sim = cosine_similarity(X)[0][1]
        except:
            cosine_sim = 0
        
        # Calculate final score (weighted average)
        final_score = (skill_match_ratio * 0.7) + (cosine_sim * 0.3)
        final_score_percentage = final_score * 100
        
        # Identify missing skills
        missing_skills = set(job_skills) - set(cv_skills)
        
        return {
            'score': final_score_percentage,
            'matched_skills': list(matched_skills),
            'missing_skills': list(missing_skills),
            'cv_skills': cv_skills,
            'job_skills': job_skills
        }
    
    def analyze_cv(self, cv_file, job_description, job_requirements):
        """Analyze CV against job description and requirements"""
        # Extract text from CV
        cv_text = self.extract_text_from_file(cv_file)
        
        # Preprocess text
        preprocessed_text = self.preprocess_text(cv_text)
        
        # Extract skills from CV
        cv_skills = self.extract_skills(preprocessed_text)
        
        # Calculate match score
        match_results = self.calculate_match_score(cv_skills, job_description, job_requirements)
        
        return {
            'match_score': match_results['score'],
            'extracted_skills': match_results['cv_skills'],
            'missing_skills': match_results['missing_skills'],
            'eligible': match_results['score'] >= 70
        }
