import sys, pypdf
sys.stdout.reconfigure(encoding='utf-8')
reader = pypdf.PdfReader('Sahih_Bukhari_Arabic_With_Urdu_Translation_(1_To_941)_Part-1.pdf')
for p in range(18, 23):
    t = reader.pages[p].extract_text() or ''
    print(f'=== PAGE {p+1} ===')
    print(t[:600])
    print('-'*40)
