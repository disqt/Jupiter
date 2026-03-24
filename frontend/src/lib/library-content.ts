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

import { CYCLING_ARTICLES_FR, CYCLING_ARTICLES_EN } from './cycling-articles';
import { RUNNING_ARTICLES_FR, RUNNING_ARTICLES_EN } from './running-articles';
import { SWIMMING_ARTICLES_FR, SWIMMING_ARTICLES_EN } from './swimming-articles';
import { WALKING_ARTICLES_FR, WALKING_ARTICLES_EN } from './walking-articles';

// Cycling/endurance is kept inline as the reference article (full content)
const CYCLING_ENDURANCE_FR: LibraryArticle = {
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
};

const CYCLING_ENDURANCE_EN: LibraryArticle = {
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
};

export const LIBRARY_ARTICLES_FR: LibraryArticle[] = [
  CYCLING_ENDURANCE_FR,
  ...CYCLING_ARTICLES_FR,
  ...RUNNING_ARTICLES_FR,
  ...SWIMMING_ARTICLES_FR,
  ...WALKING_ARTICLES_FR,
];

export const LIBRARY_ARTICLES_EN: LibraryArticle[] = [
  CYCLING_ENDURANCE_EN,
  ...CYCLING_ARTICLES_EN,
  ...RUNNING_ARTICLES_EN,
  ...SWIMMING_ARTICLES_EN,
  ...WALKING_ARTICLES_EN,
];

export function getArticlesForSport(sport: string, locale: string): LibraryArticle[] {
  const articles = locale === 'en' ? LIBRARY_ARTICLES_EN : LIBRARY_ARTICLES_FR;
  return articles.filter((a) => a.sport === sport);
}

export function getArticle(sport: string, sessionType: string, locale: string): LibraryArticle | undefined {
  const articles = locale === 'en' ? LIBRARY_ARTICLES_EN : LIBRARY_ARTICLES_FR;
  return articles.find((a) => a.sport === sport && a.sessionType === sessionType);
}
