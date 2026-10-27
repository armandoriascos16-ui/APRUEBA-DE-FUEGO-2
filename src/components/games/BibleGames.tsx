import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_QUIZ_QUESTIONS } from '../../data/seedData';
import { COMPREHENSIVE_GAME_QUESTIONS } from '../../data/adventistOfficialData';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Sparkles,
  RotateCcw,
  HelpCircle,
  Check,
  X,
  Shuffle,
  Star,
  Award,
  ArrowRight
} from 'lucide-react';

// ==========================================
// 1. DATA: Preguntas ampliadas de Quiz
// ==========================================
const EXTENDED_QUIZ_QUESTIONS = [
  ...INITIAL_QUIZ_QUESTIONS,
  {
    id: 'q_6',
    question: '¿Qué profeta desafió a los 450 profetas de Baal en el Monte Carmelo?',
    options: ['Eliseo', 'Elías', 'Jeremías', 'Isaías'],
    correctAnswer: 1,
    verseRef: '1 Reyes 18:20-40',
    explanation: 'Elías oró a Dios y cayó fuego del cielo que consumió el holocausto, la leña y las piedras.',
    points: 25,
  },
  {
    id: 'q_7',
    question: 'Según Gálatas 5:22-23, ¿cuál de los siguientes es parte del fruto del Espíritu Santo?',
    options: ['Orgullo', 'Templanza (Dominio propio)', 'Ambición', 'Indiferencia'],
    correctAnswer: 1,
    verseRef: 'Gálatas 5:22-23',
    explanation: 'El fruto del Espíritu es: amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre y templanza.',
    points: 20,
  },
  {
    id: 'q_8',
    question: '¿Qué reina judía arriesgó su vida diciendo: "Y si perezco, que perezca" para salvar a su pueblo?',
    options: ['Rut', 'Ester', 'Sara', 'Débora'],
    correctAnswer: 1,
    verseRef: 'Ester 4:16',
    explanation: 'La reina Ester ayunó tres días con sus doncellas y se presentó ante el rey Asuero sin ser llamada.',
    points: 30,
  }
];

// ==========================================
// 2. DATA: Personajes Bíblicos para Adivinar
// ==========================================
interface CharacterClueGame {
  id: string;
  name: string;
  options: string[];
  clues: string[];
  verseRef: string;
  bioSummary: string;
  points: number;
}

const BIBLE_CHARACTERS: CharacterClueGame[] = [
  {
    id: 'char_1',
    name: 'José de Egipto',
    options: ['Moisés', 'José de Egipto', 'David', 'Salomón'],
    clues: [
      'Pista 1: Mi padre me regaló una túnica de diversos colores que despertó la envidia.',
      'Pista 2: Fui vendido por mis propios hermanos como esclavo por veinte piezas de plata.',
      'Pista 3: Interpreté los sueños del Faraón sobre siete vacas gordas y siete vacas flacas.',
      'Pista 4: Llegué a ser gobernador de toda la tierra de Egipto y perdoné a mi familia.',
    ],
    verseRef: 'Génesis 37 al 45',
    bioSummary: 'José demostró integridad en la prueba y perdón incondicional hacia sus hermanos.',
    points: 50,
  },
  {
    id: 'char_2',
    name: 'Daniel',
    options: ['Nehemías', 'Ezequiel', 'Daniel', 'Jeremías'],
    clues: [
      'Pista 1: Propuse en mi corazón no contaminarme con la porción de la comida del rey.',
      'Pista 2: Mis tres amigos hebreos fueron librados del horno de fuego ardiente.',
      'Pista 3: Fui arrojado al foso de los leones por orar tres veces al día hacia Jerusalén.',
      'Pista 4: Dios envió a su ángel y cerró la boca de los leones para que no me hicieran daño.',
    ],
    verseRef: 'Daniel 1 y 6',
    bioSummary: 'Daniel se mantuvo fiel a Dios en medio de la corte imperial de Babilonia y Medo-Persia.',
    points: 50,
  },
  {
    id: 'char_3',
    name: 'David',
    options: ['Gedeón', 'David', 'Saúl', 'Sansón'],
    clues: [
      'Pista 1: En mi juventud era pastor de ovejas y tocaba el arpa con gran destreza.',
      'Pista 2: Enfrenté a un gigante filisteo con solo cinco piedras lisas y una honda.',
      'Pista 3: Escribí muchos de los Salmos que cantamos, incluyendo el Salmo 23.',
      'Pista 4: Fui ungido por Samuel como el rey más recordado de Israel.',
    ],
    verseRef: '1 Samuel 16-17',
    bioSummary: 'David confió en el nombre de Jehová de los Ejércitos para vencer gigantes.',
    points: 50,
  },
  {
    id: 'char_4',
    name: 'Rut',
    options: ['Ester', 'Rut', 'Marta', 'María'],
    clues: [
      'Pista 1: Nací en la tierra de Moab y enviudé siendo joven.',
      'Pista 2: Le dije a mi suegra Noemí: "Tu pueblo será mi pueblo, y tu Dios mi Dios".',
      'Pista 3: Recogí espigas en los campos de Booz para alimentar a mi familia.',
      'Pista 4: Me convertí en bisabuela del rey David y antepasada del Mesías.',
    ],
    verseRef: 'Libro de Rut',
    bioSummary: 'Rut ejemplifica la lealtad, la gracia y la inclusión en el plan redentor de Dios.',
    points: 50,
  }
];

// ==========================================
// 3. DATA: Verdadero o Falso Bíblico
// ==========================================
interface TrueFalseItem {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  verseRef: string;
  points: number;
}

const TRUE_FALSE_QUESTIONS: TrueFalseItem[] = [
  {
    id: 'tf_1',
    statement: 'El sábado bíblico fue instituido por Dios en la Creación antes de que existiera el pecado.',
    isTrue: true,
    explanation: 'Génesis 2:2-3 dice que Dios reposó el séptimo día, lo bendijo y lo santificó en la semana de la creación.',
    verseRef: 'Génesis 2:2-3',
    points: 15,
  },
  {
    id: 'tf_2',
    statement: 'El apóstol Pablo fue uno de los doce discípulos originales que caminó con Jesús durante su ministerio terrenal.',
    isTrue: false,
    explanation: 'Falso: Pablo (Saulo de Tarso) fue llamado después de la ascensión de Cristo en el camino a Damasco.',
    verseRef: 'Hechos 9:1-6',
    points: 15,
  },
  {
    id: 'tf_3',
    statement: 'Matusalén vivió 969 años, siendo el hombre de mayor edad registrado en la Sagrada Escritura.',
    isTrue: true,
    explanation: 'Génesis 5:27 registra: "Fueron, pues, todos los días de Matusalén novecientos sesenta y nueve años; y murió".',
    verseRef: 'Génesis 5:27',
    points: 15,
  },
  {
    id: 'tf_4',
    statement: 'El libro de Apocalipsis fue escrito por el apóstol Juan mientras estaba desterrado en la isla de Patmos.',
    isTrue: true,
    explanation: 'Juan 1:9 afirma: "Yo Juan... estaba en la isla llamada Patmos, por causa de la palabra de Dios y el testimonio de Jesucristo".',
    verseRef: 'Apocalipsis 1:9',
    points: 15,
  },
  {
    id: 'tf_5',
    statement: 'El Arca de Noé tardó exactamente 7 días en construirse.',
    isTrue: false,
    explanation: 'Falso: La predicación y construcción del arca por Noé se extendió por aproximadamente 120 años.',
    verseRef: 'Génesis 6:3; Hebreos 11:7',
    points: 15,
  },
];

// ==========================================
// 4. DATA: Versículos para Memorizar y Ordenar
// ==========================================
interface ScrambleVerse {
  id: string;
  reference: string;
  fullVerse: string;
  words: string[];
  points: number;
}

const SCRAMBLE_VERSES: ScrambleVerse[] = [
  {
    id: 'sv_1',
    reference: 'Filipenses 4:13',
    fullVerse: 'Todo lo puedo en Cristo que me fortalece',
    words: ['en', 'fortalece', 'puedo', 'Todo', 'me', 'Cristo', 'lo', 'que'],
    points: 30,
  },
  {
    id: 'sv_2',
    reference: 'Josué 1:9',
    fullVerse: 'Mira que te mando que te esfuerces y seas valiente',
    words: ['valiente', 'esfuerces', 'que', 'mando', 'Mira', 'te', 'seas', 'y', 'que', 'te'],
    points: 35,
  },
  {
    id: 'sv_3',
    reference: 'Salmos 23:1',
    fullVerse: 'Jehová es mi pastor nada me faltará',
    words: ['pastor', 'Jehová', 'faltará', 'es', 'nada', 'mi', 'me'],
    points: 25,
  }
];

export const BibleGames: React.FC = () => {
  const { currentUser, awardQuizPoints } = useApp();
  
  // Game Mode State: 'quiz' | 'characters' | 'true_false' | 'memory'
  const [activeGameMode, setActiveGameMode] = useState<'quiz' | 'characters' | 'true_false' | 'memory'>('quiz');
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Medio' | 'Difícil'>('Fácil');

  // Confetti helper
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#F59E0B', '#10B981', '#FFFFFF']
      });
    } catch {
      // safe fallback
    }
  };

  // ====================================================
  // STATE & LOGIC: 1. QUIZ BÍBLICO (Filtrado por Dificultad)
  // ====================================================
  const quizList = useMemo(() => {
    const compTrivia = COMPREHENSIVE_GAME_QUESTIONS
      .filter(q => q.gameType === 'trivia' && q.difficulty === difficulty)
      .map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctIndex,
        verseRef: q.verseRef,
        explanation: q.explanation,
        points: q.points,
      }));
    
    const fallback = EXTENDED_QUIZ_QUESTIONS.filter((_, idx) => {
      if (difficulty === 'Fácil') return idx < 3;
      if (difficulty === 'Medio') return idx >= 3 && idx < 6;
      return idx >= 5;
    });

    return [...compTrivia, ...fallback];
  }, [difficulty]);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPointsEarned, setQuizPointsEarned] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuizQ = quizList[quizIndex] || quizList[0] || EXTENDED_QUIZ_QUESTIONS[0];

  const handleSelectQuizOption = (index: number) => {
    if (quizAnswered) return;
    setQuizSelected(index);
    setQuizAnswered(true);

    if (index === currentQuizQ.correctAnswer) {
      setQuizScore(prev => prev + 1);
      setQuizPointsEarned(prev => prev + currentQuizQ.points);
      awardQuizPoints(currentQuizQ.points, `Quiz Bíblico (${difficulty}): ${currentQuizQ.question.substring(0, 30)}...`);
      triggerConfetti();
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex + 1 < quizList.length) {
      setQuizIndex(prev => prev + 1);
      setQuizSelected(null);
      setQuizAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizAnswered(false);
    setQuizScore(0);
    setQuizPointsEarned(0);
    setQuizFinished(false);
  };

  // ====================================================
  // STATE & LOGIC: 2. ADIVINA EL PERSONAJE (Filtrado por Dificultad)
  // ====================================================
  const charList = useMemo(() => {
    const compQuien = COMPREHENSIVE_GAME_QUESTIONS
      .filter(q => q.gameType === 'quien_soy' && q.difficulty === difficulty)
      .map(q => ({
        id: q.id,
        name: q.options[q.correctIndex],
        options: q.options,
        clues: [
          `Pista principal: ${q.question}`,
          `Referencia bíblica clave: ${q.verseRef}`,
          `Lección de fe: ${q.explanation}`,
        ],
        verseRef: q.verseRef,
        bioSummary: q.explanation,
        points: q.points,
      }));

    return [...compQuien, ...BIBLE_CHARACTERS];
  }, [difficulty]);

  const [charIndex, setCharIndex] = useState(0);
  const [revealedCluesCount, setRevealedCluesCount] = useState(1);
  const [charAnswered, setCharAnswered] = useState(false);
  const [charSelected, setCharSelected] = useState<string | null>(null);
  const [charScore, setCharScore] = useState(0);
  const [charFinished, setCharFinished] = useState(false);

  const currentChar = charList[charIndex] || charList[0] || BIBLE_CHARACTERS[0];

  const handleRevealClue = () => {
    if (revealedCluesCount < currentChar.clues.length) {
      setRevealedCluesCount(prev => prev + 1);
    }
  };

  const handleSelectCharOption = (option: string) => {
    if (charAnswered) return;
    setCharSelected(option);
    setCharAnswered(true);

    if (option === currentChar.name) {
      // Menos pistas = más puntos
      const earned = Math.max(20, currentChar.points - (revealedCluesCount - 1) * 10);
      setCharScore(prev => prev + earned);
      awardQuizPoints(earned, `Adivinó al personaje bíblico (${difficulty}): ${currentChar.name}`);
      triggerConfetti();
    }
  };

  const handleNextChar = () => {
    if (charIndex + 1 < charList.length) {
      setCharIndex(prev => prev + 1);
      setRevealedCluesCount(1);
      setCharAnswered(false);
      setCharSelected(null);
    } else {
      setCharFinished(true);
    }
  };

  const handleRestartChar = () => {
    setCharIndex(0);
    setRevealedCluesCount(1);
    setCharAnswered(false);
    setCharSelected(null);
    setCharScore(0);
    setCharFinished(false);
  };

  // ====================================================
  // STATE & LOGIC: 3. VERDADERO O FALSO (Filtrado por Dificultad)
  // ====================================================
  const tfList = useMemo(() => {
    const compTf = COMPREHENSIVE_GAME_QUESTIONS
      .filter(q => q.gameType === 'verdadero_falso' && q.difficulty === difficulty)
      .map(q => ({
        id: q.id,
        statement: q.question.replace('¿Verdadero o Falso? ', ''),
        isTrue: q.correctIndex === 0,
        explanation: q.explanation,
        verseRef: q.verseRef,
        points: q.points,
      }));
    
    const fallback = TRUE_FALSE_QUESTIONS.filter((_, idx) => {
      if (difficulty === 'Fácil') return idx < 2;
      if (difficulty === 'Medio') return idx === 2 || idx === 3;
      return idx >= 3;
    });

    return [...compTf, ...fallback];
  }, [difficulty]);

  const [tfIndex, setTfIndex] = useState(0);
  const [tfAnswered, setTfAnswered] = useState(false);
  const [tfSelected, setTfSelected] = useState<boolean | null>(null);
  const [tfScore, setTfScore] = useState(0);
  const [tfFinished, setTfFinished] = useState(false);

  const currentTf = tfList[tfIndex] || tfList[0] || TRUE_FALSE_QUESTIONS[0];

  const handleSelectTf = (value: boolean) => {
    if (tfAnswered) return;
    setTfSelected(value);
    setTfAnswered(true);

    if (value === currentTf.isTrue) {
      setTfScore(prev => prev + currentTf.points);
      awardQuizPoints(currentTf.points, `Verdadero o Falso (${difficulty}): ${currentTf.statement.substring(0, 30)}...`);
      triggerConfetti();
    }
  };

  const handleNextTf = () => {
    if (tfIndex + 1 < tfList.length) {
      setTfIndex(prev => prev + 1);
      setTfAnswered(false);
      setTfSelected(null);
    } else {
      setTfFinished(true);
    }
  };

  const handleRestartTf = () => {
    setTfIndex(0);
    setTfAnswered(false);
    setTfSelected(null);
    setTfScore(0);
    setTfFinished(false);
  };

  // ====================================================
  // STATE & LOGIC: 4. MEMORIZADOR DE VERSÍCULOS
  // ====================================================
  const [verseIndex, setVerseIndex] = useState(0);
  const currentVerse = SCRAMBLE_VERSES[verseIndex];
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>(currentVerse.words);
  const [verseFinished, setVerseFinished] = useState(false);
  const [verseSuccess, setVerseSuccess] = useState<boolean | null>(null);

  const handlePickWord = (word: string, index: number) => {
    setSelectedWords(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveWord = (word: string, index: number) => {
    setSelectedWords(prev => prev.filter((_, idx) => idx !== index));
    setAvailableWords(prev => [...prev, word]);
  };

  const handleCheckVerse = () => {
    const constructed = selectedWords.join(' ').trim();
    if (constructed.toLowerCase() === currentVerse.fullVerse.toLowerCase()) {
      setVerseSuccess(true);
      awardQuizPoints(currentVerse.points, `Memorizó el versículo: ${currentVerse.reference}`);
      triggerConfetti();
    } else {
      setVerseSuccess(false);
    }
  };

  const handleNextVerse = () => {
    if (verseIndex + 1 < SCRAMBLE_VERSES.length) {
      const nextIdx = verseIndex + 1;
      setVerseIndex(nextIdx);
      setSelectedWords([]);
      setAvailableWords(SCRAMBLE_VERSES[nextIdx].words);
      setVerseSuccess(null);
    } else {
      setVerseFinished(true);
    }
  };

  const handleRestartVerse = () => {
    setVerseIndex(0);
    setSelectedWords([]);
    setAvailableWords(SCRAMBLE_VERSES[0].words);
    setVerseSuccess(null);
    setVerseFinished(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4">
      
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
          <Gamepad2 className="h-4 w-4" />
          <span>JUEGOS CRISTIANOS & PUNTOS FIRESTORE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          Centro de Juegos Bíblicos JA
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl mx-auto">
          Pon a prueba tu conocimiento de las Sagradas Escrituras, ejercita tu memoria y gana puntos reales que se guardan en tu cuenta.
        </p>

        {/* User Stats Pill */}
        <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-xs">
          <span className="text-slate-400">Puntaje del Jugador:</span>
          <span className="font-black text-amber-400 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 fill-amber-400" />
            {currentUser.points.toLocaleString()} pts
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 font-semibold">Nivel {currentUser.level}</span>
        </div>
      </div>

      {/* Game Mode Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <button
          onClick={() => setActiveGameMode('quiz')}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
            activeGameMode === 'quiz'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xl">🎯</span>
          <span className="text-xs font-bold">Quiz Bíblico</span>
          <span className="text-[10px] opacity-80">Preguntas & Respuestas</span>
        </button>

        <button
          onClick={() => setActiveGameMode('characters')}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
            activeGameMode === 'characters'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xl">🕵️</span>
          <span className="text-xs font-bold">Adivina el Personaje</span>
          <span className="text-[10px] opacity-80">Pistas progresivas</span>
        </button>

        <button
          onClick={() => setActiveGameMode('true_false')}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
            activeGameMode === 'true_false'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xl">⚖️</span>
          <span className="text-xs font-bold">Verdadero o Falso</span>
          <span className="text-[10px] opacity-80">Ráfaga doctrinal</span>
        </button>

        <button
          onClick={() => setActiveGameMode('memory')}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
            activeGameMode === 'memory'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xl">🧩</span>
          <span className="text-xs font-bold">Memorizar Versículo</span>
          <span className="text-[10px] opacity-80">Ordena las palabras</span>
        </button>
      </div>

      {/* Selector de Nivel de Dificultad (3 niveles) */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-2.5 mb-6">
        <div className="flex items-center gap-1.5 pl-2 text-xs font-bold text-slate-300">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline">Nivel de Estudio:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(['Fácil', 'Medio', 'Difícil'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setDifficulty(lvl);
                setQuizIndex(0);
                setQuizSelected(null);
                setQuizAnswered(false);
                setQuizFinished(false);
                setCharIndex(0);
                setRevealedCluesCount(1);
                setCharAnswered(false);
                setCharSelected(null);
                setCharFinished(false);
                setTfIndex(0);
                setTfAnswered(false);
                setTfSelected(null);
                setTfFinished(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                difficulty === lvl
                  ? lvl === 'Fácil'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : lvl === 'Medio'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lvl === 'Fácil' && '🟢 '}
              {lvl === 'Medio' && '🟡 '}
              {lvl === 'Difícil' && '🔴 '}
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1. QUIZ BÍBLICO INTERACTIVO                          */}
      {/* ==================================================== */}
      {activeGameMode === 'quiz' && (
        <div>
          {!quizFinished ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
                <span className="font-bold text-white">
                  Pregunta {quizIndex + 1} de {quizList.length}
                </span>
                <div className="flex items-center gap-1 text-amber-400 font-extrabold">
                  <Flame className="h-4 w-4 fill-amber-400" />
                  <span>+{currentQuizQ.points} puntos posibles ({difficulty})</span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-white leading-relaxed mb-6 font-heading">
                {currentQuizQ.question}
              </h2>

              <div className="space-y-3 mb-6">
                {currentQuizQ.options.map((option, idx) => {
                  const isSelected = quizSelected === idx;
                  const isCorrect = idx === currentQuizQ.correctAnswer;

                  let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-850';
                  if (quizAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500/30';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-850 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      disabled={quizAnswered}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {quizAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                      {quizAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {quizAnswered && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6 text-xs text-amber-200 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-black text-amber-300 mb-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Base Bíblica: {currentQuizQ.verseRef}</span>
                  </div>
                  <p className="leading-relaxed">{currentQuizQ.explanation}</p>
                </div>
              )}

              {quizAnswered && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuiz}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs shadow-md hover:from-amber-400 hover:to-orange-500 transition-all"
                  >
                    {quizIndex + 1 < quizList.length ? 'Siguiente Pregunta →' : 'Ver Resultados Finales 🏆'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center shadow-2xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 mx-auto mb-4 shadow-xl">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading mb-1">
                ¡Trivia Completada ({difficulty})!
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Puntos sincronizados en tu cuenta de Cloud Firestore.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Aciertos</span>
                  <span className="text-xl font-black text-white">{quizScore} / {quizList.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Puntos Ganados</span>
                  <span className="text-xl font-black text-amber-400">+{quizPointsEarned} pts</span>
                </div>
              </div>
              <button
                onClick={handleRestartQuiz}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Volver a Jugar Quiz</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. ADIVINA EL PERSONAJE BÍBLICO                      */}
      {/* ==================================================== */}
      {activeGameMode === 'characters' && (
        <div>
          {!charFinished ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
                <span className="font-bold text-white">
                  Personaje {charIndex + 1} de {charList.length}
                </span>
                <span className="text-amber-400 font-bold">
                  Premio: Hasta +{currentChar.points} pts
                </span>
              </div>

              <div className="mb-6 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Pistas Desbloqueadas ({revealedCluesCount} de {currentChar.clues.length}):
                </span>
                {currentChar.clues.slice(0, revealedCluesCount).map((clue, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 animate-in fade-in duration-150">
                    {clue}
                  </div>
                ))}
              </div>

              {!charAnswered && revealedCluesCount < currentChar.clues.length && (
                <div className="mb-6">
                  <button
                    onClick={handleRevealClue}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 transition-colors"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Revelar siguiente pista (-10 pts de bono)</span>
                  </button>
                </div>
              )}

              <div className="space-y-2 mb-6">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  ¿Quién crees que es este personaje?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentChar.options.map((opt, idx) => {
                    const isSelected = charSelected === opt;
                    const isCorrect = opt === currentChar.name;

                    let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50';
                    if (charAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                      } else {
                        btnStyle = 'bg-slate-950/40 border-slate-850 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectCharOption(opt)}
                        disabled={charAnswered}
                        className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {charAnswered && isCorrect && <Check className="h-4 w-4 text-emerald-400" />}
                        {charAnswered && isSelected && !isCorrect && <X className="h-4 w-4 text-red-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {charAnswered && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6 text-xs text-amber-200">
                  <span className="font-bold text-amber-300 block mb-1">
                    {charSelected === currentChar.name ? '🎉 ¡Respuesta Correcta!' : `Respuesta correcta: ${currentChar.name}`}
                  </span>
                  <p className="mb-1">{currentChar.bioSummary}</p>
                  <span className="text-[11px] text-amber-400 italic">📖 {currentChar.verseRef}</span>
                </div>
              )}

              {charAnswered && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNextChar}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all"
                  >
                    {charIndex + 1 < charList.length ? 'Siguiente Personaje →' : 'Ver Resultados 🏆'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center shadow-2xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 mx-auto mb-4 shadow-xl">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading mb-1">
                ¡Juego de Personajes Completado!
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Puntos totales acumulados: <strong className="text-amber-400">+{charScore} pts</strong>
              </p>
              <button
                onClick={handleRestartChar}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Jugar de Nuevo</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. VERDADERO O FALSO BÍBLICO                         */}
      {/* ==================================================== */}
      {activeGameMode === 'true_false' && (
        <div>
          {!tfFinished ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
                <span className="font-bold text-white">
                  Afirmación {tfIndex + 1} de {tfList.length}
                </span>
                <span className="text-amber-400 font-bold">
                  +{currentTf.points} pts ({difficulty})
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 mb-6 text-center">
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  "{currentTf.statement}"
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleSelectTf(true)}
                  disabled={tfAnswered}
                  className={`p-4 rounded-2xl border text-center font-black text-sm transition-all flex items-center justify-center gap-2 ${
                    tfAnswered
                      ? currentTf.isTrue
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : tfSelected === true
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-950 opacity-40 text-slate-500'
                      : 'bg-slate-950 border-slate-800 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10'
                  }`}
                >
                  <Check className="h-5 w-5" />
                  <span>VERDADERO</span>
                </button>

                <button
                  onClick={() => handleSelectTf(false)}
                  disabled={tfAnswered}
                  className={`p-4 rounded-2xl border text-center font-black text-sm transition-all flex items-center justify-center gap-2 ${
                    tfAnswered
                      ? !currentTf.isTrue
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : tfSelected === false
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-950 opacity-40 text-slate-500'
                      : 'bg-slate-950 border-slate-800 text-rose-400 hover:border-rose-500 hover:bg-rose-500/10'
                  }`}
                >
                  <X className="h-5 w-5" />
                  <span>FALSO</span>
                </button>
              </div>

              {tfAnswered && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6 text-xs text-amber-200">
                  <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>Base Bíblica: {currentTf.verseRef}</span>
                  </div>
                  <p>{currentTf.explanation}</p>
                </div>
              )}

              {tfAnswered && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNextTf}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all"
                  >
                    {tfIndex + 1 < tfList.length ? 'Siguiente Afirmación →' : 'Ver Resultados 🏆'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center shadow-2xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 mx-auto mb-4 shadow-xl">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading mb-1">
                ¡Ronda Completada!
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Puntos sumados a tu perfil: <strong className="text-amber-400">+{tfScore} pts</strong>
              </p>
              <button
                onClick={handleRestartTf}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Volver a Jugar</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. MEMORIZADOR DE VERSÍCULOS JA                      */}
      {/* ==================================================== */}
      {activeGameMode === 'memory' && (
        <div>
          {!verseFinished ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
                <span className="font-bold text-white">
                  Versículo {verseIndex + 1} de {SCRAMBLE_VERSES.length}: <strong className="text-amber-400">{currentVerse.reference}</strong>
                </span>
                <span className="text-amber-400 font-bold">
                  +{currentVerse.points} pts
                </span>
              </div>

              {/* Constructed verse area */}
              <div className="min-h-[90px] p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 mb-4 flex flex-wrap gap-2 items-center">
                {selectedWords.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">
                    Toca las palabras de abajo en el orden correcto para reconstruir el versículo...
                  </span>
                ) : (
                  selectedWords.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveWord(word, idx)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow hover:bg-amber-400 transition-all flex items-center gap-1"
                    >
                      <span>{word}</span>
                      <X className="h-3 w-3 stroke-[2.5]" />
                    </button>
                  ))
                )}
              </div>

              {/* Available words bank */}
              <div className="mb-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Banco de Palabras:
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableWords.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePickWord(word, idx)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-all transform active:scale-95"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Alert */}
              {verseSuccess === true && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-bold">¡Correcto! Has memorizado este versículo con éxito.</span>
                  </div>
                  <span className="font-black text-amber-400">+{currentVerse.points} pts</span>
                </div>
              )}

              {verseSuccess === false && (
                <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    <span>El orden no es el correcto. Toca las palabras para reorganizarlas.</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedWords([]);
                      setAvailableWords(currentVerse.words);
                      setVerseSuccess(null);
                    }}
                    className="text-[11px] font-bold underline hover:text-white"
                  >
                    Reiniciar
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWords([]);
                    setAvailableWords(currentVerse.words);
                    setVerseSuccess(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Restablecer
                </button>

                {verseSuccess === true ? (
                  <button
                    onClick={handleNextVerse}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all"
                  >
                    {verseIndex + 1 < SCRAMBLE_VERSES.length ? 'Siguiente Versículo →' : 'Completar 🏆'}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckVerse}
                    disabled={selectedWords.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md disabled:opacity-50"
                  >
                    Verificar Versículo
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center shadow-2xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 mx-auto mb-4 shadow-xl">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading mb-1">
                ¡Memorización JA Completada!
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                "En mi corazón he guardado tus dichos, para no pecar contra ti." — Salmos 119:11
              </p>
              <button
                onClick={handleRestartVerse}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Volver a Memorizar</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
