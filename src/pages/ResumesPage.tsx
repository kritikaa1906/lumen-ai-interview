import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { ResumeProfile } from '../types';
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ResumesPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getResumes();
      if (res.success && res.resumes) {
        setResumes(res.resumes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only genuine PDF documents (.pdf) are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB maximum limit.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.uploadResume(file);
      if (res.success && res.resume) {
        setSuccess(`Resume "${res.resume.file_name}" uploaded and parsed with ${res.resume.extracted_skills.length} skills!`);
        fetchResumes();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteResume = async (id: number) => {
    if (!confirm('Are you sure you want to remove this resume profile?')) return;

    try {
      await api.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setSuccess('Resume profile removed successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to remove resume.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-3 border-b border-[#282C24]">
        <div className="text-xs font-medium uppercase tracking-wider text-[#C6F36B]">
          Candidate Assets
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-[#F5F2E9] mt-1">
          Resume Profiles & Skill Extraction
        </h1>
        <p className="text-xs text-[#A7B09C] mt-1">
          Upload PDF resumes to extract core technical skills and calibrate mock interview questions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="rounded-xl border border-dashed border-[#282C24] hover:border-[#C6F36B]/50 bg-[#1B1E19] p-8 text-center transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,application/pdf"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#111310] border border-[#282C24] flex items-center justify-center text-[#C6F36B] mx-auto">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F5F2E9]">
              {uploading ? 'Analyzing PDF & Extracting Skills...' : 'Upload PDF Resume'}
            </h3>
            <p className="text-xs text-[#74796F]">
              Drag and drop your engineering resume or browse. Max size 5MB. Verified PDF magic bytes enforced.
            </p>
          </div>

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all disabled:opacity-50"
          >
            {uploading ? 'Parsing PDF Text...' : 'Select PDF File'}
          </button>
        </div>
      </div>

      {/* Uploaded Resumes List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#A7B09C]">
          Saved Resume Profiles
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#74796F]">Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-[#282C24] bg-[#1B1E19] text-xs text-[#74796F]">
            No resume profiles uploaded yet. Upload a resume to automatically tailor questions.
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-[#111310] border border-[#282C24] text-[#C6F36B]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F5F2E9]">{resume.file_name}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#74796F] mt-0.5">
                        <span className="font-mono tabular-nums">
                          {(resume.file_size / 1024).toFixed(1)} KB
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Uploaded {new Date(resume.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteResume(resume.id)}
                    className="p-1.5 rounded text-[#74796F] hover:text-[#EF4444] hover:bg-[#111310] transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {resume.experience_summary && (
                  <div className="text-xs text-[#A7B09C] bg-[#111310] p-3 rounded border border-[#282C24] italic">
                    "{resume.experience_summary}"
                  </div>
                )}

                {/* Extracted Skills List */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#A7B09C]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C6F36B]" />
                    <span>Extracted Technical Competencies ({resume.extracted_skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.extracted_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#111310] border border-[#282C24] text-[#F5F2E9]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
