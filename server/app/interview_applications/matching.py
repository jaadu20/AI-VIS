# matching.py
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import numpy as np

class SkillMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
    
    def preprocess_text(self, text):
        """Preprocess text for better matching"""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def calculate_similarity(self, cv_text, job_text):
        """Calculate cosine similarity between CV and job description"""
        cv_text = self.preprocess_text(cv_text)
        job_text = self.preprocess_text(job_text)
        
        try:
            # Create the TF-IDF matrix
            tfidf_matrix = self.vectorizer.fit_transform([cv_text, job_text])
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return similarity * 100  # Convert to percentage
        except Exception:
            # Fallback if vectorization fails
            return 0
    
    def find_missing_skills(self, cv_skills, job_requirements):
        """Find skills mentioned in job requirements but not in CV"""
        # Convert job requirements to lowercase for case-insensitive matching
        if isinstance(job_requirements, list):
            # If job_requirements is already a list of strings
            job_requirements_text = " ".join(job_requirements).lower()
        else:
            # If job_requirements is a single string
            job_requirements_text = job_requirements.lower()
        
        # List of common skills to look for in job requirements
        common_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'django', 'flask', 'spring', 'express', 'mongodb', 'sql', 'postgresql',
            'mysql', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'agile',
            'scrum', 'rest api', 'graphql', 'machine learning', 'ai', 'data science',
            'tensorflow', 'pytorch', 'nlp', 'tableau', 'power bi', 'excel', 'word',
            'powerpoint', 'communication', 'teamwork', 'leadership', 'problem solving',
            'time management', 'critical thinking', 'project management', 'html', 'css',
            'typescript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala',
            'hadoop', 'spark', 'devops', 'ci/cd', 'jenkins', 'linux', 'unix',
            'testing', 'qa', 'security', 'networking', 'analytics', 'seo', 'marketing',
            'sales', 'finance', 'accounting', 'hr', 'legal', 'healthcare', 'retail'
        ]
        
        # Extract skills from job requirements by matching with common skills
        required_skills = set()
        for skill in common_skills:
            # Check if the skill is mentioned in the job requirements
            if re.search(r'\b' + re.escape(skill) + r'\b', job_requirements_text):
                required_skills.add(skill)
        
        # Set of skills in CV
        cv_skills_set = set(skill.lower() for skill in cv_skills)
        
        # Find missing skills
        missing_skills = required_skills - cv_skills_set
        
        return list(missing_skills)
    
    def calculate_match_score(self, cv_analysis, job):
        """Calculate match score between CV and job"""
        cv_text = cv_analysis.get('text', '')
        cv_skills = cv_analysis.get('skills', [])
        job_description = job.description
        job_requirements = job.requirements
        
        # Calculate text similarity
        text_similarity = self.calculate_similarity(cv_text, job_description)
        
        # Find missing skills
        missing_skills = self.find_missing_skills(cv_skills, job_requirements)
        
        # Calculate skills match percentage
        if not job_requirements:
            skills_match_percentage = 100
        else:
            # Get required skills
            if isinstance(job_requirements, list):
                job_requirements_text = " ".join(job_requirements).lower()
            else:
                job_requirements_text = job_requirements.lower()
            
            # Use the common_skills list from find_missing_skills to extract required skills
            common_skills = [
                'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
                'django', 'flask', 'spring', 'express', 'mongodb', 'sql', 'postgresql',
                'mysql', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'agile',
                'scrum', 'rest api', 'graphql', 'machine learning', 'ai', 'data science',
                'tensorflow', 'pytorch', 'nlp', 'tableau', 'power bi', 'excel', 'word',
                'powerpoint', 'communication', 'teamwork', 'leadership', 'problem solving',
                'time management', 'critical thinking', 'project management', 'html', 'css',
                'typescript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala',
                'hadoop', 'spark', 'devops', 'ci/cd', 'jenkins', 'linux', 'unix',
                'testing', 'qa', 'security', 'networking', 'analytics', 'seo', 'marketing',
                'sales', 'finance', 'accounting', 'hr', 'legal', 'healthcare', 'retail'
            ]
            
            required_skills = set()
            for skill in common_skills:
                if re.search(r'\b' + re.escape(skill) + r'\b', job_requirements_text):
                    required_skills.add(skill)
            
            if len(required_skills) == 0:
                skills_match_percentage = 100
            else:
                cv_skills_set = set(skill.lower() for skill in cv_skills)
                matched_skills = required_skills.intersection(cv_skills_set)
                skills_match_percentage = (len(matched_skills) / len(required_skills)) * 100
        
        # Final match score: 60% text similarity, 40% skills match
        match_score = (0.6 * text_similarity) + (0.4 * skills_match_percentage)
        
        return {
            'match_score': min(100, match_score),  # Cap at 100
            'missing_skills': missing_skills
        }