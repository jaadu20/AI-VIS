# cv_analyzer.py
import spacy
import re
import PyPDF2
import docx
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

class CVAnalyzer:
    def __init__(self):
        try:
            # Load spaCy model for NER
            self.nlp = spacy.load("en_core_web_lg")
        except OSError:
            # If model not found, download it
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_lg"])
            self.nlp = spacy.load("en_core_web_lg")
    
    def extract_text_from_pdf(self, file):
        """Extract text from a PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file.read()))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            file.seek(0)  # Reset file pointer
            return text
        except Exception as e:
            logger.error(f"Error parsing PDF: {str(e)}")
            return ""
    
    def extract_text_from_docx(self, file):
        """Extract text from a DOCX file"""
        try:
            doc = docx.Document(BytesIO(file.read()))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            file.seek(0)  # Reset file pointer
            return text
        except Exception as e:
            logger.error(f"Error parsing DOCX: {str(e)}")
            return ""
    
    def extract_text(self, file):
        """Extract text from different file formats"""
        file_name = file.name.lower()
        if file_name.endswith('.pdf'):
            return self.extract_text_from_pdf(file)
        elif file_name.endswith('.docx'):
            return self.extract_text_from_docx(file)
        elif file_name.endswith('.doc'):
            # Basic fallback for .doc files - not ideal
            try:
                return file.read().decode('utf-8', errors='ignore')
            except Exception as e:
                logger.error(f"Error parsing DOC: {str(e)}")
                return ""
        else:
            # Try to read as plain text
            try:
                return file.read().decode('utf-8', errors='ignore')
            except Exception as e:
                logger.error(f"Error parsing unknown file type: {str(e)}")
                return ""
    
    def extract_entities(self, text):
        """Extract named entities from text"""
        doc = self.nlp(text)
        entities = {}
        
        for ent in doc.ents:
            if ent.label_ not in entities:
                entities[ent.label_] = []
            entities[ent.label_].append(ent.text)
        
        return entities
    
    def extract_skills(self, text):
        """Extract technical skills from text"""
        # Common programming languages, frameworks, tools
        tech_keywords = [
            'python', 'java', 'javascript', 'typescript', 'c\\+\\+', 'c#', 'ruby', 'php', 
            'golang', 'swift', 'kotlin', 'rust', 'r', 'scala', 'perl', 'shell', 'bash',
            'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'laravel',
            'node\\.?js', 'ruby on rails', 'asp\\.net', '.net', 'core', 'tensorflow',
            'pytorch', 'scikit-learn', 'pandas', 'numpy', 'keras', 'hadoop', 'spark',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'css', 'html', 'sql', 'nosql',
            'mongodb', 'postgresql', 'mysql', 'oracle', 'redis', 'elasticsearch',
            'git', 'jenkins', 'travis', 'ci/cd', 'agile', 'scrum', 'jira', 'confluence',
            'linux', 'unix', 'windows', 'macos', 'ios', 'android', 'mobile', 'restful',
            'graphql', 'microservices', 'saas', 'devops', 'sre', 'machine learning', 'ai',
            'data science', 'deep learning', 'nlp', 'computer vision', 'tableau', 'power bi',
            'excel', 'word', 'powerpoint', 'photoshop', 'illustrator', 'figma', 'sketch',
            'ui', 'ux','java','java script,' 'seo', 'web development', 'full stack', 'frontend', 'backend',
            'responsive design', 'accessibility', 'tdd', 'bdd', 'rest api', 'json',
            'xml', 'oauth', 'jwt', 'authentication', 'authorization', 'security',
            'penetration testing', 'encryption', 'cloud', 'serverless', 'etl', 'data warehouse',
            'data lake', 'big data', 'data mining', 'data visualization', 'statistics',
            'ab testing', 'product management', 'project management', 'quality assurance',
            'testing', 'selenium', 'cypress', 'jest', 'junit', 'pytest', 'mocha', 'chai'
        ]
        
        # Industry-specific skills
        industry_keywords = [
            'accounting', 'finance', 'banking', 'investment', 'trading', 'marketing',
            'advertising', 'sales', 'customer service', 'human resources', 'hr',
            'recruiting', 'talent acquisition', 'legal', 'law', 'compliance', 'regulatory',
            'healthcare', 'medical', 'pharmaceuticals', 'biotechnology', 'research',
            'development', 'manufacturing', 'supply chain', 'logistics', 'procurement',
            'retail', 'e-commerce', 'hospitality', 'tourism', 'education', 'teaching',
            'training', 'consulting', 'business intelligence', 'data analysis',
            'analytics', 'reporting', 'forecasting', 'budgeting', 'auditing',
            'risk management', 'insurance', 'real estate', 'property management',
            'construction', 'architecture', 'engineering', 'telecommunications',
            'networking', 'system administration', 'database administration',
            'web design', 'content creation', 'copywriting', 'editing', 'publishing',
            'journalism', 'media', 'public relations', 'communications', 'social media',
            'digital marketing', 'seo', 'sem', 'ppc', 'email marketing', 'crm',
            'customer relationship management', 'event planning', 'operations',
            'strategy', 'business development', 'entrepreneurship', 'leadership',
            'management', 'team building', 'coaching', 'mentoring', 'nonprofit',
            'fundraising', 'grant writing', 'government', 'public policy',
            'international relations', 'transportation', 'aviation', 'automotive',
            'energy', 'oil and gas', 'renewable energy', 'sustainability',
            'environmental', 'climate', 'agriculture', 'food service'
        ]
        
        # Soft skills
        soft_keywords = [
            'communication', 'teamwork', 'problem solving', 'problem-solving',
            'critical thinking', 'decision making', 'time management',
            'organization', 'adaptability', 'flexibility', 'creativity',
            'innovation', 'leadership', 'emotional intelligence', 'conflict resolution',
            'negotiation', 'persuasion', 'presentation', 'public speaking',
            'writing', 'research', 'analytical', 'detail oriented', 'multitasking',
            'stress management', 'work ethic', 'interpersonal', 'collaboration',
            'customer oriented', 'service oriented', 'self motivated', 'proactive',
            'initiative', 'goal oriented', 'strategic thinking', 'planning',
            'prioritization', 'resilience', 'patience', 'enthusiasm', 'positive attitude'
        ]
        
        # Create regex pattern for case-insensitive matching of whole words
        all_keywords = tech_keywords + industry_keywords + soft_keywords
        pattern = r'\b(?:' + '|'.join(all_keywords) + r')\b'
        matches = re.finditer(pattern, text.lower(), re.IGNORECASE)
        
        # Extract unique skills
        skills = set()
        for match in matches:
            skills.add(match.group(0).lower())
        
        return list(skills)
    
    def extract_education(self, text):
        """Extract education information"""
        education_patterns = [
            r'\b(?:ph\.?d\.?|doctor of philosophy)\b',
            r'\b(?:m\.?s\.?|master of science)\b',
            r'\b(?:m\.?a\.?|master of arts)\b',
            r'\b(?:m\.?b\.?a\.?|master of business administration)\b',
            r'\b(?:b\.?s\.?|bachelor of science)\b',
            r'\b(?:b\.?a\.?|bachelor of arts)\b',
            r'\b(?:b\.?tech\.?|bachelor of technology)\b',
            r'\b(?:associate\'?s? degree)\b',
            r'\b(?:high school diploma|ged)\b'
        ]
        
        education = []
        for pattern in education_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                education.append(match.group(0))
        
        return list(set(education))
    
    def extract_experience(self, text):
        """Extract years of experience"""
        experience_patterns = [
            r'(\d+)\+?\s*(?:years|yrs)(?:\s+of)?\s+(?:experience|exp)',
            r'(?:experience|exp)(?:\s+of)?\s+(\d+)\+?\s*(?:years|yrs)'
        ]
        
        for pattern in experience_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                return int(match.group(1))
        
        return None
    
    def analyze_cv(self, file):
        """Analyze CV and extract relevant information"""
        text = self.extract_text(file)
        if not text:
            return {"error": "Could not extract text from file"}
        
        entities = self.extract_entities(text)
        skills = self.extract_skills(text)
        education = self.extract_education(text)
        experience = self.extract_experience(text)
        
        return {
            "entities": entities,
            "skills": skills,
            "education": education,
            "experience": experience,
            "text": text
        }