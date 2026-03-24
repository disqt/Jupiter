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
