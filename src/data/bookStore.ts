import { DetailedBook } from '../types/bookContent';
import { BOOKS } from './mockLibrary';

// Initial Seed with structured chapters and full text
export const INITIAL_DETAILED_BOOKS: DetailedBook[] = [
  {
    id: 'bukhari',
    title: 'Ṣaḥīḥ al-Bukhārī',
    arabicTitle: 'صحيح البخاري — الجامع المسند الصحيح',
    author: 'Imām Muḥammad ibn Ismā‘īl al-Bukhārī',
    authorHijriYear: '194 – 256 AH',
    discipline: 'hadith',
    disciplineName: 'Prophetic Traditions (Hadīth)',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU78ZDdbhpH6RbR5aniEC94eIG9XExjaP97ozBeIPo9y_XJR7S31hXfSQJhFYFav8hnmY67pF36_CN431NkDYjDpw6pDMjp17YXAALxEAZVnktHC4eTsP1MIRiP3OlrtjtMxiqZ94mAWZhQzLoMtQUyZ_hXgtNrf2MFWgy1ncBd0R6jrsaaaWcqS7YvXqwwaKiQ0Ev8LsuEuM9bc4UZU-oFtcf_F4hhYs0dNmUFJKCE9YdNM66s0RL',
    description: 'The most authentic compilation of Prophetic traditions, universally accepted by the consensus of Ahl as-Sunnah.',
    pages: 2840,
    sizeMb: 42.4,
    edition: 'Sultaniyyah Recension with Isnad Index',
    volumes: 9,
    verified: true,
    published: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-04-10T12:00:00Z',
    formats: ['PDF', 'EPUB', 'Searchable OCR'],
    chapters: [
      {
        id: 'c1',
        number: 1,
        title: 'How Divine Inspiration Began',
        arabicTitle: 'كتاب بدء الوحي',
        startPage: 1,
        content: `حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ، قَالَ: حَدَّثَنَا سُفْيَانُ، قَالَ: حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الأَنْصَارِيُّ، قَالَ: أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ، أَنَّهُ سَمِعَ عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ، يَقُولُ: سَمِعْتُ عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ عَلَى الْمِنْبَرِ، قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ:

«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ».`,
        translation: `Narrated 'Umar bin Al-Khattab (may Allah be pleased with him): I heard the Messenger of Allah (ﷺ) say: "Actions are but by intention, and every man shall have only that which he intended. Thus he whose migration was for Allah and His Messenger, his migration was for Allah and His Messenger, and he whose migration was for some worldly benefit or for a woman to marry, his migration was for that which he migrated."`,
        notes: `The foundational hadith of Islamic jurisprudence and intention (Ikhlāṣ). Transmitted through Al-Humaydi -> Sufyan -> Yahya -> Muhammad ibn Ibrahim -> 'Alqamah -> 'Umar ibn al-Khattab.`
      },
      {
        id: 'c2',
        number: 2,
        title: 'The Book of Faith (Kitāb al-Īmān)',
        arabicTitle: 'كتاب الإيمان',
        startPage: 14,
        content: `حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مُحَمَّدٍ، قَالَ: حَدَّثَنَا أَبُو عَامِرٍ الْعَقَدِيُّ، قَالَ: حَدَّثَنَا سُلَيْمَانُ بْنُ بِلَالٍ، عَنْ عَبْدِ اللَّهِ بْنِ دِينَارٍ، عَنْ أَبِي صَالِحٍ، عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ:

«الإِيمَانُ بِضْعٌ وَسِتُّونَ شُعْبَةً، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ».`,
        translation: `Narrated Abu Huraira: The Prophet (ﷺ) said, "Faith (Belief) consists of more than sixty branches (i.e. parts). And Haya' (self-respect, modesty, and piety) is a branch of faith."`,
        notes: `Refutation of the Khawarij and Murji'ah doctrines concerning whether faith increases and decreases.`
      },
      {
        id: 'c3',
        number: 3,
        title: 'The Book of Knowledge (Kitāb al-‘Ilm)',
        arabicTitle: 'كتاب العلم',
        startPage: 45,
        content: `حَدَّثَنَا مُحَمَّدُ بْنُ يُوسُفَ، قَالَ: أَخْبَرَنَا إِسْرَاعِيلُ، عَنْ عَوْنِ بْنِ أَبِي جُحَيْفَةَ، عَنْ أَبِيهِ، قَالَ:
«مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ، وَإِنَّمَا الْعِلْمُ بِالتَّعَلُّمِ».`,
        translation: `Narrated by Ibn Abbas: The Prophet (ﷺ) said: "Whomever Allah desires good for, He grants him deep discernment and profound understanding of the Religion."`,
        notes: `Praising the seekers of knowledge and defining the methodological principles of learning.`
      }
    ]
  },
  {
    id: 'riyad',
    title: 'Riyāḍ aṣ-Ṣāliḥīn',
    arabicTitle: 'رياض الصالحين',
    author: 'Imām Yaḥyā ibn Sharaf an-Nawawī',
    authorHijriYear: '631 – 676 AH',
    discipline: 'hadith',
    disciplineName: 'Prophetic Traditions (Hadīth)',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCISINIQlfyVrhPf3ProA9h4V9mk0CB9K3ZWhlvV6oowyetrkMdUblni6ww2l9WV9pwNPW1-FyS3mn_KimHElBNUgBLnXuqL9OFYIBxHO4kSpLnJBfuKCEExyxeIR7OiAaHMxmxPr4iVYIe3EBbdzLb7elwy6w8wem6aW-s1IJQx6i_fSPjGTUFNEG6lScmpr6QxdehqusSO5QQtGv-voqEBs5bAWAbzaK_vomIq_UFJF-rwD_WqvYW',
    description: 'The Gardens of the Righteous, curated with profound moral, ethical, and spiritual traditions.',
    pages: 720,
    sizeMb: 14.8,
    edition: 'Dar al-Minhaj Authenticated Edition',
    volumes: 1,
    verified: true,
    published: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-04-12T10:00:00Z',
    formats: ['PDF', 'EPUB', 'Searchable OCR'],
    chapters: [
      {
        id: 'r1',
        number: 1,
        title: 'Sincerity and Intentions in All Actions',
        arabicTitle: 'باب الإخلاص وإحضار النية في جميع الأعمال',
        startPage: 1,
        content: `قَالَ اللَّهُ تَعَالَى: {وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ وَيُقِيمُوا الصَّلَاةَ وَيُؤْتُوا الزَّكَاةَ وَذَلِكَ دِينُ الْقَيِّمَةِ}.

وَقَالَ تَعَالَى: {لَن يَنَالَ اللَّهَ لُحُومُهَا وَلَا دِمَاؤُهَا وَلَٰكِن يَنَالُهُ التَّقْوَىٰ مِنكُمْ}.

عَنْ أَبِي هُرَيْرَةَ عَبْدِ الرَّحْمَنِ بْنِ صَخْرٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ:
«إِنَّ اللَّهَ لا يَنْظُرُ إِلَى أَجْسَادِكُمْ، وَلا إِلَى صُوَرِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ». رَوَاهُ مُسْلِمٌ.`,
        translation: `Allah the Exalted says: "And they were not commanded except to worship Allah, being sincere to Him in religion, inclining to truth, and to establish prayer and to give zakah. And that is the correct religion." (Al-Bayyinah: 5)
Abu Hurairah narrated that the Messenger of Allah (ﷺ) said: "Verily, Allah does not look at your appearances or your wealth, but rather He looks at your hearts and your deeds."`,
        notes: `Sahih Muslim, Book of Virtue, Hadith 2564.`
      },
      {
        id: 'r2',
        number: 2,
        title: 'The Virtue of Patience (Ṣabr)',
        arabicTitle: 'باب الصبر',
        startPage: 28,
        content: `قَالَ اللَّهُ تَعَالَى: {يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ}.

عَنْ أَبِي مَالِكٍ الْحَارِثِ بْنِ عَاصِمٍ الأَشْعَرِيِّ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ:
«الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآنِ - أَوْ تَمْلأُ - مَا بَيْنَ السَّمَاءِ وَالأَرْضِ، وَالصَّلاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ».`,
        translation: `Abu Malik Al-Ash'ari narrated that the Messenger of Allah (ﷺ) said: "Purity is half of iman (faith). 'Al-hamdu lillah' fills the scale. 'Subhan Allah and al-hamdu lillah' fill that which is between heaven and earth. Prayer is light, charity is a proof, patience is an illumination, and the Qur'an is an argument for you or against you."`,
        notes: `Sahih Muslim, Book of Purification, Hadith 223.`
      }
    ]
  },
  {
    id: 'wasitiyyah',
    title: 'Al-‘Aqīdah al-Wāsiṭiyyah',
    arabicTitle: 'العقيدة الواسطية',
    author: 'Shaykh al-Islām Ibn Taymiyyah',
    authorHijriYear: '661 – 728 AH',
    discipline: 'aqeedah',
    disciplineName: 'Theology & Creed (‘Aqīdah)',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0WUB6utW6xnSsamqnxpH33bvwfdD_bzs0W7mRQvou52ExKN7JkCuRJ_TCmMjipQjFMUg2IA3Fi05zR26m8ehCre60_3sJO3abk1pJ6ohPBRGkcJvK2-OHz0o-zQhvDAaRTp9sAh0i-26g4iy2l8NIpEBYXfqlCy-dkCKE-KssCUclyXU2pByyNNPXsSqQB5_ZTDBeyGCVHnK4G24ID0C-zkiWB6TDXNzJCxaUwyI9YhFCe4wmS1mn',
    description: 'A precise canonical treatise summarizing the foundational creed of the early righteous predecessors (Salaf aṣ-Ṣāliḥ).',
    pages: 180,
    sizeMb: 5.2,
    edition: 'Dar Ibn al-Jawzi Verified Text',
    volumes: 1,
    verified: true,
    published: true,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-04-05T09:00:00Z',
    formats: ['PDF', 'EPUB', 'Searchable OCR'],
    chapters: [
      {
        id: 'w1',
        number: 1,
        title: 'Preamble on the Methodology of the Ahl as-Sunnah',
        arabicTitle: 'مقدمة في أصول مذهب أهل السنة والجماعة',
        startPage: 1,
        content: `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
الْحَمْدُ لِلَّهِ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَى وَدِينِ الْحَقِّ لِيُظْهِرَهُ عَلَى الدِّينِ كُلِّهِ وَكَفَى بِاللَّهِ شَهِيدًا.
أَمَّا بَعْدُ: فَهَذَا اعْتِقَادُ الْفِرْقَةِ النَّاجِيَةِ الْمَنْصُورَةِ إِلَى قِيَامِ السَّاعَةِ: أَهْلِ السُّنَّةِ وَالْجَمَاعَةِ.

وَهُوَ: الإِيمَانُ بِاللَّهِ، وَمَلائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْبَعْثِ بَعْدَ الْمَوْتِ، وَالإِيمَانِ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ.
وَمِنَ الإِيمَانِ بِاللَّهِ: الإِيمَانُ بِمَا وَصَفَ بِهِ نَفْسَهُ فِي كِتَابِهِ الْعَزِيزِ، وَبِمَا وَصَفَهُ بِهِ رَسُولُهُ مُحَمَّدٌ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ؛ مِنْ غَيْرِ تَحْرِيفٍ وَلا تَعْطِيلٍ، وَمِنْ غَيْرِ تَكْيِيفٍ وَلا تَمْثِيلٍ.`,
        translation: `In the name of Allah, the Most Merciful, the Most Gracious. All praise is due to Allah who sent His Messenger with guidance and the religion of truth to make it superior over all religions. This is the creed of the Saved and Victorious Sect until the establishment of the Hour: Ahl as-Sunnah wal-Jama'ah: Faith in Allah, His Angels, His Books, His Messengers, Resurrection after death, and Destiny (Qadar)—its good and its bad.`,
        notes: `Written in 698 AH at the request of a judge from the city of Wasit in Iraq.`
      }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'al_maktabah_books_live_v1';

export function getStoredBooks(): DetailedBook[] {
  if (typeof window === 'undefined') {
    return INITIAL_DETAILED_BOOKS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DETAILED_BOOKS));
      return INITIAL_DETAILED_BOOKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DETAILED_BOOKS;
  } catch (err) {
    return INITIAL_DETAILED_BOOKS;
  }
}

export function saveStoredBooks(books: DetailedBook[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    console.error('Failed to persist books in localStorage:', err);
  }
}

export function saveBook(book: DetailedBook): DetailedBook[] {
  const books = getStoredBooks();
  const existingIdx = books.findIndex((b) => b.id === book.id);
  let updated: DetailedBook[];
  if (existingIdx >= 0) {
    updated = [...books];
    updated[existingIdx] = { ...book, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...book, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...books];
  }
  saveStoredBooks(updated);
  return updated;
}

export function deleteBook(id: string): DetailedBook[] {
  const books = getStoredBooks();
  const updated = books.filter((b) => b.id !== id);
  saveStoredBooks(updated);
  return updated;
}

export function getPublicLibraryBooks(): (import('../types/library').Book)[] {
  const stored = getStoredBooks().filter((b) => b.published !== false);
  const mappedStored: import('../types/library').Book[] = stored.map((b) => ({
    id: b.id,
    title: b.title,
    arabicTitle: b.arabicTitle,
    author: b.author,
    authorHijriYear: b.authorHijriYear || '1445 AH',
    discipline: (b.discipline as import('../types/library').Discipline) || 'hadith',
    disciplineName: b.disciplineName || 'Scholarly Canon',
    disciplineArabic: 'المعارف والعلوم',
    pages: b.pages || 100,
    sizeMb: b.sizeMb || 5.0,
    coverImage: b.coverImage,
    pdfUrl: b.pdfUrl,
    badge: b.disciplineName || 'Critical Edition',
    badgeColor: 'bg-primary-container text-on-primary',
    formats: (b.formats as any) || ['PDF', 'EPUB', 'Searchable OCR'],
    description: b.description || 'Verified classical text preserving sacred Islamic scholarship.',
    verified: b.verified !== false,
    edition: b.edition || 'Academic Critical Edition',
    volumes: b.volumes || 1,
    rating: 4.9,
    readingTimeHours: Math.round((b.pages || 100) / 30),
    canonicalStatus: 'Academic Council Verified Manuscript',
  }));

  // Only return real stored/live books — static mock library is hidden
  return mappedStored;
}

