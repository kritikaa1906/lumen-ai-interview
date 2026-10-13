-- =====================================================================
-- LUMEN AI INTERVIEW — MYSQL SEED SCRIPT
-- =====================================================================

USE lumen_ai_interview;

-- Demo user with bcrypt hashed password: 'password123'
-- Hash: $2a$10$wT33H9Xh0O29kO8yqR3dO.wD5iA/Xw7m5ZfT6V3TzX.4g8a9v4U2S
INSERT INTO users (id, email, password_hash, name, title, target_role)
VALUES (
  1,
  'alex.dev@lumenstudio.ai',
  '$2a$10$3p4B7NkV43wK7xK9uN8OQeeu6yH2qPzX3h8k9o0v4U2SwT33H9Xh0',
  'Alex Chen',
  'Senior Candidate',
  'Full-Stack Developer'
)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Demo Resume Profile
INSERT INTO resume_profiles (id, user_id, file_name, file_size, raw_text, extracted_skills, experience_summary)
VALUES (
  1,
  1,
  'alex_chen_fullstack_resume.pdf',
  48200,
  'Alex Chen. Full-Stack Engineer with 4 years experience in TypeScript, React, Node.js, Express, MySQL, PostgreSQL, Docker, and distributed systems. Built microservices handling 2M requests/day and responsive web applications.',
  JSON_ARRAY('TypeScript', 'React', 'Node.js', 'Express', 'MySQL', 'PostgreSQL', 'Docker', 'System Design', 'REST APIs', 'Tailwind CSS'),
  '4 years of experience architecting high-throughput full-stack TypeScript applications and MySQL data pipelines.'
)
ON DUPLICATE KEY UPDATE file_name=VALUES(file_name);

-- Completed Demo Interview
INSERT INTO interviews (id, user_id, resume_id, role_title, difficulty, interview_type, question_count, status, is_fallback, created_at, completed_at)
VALUES (
  1,
  1,
  1,
  'Full-Stack Developer',
  'medium',
  'technical',
  3,
  'completed',
  FALSE,
  NOW() - INTERVAL 2 DAY,
  NOW() - INTERVAL 2 DAY + INTERVAL 25 MINUTE
)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Questions for Demo Interview
INSERT INTO questions (id, interview_id, order_index, question_text, topic_tag, difficulty, expected_concepts, example_answer)
VALUES
(
  1,
  1,
  1,
  'Walk through the architectural trade-offs between Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR).',
  'Web Architecture',
  'medium',
  JSON_ARRAY('CSR vs SSG vs SSR comparison', 'TTFB vs Hydration', 'SEO advantages', 'CDN caching'),
  'CSR loads an empty HTML shell and boots on client. SSG generates at build time for optimal CDN caching. SSR renders per request for live data.'
),
(
  2,
  1,
  2,
  'How do you protect a modern full-stack web application against CSRF, XSS, and SQL Injection attacks?',
  'Full-Stack Security',
  'hard',
  JSON_ARRAY('Parameterized SQL', 'CSP headers', 'Contextual output encoding', 'SameSite cookies and custom auth headers'),
  'Parameterized SQL statements prevent SQL injection. Contextual sanitization and CSP prevent XSS. SameSite cookies and bearer tokens mitigate CSRF.'
),
(
  3,
  1,
  3,
  'Explain how you would architect a distributed idempotency key mechanism for high-frequency financial payments.',
  'System Design',
  'hard',
  JSON_ARRAY('Client idempotency header', 'Atomic lock via Redis or SQL unique constraint', 'State transitions IN_PROGRESS, COMPLETED', 'Cached response replay'),
  'Client sends unique Idempotency-Key. Backend atomically acquires unique lock, verifies previous state, executes transaction inside ACID boundary, and caches response.'
)
ON DUPLICATE KEY UPDATE question_text=VALUES(question_text);

-- Saved Answers for Demo Interview
INSERT INTO answers (id, interview_id, question_id, user_id, answer_text, submitted_at)
VALUES
(
  1,
  1,
  1,
  1,
  'CSR provides great desktop interactivity after hydration but has slow initial load and SEO penalties. SSG produces static HTML at build time which hits CDNs immediately, but is inflexible for live private dashboards. SSR computes HTML on every incoming request, ensuring fresh data and search engine visibility at the cost of server resource overhead.',
  NOW() - INTERVAL 2 DAY + INTERVAL 7 MINUTE
),
(
  2,
  1,
  2,
  1,
  'To prevent SQL injection, I use parameterized queries with prepared statements or ORMs so parameters are never interpreted as executable code. For XSS, I avoid raw HTML injection and rely on React automatic JSX encoding along with Content-Security-Policy headers. For CSRF, I use SameSite=Strict cookies or Authorization Bearer tokens.',
  NOW() - INTERVAL 2 DAY + INTERVAL 16 MINUTE
),
(
  3,
  1,
  3,
  1,
  'Clients provide an Idempotency-Key header. We store this in a Redis key with SETNX or a unique database table constraint. If the status is COMPLETED, we immediately return the cached payload. If new, we process within an ACID transaction and store the response.',
  NOW() - INTERVAL 2 DAY + INTERVAL 24 MINUTE
)
ON DUPLICATE KEY UPDATE answer_text=VALUES(answer_text);

-- Results Evaluation for Demo Interview
INSERT INTO results (id, interview_id, user_id, overall_score, relevance_score, technical_score, clarity_score, examples_score, strengths, missing_concepts, improvements, question_evaluations, evaluator_source, created_at)
VALUES
(
  1,
  1,
  1,
  87.5,
  90.0,
  88.0,
  85.0,
  82.0,
  JSON_ARRAY(
    'Strong architectural understanding of rendering strategies and trade-offs',
    'Precise explanation of parameterized queries and defense-in-depth security principles',
    'Clear distributed systems terminology for idempotency keys and state tracking'
  ),
  JSON_ARRAY(
    'Could elaborate more on scheduler.yield() or streaming SSR in React 19',
    'Did not mention TTL expiry policies for idempotency keys to manage cache memory'
  ),
  JSON_ARRAY(
    'Mention specific distributed locking libraries or database isolation levels when discussing payment race conditions',
    'Connect the CSRF defense to modern single-page apps vs multi-domain API architectures'
  ),
  JSON_ARRAY(
    JSON_OBJECT(
      'questionId', 1,
      'score', 88,
      'feedback', 'Comprehensive breakdown of SSR, SSG, and CSR with accurate performance tradeoffs.'
    ),
    JSON_OBJECT(
      'questionId', 2,
      'score', 90,
      'feedback', 'Exemplary security knowledge covering parameterized queries, CSP, and Bearer authentication.'
    ),
    JSON_OBJECT(
      'questionId', 3,
      'score', 85,
      'feedback', 'Good workflow for idempotency keys; remember to discuss TTL duration and crash recovery.'
    )
  ),
  'gemini-3.8-flash',
  NOW() - INTERVAL 2 DAY + INTERVAL 25 MINUTE
)
ON DUPLICATE KEY UPDATE overall_score=VALUES(overall_score);
