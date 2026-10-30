import { BookChapter } from '../types/bookContent';

export function parseChaptersFromText(rawText: string): BookChapter[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const parsedChapters: BookChapter[] = [];
  let currentChapterTitle = 'Introduction / Muqaddimah';
  let currentChapterArabic = 'المقدمة';
  let currentContentLines: string[] = [];
  let chapterCount = 1;

  const commitChapter = () => {
    if (currentContentLines.length > 0 || parsedChapters.length > 0) {
      parsedChapters.push({
        id: `ch-${Date.now()}-${chapterCount}`,
        number: chapterCount,
        title: currentChapterTitle,
        arabicTitle: currentChapterArabic,
        startPage: (chapterCount - 1) * 15 + 1,
        content: currentContentLines.join('\n').trim(),
        translation: '',
        notes: '',
      });
      chapterCount++;
      currentContentLines = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const isHeader =
      line.startsWith('###') ||
      line.startsWith('##') ||
      line.startsWith('باب') ||
      /^Bab\s+\d+/i.test(line) ||
      /^Chapter\s+\d+/i.test(line);

    if (isHeader) {
      commitChapter();
      const cleanedTitle = line.replace(/^[#\-\*\s]+/, '').trim();
      currentChapterTitle = cleanedTitle;
      currentChapterArabic = line.startsWith('باب') ? cleanedTitle : `الباب ${chapterCount}`;
    } else {
      currentContentLines.push(rawLine);
    }
  }
  commitChapter();

  return parsedChapters;
}
