import { createRequire } from 'module';
import { geminiService } from './geminiService';
import { db, ResumeRecord } from '../db';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

export class ResumeService {
  /**
   * Validates and parses a PDF buffer, extracts text and skills, and persists record in DB.
   */
  public async processResumeUpload(params: {
    userId: number;
    originalName: string;
    buffer: Buffer;
    size: number;
  }): Promise<ResumeRecord> {
    // 1. Magic byte verification (%PDF-)
    const header = params.buffer.slice(0, 5).toString('ascii');
    if (!header.startsWith('%PDF-')) {
      throw new Error('Invalid file format: uploaded file is not a valid PDF document.');
    }

    // 2. Parse PDF text
    let rawText = '';
    try {
      if (typeof pdfParseModule === 'function') {
        const data = await pdfParseModule(params.buffer);
        rawText = data.text || '';
      } else if (pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse({ data: params.buffer });
        await parser.load();
        const textResult = await parser.getText();
        rawText = typeof textResult === 'string' ? textResult : (textResult?.text || '');
        await parser.destroy();
      }
    } catch {
      // Fallback: extract ASCII string contents from streams
      const bufferStr = params.buffer.toString('binary');
      const textMatches = bufferStr.match(/\(([^()]+)\)\s*Tj/g);
      if (textMatches) {
        rawText = textMatches.map((m) => m.replace(/[()]/g, '').replace('Tj', '').trim()).join(' ');
      }
    }

    if (!rawText || rawText.trim().length < 5) {
      // Scanned PDF or minimal text
      rawText = `Scanned or minimal PDF resume: ${params.originalName}`;
    }

    // 3. AI / Heuristic skill extraction
    const { skills, experienceSummary } = await geminiService.extractSkillsFromResume(rawText);

    // 4. Sanitize file name
    const sanitizedName = params.originalName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 100);

    // 5. Save in database
    return await db.createResume({
      user_id: params.userId,
      file_name: sanitizedName,
      file_size: params.size,
      raw_text: rawText.trim(),
      extracted_skills: skills,
      experience_summary: experienceSummary,
    });
  }
}

export const resumeService = new ResumeService();
