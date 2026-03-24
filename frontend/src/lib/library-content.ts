export type ArticleBlock =
  | { type: 'hero'; tag: string; title: string; subtitle: string }
  | { type: 'big-numbers'; items: { value: string; label: string }[] }
  | { type: 'intro'; title: string; text: string }
  | { type: 'benefits-grid'; title: string; items: { emoji: string; title: string; text: string }[] }
  | { type: 'caution'; items: string[] }
  | { type: 'examples'; title: string; items: ExampleSession[] }
  | { type: 'tip'; text: string };

export interface ExampleSession {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  metrics: { label: string; value: string }[];
  description: string;
}

export interface LibraryArticle {
  sport: string;
  sessionType: string;
  title: string;
  subtitle: string;
  blocks: ArticleBlock[];
}

export const LIBRARY_ARTICLES_FR: LibraryArticle[] = [
  // Cycling
  {
    sport: 'velo',
    sessionType: 'endurance',
    title: 'La sortie longue, pilier de votre progression',
    subtitle: "Comprendre l'endurance fondamentale et pourquoi elle devrait représenter la majorité de votre entraînement.",
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'La sortie longue, pilier de votre progression', subtitle: "Comprendre l'endurance fondamentale et pourquoi elle devrait représenter la majorité de votre entraînement." },
      { type: 'big-numbers', items: [
        { value: '80%', label: 'du volume' },
        { value: 'Zone 2', label: 'zone cible' },
        { value: '1h30+', label: 'durée idéale' },
      ]},
      { type: 'intro', title: "C'est quoi une sortie endurance ?", text: "L'endurance fondamentale, c'est rouler à une intensité où vous pouvez tenir une conversation. Votre cœur travaille en zone 2 (entre 60 et 75% de votre fréquence cardiaque maximale, c'est-à-dire le rythme où vous respirez un peu plus fort sans être essoufflé). C'est le rythme qui ne paie pas de mine mais qui construit toute votre base aérobie (la capacité de votre corps à utiliser l'oxygène pour produire de l'énergie)." },
      { type: 'benefits-grid', title: 'Pourquoi la faire ?', items: [
        { emoji: '❤️', title: 'Cœur plus fort', text: "Augmente le volume de sang pompé à chaque battement — votre cœur devient plus efficace" },
        { emoji: '🔥', title: 'Brûle les graisses', text: "À cette intensité, votre corps puise principalement dans les réserves de graisse" },
        { emoji: '🧠', title: 'Mental solide', text: "Apprend à gérer l'effort sur la durée et à rester régulier" },
        { emoji: '🩸', title: 'Meilleure circulation', text: "Développe les petits vaisseaux sanguins dans vos muscles (capillaires)" },
      ]},
      { type: 'caution', items: [
        "Ne partez pas trop vite — l'erreur la plus fréquente est de rouler trop fort et de passer en zone 3 sans s'en rendre compte",
        "Hydratez-vous régulièrement au-delà d'1h d'effort",
        "Emportez de quoi manger pour les sorties de plus de 2h (barres, gels, fruits secs)",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Sortie café', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '1h–1h30' }, { label: 'Distance', value: '25–40 km' }, { label: 'Intensité', value: 'Zone 2' }], description: "Roulez à allure conversation. Si vous ne pouvez plus parler, ralentissez. L'objectif est de finir frais, pas épuisé." },
        { name: 'Sortie longue du weekend', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '2h30–3h' }, { label: 'Distance', value: '60–90 km' }, { label: 'Intensité', value: 'Zone 2' }], description: "La sortie qui construit votre fond. Emportez des barres et de l'eau. Mangez avant d'avoir faim, buvez avant d'avoir soif." },
        { name: 'Ultra endurance', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '4h+' }, { label: 'Distance', value: '100+ km' }, { label: 'Intensité', value: 'Zone 1-2' }], description: "Préparez votre nutrition à l'avance. Visez des ravitaillements toutes les 45 minutes. Le mental prend le relais après 3h." },
      ]},
      { type: 'tip', text: "L'endurance est la base invisible sur laquelle tout le reste se construit. Sans elle, les intervalles et le tempo ne donnent que des résultats temporaires." },
    ],
  },
  {
    sport: 'velo',
    sessionType: 'intervals',
    title: 'Le fractionné, accélérateur de performance',
    subtitle: 'Alterner efforts intenses et récupération pour progresser plus vite.',
    blocks: [
      { type: 'hero', tag: 'Intervalles', title: 'Le fractionné, accélérateur de performance', subtitle: 'Alterner efforts intenses et récupération pour progresser plus vite.' },
    ],
  },
  {
    sport: 'velo',
    sessionType: 'tempo',
    title: 'Le tempo, repousser votre seuil',
    subtitle: 'Rouler au seuil pour habituer votre corps à maintenir un effort soutenu.',
    blocks: [
      { type: 'hero', tag: 'Tempo', title: 'Le tempo, repousser votre seuil', subtitle: 'Rouler au seuil pour habituer votre corps à maintenir un effort soutenu.' },
    ],
  },
  {
    sport: 'velo',
    sessionType: 'recovery',
    title: 'La sortie récup, indispensable et sous-estimée',
    subtitle: 'Pourquoi rouler doucement est aussi important que rouler fort.',
    blocks: [
      { type: 'hero', tag: 'Récupération', title: 'La sortie récup, indispensable et sous-estimée', subtitle: 'Pourquoi rouler doucement est aussi important que rouler fort.' },
    ],
  },
  {
    sport: 'velo',
    sessionType: 'climbing',
    title: 'Grimper plus fort, grimper mieux',
    subtitle: 'Techniques et entraînements pour progresser en montée.',
    blocks: [
      { type: 'hero', tag: 'Côtes / Grimpée', title: 'Grimper plus fort, grimper mieux', subtitle: 'Techniques et entraînements pour progresser en montée.' },
    ],
  },
  // Running
  {
    sport: 'course',
    sessionType: 'endurance',
    title: 'Le footing long, la base de tout',
    subtitle: 'Courir lentement pour courir longtemps — et progresser.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'Le footing long, la base de tout', subtitle: 'Courir lentement pour courir longtemps — et progresser.' },
    ],
  },
  {
    sport: 'course',
    sessionType: 'intervals',
    title: 'Le fractionné en course à pied',
    subtitle: 'Des séries courtes et intenses pour gagner en vitesse.',
    blocks: [
      { type: 'hero', tag: 'Intervalles', title: 'Le fractionné en course à pied', subtitle: 'Des séries courtes et intenses pour gagner en vitesse.' },
    ],
  },
  {
    sport: 'course',
    sessionType: 'tempo',
    title: "L'allure tempo, votre vitesse de croisière",
    subtitle: 'Courir au seuil pour repousser vos limites en compétition.',
    blocks: [
      { type: 'hero', tag: 'Tempo', title: "L'allure tempo, votre vitesse de croisière", subtitle: 'Courir au seuil pour repousser vos limites en compétition.' },
    ],
  },
  {
    sport: 'course',
    sessionType: 'recovery',
    title: 'Le footing de récupération',
    subtitle: 'Courir sans forcer pour mieux assimiler les entraînements durs.',
    blocks: [
      { type: 'hero', tag: 'Récupération', title: 'Le footing de récupération', subtitle: 'Courir sans forcer pour mieux assimiler les entraînements durs.' },
    ],
  },
  {
    sport: 'course',
    sessionType: 'fartlek',
    title: 'Le fartlek, le jeu de vitesse',
    subtitle: 'Varier les allures au feeling pour le plaisir et la progression.',
    blocks: [
      { type: 'hero', tag: 'Fartlek', title: 'Le fartlek, le jeu de vitesse', subtitle: 'Varier les allures au feeling pour le plaisir et la progression.' },
    ],
  },
  // Swimming
  {
    sport: 'natation',
    sessionType: 'endurance',
    title: 'La nage longue, construire son aérobie',
    subtitle: 'Nager longtemps à allure régulière pour bâtir votre fond.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'La nage longue, construire son aérobie', subtitle: 'Nager longtemps à allure régulière pour bâtir votre fond.' },
    ],
  },
  {
    sport: 'natation',
    sessionType: 'intervals',
    title: 'Les séries fractionnées en piscine',
    subtitle: 'Des répétitions chronométrées pour gagner en vitesse.',
    blocks: [
      { type: 'hero', tag: 'Intervalles', title: 'Les séries fractionnées en piscine', subtitle: 'Des répétitions chronométrées pour gagner en vitesse.' },
    ],
  },
  {
    sport: 'natation',
    sessionType: 'technique',
    title: 'Les éducatifs, nager mieux avant de nager plus',
    subtitle: "Travailler sa technique pour être plus efficace dans l'eau.",
    blocks: [
      { type: 'hero', tag: 'Technique', title: 'Les éducatifs, nager mieux avant de nager plus', subtitle: "Travailler sa technique pour être plus efficace dans l'eau." },
    ],
  },
  {
    sport: 'natation',
    sessionType: 'recovery',
    title: 'La séance récup en natation',
    subtitle: "Nager doucement pour récupérer et détendre le corps dans l'eau.",
    blocks: [
      { type: 'hero', tag: 'Récupération', title: 'La séance récup en natation', subtitle: "Nager doucement pour récupérer et détendre le corps dans l'eau." },
    ],
  },
  {
    sport: 'natation',
    sessionType: 'mixed',
    title: 'La séance mixte, varier les plaisirs',
    subtitle: 'Combiner les nages et les objectifs dans une même séance.',
    blocks: [
      { type: 'hero', tag: 'Mixte', title: 'La séance mixte, varier les plaisirs', subtitle: 'Combiner les nages et les objectifs dans une même séance.' },
    ],
  },
  // Walking
  {
    sport: 'marche',
    sessionType: 'walk',
    title: 'La balade, le sport le plus sous-estimé',
    subtitle: 'Marcher régulièrement transforme votre santé — sans forcer.',
    blocks: [
      { type: 'hero', tag: 'Balade', title: 'La balade, le sport le plus sous-estimé', subtitle: 'Marcher régulièrement transforme votre santé — sans forcer.' },
    ],
  },
  {
    sport: 'marche',
    sessionType: 'brisk',
    title: 'La marche rapide, du cardio sans courir',
    subtitle: 'Accélérer le pas pour un vrai travail cardiovasculaire.',
    blocks: [
      { type: 'hero', tag: 'Marche rapide', title: 'La marche rapide, du cardio sans courir', subtitle: 'Accélérer le pas pour un vrai travail cardiovasculaire.' },
    ],
  },
  {
    sport: 'marche',
    sessionType: 'hike',
    title: 'La randonnée, effort et évasion',
    subtitle: 'Longues distances et dénivelé pour un entraînement complet.',
    blocks: [
      { type: 'hero', tag: 'Randonnée', title: 'La randonnée, effort et évasion', subtitle: 'Longues distances et dénivelé pour un entraînement complet.' },
    ],
  },
  {
    sport: 'marche',
    sessionType: 'recovery',
    title: 'La marche de récupération',
    subtitle: 'Bouger doucement pour aider le corps à récupérer.',
    blocks: [
      { type: 'hero', tag: 'Récupération', title: 'La marche de récupération', subtitle: 'Bouger doucement pour aider le corps à récupérer.' },
    ],
  },
];

export const LIBRARY_ARTICLES_EN: LibraryArticle[] = [
  // Cycling
  {
    sport: 'velo',
    sessionType: 'endurance',
    title: 'The long ride, foundation of your progress',
    subtitle: 'Understanding base endurance and why it should make up most of your training.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'The long ride, foundation of your progress', subtitle: 'Understanding base endurance and why it should make up most of your training.' },
      { type: 'big-numbers', items: [
        { value: '80%', label: 'of volume' },
        { value: 'Zone 2', label: 'target zone' },
        { value: '1h30+', label: 'ideal duration' },
      ]},
      { type: 'intro', title: 'What is an endurance ride?', text: "Base endurance means riding at an intensity where you can hold a conversation. Your heart works in zone 2 (between 60 and 75% of your maximum heart rate — the pace where you breathe a bit harder without being out of breath). It doesn't look impressive but it builds your entire aerobic base (your body's ability to use oxygen to produce energy)." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '❤️', title: 'Stronger heart', text: 'Increases the volume of blood pumped per beat — your heart becomes more efficient' },
        { emoji: '🔥', title: 'Burns fat', text: 'At this intensity, your body primarily draws from fat reserves' },
        { emoji: '🧠', title: 'Mental toughness', text: 'Teaches you to manage effort over time and stay consistent' },
        { emoji: '🩸', title: 'Better circulation', text: 'Develops the small blood vessels in your muscles (capillaries)' },
      ]},
      { type: 'caution', items: [
        "Don't start too fast — the most common mistake is riding too hard and drifting into zone 3 without realizing",
        'Stay hydrated regularly beyond 1 hour of effort',
        'Bring food for rides over 2 hours (bars, gels, dried fruit)',
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Coffee ride', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '1h–1h30' }, { label: 'Distance', value: '25–40 km' }, { label: 'Intensity', value: 'Zone 2' }], description: "Ride at conversation pace. If you can't talk anymore, slow down. The goal is to finish fresh, not exhausted." },
        { name: 'Weekend long ride', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '2h30–3h' }, { label: 'Distance', value: '60–90 km' }, { label: 'Intensity', value: 'Zone 2' }], description: "The ride that builds your base. Bring bars and water. Eat before you're hungry, drink before you're thirsty." },
        { name: 'Ultra endurance', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '4h+' }, { label: 'Distance', value: '100+ km' }, { label: 'Intensity', value: 'Zone 1-2' }], description: 'Plan your nutrition ahead. Aim for refueling every 45 minutes. Your mind takes over after 3 hours.' },
      ]},
      { type: 'tip', text: 'Endurance is the invisible foundation on which everything else is built. Without it, intervals and tempo only produce temporary results.' },
    ],
  },
  {
    sport: 'velo',
    sessionType: 'intervals',
    title: 'Intervals, your performance accelerator',
    subtitle: 'Alternating hard efforts and recovery to progress faster.',
    blocks: [
      { type: 'hero', tag: 'Intervals', title: 'Intervals, your performance accelerator', subtitle: 'Alternating hard efforts and recovery to progress faster.' },
    ],
  },
  {
    sport: 'velo',
    sessionType: 'tempo',
    title: 'Tempo rides, pushing your threshold',
    subtitle: 'Riding at threshold to build sustained power.',
    blocks: [
      { type: 'hero', tag: 'Tempo', title: 'Tempo rides, pushing your threshold', subtitle: 'Riding at threshold to build sustained power.' },
    ],
  },
  {
    sport: 'velo',
    sessionType: 'recovery',
    title: 'Recovery rides, essential and underrated',
    subtitle: 'Why riding easy is just as important as riding hard.',
    blocks: [
      { type: 'hero', tag: 'Recovery', title: 'Recovery rides, essential and underrated', subtitle: 'Why riding easy is just as important as riding hard.' },
    ],
  },
  {
    sport: 'velo',
    sessionType: 'climbing',
    title: 'Climb stronger, climb smarter',
    subtitle: 'Techniques and workouts to improve on hills.',
    blocks: [
      { type: 'hero', tag: 'Climbing', title: 'Climb stronger, climb smarter', subtitle: 'Techniques and workouts to improve on hills.' },
    ],
  },
  // Running
  {
    sport: 'course',
    sessionType: 'endurance',
    title: 'The long run, foundation of everything',
    subtitle: 'Run slow to run long — and get faster.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'The long run, foundation of everything', subtitle: 'Run slow to run long — and get faster.' },
    ],
  },
  {
    sport: 'course',
    sessionType: 'intervals',
    title: 'Running intervals',
    subtitle: 'Short, intense reps to build speed.',
    blocks: [
      { type: 'hero', tag: 'Intervals', title: 'Running intervals', subtitle: 'Short, intense reps to build speed.' },
    ],
  },
  {
    sport: 'course',
    sessionType: 'tempo',
    title: 'Tempo runs, your race pace builder',
    subtitle: 'Running at threshold to push your race limits.',
    blocks: [
      { type: 'hero', tag: 'Tempo', title: 'Tempo runs, your race pace builder', subtitle: 'Running at threshold to push your race limits.' },
    ],
  },
  {
    sport: 'course',
    sessionType: 'recovery',
    title: 'Recovery jogs',
    subtitle: 'Easy running to absorb hard workouts.',
    blocks: [
      { type: 'hero', tag: 'Recovery', title: 'Recovery jogs', subtitle: 'Easy running to absorb hard workouts.' },
    ],
  },
  {
    sport: 'course',
    sessionType: 'fartlek',
    title: 'Fartlek, the speed play',
    subtitle: 'Vary your pace by feel for fun and fitness.',
    blocks: [
      { type: 'hero', tag: 'Fartlek', title: 'Fartlek, the speed play', subtitle: 'Vary your pace by feel for fun and fitness.' },
    ],
  },
  // Swimming
  {
    sport: 'natation',
    sessionType: 'endurance',
    title: 'Endurance swimming, building your aerobic base',
    subtitle: 'Swim long at a steady pace to build your foundation.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'Endurance swimming, building your aerobic base', subtitle: 'Swim long at a steady pace to build your foundation.' },
    ],
  },
  {
    sport: 'natation',
    sessionType: 'intervals',
    title: 'Pool interval sets',
    subtitle: 'Timed reps to build speed in the water.',
    blocks: [
      { type: 'hero', tag: 'Intervals', title: 'Pool interval sets', subtitle: 'Timed reps to build speed in the water.' },
    ],
  },
  {
    sport: 'natation',
    sessionType: 'technique',
    title: 'Drills first, speed second',
    subtitle: 'Work on form to become more efficient in the water.',
    blocks: [
      { type: 'hero', tag: 'Technique', title: 'Drills first, speed second', subtitle: 'Work on form to become more efficient in the water.' },
    ],
  },
  {
    sport: 'natation',
    sessionType: 'recovery',
    title: 'Recovery swim sessions',
    subtitle: 'Easy laps to recover and loosen up in the water.',
    blocks: [
      { type: 'hero', tag: 'Recovery', title: 'Recovery swim sessions', subtitle: 'Easy laps to recover and loosen up in the water.' },
    ],
  },
  {
    sport: 'natation',
    sessionType: 'mixed',
    title: 'Mixed sessions, variety in the pool',
    subtitle: 'Combine strokes and goals in one workout.',
    blocks: [
      { type: 'hero', tag: 'Mixed', title: 'Mixed sessions, variety in the pool', subtitle: 'Combine strokes and goals in one workout.' },
    ],
  },
  // Walking
  {
    sport: 'marche',
    sessionType: 'walk',
    title: 'Walking, the most underrated exercise',
    subtitle: 'Regular walking transforms your health — no strain needed.',
    blocks: [
      { type: 'hero', tag: 'Walk', title: 'Walking, the most underrated exercise', subtitle: 'Regular walking transforms your health — no strain needed.' },
    ],
  },
  {
    sport: 'marche',
    sessionType: 'brisk',
    title: 'Brisk walking, cardio without running',
    subtitle: 'Pick up the pace for a real cardiovascular workout.',
    blocks: [
      { type: 'hero', tag: 'Brisk walk', title: 'Brisk walking, cardio without running', subtitle: 'Pick up the pace for a real cardiovascular workout.' },
    ],
  },
  {
    sport: 'marche',
    sessionType: 'hike',
    title: 'Hiking, effort meets adventure',
    subtitle: 'Long distances and elevation for a complete workout.',
    blocks: [
      { type: 'hero', tag: 'Hiking', title: 'Hiking, effort meets adventure', subtitle: 'Long distances and elevation for a complete workout.' },
    ],
  },
  {
    sport: 'marche',
    sessionType: 'recovery',
    title: 'Recovery walks',
    subtitle: 'Move gently to help your body recover.',
    blocks: [
      { type: 'hero', tag: 'Recovery', title: 'Recovery walks', subtitle: 'Move gently to help your body recover.' },
    ],
  },
];

export function getArticlesForSport(sport: string, locale: string): LibraryArticle[] {
  const articles = locale === 'en' ? LIBRARY_ARTICLES_EN : LIBRARY_ARTICLES_FR;
  return articles.filter((a) => a.sport === sport);
}

export function getArticle(sport: string, sessionType: string, locale: string): LibraryArticle | undefined {
  const articles = locale === 'en' ? LIBRARY_ARTICLES_EN : LIBRARY_ARTICLES_FR;
  return articles.find((a) => a.sport === sport && a.sessionType === sessionType);
}
