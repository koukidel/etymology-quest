import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Brain, Trophy, Search, Wand2, Flame, Gem, Puzzle, Map, FileText, Medal, Star, Sparkles, Lock, CheckCircle, Users, Repeat, KeyRound } from "lucide-react";
import * as Tone from 'tone';

// --- データ定義 (ベース：日本語) ---
const CORE_ROOTS = [
    { id: "port", label: "port", meaning: "運ぶ", words: ["transport", "report", "portable", "export", "import"] },
    { id: "spect", label: "spect", meaning: "見る", words: ["inspect", "respect", "prospect", "spectacle"] },
    { id: "mit", label: "mit/mis", meaning: "送る", words: ["submit", "transmit", "mission", "permit"] },
    { id: "scrib", label: "scrib/script", meaning: "書く", words: ["describe", "subscribe", "script", "manuscript"] },
    { id: "dict", label: "dict", meaning: "言う", words: ["predict", "dictate", "contradict", "dictionary"] },
    { id: "gress", label: "gress", meaning: "進む", words: ["progress", "regress", "congress"] },
    { id: "pon", label: "pon/pos", meaning: "置く", words: ["compose", "deposit", "opponent", "position"] },
    { id: "duc", label: "duc/duct", meaning: "導く", words: ["produce", "conduct", "reduce", "educate"] },
    { id: "vis", label: "vis/vid", meaning: "見る", words: ["review", "vision", "invisible", "video"] },
    { id: "rupt", label: "rupt", meaning: "壊す", words: ["erupt", "interrupt", "bankrupt", "disrupt"] },
    { id: "tract", label: "tract", meaning: "引く", words: ["attract", "subtract", "contract", "distract"] },
    { id: "form", label: "form", meaning: "形作る", words: ["inform", "reform", "uniform", "formula"] },
    { id: "struct", label: "struct", meaning: "組み立てる", words: ["construct", "instruct", "structure", "destroy"] },
    { id: "sta", label: "sta/sist", meaning: "立つ", words: ["status", "insist", "resist", "stable"] },
];

const PREFIXES = [
  { id: "tele-", label: "tele-", meaning: "遠い", lang: "ギリシャ語" }, { id: "trans-", label: "trans-", meaning: "横切って", lang: "ラテン語" },
  { id: "in-", label: "in-", meaning: "中に", lang: "ラテン語" }, { id: "in-neg", label: "in-", meaning: "〜でない(否定)", lang: "ラテン語" },
  { id: "re-", label: "re-", meaning: "再び", lang: "ラテン語" }, { id: "pre-", label: "pre-", meaning: "前に", lang: "ラテン語" },
  { id: "sub-", label: "sub-", meaning: "下に", lang: "ラテン語" }, { id: "de-", label: "de-", meaning: "下に、離れて", lang: "ラテン語" },
  { id: "con-", label: "con-", meaning: "共に", lang: "ラテン語" }, { id: "pro-", label: "pro-", meaning: "前へ", lang: "ラテン語" },
  { id: "ex-", label: "ex-", meaning: "外に", lang: "ラテン語" },
];
const ROOTS = [
  { id: "port", label: "port", meaning: "運ぶ", lang: "ラテン語" }, { id: "spect", label: "spect", meaning: "見る", lang: "ラテン語" },
  { id: "phon", label: "phon", meaning: "音", lang: "ギリシャ語" }, { id: "vis", label: "vis/vid", meaning: "見る", lang: "ラテン語" },
  { id: "mit", label: "mit/mis", meaning: "送る", lang: "ラテン語" }, { id: "scrib", label: "scrib/script", meaning: "書く", lang: "ラテン語" },
  { id: "dict", label: "dict", meaning: "言う", lang: "ラテン語" }, { id: "gress", label: "gress", meaning: "進む", lang: "ラテン語" },
  { id: "pon", label: "pon/pos", meaning: "置く", lang: "ラテン語" }, { id: "duc", label: "duc/duct", meaning: "導く", lang: "ラテン語" },
];
const SUFFIXES = [
  { id: "-able", label: "-able", meaning: "〜できる", lang: "ラテン語" }, { id: "-tion", label: "-tion", meaning: "こと", lang: "ラテン語" },
  { id: "-ion", label: "-ion", meaning: "こと(名詞化)", lang: "ラテン語" }, { id: "-or", label: "-or", meaning: "〜する人", lang: "ラテン語" },
];
const WORD_BANK_JA = [
  { word: "transport", parts: ["trans-", "port"], gloss: "横切って運ぶ", meaning: "輸送する", semantic: { parent: "移動" } },
  { word: "report", parts: ["re-", "port"], gloss: "後ろへ運ぶ", meaning: "報告する", semantic: { parent: "報告" } },
  { word: "portable", parts: ["port", "-able"], gloss: "運ぶことができる", meaning: "携帯用の", semantic: { parent: "性質" } },
  { word: "export", parts: ["ex-", "port"], gloss: "外に運ぶ", meaning: "輸出する", semantic: { parent: "貿易" } },
  { word: "import", parts: ["in-", "port"], gloss: "中に運ぶ", meaning: "輸入する", semantic: { parent: "貿易" } },
  { word: "inspect", parts: ["in-", "spect"], gloss: "中を見る", meaning: "検査する", semantic: { parent: "調査" } },
  { word: "respect", parts: ["re-", "spect"], gloss: "再び見る", meaning: "尊敬する", semantic: { parent: "尊敬" } },
  { word: "prospect", parts: ["pro-", "spect"], gloss: "前を見る", meaning: "見込み", semantic: { parent: "予測" } },
  { word: "spectacle", parts: ["spect", "-acle"], gloss: "見るもの", meaning: "光景", semantic: { parent: "出来事" } },
  { word: "submit", parts: ["sub-", "mit"], gloss: "下に送る", meaning: "提出する", semantic: { parent: "行動" } },
  { word: "transmit", parts: ["trans-", "mit"], gloss: "横切って送る", meaning: "送信する", semantic: { parent: "通信" } },
  { word: "mission", parts: ["mis", "-ion"], gloss: "送られたもの", meaning: "任務", semantic: { parent: "仕事" } },
  { word: "permit", parts: ["per-", "mit"], gloss: "通り抜け送る", meaning: "許可する", semantic: { parent: "承認" } },
  { word: "predict", parts: ["pre-", "dict"], gloss: "前に言う", meaning: "予言する", semantic: { parent: "思考" } },
  { word: "review", parts: ["re-", "vis"], gloss: "再び見る", meaning: "見直す", semantic: { parent: "評価" } },
  { word: "telephone", parts: ["tele-", "phon"], gloss: "遠くの音", meaning: "電話", semantic: { parent: "通信" } },
  { word: "vision", parts: ["vis", "-ion"], gloss: "見ること", meaning: "視力、未来像", semantic: { parent: "感覚" } },
  { word: "invisible", parts: ["in-neg", "vis", "-able"], gloss: "見ることができない", meaning: "見えない", semantic: { parent: "状態" } },
  { word: "progress", parts: ["pro-", "gress"], gloss: "前に進む", meaning: "進歩", semantic: { parent: "発展" } },
  { word: "describe", parts: ["de-", "scrib"], gloss: "書き下ろす", meaning: "描写する", semantic: { parent: "表現" } },
  { word: "compose", parts: ["con-", "pon"], gloss: "共に置く", meaning: "構成する", semantic: { parent: "創造" } },
  { word: "produce", parts: ["pro-", "duc"], gloss: "前へ導き出す", meaning: "生産する", semantic: { parent: "生産" } },
];
const LEARNING_PATH_JA = [
    { id: 'level1', title: '「運ぶ」の仲間', icon: 'port', words: ['transport', 'report', 'portable', 'export', 'import'], unlocks: 'level2' },
    { id: 'level2', title: '「見る」の仲間', icon: 'spect', words: ['inspect', 'respect', 'prospect', 'spectacle'], unlocks: 'level3' },
    { id: 'level3', title: '「送る」の仲間', icon: 'mit', words: ['submit', 'transmit', 'mission', 'permit'], unlocks: 'level4' },
    { id: 'level4', title: '「言う」と「見る(vis)」', icon: 'dict', words: ['predict', 'review', 'vision', 'invisible'], unlocks: 'level5' },
    { id: 'level5', title: '「書く」と「進む」', icon: 'scrib', words: ['describe', 'progress'], unlocks: 'level6' },
    { id: 'level6', title: '「置く」と「導く」', icon: 'pon', words: ['compose', 'produce'], unlocks: null },
];
const ACHIEVEMENTS_JA = {
    'first_step': { title: "最初の一歩", description: "最初の1問に正解する", icon: Star, condition: (stats) => stats.totalScore >= 1 },
    'streak_3': { title: "燃える闘魂", description: "3日間連続で学習する", icon: Flame, condition: (stats) => stats.streak >= 3 },
    'level1_clear': { title: "運び屋", description: "レベル1をクリア", icon: Gem, condition: (stats) => stats.completedLevels.includes('level1') },
    'level4_clear': { title: "探求者", description: "レベル4をクリア", icon: Medal, condition: (stats) => stats.completedLevels.includes('level4') },
    'word_master': { title: "語源マスター", description: "全レベルをクリア", icon: Trophy, condition: (stats) => LEARNING_PATH_JA.every(l => stats.completedLevels.includes(l.id)) },
};

// --- 多言語対応データ ---
const translations = {
    ja: {
        appName: "Etymology Quest", nav_path: "パス", nav_puzzle: "パズル", nav_dictionary: "辞書", nav_map: "マップ", nav_story: "ストーリー", nav_stats: "軌跡", nav_core: "コア",
        path_title: "学習パス", path_desc: "レベルをクリアして知識を広げよう", review_title: "苦手克服レッスン", review_desc: "{count}語を復習",
        lesson_progress: "進捗", lesson_back: "パスに戻る",
        complete_title: "レベルクリア！", complete_desc: "{levelTitle}をマスターしました。", complete_mapBtn: "マップで探求", complete_storyBtn: "関連ストーリーを読む", complete_pathBtn: "パスに戻る",
        stats_title: "あなたの軌跡", stats_desc: "学習の進捗を確認しましょう", stats_tab_progress: "進捗", stats_tab_achievements: "実績", stats_tab_leaderboard: "ランキング",
        stats_dailyGoal: "本日の目標", stats_streak: "連続学習日数", stats_totalScore: "総スコア",
        dict_title: "語源データベース", dict_desc: "接頭辞・語根・接尾辞を検索", dict_placeholder: "例: 'port', '運ぶ'",
        core_title: "コア学習", core_desc: "最重要の語源を集中練習",
    },
    en: {
        appName: "Etymology Quest", nav_path: "Path", nav_puzzle: "Puzzle", nav_dictionary: "Dictionary", nav_map: "Map", nav_story: "Story", nav_stats: "Stats", nav_core: "Core",
        path_title: "Learning Path", path_desc: "Clear levels to expand your knowledge.", review_title: "Review Session", review_desc: "Review {count} words",
        lesson_progress: "Progress", lesson_back: "Back to Path",
        complete_title: "Level Cleared!", complete_desc: "You've mastered {levelTitle}.", complete_mapBtn: "Explore on Map", complete_storyBtn: "Read Related Story", complete_pathBtn: "Back to Path",
        stats_title: "Your Stats", stats_desc: "Track your learning progress.", stats_tab_progress: "Progress", stats_tab_achievements: "Achievements", stats_tab_leaderboard: "Leaderboard",
        stats_dailyGoal: "Daily Goal", stats_streak: "Day Streak", stats_totalScore: "Total Score",
        dict_title: "Etymology Database", dict_desc: "Search prefixes, roots, and suffixes.", dict_placeholder: "e.g., 'port', 'carry'",
        core_title: "Core Learning", core_desc: "Focus on the most important roots.",
    }
};

const ALL_PARTS = {
    ja: { prefixes: PREFIXES, roots: ROOTS, suffixes: SUFFIXES },
    en: {
        prefixes: [
          { id: "tele-", label: "tele-", meaning: "far", lang: "Greek" }, { id: "trans-", label: "trans-", meaning: "across", lang: "Latin" },
          { id: "in-", label: "in-", meaning: "in, into", lang: "Latin" }, { id: "in-neg", label: "in-", meaning: "not", lang: "Latin" },
          { id: "re-", label: "re-", meaning: "again", lang: "Latin" }, { id: "pre-", label: "pre-", meaning: "before", lang: "Latin" },
          { id: "sub-", label: "sub-", meaning: "under", lang: "Latin" }, { id: "de-", label: "de-", meaning: "down, away", lang: "Latin" },
          { id: "con-", label: "con-", meaning: "with, together", lang: "Latin" }, { id: "pro-", label: "pro-", meaning: "forward", lang: "Latin" },
          { id: "ex-", label: "ex-", meaning: "out", lang: "Latin" },
        ],
        roots: [
          { id: "port", label: "port", meaning: "to carry", lang: "Latin" }, { id: "spect", label: "spect", meaning: "to look", lang: "Latin" },
          { id: "phon", label: "phon", meaning: "sound", lang: "Greek" }, { id: "vis", label: "vis/vid", meaning: "to see", lang: "Latin" },
          { id: "mit", label: "mit/mis", meaning: "to send", lang: "Latin" }, { id: "scrib", label: "scrib/script", meaning: "to write", lang: "Latin" },
          { id: "dict", label: "dict", meaning: "to say", lang: "Latin" }, { id: "gress", label: "gress", meaning: "to go", lang: "Latin" },
          { id: "pon", label: "pon/pos", meaning: "to place", lang: "Latin" }, { id: "duc", label: "duc/duct", meaning: "to lead", lang: "Latin" },
        ],
        suffixes: [
          { id: "-able", label: "-able", meaning: "able to be", lang: "Latin" }, { id: "-tion", label: "-tion", meaning: "act of", lang: "Latin" },
          { id: "-ion", label: "-ion", meaning: "act of (noun)", lang: "Latin" }, { id: "-or", label: "-or", meaning: "one who", lang: "Latin" },
        ]
    }
};

const WORD_BANK = {
    ja: WORD_BANK_JA,
    en: [
      { word: "transport", parts: ["trans-", "port"], gloss: "to carry across", meaning: "to transport", semantic: { parent: "Movement" } },
      { word: "report", parts: ["re-", "port"], gloss: "to carry again (back)", meaning: "to report", semantic: { parent: "Reporting" } },
      { word: "portable", parts: ["port", "-able"], gloss: "able to be carried", meaning: "portable", semantic: { parent: "Quality" } },
      { word: "export", parts: ["ex-", "port"], gloss: "to carry out", meaning: "to export", semantic: { parent: "Trade" } },
      { word: "inspect", parts: ["in-", "spect"], gloss: "to look into", meaning: "to inspect", semantic: { parent: "Investigation" } },
      { word: "respect", parts: ["re-", "spect"], gloss: "to look again (at)", meaning: "to respect", semantic: { parent: "Esteem" } },
      { word: "predict", parts: ["pre-", "dict"], gloss: "to say before", meaning: "to predict", semantic: { parent: "Thinking" } },
      { word: "submit", parts: ["sub-", "mit"], gloss: "to send under", meaning: "to submit", semantic: { parent: "Action" } },
      { word: "review", parts: ["re-", "vis"], gloss: "to see again", meaning: "to review", semantic: { parent: "Evaluation" } },
      { word: "telephone", parts: ["tele-", "phon"], gloss: "far sound", meaning: "telephone", semantic: { parent: "Communication" } },
      { word: "vision", parts: ["vis", "-ion"], gloss: "act of seeing", meaning: "vision", semantic: { parent: "Sense" } },
      { word: "invisible", parts: ["in-neg", "vis", "-able"], gloss: "not able to be seen", meaning: "invisible", semantic: { parent: "State" } },
      { word: "progress", parts: ["pro-", "gress"], gloss: "to go forward", meaning: "progress", semantic: { parent: "Development" } },
      { word: "describe", parts: ["de-", "scrib"], gloss: "to write down", meaning: "to describe", semantic: { parent: "Expression" } },
      { word: "compose", parts: ["con-", "pon"], gloss: "to place together", meaning: "to compose", semantic: { parent: "Creation" } },
      { word: "produce", parts: ["pro-", "duc"], gloss: "to lead forward", meaning: "to produce", semantic: { parent: "Production" } },
    ]
};

const LEARNING_PATH = {
    ja: LEARNING_PATH_JA,
    en: [
      { id: 'level1', title: 'The "Carry" Group', icon: 'port', words: ['transport', 'report', 'portable', 'export', 'import'], unlocks: 'level2' },
      { id: 'level2', title: 'The "Look" Group', icon: 'spect', words: ['inspect', 'respect', 'prospect', 'spectacle'], unlocks: 'level3' },
      { id: 'level3', title: 'The "Send" Group', icon: 'mit', words: ['submit', 'transmit', 'mission', 'permit'], unlocks: 'level4' },
      { id: 'level4', title: '"Say" and "See"', icon: 'dict', words: ['predict', 'review', 'vision', 'invisible'], unlocks: 'level5' },
      { id: 'level5', title: '"Write" and "Go"', icon: 'scrib', words: ['describe', 'progress'], unlocks: 'level6' },
      { id: 'level6', title: '"Place" and "Lead"', icon: 'pon', words: ['compose', 'produce'], unlocks: null },
    ]
};

const ACHIEVEMENTS = {
    ja: ACHIEVEMENTS_JA,
    en: {
        'first_step': { title: "First Step", description: "Answer your first question", icon: Star, condition: (stats) => stats.totalScore >= 1 },
        'streak_3': { title: "On Fire!", description: "Maintain a 3-day streak", icon: Flame, condition: (stats) => stats.streak >= 3 },
        'level1_clear': { title: "Porter", description: "Clear Level 1", icon: Gem, condition: (stats) => stats.completedLevels.includes('level1') },
        'level4_clear': { title: "Explorer", description: "Clear Level 4", icon: Medal, condition: (stats) => stats.completedLevels.includes('level4') },
        'word_master': { title: "Etymology Master", description: "Clear all levels", icon: Trophy, condition: (stats) => LEARNING_PATH.en.every(l => stats.completedLevels.includes(l.id)) },
    }
};

// --- 言語コンテキスト ---
const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useLocalStorage('etymology-lang', 'ja');
    
    const t = (key, params = {}) => {
        let text = translations[language]?.[key] || key;
        Object.keys(params).forEach(pKey => {
            text = text.replace(`{${pKey}}`, params[pKey]);
        });
        return text;
    };
    
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

const useLanguage = () => useContext(LanguageContext);

// --- ユーティリティ & クイズ生成ロジック ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) { return initialValue; }
  });
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) { console.log(error); }
  };
  return [storedValue, setValue];
}
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

const useSounds = () => {
    const sounds = useRef(null);
    useEffect(() => {
        const initTone = async () => {
            await Tone.start();
            sounds.current = {
                correct: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } }).toDestination(),
                incorrect: new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination(),
                click: new Tone.MembraneSynth({ pitchDecay: 0.008, octaves: 2, envelope: { attack: 0.0006, decay: 0.2, sustain: 0 } }).toDestination(),
            };
        }
        initTone();
    }, []);
    const playCorrect = () => sounds.current?.correct.triggerAttackRelease("C5", "8n", Tone.now());
    const playIncorrect = () => sounds.current?.incorrect.triggerAttackRelease("C3", "8n", Tone.now());
    const playClick = () => sounds.current?.click.triggerAttackRelease("C2", "8n", Tone.now());
    return { playCorrect, playIncorrect, playClick };
};

// --- UIコンポーネント ---
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-4 sm:p-6 border-b border-slate-200">{children}</div>;
const CardTitle = ({ children }) => <h2 className="text-lg sm:text-xl font-bold text-slate-800">{children}</h2>;
const CardDescription = ({ children }) => <p className="text-sm text-slate-500 mt-1">{children}</p>;
const CardContent = ({ children, className = "" }) => <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
const Button = ({ children, onClick, className = "", disabled = false }) => (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled} className={`w-full text-center px-4 py-3 rounded-lg font-semibold border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </motion.button>
);
const Input = (props) => <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" {...props} />;
const Badge = ({ children }) => <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">{children}</span>;
const Progress = ({ value }) => <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${value}%` }}></div></div>;
const Loader = () => <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

// --- ページコンポーネント ---
const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 0.98, y: -10 },
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

const PathPage = ({ stats, onLevelSelect, playClick }) => {
    const { language, t } = useLanguage();
    const reviewThreshold = 3;
    const hasReviewItems = stats.weakWords.length >= reviewThreshold;

    const reviewLevel = {
        id: 'review',
        title: t('review_title'),
        icon: 'Repeat',
        words: stats.weakWords,
    };

    return (
        <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Brain size={22} />{t('path_title')}</CardTitle>
                    <CardDescription>{t('path_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {hasReviewItems && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { playClick(); onLevelSelect(reviewLevel); }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all border-purple-500 bg-purple-50 hover:bg-purple-100"
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500">
                                    <Repeat size={28} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{reviewLevel.title}</h3>
                                    <p className="text-sm text-slate-500">{t('review_desc', {count: stats.weakWords.length})}</p>
                                </div>
                            </motion.button>
                        </motion.div>
                    )}
                    {LEARNING_PATH[language].map((level, index) => {
                        const isUnlocked = index === 0 || stats.completedLevels.includes(LEARNING_PATH[language][index - 1].id);
                        const isCompleted = stats.completedLevels.includes(level.id);
                        return (
                            <motion.div key={level.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index + (hasReviewItems ? 1 : 0)) * 0.1 }}>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { if(isUnlocked) { playClick(); onLevelSelect(level); } }}
                                    disabled={!isUnlocked}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50"
                                    style={{
                                        borderColor: isUnlocked ? (isCompleted ? '#22c55e' : '#3b82f6') : '#e2e8f0',
                                        backgroundColor: isUnlocked ? (isCompleted ? '#f0fdf4' : 'white') : '#f8fafc',
                                    }}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? (isCompleted ? 'bg-green-500' : 'bg-blue-500') : 'bg-slate-300'}`}>
                                        {isCompleted ? <CheckCircle size={28} className="text-white" /> : isUnlocked ? <span className="text-white font-bold text-lg">{index + 1}</span> : <Lock size={24} className="text-slate-500" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{level.title}</h3>
                                        <p className="text-sm text-slate-500">{language === 'ja' ? '語根' : 'Root'}: {level.icon}</p>
                                    </div>
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const LessonPage = ({ level, onComplete, onCorrectAnswer, onIncorrectAnswer, onExit, sounds }) => {
    const { language, t } = useLanguage();
    const lessonWords = useMemo(() => WORD_BANK[language].filter(w => level.words.includes(w.word)), [level, language]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const questionsNeeded = level.id === 'review' ? level.words.length : 3;

    const generateQuestion = () => {
        const targetWord = lessonWords[questionIndex % lessonWords.length];
        const distractors = shuffle(WORD_BANK[language].filter(w => w.word !== targetWord.word)).slice(0, 2).map(w => w.word);
        const options = shuffle([targetWord.word, ...distractors]);
        const prompt = language === 'ja' ? `「${targetWord.meaning}」を意味する単語は？` : `What word means "${targetWord.meaning}"?`;
        setQuiz({ prompt, options, answer: targetWord.word, explanation: `語源: ${targetWord.gloss}` });
    };

    useEffect(() => {
        generateQuestion();
    }, [questionIndex, language]);

    const handleAnswer = (option) => {
        if (feedback) return;
        if (option === quiz.answer) {
            sounds.playCorrect();
            setFeedback({ correct: true, text: language === 'ja' ? "正解！" : "Correct!" });
            onCorrectAnswer('quest');
            setCorrectAnswers(c => c + 1);
            setTimeout(() => {
                if (correctAnswers + 1 >= questionsNeeded) {
                    onComplete(level);
                } else {
                    setQuestionIndex(i => i + 1);
                    setFeedback(null);
                }
            }, 1500);
        } else {
            sounds.playIncorrect();
            setFeedback({ correct: false, text: language === 'ja' ? "不正解..." : "Incorrect..." });
            onIncorrectAnswer(quiz.answer);
            setTimeout(() => setFeedback(null), 1200);
        }
    };

    if (!quiz) return null;

    return (
        <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle>{level.title}</CardTitle>
                    <Progress value={(correctAnswers / questionsNeeded) * 100} />
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center">
                    <p className="text-center text-lg font-semibold mb-6 h-12 flex items-center justify-center">{quiz.prompt}</p>
                    <div className="space-y-3">{quiz.options.map(option => <Button key={option} onClick={() => handleAnswer(option)} className="bg-white border-slate-300 hover:bg-slate-50 text-slate-800">{option}</Button>)}</div>
                    <div className="h-12 mt-4 text-center">
                        <AnimatePresence>
                            {feedback && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`font-bold ${feedback.correct ? "text-green-600" : "text-red-600"}`}>{feedback.text} {feedback.correct && quiz.explanation}</motion.p>}
                        </AnimatePresence>
                    </div>
                </CardContent>
                <div className="p-4"><Button onClick={onExit} className="bg-slate-200 text-slate-700">{t('lesson_back')}</Button></div>
            </Card>
        </motion.div>
    );
};

const LessonCompletePage = ({ level, onNavigate }) => {
    const { t } = useLanguage();
    return (
        <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
            <Card className="h-full flex flex-col items-center justify-center text-center">
                <CardContent className="space-y-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                        <CheckCircle size={64} className="text-green-500 mx-auto" />
                    </motion.div>
                    <h2 className="text-2xl font-bold">{t('complete_title')}</h2>
                    <p className="text-slate-500">{t('complete_desc', {levelTitle: level.title})}</p>
                    <div className="pt-4 space-y-3">
                        <Button onClick={() => onNavigate({ page: 'map', word: level.words[0] })} className="bg-blue-500 text-white hover:bg-blue-600">{t('complete_mapBtn')}</Button>
                        <Button onClick={() => onNavigate({ page: 'story', level: level })} className="bg-purple-500 text-white hover:bg-purple-600">{t('complete_storyBtn')}</Button>
                        <Button onClick={() => onNavigate({ page: 'path' })} className="bg-slate-200 text-slate-700 hover:bg-slate-300">{t('complete_pathBtn')}</Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const DailyPuzzlePage = ({ onCorrectAnswer, sounds }) => {
  const { language } = useLanguage();
  const getDailyPuzzle = () => { const dayIndex = new Date().getDate() % WORD_BANK[language].length; return WORD_BANK[language][dayIndex]; };
  const [puzzle, setPuzzle] = useState(getDailyPuzzle());
  const [sourceBlocks, setSourceBlocks] = useState([]);
  const [targetBlocks, setTargetBlocks] = useState([]);
  const [feedback, setFeedback] = useState(null);
  useEffect(() => { setSourceBlocks(shuffle([...puzzle.parts])); setTargetBlocks([]); setFeedback(null); }, [puzzle, language]);
  const handleBlockClick = (block, from) => {
    sounds.playClick();
    if (feedback?.correct) return;
    if (from === 'source') {
      setSourceBlocks(sourceBlocks.filter(b => b !== block));
      setTargetBlocks([...targetBlocks, block]);
    } else {
      setTargetBlocks(targetBlocks.filter(b => b !== block));
      setSourceBlocks([...sourceBlocks, block]);
    }
  };
  const checkAnswer = () => {
    if (targetBlocks.join('') === puzzle.parts.join('')) {
      sounds.playCorrect();
      setFeedback({ correct: true, text: "完成！" });
      onCorrectAnswer('puzzle');
    } else {
      sounds.playIncorrect();
      setFeedback({ correct: false, text: "順番が違うようです" });
      setTimeout(() => setFeedback(null), 1500);
    }
  };
  return (
    <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
      <Card className="flex flex-col h-full">
        <CardHeader><CardTitle className="flex items-center gap-2"><Puzzle size={22} />デイリーパズル</CardTitle><CardDescription>語源ブロックを並べて単語を作ろう</CardDescription></CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div>
            <p className="text-center text-slate-600 mb-2">意味: 「{puzzle.meaning}」</p>
            <div className="h-20 p-2 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-1 bg-slate-50 mb-4">
              {targetBlocks.map(block => <motion.div layoutId={block} key={block} onClick={() => handleBlockClick(block, 'target')} className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer font-semibold shadow-md">{block}</motion.div>)}
            </div>
            <div className="h-20 flex items-center justify-center gap-2 flex-wrap">
              {sourceBlocks.map(block => <motion.div layoutId={block} key={block} onClick={() => handleBlockClick(block, 'source')} className="px-4 py-2 bg-white border border-slate-300 rounded-md cursor-pointer font-semibold shadow-sm">{block}</motion.div>)}
            </div>
          </div>
          <div className="mt-6">
             {feedback && <p className={`text-center mb-2 font-bold ${feedback.correct ? "text-green-600" : "text-red-600"}`}>{feedback.text}</p>}
            <Button onClick={checkAnswer} disabled={feedback?.correct} className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-green-600">提出</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
const DictionaryPage = ({ playClick }) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const currentParts = useMemo(() => [...ALL_PARTS[language].prefixes, ...ALL_PARTS[language].roots, ...ALL_PARTS[language].suffixes], [language]);
  const filteredParts = useMemo(() => searchTerm ? currentParts.filter(p => p.label.toLowerCase().includes(searchTerm.toLowerCase()) || p.meaning.toLowerCase().includes(searchTerm.toLowerCase())) : [], [searchTerm, currentParts]);
  return (
    <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
      <Card className="flex flex-col h-full">
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen size={22} />{t('dict_title')}</CardTitle><CardDescription>{t('dict_desc')}</CardDescription></CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input placeholder={t('dict_placeholder')} className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex-grow space-y-3 overflow-y-auto pr-2">
            {!searchTerm && <p className="text-center text-slate-500 pt-8">{language === 'ja' ? '検索語を入力してください' : 'Please enter a search term'}</p>}
            {searchTerm && filteredParts.length === 0 && <p className="text-center text-slate-500 pt-8">{language === 'ja' ? '見つかりませんでした。' : 'Not found.'}</p>}
            {filteredParts.map(part => <div key={part.id} className="p-3 border rounded-lg bg-slate-50/50"><div className="flex justify-between items-start"><div><h4 className="font-bold text-slate-800">{part.label}</h4><p className="text-sm text-slate-600">{part.meaning}</p></div><Badge>{part.lang}</Badge></div></div>)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
const EtymologyTreePage = ({ initialWord, playClick }) => {
    const { language } = useLanguage();
    const [selectedWord, setSelectedWord] = useState(initialWord || WORD_BANK[language][0]);
    const [expandedParts, setExpandedParts] = useState([]);
    
    useEffect(() => {
        if (initialWord) {
            setSelectedWord(initialWord);
        } else {
            setSelectedWord(WORD_BANK[language][0]);
        }
        setExpandedParts([]);
    }, [initialWord, language]);

    const togglePartExpansion = (partId) => {
        playClick();
        setExpandedParts(prev => prev.includes(partId) ? prev.filter(p => p !== partId) : [...prev, partId]);
    };
    const getRelatedWords = (partId) => WORD_BANK[language].filter(w => w.word !== selectedWord.word && w.parts.includes(partId));
    const Node = ({ label, type, onClick, isExpanded = false }) => (
        <motion.div layout whileTap={{ scale: 0.95 }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
            className={`px-3 py-1.5 rounded-lg shadow-md cursor-pointer text-center font-semibold text-sm transition-all ${
                type === 'word' ? 'bg-blue-500 text-white' : type === 'part' ? (isExpanded ? 'bg-amber-400 text-white' : 'bg-amber-200 text-amber-800') : 'bg-slate-200 text-slate-700'}`}
            onClick={onClick}>
            {label}
        </motion.div>
    );
    return (
        <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
            <Card className="h-full flex flex-col">
                <CardHeader><CardTitle className="flex items-center gap-2"><Map size={22} />語源ツリー</CardTitle><CardDescription>単語のつながりを視覚的に探求しよう</CardDescription></CardHeader>
                <CardContent className="flex-grow overflow-auto p-4 space-y-4">
                    <div className="flex flex-col items-center space-y-8 pt-4">
                        <Node label={selectedWord.word} type="word" />
                        <div className="flex justify-center gap-4 md:gap-8">
                            {selectedWord.parts.map(partId => {
                                const isExpanded = expandedParts.includes(partId);
                                const relatedWords = getRelatedWords(partId);
                                return (
                                    <div key={partId} className="flex flex-col items-center space-y-4 relative">
                                        <div className="absolute top-[-2rem] h-8 w-px bg-slate-300"></div>
                                        <Node label={partId} type="part" isExpanded={isExpanded} onClick={() => togglePartExpansion(partId)} />
                                        <AnimatePresence>
                                        {isExpanded && relatedWords.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center space-y-4">
                                                {relatedWords.map(relWord => (
                                                    <div key={relWord.word} className="flex flex-col items-center relative">
                                                         <div className="absolute top-[-1rem] h-4 w-px bg-slate-300"></div>
                                                         <Node label={relWord.word} type="related" onClick={() => { playClick(); setSelectedWord(relWord); setExpandedParts([]); }} />
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
const StatsPage = ({ stats }) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('progress');

  const leaderboardData = useMemo(() => {
      const otherUsers = [
          { name: 'Alex', score: 1250 }, { name: 'Yuki', score: 1100 }, { name: 'Maria', score: 980 },
          { name: 'Chen', score: 850 }, { name: 'Leo', score: 720 }, { name: 'Zoe', score: 600 },
          { name: 'Kenji', score: 450 }, { name: 'Isla', score: 300 }, { name: 'Omar', score: 150 },
      ];
      const allUsers = [...otherUsers, { name: language === 'ja' ? 'あなた' : 'You', score: stats.totalScore }];
      return allUsers.sort((a, b) => b.score - a.score);
  }, [stats.totalScore, language]);

  return (
    <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy size={22} />{t('stats_title')}</CardTitle>
              <div className="mt-4 border-b">
                  <nav className="-mb-px flex space-x-6">
                      <button onClick={() => setActiveTab('progress')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'progress' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>{t('stats_tab_progress')}</button>
                      <button onClick={() => setActiveTab('achievements')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'achievements' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>{t('stats_tab_achievements')}</button>
                      <button onClick={() => setActiveTab('leaderboard')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaderboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>{t('stats_tab_leaderboard')}</button>
                  </nav>
              </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            {activeTab === 'progress' && (
              <div className="space-y-8 pt-2">
                 <div>
                    <div className="flex justify-between items-center mb-2 text-sm font-medium text-slate-600"><p>{t('stats_dailyGoal')}</p><p>{stats.score} / 10</p></div>
                    <Progress value={(stats.score / 10) * 100} />
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-slate-50 rounded-lg"><p className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-800"><Flame className="text-orange-500" /> {stats.streak}</p><p className="text-xs text-slate-500 font-medium">{t('stats_streak')}</p></div>
                    <div className="p-4 bg-slate-50 rounded-lg"><p className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-800"><Gem className="text-sky-500" /> {stats.totalScore}</p><p className="text-xs text-slate-500 font-medium">{t('stats_totalScore')}</p></div>
                 </div>
              </div>
            )}
            {activeTab === 'achievements' && (
              <div className="grid grid-cols-3 gap-4 pt-2">
                  {Object.entries(ACHIEVEMENTS[language]).map(([key, ach]) => {
                      const unlocked = stats.unlockedAchievements.includes(key);
                      const Icon = ach.icon;
                      return (
                          <div key={key} className={`flex flex-col items-center text-center p-2 rounded-lg ${unlocked ? 'bg-amber-50' : 'bg-slate-50'}`}>
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${unlocked ? 'bg-amber-400' : 'bg-slate-200'}`}>
                                  <Icon size={32} className={unlocked ? 'text-white' : 'text-slate-400'}/>
                              </div>
                              <h4 className="text-xs font-bold mt-2">{ach.title}</h4>
                              <p className={`text-xs ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}>{unlocked ? ach.description : '???'}</p>
                          </div>
                      );
                  })}
              </div>
            )}
            {activeTab === 'leaderboard' && (
                <div className="space-y-2 pt-2">
                    {leaderboardData.map((user, index) => (
                        <div key={user.name} className={`flex items-center p-3 rounded-lg ${user.name === (language === 'ja' ? 'あなた' : 'You') ? 'bg-blue-50 border-2 border-blue-400' : 'bg-slate-50'}`}>
                            <div className="w-8 text-center font-bold text-slate-500">{index + 1}</div>
                            <div className="flex-grow font-semibold text-slate-800">{user.name}</div>
                            <div className="font-bold text-blue-600">{user.score} XP</div>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
    </motion.div>
  );
};
const StoryPage = ({ level }) => {
    const { language } = useLanguage();
    const [generatedStory, setGeneratedStory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [wordHint, setWordHint] = useState(null);
    const [keywords, setKeywords] = useState([]);
    
    const generateStory = async () => {
        setIsLoading(true);
        setGeneratedStory(null);
        setWordHint(null);

        const selectedKeywords = level ? level.words : shuffle([...WORD_BANK[language]]).slice(0, 3).map(w => w.word);
        setKeywords(selectedKeywords);

        const prompt = `「${level ? level.title : 'ランダム'}」をテーマにした、英語学習者向けの短い物語を創作してください。物語には、必ず以下の単語を自然な形で含めてください: ${selectedKeywords.join(', ')}。物語は150語程度の英語で記述し、物語の本文のみを返してください。`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
            });
            if (!response.ok) throw new Error('Text generation failed');
            const result = await response.json();
            const storyText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!storyText) throw new Error('No story text received');
            setGeneratedStory(storyText);
        } catch (error) {
            console.error("Story generation error:", error);
            setGeneratedStory("エラーが発生しました。時間をおいて再度お試しください。");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        generateStory();
    }, [level, language]);

    const parseContent = (content) => {
        if (!content) return "";
        const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
        return content.split(regex).map((part, index) => {
            if (keywords.some(kw => kw.toLowerCase() === part.toLowerCase())) {
                return <strong key={index} className="font-bold text-blue-600 cursor-pointer" onClick={() => showHint(part.toLowerCase())}>{part}</strong>;
            }
            return part;
        });
    };
    
    const showHint = (word) => {
        const wordData = WORD_BANK[language].find(w => w.word === word);
        if (wordData) setWordHint(`${wordData.word}: ${wordData.gloss} (${wordData.parts.join(' + ')})`);
    };
    
    return (
        <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
            <Card className="h-full flex flex-col">
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles size={22} className="text-purple-500"/>AIストーリー</CardTitle><CardDescription>{level ? `テーマ: ${level.title}` : "今日の物語"}</CardDescription></CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    {isLoading ? <Loader /> : <p className="text-slate-700 leading-relaxed">{parseContent(generatedStory)}</p>}
                </CardContent>
                <div className="p-4 border-t">
                    {wordHint ? <p className="text-sm text-center text-blue-700 font-semibold">{wordHint}</p> : <p className="text-sm text-center text-slate-400">太字の単語をタップしてヒントを表示</p>}
                </div>
            </Card>
        </motion.div>
    );
};

const CoreRootsPage = ({ onLevelSelect, playClick }) => {
    const { language, t } = useLanguage();
    return (
        <motion.div variants={pageVariants} transition={pageTransition} initial="initial" animate="in" exit="out" className="p-4 h-full">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gem size={22} />{t('core_title')}</CardTitle>
                    <CardDescription>{t('core_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {CORE_ROOTS.map(root => (
                        <motion.button
                            key={root.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                playClick();
                                onLevelSelect({ id: `core-${root.id}`, title: `${language === 'ja' ? 'コア' : 'Core'}: ${root.label}`, words: root.words });
                            }}
                            className="p-4 rounded-lg border-2 text-center bg-white hover:bg-slate-50"
                        >
                            <h3 className="font-bold text-lg text-blue-600">{root.label}</h3>
                            <p className="text-sm text-slate-500">{root.meaning}</p>
                        </motion.button>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    );
};

// --- メインのAppコンポーネント ---
const AppContent = () => {
  const [viewState, setViewState] = useState({ page: 'path' });
  const [stats, setStats] = useLocalStorage("etymology-app-stats-v12", { score: 0, totalScore: 0, streak: 0, lastPlayed: null, unlockedAchievements: [], puzzlesSolved: 0, completedLevels: [], weakWords: [] });
  const sounds = useSounds();
  const { language, setLanguage, t } = useLanguage();

  const checkAchievements = (newStats) => {
    const newlyUnlocked = [];
    for (const key in ACHIEVEMENTS[language]) {
        if (!newStats.unlockedAchievements.includes(key) && ACHIEVEMENTS[language][key].condition(newStats)) {
            newlyUnlocked.push(key);
        }
    }
    if (newlyUnlocked.length > 0) {
        setStats(prev => ({ ...prev, unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked] }));
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    let newStats = { ...stats };
    if (stats.lastPlayed !== today) {
        newStats = { ...newStats, score: 0, streak: stats.lastPlayed === yesterday ? stats.streak + 1 : 1 };
        setStats(newStats);
    }
    checkAchievements(newStats);
  }, []);

  const handleCorrectAnswer = (type) => {
    const today = new Date().toISOString().slice(0, 10);
    const newStats = {
        ...stats,
        score: stats.score + 1,
        totalScore: stats.totalScore + 1,
        lastPlayed: today,
        puzzlesSolved: type === 'puzzle' ? (stats.puzzlesSolved || 0) + 1 : stats.puzzlesSolved,
    };
    setStats(newStats);
    checkAchievements(newStats);
  };
  
  const handleIncorrectAnswer = (word) => {
      setStats(prev => {
          if (prev.weakWords.includes(word)) return prev;
          return { ...prev, weakWords: [...prev.weakWords, word] };
      });
  };

  const handleLevelComplete = (level) => {
      if (level.id === 'review') {
          setStats(prev => ({ ...prev, weakWords: [] }));
      } else if (!stats.completedLevels.includes(level.id)) {
          const newStats = { ...stats, completedLevels: [...stats.completedLevels, level.id] };
          setStats(newStats);
          checkAchievements(newStats);
      }
      setViewState({ page: 'lessonComplete', level: level });
  };

  const NavItem = ({ page, labelKey, icon: Icon }) => {
    const isActive = viewState.page === page;
    return (
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => { sounds.playClick(); setViewState({ page: page }); }} className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors duration-200 ${isActive ? "text-blue-600" : "text-slate-500 hover:bg-slate-100"}`}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <p className={`text-xs font-bold`}>{t(labelKey)}</p>
      </motion.button>
    );
  };
  
  const renderPage = () => {
      switch (viewState.page) {
          case 'path': return <PathPage key="path" stats={stats} onLevelSelect={(level) => setViewState({ page: 'lesson', level: level })} playClick={sounds.playClick} />;
          case 'lesson': return <LessonPage key="lesson" level={viewState.level} onComplete={handleLevelComplete} onCorrectAnswer={handleCorrectAnswer} onIncorrectAnswer={handleIncorrectAnswer} onExit={() => setViewState({ page: 'path' })} sounds={sounds} />;
          case 'lessonComplete': return <LessonCompletePage key="lessonComplete" level={viewState.level} onNavigate={setViewState} />;
          case 'core': return <CoreRootsPage key="core" onLevelSelect={(level) => setViewState({ page: 'lesson', level: level })} playClick={sounds.playClick} />;
          case 'puzzle': return <DailyPuzzlePage key="puzzle" onCorrectAnswer={handleCorrectAnswer} sounds={sounds} />;
          case 'dictionary': return <DictionaryPage key="dictionary" playClick={sounds.playClick} />;
          case 'map': return <EtymologyTreePage key="map" initialWord={WORD_BANK[language].find(w => w.word === viewState.word)} playClick={sounds.playClick} />;
          case 'story': return <StoryPage key="story" level={viewState.level} />;
          case 'stats': return <StatsPage key="stats" stats={stats} />;
          default: return <PathPage key="path" stats={stats} onLevelSelect={(level) => setViewState({ page: 'lesson', level: level })} playClick={sounds.playClick} />;
      }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans max-w-md mx-auto shadow-2xl">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-slate-200 shrink-0">
        <h1 className="text-lg font-bold flex items-center justify-center gap-2 text-slate-800"><Wand2 size={20} className="text-blue-600"/> {t('appName')}</h1>
        <div className="flex items-center space-x-2">
            <span className={`text-sm font-semibold ${language === 'ja' ? 'text-blue-600' : 'text-slate-400'}`}>JA</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={language === 'en'} onChange={() => setLanguage(lang => lang === 'ja' ? 'en' : 'ja')} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className={`text-sm font-semibold ${language === 'en' ? 'text-blue-600' : 'text-slate-400'}`}>EN</span>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      <footer className="grid grid-cols-7 gap-1 border-t border-slate-200 bg-white/80 backdrop-blur-sm px-1 py-1.5 shrink-0">
        <NavItem page="path" labelKey="nav_path" icon={Brain} />
        <NavItem page="core" labelKey="nav_core" icon={Gem} />
        <NavItem page="puzzle" labelKey="nav_puzzle" icon={Puzzle} />
        <NavItem page="dictionary" labelKey="nav_dictionary" icon={BookOpen} />
        <NavItem page="map" labelKey="nav_map" icon={Map} />
        <NavItem page="story" labelKey="nav_story" icon={FileText} />
        <NavItem page="stats" labelKey="nav_stats" icon={Trophy} />
      </footer>
    </div>
  );
}

export default function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    )
}
