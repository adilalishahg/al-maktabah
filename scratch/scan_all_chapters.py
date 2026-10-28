import sys, pypdf, re
sys.stdout.reconfigure(encoding='utf-8')
reader = pypdf.PdfReader('Sahih_Bukhari_Arabic_With_Urdu_Translation_(1_To_941)_Part-1.pdf')
print('Total pages:', len(reader.pages))

found_chapters = []
for p in range(len(reader.pages)):
    t = reader.pages[p].extract_text() or ''
    # Look for Kitab markers
    for line in t.split('\n'):
        line_clean = line.strip()
        if re.search(r'^(كتاب|کتاب)\s+', line_clean) and len(line_clean) < 50:
            if not any(c['title'] == line_clean for c in found_chapters):
                found_chapters.append({'page': p + 1, 'title': line_clean})

print(f"Total chapters identified across document: {len(found_chapters)}")
for c in found_chapters[:25]:
    print(f"  Page {c['page']}: {c['title']}")

