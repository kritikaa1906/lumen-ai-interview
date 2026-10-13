import React from 'react';
import {
  ArrowRight,
  Terminal,
  Cpu,
  BarChart3,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-[#111310] text-[#F5F2E9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 border-b border-[#282C24]">
        {/* Subtle architectural grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1B1E19_1px,transparent_1px),linear-gradient(to_bottom,#1B1E19_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-6">
            {/* Unboxed Kicker */}
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#C6F36B]">
              <span>Lumen Studio</span>
              <span aria-hidden="true">·</span>
              <span>The Interview Intelligence Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-[#F5F2E9] text-balance leading-[1.1]">
              Sharpen your technical interviews with realistic AI evaluation.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A7B09C] max-w-2xl leading-relaxed">
              Designed for developers, engineers, and data professionals. Practice customized technical
              questions generated with Google Gemini, get evaluated across rigorous rubrics, and track your
              progress in persistent MySQL storage.
            </p>

            {/* CTA Group */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onStart}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-semibold text-sm bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all shadow-md group"
              >
                <span>Launch Mock Interview</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onLogin}
                className="px-5 py-3 rounded-lg font-medium text-sm border border-[#282C24] text-[#F5F2E9] hover:bg-[#1B1E19] hover:border-[#3A3F34] transition-colors"
              >
                Sign In with Demo Account
              </button>
            </div>

            {/* Unboxed Trust Markers */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[#74796F]">
              <span>MySQL 8 Relational Storage</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash Engine</span>
              <span aria-hidden="true">·</span>
              <span>4-Tier Rubric Weighting</span>
              <span aria-hidden="true">·</span>
              <span>PDF Skill Extraction</span>
            </div>
          </div>

          {/* Genuine Application UI Preview — Interactive Cockpit Mock */}
          <div className="mt-14 rounded-xl border border-[#282C24] bg-[#141712] p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#282C24] pb-4 mb-5 text-xs text-[#74796F]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
                <div className="w-3 h-3 rounded-full bg-[#EAB308]/60" />
                <div className="w-3 h-3 rounded-full bg-[#22C55E]/60" />
                <span className="ml-2 font-mono text-[#A7B09C]">lumen-interview-cockpit / session_01</span>
              </div>
              <div className="font-mono text-[#C6F36B] tabular-nums">Question 2 of 3 · Hard</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Live Question & Answer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-4 rounded-lg bg-[#1B1E19] border border-[#282C24] space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-[#A7B09C]">
                    Role: Full-Stack Developer · Topic: Concurrency & Idempotency
                  </div>
                  <h3 className="text-base font-bold text-[#F5F2E9]">
                    How would you design a distributed idempotency key mechanism for high-frequency payment processing APIs?
                  </h3>
                </div>

                <div className="p-4 rounded-lg bg-[#111310] border border-[#282C24] text-xs font-mono text-[#A7B09C] space-y-2 leading-relaxed">
                  <div className="text-[10px] text-[#74796F] uppercase">Candidate Response</div>
                  <p className="text-[#F5F2E9]">
                    "Clients send an Idempotency-Key header. We acquire a distributed lock using Redis SETNX or a unique MySQL constraint. If state is COMPLETED, we return the cached response. If IN_PROGRESS, we reject duplicates with 409 Conflict. If new, we process the transaction inside an ACID boundary with a 24-hour TTL."
                  </p>
                </div>
              </div>

              {/* Right Column: AI Rubric Breakdown */}
              <div className="lg:col-span-4 p-4 rounded-lg bg-[#1B1E19] border border-[#282C24] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#A7B09C]">
                    Practice Evaluation
                  </span>
                  <span className="font-mono text-sm font-bold text-[#C6F36B] tabular-nums">
                    88.5 / 100
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[#A7B09C] mb-1 text-[11px]">
                      <span>Relevance (40%)</span>
                      <span className="font-mono text-[#C6F36B]">92/100</span>
                    </div>
                    <div className="h-1 bg-[#111310] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C6F36B] w-[92%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#A7B09C] mb-1 text-[11px]">
                      <span>Technical Depth (30%)</span>
                      <span className="font-mono text-[#C6F36B]">88/100</span>
                    </div>
                    <div className="h-1 bg-[#111310] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C6F36B] w-[88%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#A7B09C] mb-1 text-[11px]">
                      <span>Structure & Clarity (20%)</span>
                      <span className="font-mono text-[#C6F36B]">85/100</span>
                    </div>
                    <div className="h-1 bg-[#111310] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C6F36B] w-[85%]" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#282C24] text-[11px] text-[#A7B09C]">
                  <span className="text-[#C6F36B] font-semibold">Strengths:</span> Solid explanation of distributed lock transitions and atomic state verification.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Overview */}
      <section className="py-20 max-w-7xl mx-auto px-6 border-b border-[#282C24]">
        <div className="max-w-2xl space-y-3 mb-12">
          <div className="text-xs uppercase tracking-wider text-[#C6F36B] font-medium">
            Core Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#F5F2E9]">
            Engineered for genuine interview readiness.
          </h2>
          <p className="text-sm text-[#A7B09C] leading-relaxed">
            Unlike superficial generic chatbot prompts, Lumen establishes a structured pipeline
            grounded in production software engineering scenarios and objective evaluation metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-lg bg-[#1B1E19] border border-[#282C24] space-y-3">
            <div className="w-10 h-10 rounded bg-[#111310] border border-[#282C24] flex items-center justify-center text-[#C6F36B]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F2E9]">Role-Specific Question Generation</h3>
            <p className="text-xs text-[#A7B09C] leading-relaxed">
              Target roles from Frontend to AI/ML Engineering. Questions adapt to seniority levels
              and incorporate your uploaded resume skills.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-lg bg-[#1B1E19] border border-[#282C24] space-y-3">
            <div className="w-10 h-10 rounded bg-[#111310] border border-[#282C24] flex items-center justify-center text-[#C6F36B]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F2E9]">Weighted Rubric Analysis</h3>
            <p className="text-xs text-[#A7B09C] leading-relaxed">
              Every answer is evaluated across relevance (40%), technical depth (30%), clarity (20%),
              and supporting evidence (10%) with concrete feedback.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-lg bg-[#1B1E19] border border-[#282C24] space-y-3">
            <div className="w-10 h-10 rounded bg-[#111310] border border-[#282C24] flex items-center justify-center text-[#C6F36B]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F2E9]">PDF Resume Skill Extraction</h3>
            <p className="text-xs text-[#A7B09C] leading-relaxed">
              Upload real PDF resumes to parse technical competencies and experience summaries,
              ensuring interview questions test your actual stack.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Explanation */}
      <section className="py-20 max-w-7xl mx-auto px-6 border-b border-[#282C24]">
        <div className="max-w-2xl space-y-3 mb-12">
          <div className="text-xs uppercase tracking-wider text-[#C6F36B] font-medium">
            Practice Lifecycle
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#F5F2E9]">
            The 4-stage interview progression.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Role Specification',
              desc: 'Select job track, difficulty, question count, and attach an extracted resume profile.',
            },
            {
              step: '02',
              title: 'Adaptive Generation',
              desc: 'Gemini constructs scenario questions targeted at system design, concurrency, or core APIs.',
            },
            {
              step: '03',
              title: 'Cockpit Practice',
              desc: 'Write structured answers in a focused distraction-free room with auto-save to MySQL.',
            },
            {
              step: '04',
              title: 'Rubric Evaluation',
              desc: 'Receive comprehensive scores, identified missing concepts, and benchmark model answers.',
            },
          ].map((item) => (
            <div key={item.step} className="p-5 rounded-lg bg-[#1B1E19] border border-[#282C24] space-y-2">
              <span className="font-mono text-sm font-bold text-[#C6F36B] tabular-nums">{item.step}</span>
              <h4 className="text-sm font-bold text-[#F5F2E9]">{item.title}</h4>
              <p className="text-xs text-[#A7B09C] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#74796F]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#C6F36B]" />
          <span className="text-[#F5F2E9] font-medium">Lumen AI Interview Studio</span>
          <span>· Portfolio Engineering Platform</span>
        </div>
        <div>
          <span>MySQL 8 Relational Backend · Google Gemini API · React 19</span>
        </div>
      </footer>
    </div>
  );
};
