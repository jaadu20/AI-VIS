from fastapi import logger
from transformers import pipeline
import PyPDF2
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class CVAnalyzer:
    def __init__(self):
        self.ner_model = pipeline("ner", model="dslim/bert-base-NER")
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def extract_text_from_pdf(self, file):
        try:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() or ""  # Handle empty pages
            return text
        except Exception as e:
            logger.error(f"PDF extraction error: {str(e)}")
            raise ValueError("Invalid PDF file")

    def extract_entities(self, text):
        results = self.ner_model(text)
        entities = {
            'SKILLS': set(),
            'EXPERIENCE': set(),
            'EDUCATION': set(),
            'ORGANIZATION': set(),
            'MISC': set()  # Add MISC category
        }
        
        current_entity = ''
        current_text = ''
        for res in results:
            entity_type = res['entity']
            if entity_type.startswith('B-'):
                entity_category = entity_type[2:]
                if entity_category not in entities:
                    entity_category = 'MISC'  # Handle unknown categories
                if current_entity:
                    entities[current_entity].add(current_text.strip())
                current_entity = entity_category
                current_text = res['word']
            elif entity_type.startswith('I-'):
                current_text += ' ' + res['word']
            else:
                if current_entity:
                    entities[current_entity].add(current_text.strip())
                current_entity = ''
                current_text = ''
        # Add any remaining text
        if current_entity:
            entities[current_entity].add(current_text.strip())
        return entities

    def calculate_match_score(self, cv_text, job_description):
        # Clean text
        cv_text = re.sub(r'\s+', ' ', cv_text).lower()
        job_description = re.sub(r'\s+', ' ', job_description).lower()
        
        # Vectorize texts
        tfidf_matrix = self.vectorizer.fit_transform([cv_text, job_description])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        return similarity[0][0]