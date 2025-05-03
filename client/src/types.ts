// src/types.ts
export interface Job {
    id: number;
    title: string;
    department: string;
    location: string;
    employment_type: string;
    experience_level: string;
    salary: string | null;
    description: string;
    requirements: string;
    benefits?: string;
    created_at: string;
    company: number;
    company_name: string;
  }
  
  export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'company' | 'candidate';
    is_company: boolean; 
    company_profile?: CompanyProfile;
  }
  
  export interface CompanyProfile {
    id: number;
    company_name: string;
    website: string;
    description: string;
    industry: string;
  }