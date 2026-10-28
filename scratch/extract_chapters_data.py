import sys, pypdf, json
sys.stdout.reconfigure(encoding='utf-8')

reader = pypdf.PdfReader('Sahih_Bukhari_Arabic_With_Urdu_Translation_(1_To_941)_Part-1.pdf')
print('Loaded pages:', len(reader.pages))

# Specific known book boundaries in Sahih Bukhari Part 1
sections = [
    {
        "number": 1,
        "title": "How Divine Revelation Began (Bad' al-Wahy)",
        "arabicTitle": "كتاب بدء الوحى",
        "startPage": 19,
        "endPage": 30
    },
    {
        "number": 2,
        "title": "The Book of Faith (Kitāb al-Īmān)",
        "arabicTitle": "كتاب الإيمان",
        "startPage": 31,
        "endPage": 69
    },
    {
        "number": 3,
        "title": "The Book of Knowledge (Kitāb al-‘Ilm)",
        "arabicTitle": "كتاب العلم",
        "startPage": 70,
        "endPage": 125
    },
    {
        "number": 4,
        "title": "The Book of Ablution (Kitāb al-Wuḍū’)",
        "arabicTitle": "كتاب الوضوء",
        "startPage": 126,
        "endPage": 195
    },
    {
        "number": 5,
        "title": "The Book of Bathing (Kitāb al-Ghusl)",
        "arabicTitle": "كتاب الغسل",
        "startPage": 196,
        "endPage": 221
    },
    {
        "number": 6,
        "title": "The Book of Menses (Kitāb al-Ḥayḍ)",
        "arabicTitle": "كتاب الحيض",
        "startPage": 222,
        "endPage": 247
    },
    {
        "number": 7,
        "title": "The Book of Tayammum (Dry Ablution)",
        "arabicTitle": "كتاب التيمم",
        "startPage": 248,
        "endPage": 367
    },
    {
        "number": 8,
        "title": "Times of the Prayers (Mawāqīt aṣ-Ṣalāh)",
        "arabicTitle": "كتاب مواقيت الصلاة",
        "startPage": 368,
        "endPage": 416
    },
    {
        "number": 9,
        "title": "The Call to Prayer (Kitāb al-Adhān)",
        "arabicTitle": "كتاب الأذان",
        "startPage": 417,
        "endPage": 584
    },
    {
        "number": 10,
        "title": "The Friday Prayer (Kitāb al-Jumu‘ah)",
        "arabicTitle": "كتاب الجمعة",
        "startPage": 585,
        "endPage": 631
    }
]

for s in sections:
    # Extract text from the start page
    idx = s['startPage'] - 1
    t = reader.pages[idx].extract_text() or ''
    # Clean up watermark/url lines
    lines = [l.strip() for l in t.split('\n') if 'islamicurdubooks' not in l and len(l.strip()) > 0]
    
    # Separate Arabic lines and Urdu lines
    arabic_lines = [l for l in lines if any('\u0600' <= c <= '\u06FF' for c in l) and not any(ur in l for ur in ['نے فرمایا', 'کہا کہ', 'ہم کو', 'روایت ہے'])]
    urdu_lines = [l for l in lines if any(ur in l for ur in ['نے فرمایا', 'کہا کہ', 'ہم کو', 'روایت ہے', 'بیان کیا', 'میں بیان'])]
    
    s['content'] = '\n'.join(lines[:12])
    s['translation'] = '\n'.join(urdu_lines[:8]) if urdu_lines else "اردو ترجمہ مع احادیث نبویہ و اسناد متن"
    s['notes'] = f"صحیح بخاری حصہ اول، احادیث ۱ تا ۹۴۱، صفحات {s['startPage']} تا {s['endPage']}۔"

print(json.dumps(sections[:3], ensure_ascii=False, indent=2))

