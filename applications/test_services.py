from django.test import TestCase
from applications.services import CVAnalyzer, EligibilityCalculator
from jobs.models import Job
from users.models import User

class TestCVProcessing(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.company = User.objects.create(
            email="company@test.com",
            role="company",
            name="Test Corp",
            phone="1234567890"
        )
        cls.job = Job.objects.create(
            company=cls.company,
            title="Python Developer",
            requirements="Must know Python, Django, and REST APIs",
            # ... other fields
        )
        
    def test_skill_matching(self):
        analyzer = CVAnalyzer()
        calculator = EligibilityCalculator()
        
        # Mock CV content
        cv_content = "Experienced in Python, Django, and JavaScript"
        
        # Test skill extraction
        skills = analyzer.extract_skills(cv_content)
        self.assertIn("Python", skills)
        self.assertIn("Django", skills)
        
        # Test job requirements parsing
        job_skills = analyzer.analyze_job_requirements(self.job)
        self.assertIn("Python", job_skills)
        
        # Test matching
        score, missing = calculator.calculate_match(skills, job_skills)
        self.assertGreaterEqual(score, 66.67)
        self.assertIn("REST APIs", missing)