-- =====================================================================
-- LUMEN AI INTERVIEW — MYSQL 8 RELATIONAL DATABASE SCHEMA
-- =====================================================================

CREATE DATABASE IF NOT EXISTS lumen_ai_interview
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lumen_ai_interview;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  title VARCHAR(150) DEFAULT 'Software Engineer',
  target_role VARCHAR(150) DEFAULT 'Full-Stack Developer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RESUME PROFILES TABLE
CREATE TABLE IF NOT EXISTS resume_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  raw_text MEDIUMTEXT NOT NULL,
  extracted_skills JSON NOT NULL,
  experience_summary TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_resumes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  resume_id INT NULL,
  role_title VARCHAR(150) NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  interview_type ENUM('technical', 'behavioral', 'system_design', 'mixed') NOT NULL DEFAULT 'technical',
  question_count INT NOT NULL DEFAULT 5,
  status ENUM('created', 'in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'created',
  is_fallback BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resume_profiles(id) ON DELETE SET NULL,
  INDEX idx_interviews_user (user_id),
  INDEX idx_interviews_status (status),
  INDEX idx_interviews_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interview_id INT NOT NULL,
  order_index INT NOT NULL,
  question_text TEXT NOT NULL,
  topic_tag VARCHAR(100) NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  expected_concepts JSON NOT NULL,
  example_answer TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  INDEX idx_questions_interview (interview_id),
  INDEX idx_questions_order (interview_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interview_id INT NOT NULL,
  question_id INT NOT NULL,
  user_id INT NOT NULL,
  answer_text MEDIUMTEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_question_answer (question_id),
  INDEX idx_answers_interview (interview_id),
  INDEX idx_answers_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interview_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  overall_score DECIMAL(5, 2) NOT NULL,
  relevance_score DECIMAL(5, 2) NOT NULL,
  technical_score DECIMAL(5, 2) NOT NULL,
  clarity_score DECIMAL(5, 2) NOT NULL,
  examples_score DECIMAL(5, 2) NOT NULL,
  strengths JSON NOT NULL,
  missing_concepts JSON NOT NULL,
  improvements JSON NOT NULL,
  question_evaluations JSON NOT NULL,
  evaluator_source VARCHAR(60) NOT NULL DEFAULT 'gemini-3.8-flash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_results_user (user_id),
  INDEX idx_results_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
