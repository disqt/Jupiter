import type { LibraryArticle } from './library-content';

export const SWIMMING_ARTICLES_FR: LibraryArticle[] = [
  // 1. Endurance
  {
    sport: 'natation',
    sessionType: 'endurance',
    title: 'La nage longue, construire son aérobie',
    subtitle: 'Nager longtemps à allure régulière pour bâtir votre fond.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'La nage longue, construire son aérobie', subtitle: 'Nager longtemps à allure régulière pour bâtir votre fond.' },
      { type: 'big-numbers', items: [
        { value: '70%', label: 'du volume' },
        { value: 'Zone 2', label: 'zone cible' },
        { value: '20–45 min', label: 'durée idéale' },
      ]},
      { type: 'intro', title: "C'est quoi la nage en endurance ?", text: "Nager en endurance, c'est enchaîner les longueurs à une allure régulière et confortable, en Zone 2 (entre 60 et 75% de votre fréquence cardiaque maximale — le rythme où vous pourriez parler entre deux respirations). L'objectif n'est pas la vitesse mais la constance. Ce travail développe votre base aérobie (la capacité de votre corps à utiliser l'oxygène efficacement), améliore votre technique par la répétition, et vous apprend à trouver un rythme respiratoire fluide. En piscine, c'est l'équivalent de la sortie longue en vélo ou du footing lent en course à pied." },
      { type: 'benefits-grid', title: 'Pourquoi la faire ?', items: [
        { emoji: '❤️', title: 'Cœur plus efficace', text: "L'effort prolongé à basse intensité augmente le volume d'éjection de votre cœur — il pompe plus de sang à chaque battement" },
        { emoji: '🫁', title: 'Capacité respiratoire', text: "La respiration contrôlée en nageant développe vos muscles respiratoires et votre capacité pulmonaire fonctionnelle" },
        { emoji: '🏊', title: 'Technique automatisée', text: "Les longueurs répétées ancrent les bons gestes — votre corps mémorise le mouvement sans que vous y pensiez" },
        { emoji: '🔥', title: 'Brûleur de graisses', text: "À cette intensité, votre corps puise principalement dans les réserves lipidiques pour produire de l'énergie" },
      ]},
      { type: 'caution', items: [
        "Respirez régulièrement — ne bloquez jamais votre respiration. Expirez sous l'eau de manière continue et inspirez vite en tournant la tête",
        "Ne forcez pas sur le rythme. Si vous êtes essoufflé après quelques longueurs, ralentissez ou faites une pause au mur",
        "Hydratez-vous entre les séries même en piscine — on transpire dans l'eau sans s'en rendre compte",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Première nage continue', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '20 min' }, { label: 'Distance', value: '500–700 m' }, { label: 'Intensité', value: 'Zone 2' }], description: "Nagez en crawl ou en brasse à votre rythme, sans vous arrêter. Si besoin, passez en brasse pour récupérer sans arrêter de nager. L'objectif : 20 minutes continues. La vitesse n'a aucune importance." },
        { name: 'Le 1500 m régulier', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '30–35 min' }, { label: 'Distance', value: '1500 m' }, { label: 'Intensité', value: 'Zone 2' }], description: "Nagez 1500 m en crawl à allure constante. Comptez vos coups de bras par longueur (visez la régularité, par exemple 18–20 mouvements par 25 m). Respirez tous les 3 ou 5 mouvements pour équilibrer les deux côtés." },
        { name: 'Le 3000 m aérobie', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '45–55 min' }, { label: 'Distance', value: '3000+ m' }, { label: 'Intensité', value: 'Zone 1-2' }], description: "Enchaînez 3000 m en crawl avec un temps de passage stable (par exemple 1 min 50 par 100 m). Variez la respiration : 500 m tous les 3 mouvements, 500 m tous les 5, etc. Travaillez le relâchement et l'efficacité de chaque coup de bras." },
      ]},
      { type: 'tip', text: "💡 Comptez vos coups de bras par longueur. Si ce nombre augmente au fil de la séance, c'est que votre technique se dégrade — ralentissez plutôt que de forcer. Moins de coups de bras pour la même distance = plus d'efficacité." },
    ],
  },
  // 2. Intervals
  {
    sport: 'natation',
    sessionType: 'intervals',
    title: 'Les séries fractionnées en piscine',
    subtitle: 'Des répétitions chronométrées pour gagner en vitesse.',
    blocks: [
      { type: 'hero', tag: 'Intervalles', title: 'Les séries fractionnées en piscine', subtitle: 'Des répétitions chronométrées pour gagner en vitesse.' },
      { type: 'big-numbers', items: [
        { value: '1–2x', label: 'par semaine' },
        { value: 'Zone 4-5', label: 'intensité effort' },
        { value: '15–30s', label: 'repos type' },
      ]},
      { type: 'intro', title: "C'est quoi le fractionné en natation ?", text: "Le fractionné consiste à nager des répétitions à haute intensité, entrecoupées de temps de repos. Par exemple, 10 fois 100 mètres en partant toutes les 2 minutes. Votre cœur travaille en Zone 4 à Zone 5 (85 à 95% de votre fréquence cardiaque maximale — un effort où parler est impossible). Ce type de séance stimule votre VO2max (la quantité maximale d'oxygène que votre corps peut utiliser), augmente votre seuil lactique (le point où l'acide lactique s'accumule dans vos muscles), et vous apprend à maintenir une bonne technique sous fatigue. En piscine, le mur offre un repère naturel pour structurer chaque répétition." },
      { type: 'benefits-grid', title: 'Pourquoi le faire ?', items: [
        { emoji: '⚡', title: 'Vitesse pure', text: "Nager vite régulièrement entraîne votre système neuromusculaire à recruter plus de fibres musculaires" },
        { emoji: '📈', title: 'VO2max en hausse', text: "Les efforts courts et intenses augmentent votre capacité maximale à utiliser l'oxygène" },
        { emoji: '🧱', title: 'Résistance à la fatigue', text: "Votre corps apprend à maintenir la technique et la vitesse malgré l'accumulation de fatigue" },
        { emoji: '⏱️', title: 'Efficacité du temps', text: "En 30–40 minutes, vous obtenez un stimulus d'entraînement que 1h30 d'endurance ne peut pas fournir" },
      ]},
      { type: 'caution', items: [
        "Échauffez-vous toujours avant — au moins 400 m de nage facile avant de commencer les séries rapides",
        "Respectez les temps de repos. Raccourcir la récupération ne vous rend pas plus fort, ça dégrade votre technique",
        "Limitez le fractionné à 1 ou 2 séances par semaine — vos muscles et votre système nerveux ont besoin de récupérer",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: '8×50 m découverte', level: 'beginner' as const, metrics: [{ label: 'Séries', value: '8×50 m' }, { label: 'Repos', value: '30s au mur' }, { label: 'Distance totale', value: '~800 m' }], description: "Après 200 m d'échauffement, nagez 8 fois 50 mètres (2 longueurs en bassin de 25 m) à allure soutenue. Prenez 30 secondes de repos au mur entre chaque répétition. Terminez par 200 m calmes. Concentrez-vous sur un mouvement propre même quand la fatigue arrive." },
        { name: '10×100 m chrono', level: 'intermediate' as const, metrics: [{ label: 'Séries', value: '10×100 m' }, { label: 'Repos', value: '20s au mur' }, { label: 'Distance totale', value: '~1800 m' }], description: "400 m d'échauffement varié. Puis 10 fois 100 m en crawl : les 5 premiers à allure rapide régulière, les 5 derniers en essayant de descendre le temps (séries descendantes). 20 secondes de repos entre chaque. 400 m de retour au calme. Notez vos temps pour suivre votre progression." },
        { name: '5×200 m seuil', level: 'advanced' as const, metrics: [{ label: 'Séries', value: '5×200 m' }, { label: 'Repos', value: '15–20s' }, { label: 'Distance totale', value: '~2500 m' }], description: "600 m d'échauffement incluant des éducatifs. Puis 5 fois 200 m à allure seuil (le rythme le plus rapide que vous pouvez tenir sur 200 m de manière répétée). 15 à 20 secondes de repos. Respirez tous les 3 mouvements, maintenez un gainage constant. 400 m de retour au calme. Visez des temps réguliers (moins de 3 secondes d'écart entre le premier et le dernier)." },
      ]},
      { type: 'tip', text: "💡 Utilisez l'horloge murale de la piscine plutôt qu'une montre. Partez toujours à la même position d'aiguille — cela vous donne un repère fiable et vous évite de tripoter votre équipement entre les séries." },
    ],
  },
  // 3. Technique
  {
    sport: 'natation',
    sessionType: 'technique',
    title: 'Les éducatifs, nager mieux avant de nager plus',
    subtitle: "Travailler sa technique pour être plus efficace dans l'eau.",
    blocks: [
      { type: 'hero', tag: 'Technique', title: 'Les éducatifs, nager mieux avant de nager plus', subtitle: "Travailler sa technique pour être plus efficace dans l'eau." },
      { type: 'big-numbers', items: [
        { value: '–20%', label: 'coups de bras' },
        { value: '3-5', label: 'éducatifs clés' },
        { value: '100%', label: 'concentration' },
      ]},
      { type: 'intro', title: 'Pourquoi travailler la technique ?', text: "L'eau est 800 fois plus dense que l'air. Chaque défaut technique — une main qui entre mal, une tête trop haute, des jambes qui freinent — vous coûte de l'énergie. Les éducatifs (des exercices ciblés qui isolent un aspect du mouvement) corrigent ces défauts un par un. Travailler sa technique permet de nager plus vite sans effort supplémentaire, simplement en réduisant la résistance à l'avancement (la traînée). Un nageur efficace parcourt 25 mètres en 12 à 16 coups de bras. Un nageur débutant en fait souvent 25 à 30. L'objectif de ces séances : réduire cet écart." },
      { type: 'benefits-grid', title: 'Pourquoi les faire ?', items: [
        { emoji: '💨', title: 'Moins de résistance', text: "Une meilleure position dans l'eau réduit la traînée — vous glissez au lieu de lutter contre l'eau" },
        { emoji: '🔋', title: 'Économie d\'énergie', text: "Moins de mouvements parasites = plus de distance pour le même effort" },
        { emoji: '🩹', title: 'Prévention des blessures', text: "Un geste correct protège vos épaules — la blessure la plus courante chez les nageurs (tendinite de la coiffe des rotateurs)" },
        { emoji: '📐', title: 'Base pour progresser', text: "Sans technique correcte, ajouter du volume ou de l'intensité ne fait qu'ancrer de mauvaises habitudes" },
      ]},
      { type: 'caution', items: [
        "Ne faites pas les éducatifs à toute vitesse — l'objectif est la qualité du geste, pas la vitesse d'exécution",
        "Si un éducatif vous semble impossible, simplifiez-le (utilisez des palmes ou un pull-buoy pour le support)",
        "Filmez-vous ou demandez à quelqu'un de vous regarder — en natation, ce qu'on ressent et ce qu'on fait sont souvent très différents",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Initiation éducatifs', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '30 min' }, { label: 'Distance', value: '600–800 m' }, { label: 'Focus', value: 'Position + respiration' }], description: "200 m d'échauffement souple. Puis : 4×25 m battements sur le côté (un bras devant, un bras le long du corps, rotation pour respirer) — 4×25 m rattrapé (les deux mains se touchent devant avant chaque coup de bras) — 4×25 m point fermé (nager avec les poings pour sentir l'appui de l'avant-bras). 15 secondes de repos entre chaque 25 m. Terminez par 200 m en nage complète en appliquant ce que vous avez travaillé." },
        { name: 'Pull-kick-drill combo', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '40 min' }, { label: 'Distance', value: '1200–1500 m' }, { label: 'Focus', value: 'Catch + rotation' }], description: "300 m d'échauffement. Puis 3 blocs de : 100 m pull-buoy (bras seuls, focus sur la prise d'eau ou \"catch\") + 100 m planche (jambes seules, battements réguliers depuis les hanches) + 100 m éducatif au choix (rattrapé, bras tendu, ou nage désynchronisée). 200 m de nage complète à allure modérée en intégrant les sensations. 200 m retour au calme en dos." },
        { name: 'Affinement du geste', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '50 min' }, { label: 'Distance', value: '2000+ m' }, { label: 'Focus', value: 'Efficacité globale' }], description: "400 m d'échauffement varié (100 crawl, 100 dos, 100 brasse, 100 éducatif). Puis : 4×50 m nage complète en comptant les coups de bras (objectif : réduire d'1 coup par longueur) — 4×50 m godille (sculling) position haute puis basse — 4×50 m crawl un bras avec rotation complète — 4×100 m nage complète à 75% en maintenant le minimum de coups de bras. 300 m retour au calme. L'objectif : chaque longueur doit être plus efficace que la précédente." },
      ]},
      { type: 'tip', text: "💡 Choisissez un seul point technique par séance. Tout corriger en même temps est impossible. Aujourd'hui la respiration, demain la rotation, après-demain le battement. Votre cerveau apprend mieux quand il se concentre sur une chose à la fois." },
    ],
  },
  // 4. Recovery
  {
    sport: 'natation',
    sessionType: 'recovery',
    title: 'La séance récup en natation',
    subtitle: "Nager doucement pour récupérer et détendre le corps dans l'eau.",
    blocks: [
      { type: 'hero', tag: 'Récupération', title: 'La séance récup en natation', subtitle: "Nager doucement pour récupérer et détendre le corps dans l'eau." },
      { type: 'big-numbers', items: [
        { value: 'Zone 1', label: 'intensité max' },
        { value: '60%', label: 'effort perçu' },
        { value: '0', label: 'essoufflement' },
      ]},
      { type: 'intro', title: "Pourquoi nager doucement est essentiel ?", text: "La récupération active en piscine est l'un des meilleurs outils de régénération. L'eau exerce une pression hydrostatique (une compression douce et uniforme sur tout le corps) qui favorise le retour veineux et réduit les inflammations musculaires. L'apesanteur relative dans l'eau décharge vos articulations. Vous nagez en Zone 1 (moins de 60% de votre fréquence cardiaque maximale — le rythme où vous ne sentez quasiment aucun effort). L'objectif n'est ni la distance ni le chrono : c'est de bouger sans stress pour accélérer la récupération entre deux séances difficiles." },
      { type: 'benefits-grid', title: 'Pourquoi la faire ?', items: [
        { emoji: '💆', title: 'Détente musculaire', text: "La pression de l'eau masse vos muscles et réduit les tensions accumulées après les entraînements intenses" },
        { emoji: '🩸', title: 'Circulation améliorée', text: "L'immersion favorise le retour veineux et aide à évacuer les déchets métaboliques des muscles" },
        { emoji: '🦴', title: 'Zéro impact', text: "L'eau porte votre poids — vos articulations, tendons et os se reposent complètement" },
        { emoji: '🧘', title: 'Pause mentale', text: "L'eau coupe les stimulations extérieures. C'est un moment de calme qui réduit le cortisol (hormone du stress)" },
      ]},
      { type: 'caution', items: [
        "Si vous êtes tenté d'accélérer, c'est que ce n'est plus de la récupération. Résistez à l'envie de « rentabiliser » la séance",
        "Évitez le papillon et les sprints — gardez les nages douces (dos crawlé, brasse coulée, crawl souple)",
        "Ne négligez pas l'hydratation même pour une séance facile — l'eau chaude de la piscine favorise la déshydratation",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Récup express', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '15–20 min' }, { label: 'Distance', value: '400–500 m' }, { label: 'Intensité', value: 'Zone 1' }], description: "Alternez 50 m de brasse tranquille et 50 m de dos crawlé à votre rythme. Concentrez-vous sur des mouvements amples et relâchés. Aucun objectif de chrono. Si vous voulez, faites des pauses au mur pour vous étirer. Terminez par quelques longueurs de jambes sans planche, sur le dos." },
        { name: 'Récup 30 minutes', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '30 min' }, { label: 'Distance', value: '800–1000 m' }, { label: 'Intensité', value: 'Zone 1' }], description: "Commencez par 200 m de dos crawlé. Puis alternez des blocs de 100 m : crawl souple (bras longs, grande glisse), brasse lente, dos. Pensez à allonger chaque mouvement au maximum. Intercalez 2×50 m de battements doux sur le dos entre les blocs. Pas de chrono, pas de compétition avec le voisin de ligne." },
        { name: 'Récup variété', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '40–45 min' }, { label: 'Distance', value: '1500–1800 m' }, { label: 'Intensité', value: 'Zone 1' }], description: "400 m de nage au choix très souple. Puis 4 blocs de : 100 m nage complète (en alternant crawl, dos, brasse) + 50 m éducatif technique léger (rattrapé, godille, ou toucher d'épaule). 4×50 m pull-buoy ultra-relâché. 200 m de dos final. Profitez du silence sous l'eau — c'est une séance de méditation en mouvement." },
      ]},
      { type: 'tip', text: "💡 La séance récup est celle que les nageurs sérieux ne sautent jamais. C'est souvent la plus agréable. Allez-y le lendemain d'une grosse séance — vos muscles vous remercieront et vous serez plus frais pour le prochain entraînement dur." },
    ],
  },
  // 5. Mixed
  {
    sport: 'natation',
    sessionType: 'mixed',
    title: 'La séance mixte, varier les plaisirs',
    subtitle: 'Combiner les nages et les objectifs dans une même séance.',
    blocks: [
      { type: 'hero', tag: 'Mixte', title: 'La séance mixte, varier les plaisirs', subtitle: 'Combiner les nages et les objectifs dans une même séance.' },
      { type: 'big-numbers', items: [
        { value: '4', label: 'nages combinées' },
        { value: '3', label: 'objectifs par séance' },
        { value: '∞', label: 'variété possible' },
      ]},
      { type: 'intro', title: "C'est quoi une séance mixte ?", text: "Une séance mixte combine plusieurs nages (crawl, dos, brasse, papillon) et plusieurs objectifs (endurance, vitesse, technique) dans un même entraînement. C'est le principe du 4 nages ou « Individual Medley » (une épreuve où vous enchaînez les 4 nages dans l'ordre : papillon, dos, brasse, crawl). Ce format développe une condition physique complète, sollicite tous les groupes musculaires, et casse la monotonie. C'est aussi un excellent moyen de découvrir des nages que vous pratiquez rarement — la brasse et le dos travaillent des muscles différents du crawl, ce qui rééquilibre votre corps." },
      { type: 'benefits-grid', title: 'Pourquoi la faire ?', items: [
        { emoji: '🎯', title: 'Complet musculairement', text: "Chaque nage sollicite des chaînes musculaires différentes — la séance mixte travaille tout le corps sans déséquilibre" },
        { emoji: '🧩', title: 'Antidote à l\'ennui', text: "Changer de nage, d'allure et d'objectif toutes les quelques longueurs garde votre esprit engagé" },
        { emoji: '🔄', title: 'Adaptabilité', text: "Vous apprenez à passer d'une nage à l'autre, ce qui développe votre coordination et votre polyvalence dans l'eau" },
        { emoji: '⚖️', title: 'Équilibre corporel', text: "Le dos et la brasse compensent les déséquilibres créés par la pratique exclusive du crawl (épaules, cou)" },
      ]},
      { type: 'caution', items: [
        "N'introduisez le papillon que si vous maîtrisez un minimum le mouvement — mal exécuté, il fatigue les épaules et le dos inutilement",
        "Respectez l'échauffement même pour une séance variée — vos épaules ont besoin d'être préparées avant les efforts",
        "Si vous ne connaissez que le crawl, commencez par ajouter le dos crawlé — c'est la nage complémentaire la plus accessible",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Découverte multi-nages', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '25–30 min' }, { label: 'Distance', value: '600–800 m' }, { label: 'Nages', value: '3 (crawl, dos, brasse)' }], description: "200 m d'échauffement en crawl. Puis 6 blocs de : 25 m crawl + 25 m dos + 25 m brasse + 25 m au choix (votre nage préférée). 15 à 20 secondes de repos entre chaque bloc. Terminez par 100 m tranquilles. Concentrez-vous sur la transition entre les nages — prenez le temps de vous repositionner au mur." },
        { name: 'Séance 4 nages', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '40–45 min' }, { label: 'Distance', value: '1500–1800 m' }, { label: 'Nages', value: '4 (papillon, dos, brasse, crawl)' }], description: "400 m d'échauffement (100 par nage). Puis : 4×100 m 4 nages (25 papillon + 25 dos + 25 brasse + 25 crawl) avec 20s de repos — 4×50 m au choix à allure soutenue avec 15s de repos — 200 m pull-buoy crawl souple. 200 m retour au calme en dos. Le 4 nages est exigeant : si le papillon vous épuise, remplacez-le par du dos ondulé (dolphin kick sur le dos)." },
        { name: 'Prépa triathlon / mixte avancé', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '55–60 min' }, { label: 'Distance', value: '2500–3000 m' }, { label: 'Nages', value: '4 + éducatifs' }], description: "500 m échauffement progressif (200 crawl + 200 4 nages + 100 éducatif). Bloc 1 — endurance : 800 m crawl continu à allure modérée. Bloc 2 — vitesse : 6×50 m (2 papillon, 2 dos, 2 crawl) à 85% avec 15s repos. Bloc 3 — technique : 4×100 m pull-buoy avec comptage de coups. Bloc 4 — 200 m 4 nages à allure rapide. 400 m retour au calme varié. Cette séance combine tous les systèmes énergétiques en une seule session." },
      ]},
      { type: 'tip', text: "💡 Apprendre au moins 3 nages différentes est le meilleur investissement en natation. Quand vous êtes fatigué du crawl, le dos vous repose. Quand vos épaules tirent, la brasse prend le relais. La polyvalence, c'est la durabilité." },
    ],
  },
];

export const SWIMMING_ARTICLES_EN: LibraryArticle[] = [
  // 1. Endurance
  {
    sport: 'natation',
    sessionType: 'endurance',
    title: 'Endurance swimming, building your aerobic base',
    subtitle: 'Swim long at a steady pace to build your foundation.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'Endurance swimming, building your aerobic base', subtitle: 'Swim long at a steady pace to build your foundation.' },
      { type: 'big-numbers', items: [
        { value: '70%', label: 'of volume' },
        { value: 'Zone 2', label: 'target zone' },
        { value: '20–45 min', label: 'ideal duration' },
      ]},
      { type: 'intro', title: 'What is endurance swimming?', text: "Endurance swimming means swimming lap after lap at a comfortable, steady pace in Zone 2 (between 60 and 75% of your maximum heart rate — the rhythm where you could speak between breaths). The goal is not speed but consistency. This work builds your aerobic base (your body's ability to use oxygen efficiently), improves your technique through repetition, and teaches you to find a smooth breathing rhythm. In the pool, it's the equivalent of the long ride in cycling or the easy jog in running." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '❤️', title: 'More efficient heart', text: 'Prolonged low-intensity effort increases your stroke volume — your heart pumps more blood per beat' },
        { emoji: '🫁', title: 'Respiratory capacity', text: 'Controlled breathing while swimming strengthens your respiratory muscles and functional lung capacity' },
        { emoji: '🏊', title: 'Automated technique', text: 'Repeated laps engrain good movement patterns — your body memorizes the stroke without conscious effort' },
        { emoji: '🔥', title: 'Fat burning', text: 'At this intensity, your body primarily draws from fat reserves for energy production' },
      ]},
      { type: 'caution', items: [
        "Breathe regularly — never hold your breath. Exhale continuously underwater and inhale quickly when you turn your head",
        "Don't push the pace. If you're out of breath after a few laps, slow down or take a break at the wall",
        "Stay hydrated between sets even in the pool — you sweat in the water without realizing it",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'First continuous swim', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '20 min' }, { label: 'Distance', value: '500–700 m' }, { label: 'Intensity', value: 'Zone 2' }], description: "Swim freestyle or breaststroke at your own pace, without stopping. If needed, switch to breaststroke to recover without stopping. The goal: 20 continuous minutes. Speed does not matter at all." },
        { name: 'The steady 1500 m', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '30–35 min' }, { label: 'Distance', value: '1500 m' }, { label: 'Intensity', value: 'Zone 2' }], description: "Swim 1500 m freestyle at a consistent pace. Count your strokes per length (aim for consistency, e.g. 18–20 strokes per 25 m). Breathe every 3 or 5 strokes to balance both sides." },
        { name: 'The 3000 m aerobic swim', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '45–55 min' }, { label: 'Distance', value: '3000+ m' }, { label: 'Intensity', value: 'Zone 1-2' }], description: "Swim 3000 m freestyle with consistent split times (e.g. 1 min 50 per 100 m). Vary your breathing pattern: 500 m every 3 strokes, 500 m every 5, etc. Focus on relaxation and efficiency in every stroke." },
      ]},
      { type: 'tip', text: "💡 Count your strokes per length. If that number increases as the session goes on, your technique is breaking down — slow down rather than forcing it. Fewer strokes for the same distance = more efficiency." },
    ],
  },
  // 2. Intervals
  {
    sport: 'natation',
    sessionType: 'intervals',
    title: 'Pool interval sets',
    subtitle: 'Timed reps to build speed in the water.',
    blocks: [
      { type: 'hero', tag: 'Intervals', title: 'Pool interval sets', subtitle: 'Timed reps to build speed in the water.' },
      { type: 'big-numbers', items: [
        { value: '1–2x', label: 'per week' },
        { value: 'Zone 4-5', label: 'effort intensity' },
        { value: '15–30s', label: 'typical rest' },
      ]},
      { type: 'intro', title: 'What are pool intervals?', text: "Interval training means swimming repetitions at high intensity, interspersed with rest periods. For example, 10 times 100 meters leaving every 2 minutes. Your heart works in Zone 4 to Zone 5 (85 to 95% of your maximum heart rate — an effort where talking is impossible). This type of session stimulates your VO2max (the maximum amount of oxygen your body can use), raises your lactate threshold (the point where lactic acid accumulates in your muscles), and teaches you to maintain good technique under fatigue. In the pool, the wall provides a natural marker to structure each rep." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '⚡', title: 'Raw speed', text: 'Swimming fast regularly trains your neuromuscular system to recruit more muscle fibers' },
        { emoji: '📈', title: 'VO2max boost', text: 'Short, intense efforts increase your maximum oxygen uptake capacity' },
        { emoji: '🧱', title: 'Fatigue resistance', text: 'Your body learns to maintain technique and speed despite accumulating fatigue' },
        { emoji: '⏱️', title: 'Time efficiency', text: "In 30–40 minutes, you get a training stimulus that 1h30 of endurance can't provide" },
      ]},
      { type: 'caution', items: [
        "Always warm up first — at least 400 m of easy swimming before starting fast sets",
        "Respect rest times. Cutting recovery doesn't make you stronger, it degrades your technique",
        "Limit intervals to 1 or 2 sessions per week — your muscles and nervous system need time to recover",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: '8×50 m starter set', level: 'beginner' as const, metrics: [{ label: 'Sets', value: '8×50 m' }, { label: 'Rest', value: '30s at wall' }, { label: 'Total distance', value: '~800 m' }], description: "After a 200 m warm-up, swim 8 times 50 meters (2 lengths in a 25 m pool) at a strong pace. Take 30 seconds rest at the wall between each rep. Finish with 200 m easy. Focus on clean technique even when fatigue sets in." },
        { name: '10×100 m timed', level: 'intermediate' as const, metrics: [{ label: 'Sets', value: '10×100 m' }, { label: 'Rest', value: '20s at wall' }, { label: 'Total distance', value: '~1800 m' }], description: "400 m varied warm-up. Then 10 times 100 m freestyle: the first 5 at a steady fast pace, the last 5 trying to drop the time (descending sets). 20 seconds rest between each. 400 m cool-down. Write down your times to track your progress." },
        { name: '5×200 m threshold', level: 'advanced' as const, metrics: [{ label: 'Sets', value: '5×200 m' }, { label: 'Rest', value: '15–20s' }, { label: 'Total distance', value: '~2500 m' }], description: "600 m warm-up including drills. Then 5 times 200 m at threshold pace (the fastest rhythm you can sustain over 200 m repeatedly). 15 to 20 seconds rest. Breathe every 3 strokes, maintain constant core engagement. 400 m cool-down. Aim for consistent times (less than 3 seconds gap between first and last)." },
      ]},
      { type: 'tip', text: "💡 Use the pool's pace clock rather than a watch. Always leave at the same hand position — it gives you a reliable marker and saves you fiddling with gear between sets." },
    ],
  },
  // 3. Technique
  {
    sport: 'natation',
    sessionType: 'technique',
    title: 'Drills first, speed second',
    subtitle: 'Work on form to become more efficient in the water.',
    blocks: [
      { type: 'hero', tag: 'Technique', title: 'Drills first, speed second', subtitle: 'Work on form to become more efficient in the water.' },
      { type: 'big-numbers', items: [
        { value: '–20%', label: 'strokes per length' },
        { value: '3-5', label: 'key drills' },
        { value: '100%', label: 'focus' },
      ]},
      { type: 'intro', title: 'Why work on technique?', text: "Water is 800 times denser than air. Every technical flaw — a hand entering wrong, a head too high, legs dragging — costs you energy. Drills (targeted exercises that isolate one aspect of the stroke) correct these flaws one by one. Working on technique lets you swim faster without extra effort, simply by reducing drag (the resistance your body creates moving through water). An efficient swimmer covers 25 meters in 12 to 16 strokes. A beginner often takes 25 to 30. The goal of these sessions: close that gap." },
      { type: 'benefits-grid', title: 'Why do them?', items: [
        { emoji: '💨', title: 'Less drag', text: 'A better body position in the water reduces resistance — you glide instead of fighting the water' },
        { emoji: '🔋', title: 'Energy savings', text: 'Fewer wasted movements = more distance for the same effort' },
        { emoji: '🩹', title: 'Injury prevention', text: "Correct form protects your shoulders — the most common swimmer's injury (rotator cuff tendinitis)" },
        { emoji: '📐', title: 'Foundation for progress', text: 'Without proper technique, adding volume or intensity only cements bad habits' },
      ]},
      { type: 'caution', items: [
        "Don't rush through drills — the goal is movement quality, not speed of execution",
        "If a drill feels impossible, simplify it (use fins or a pull buoy for support)",
        "Film yourself or ask someone to watch — in swimming, what you feel and what you do are often very different",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Drill basics', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '30 min' }, { label: 'Distance', value: '600–800 m' }, { label: 'Focus', value: 'Position + breathing' }], description: "200 m easy warm-up. Then: 4×25 m side kick (one arm extended, one at your side, rotate to breathe) — 4×25 m catch-up drill (both hands touch in front before each stroke) — 4×25 m fist drill (swim with closed fists to feel forearm pressure). 15 seconds rest between each 25 m. Finish with 200 m full stroke, applying what you practiced." },
        { name: 'Pull-kick-drill combo', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '40 min' }, { label: 'Distance', value: '1200–1500 m' }, { label: 'Focus', value: 'Catch + rotation' }], description: "300 m warm-up. Then 3 blocks of: 100 m pull buoy (arms only, focus on the catch phase) + 100 m kickboard (legs only, steady kicks from the hips) + 100 m drill of your choice (catch-up, single arm, or desynchronized arms). 200 m full stroke at moderate pace integrating the sensations. 200 m backstroke cool-down." },
        { name: 'Advanced stroke refinement', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '50 min' }, { label: 'Distance', value: '2000+ m' }, { label: 'Focus', value: 'Overall efficiency' }], description: "400 m varied warm-up (100 free, 100 back, 100 breast, 100 drill). Then: 4×50 m full stroke counting strokes (goal: reduce by 1 per length) — 4×50 m sculling in high and low positions — 4×50 m single-arm freestyle with full rotation — 4×100 m full stroke at 75% maintaining minimum stroke count. 300 m cool-down. The goal: every length should be more efficient than the last." },
      ]},
      { type: 'tip', text: "💡 Pick one technical focus per session. Fixing everything at once is impossible. Today breathing, tomorrow rotation, the day after kicking. Your brain learns best when it focuses on one thing at a time." },
    ],
  },
  // 4. Recovery
  {
    sport: 'natation',
    sessionType: 'recovery',
    title: 'Recovery swim sessions',
    subtitle: 'Easy laps to recover and loosen up in the water.',
    blocks: [
      { type: 'hero', tag: 'Recovery', title: 'Recovery swim sessions', subtitle: 'Easy laps to recover and loosen up in the water.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 1', label: 'max intensity' },
        { value: '60%', label: 'perceived effort' },
        { value: '0', label: 'breathlessness' },
      ]},
      { type: 'intro', title: 'Why swimming easy is essential', text: "Active recovery in the pool is one of the best regeneration tools available. Water exerts hydrostatic pressure (a gentle, uniform compression on your entire body) that promotes venous return and reduces muscle inflammation. The relative buoyancy in water unloads your joints. You swim in Zone 1 (below 60% of your maximum heart rate — the pace where you feel almost no effort). The goal is neither distance nor time: it's to move without stress to speed up recovery between hard sessions." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '💆', title: 'Muscle relaxation', text: 'Water pressure massages your muscles and reduces tension built up from intense training' },
        { emoji: '🩸', title: 'Improved circulation', text: 'Immersion promotes venous return and helps flush metabolic waste from muscles' },
        { emoji: '🦴', title: 'Zero impact', text: 'Water supports your weight — your joints, tendons, and bones get complete rest' },
        { emoji: '🧘', title: 'Mental reset', text: 'Water cuts out external stimulation. It reduces cortisol (the stress hormone) and calms the mind' },
      ]},
      { type: 'caution', items: [
        "If you're tempted to speed up, it's no longer recovery. Resist the urge to \"make the session count\"",
        "Avoid butterfly and sprints — stick to gentle strokes (backstroke, easy breaststroke, relaxed freestyle)",
        "Don't skip hydration even for an easy session — warm pool water promotes dehydration",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Quick recovery', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '15–20 min' }, { label: 'Distance', value: '400–500 m' }, { label: 'Intensity', value: 'Zone 1' }], description: "Alternate 50 m of easy breaststroke and 50 m of backstroke at your own pace. Focus on long, relaxed movements. No time goals. If you want, pause at the wall to stretch. Finish with a few lengths of easy kicking on your back." },
        { name: '30-minute recovery', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '30 min' }, { label: 'Distance', value: '800–1000 m' }, { label: 'Intensity', value: 'Zone 1' }], description: "Start with 200 m backstroke. Then alternate 100 m blocks: easy freestyle (long arms, maximum glide), slow breaststroke, backstroke. Focus on extending each stroke as far as possible. Mix in 2×50 m gentle kicking on your back between blocks. No clock, no racing the swimmer next to you." },
        { name: 'Recovery variety', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '40–45 min' }, { label: 'Distance', value: '1500–1800 m' }, { label: 'Intensity', value: 'Zone 1' }], description: "400 m of any stroke, very easy. Then 4 blocks of: 100 m full stroke (alternating freestyle, back, breast) + 50 m light technique drill (catch-up, sculling, or shoulder tap). 4×50 m ultra-relaxed pull buoy. 200 m backstroke to finish. Enjoy the silence underwater — this is a moving meditation session." },
      ]},
      { type: 'tip', text: "💡 The recovery session is the one serious swimmers never skip. It's often the most enjoyable. Go the day after a hard workout — your muscles will thank you and you'll be fresher for your next intense training." },
    ],
  },
  // 5. Mixed
  {
    sport: 'natation',
    sessionType: 'mixed',
    title: 'Mixed sessions, variety in the pool',
    subtitle: 'Combine strokes and goals in one workout.',
    blocks: [
      { type: 'hero', tag: 'Mixed', title: 'Mixed sessions, variety in the pool', subtitle: 'Combine strokes and goals in one workout.' },
      { type: 'big-numbers', items: [
        { value: '4', label: 'strokes combined' },
        { value: '3', label: 'goals per session' },
        { value: '∞', label: 'possible variety' },
      ]},
      { type: 'intro', title: 'What is a mixed session?', text: "A mixed session combines multiple strokes (freestyle, backstroke, breaststroke, butterfly) and multiple objectives (endurance, speed, technique) in one workout. This is the principle behind the Individual Medley or \"IM\" (a race where you swim all 4 strokes in order: butterfly, backstroke, breaststroke, freestyle). This format develops well-rounded fitness, engages all muscle groups, and breaks monotony. It's also an excellent way to discover strokes you rarely practice — breaststroke and backstroke work different muscles than freestyle, helping rebalance your body." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '🎯', title: 'Complete muscle work', text: 'Each stroke targets different muscle chains — mixed sessions train the whole body without imbalance' },
        { emoji: '🧩', title: 'Boredom antidote', text: 'Switching strokes, paces, and goals every few lengths keeps your mind engaged' },
        { emoji: '🔄', title: 'Adaptability', text: 'You learn to transition between strokes, developing coordination and versatility in the water' },
        { emoji: '⚖️', title: 'Body balance', text: 'Backstroke and breaststroke offset the imbalances created by swimming only freestyle (shoulders, neck)' },
      ]},
      { type: 'caution', items: [
        "Only include butterfly if you have a basic grasp of the stroke — done poorly, it strains your shoulders and back unnecessarily",
        "Warm up properly even for a varied session — your shoulders need preparation before hard efforts",
        "If you only know freestyle, start by adding backstroke — it's the most accessible complementary stroke",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Multi-stroke discovery', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '25–30 min' }, { label: 'Distance', value: '600–800 m' }, { label: 'Strokes', value: '3 (free, back, breast)' }], description: "200 m freestyle warm-up. Then 6 blocks of: 25 m freestyle + 25 m backstroke + 25 m breaststroke + 25 m choice (your favorite stroke). 15 to 20 seconds rest between each block. Finish with 100 m easy. Focus on the transition between strokes — take your time to reposition at the wall." },
        { name: 'IM-focused session', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '40–45 min' }, { label: 'Distance', value: '1500–1800 m' }, { label: 'Strokes', value: '4 (fly, back, breast, free)' }], description: "400 m warm-up (100 per stroke). Then: 4×100 m IM (25 butterfly + 25 backstroke + 25 breaststroke + 25 freestyle) with 20s rest — 4×50 m choice at a strong pace with 15s rest — 200 m pull buoy easy freestyle. 200 m backstroke cool-down. The IM is demanding: if butterfly exhausts you, replace it with dolphin kick on your back." },
        { name: 'Triathlon prep / advanced mix', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '55–60 min' }, { label: 'Distance', value: '2500–3000 m' }, { label: 'Strokes', value: '4 + drills' }], description: "500 m progressive warm-up (200 free + 200 IM + 100 drill). Block 1 — endurance: 800 m continuous freestyle at moderate pace. Block 2 — speed: 6×50 m (2 fly, 2 back, 2 free) at 85% with 15s rest. Block 3 — technique: 4×100 m pull buoy with stroke counting. Block 4 — 200 m IM at race pace. 400 m varied cool-down. This session combines all energy systems in a single workout." },
      ]},
      { type: 'tip', text: "💡 Learning at least 3 different strokes is the best investment in swimming. When you're tired of freestyle, backstroke gives you a break. When your shoulders ache, breaststroke takes over. Versatility is durability." },
    ],
  },
];
