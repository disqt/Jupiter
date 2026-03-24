import type { LibraryArticle } from './library-content';

export const CYCLING_ARTICLES_FR: LibraryArticle[] = [
  // Intervals
  {
    sport: 'velo',
    sessionType: 'intervals',
    title: 'Le fractionné, accélérateur de performance',
    subtitle: 'Alterner efforts intenses et récupération pour progresser plus vite.',
    blocks: [
      { type: 'hero', tag: 'Intervalles', title: 'Le fractionné, accélérateur de performance', subtitle: 'Alterner efforts intenses et récupération pour progresser plus vite.' },
      { type: 'big-numbers', items: [
        { value: '2-3×', label: 'par semaine max' },
        { value: 'Zone 4-5', label: 'zone effort' },
        { value: '+15%', label: 'VO2max en 6 sem.' },
      ]},
      { type: 'intro', title: "C'est quoi le fractionné ?", text: "Le fractionné (ou entraînement par intervalles), c'est alterner des phases d'effort intense avec des phases de récupération. L'idée est simple : en découpant l'effort, vous passez plus de temps total à haute intensité que si vous rouliez fort en continu. Cela sollicite votre VO2max (la quantité maximale d'oxygène que votre corps peut utiliser — c'est le principal indicateur de votre capacité cardio). Plus votre VO2max est élevé, plus vous pouvez produire d'énergie et rouler vite." },
      { type: 'benefits-grid', title: 'Pourquoi en faire ?', items: [
        { emoji: '🚀', title: 'VO2max en hausse', text: "Stimule votre capacité maximale à utiliser l'oxygène — le facteur n°1 de la performance en endurance" },
        { emoji: '⚡', title: 'Puissance accrue', text: "Développe votre capacité à produire un effort intense et à le répéter" },
        { emoji: '⏱️', title: 'Efficacité du temps', text: "45 minutes de fractionné stimulent autant votre système cardiovasculaire que 2h d'endurance" },
        { emoji: '🧠', title: 'Résistance mentale', text: "Apprend à gérer l'inconfort et à se dépasser quand les jambes brûlent" },
      ]},
      { type: 'caution', items: [
        "Toujours s'échauffer 15 à 20 minutes en zone 2 avant de commencer les intervalles — partir à froid augmente le risque de blessure",
        "Ne dépassez pas 2 à 3 séances de fractionné par semaine — votre corps a besoin de temps pour assimiler le stress",
        "Si vous ne pouvez pas maintenir l'intensité sur les dernières répétitions, arrêtez — la qualité compte plus que la quantité",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: '30/30 — Initiation', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '45 min' }, { label: 'Intervalles', value: '10×30s' }, { label: 'Intensité', value: 'Zone 4-5' }], description: "Après 15 min d'échauffement, alternez 30 secondes d'effort soutenu avec 30 secondes de récupération facile. Répétez 10 fois, puis 10 min de retour au calme. Le format idéal pour découvrir le fractionné sans se mettre dans le rouge." },
        { name: '4×4 min — Développement', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '1h' }, { label: 'Intervalles', value: '4×4 min' }, { label: 'Intensité', value: 'Zone 4' }], description: "4 blocs de 4 minutes à haute intensité (essoufflement marqué, conversation impossible), séparés par 3 minutes de récupération active en pédalant doucement. Ce format, validé par la recherche scientifique, est l'un des plus efficaces pour améliorer votre VO2max." },
        { name: 'Pyramide — Confirmé', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '1h15' }, { label: 'Intervalles', value: '1-2-3-4-3-2-1 min' }, { label: 'Intensité', value: 'Zone 4-5' }], description: "Montez progressivement la durée des intervalles (1 min, 2 min, 3 min, 4 min) puis redescendez (3, 2, 1 min). Récupération égale à la moitié du temps d'effort. La pyramide travaille différentes filières énergétiques et enseigne à gérer son effort sur des durées variées." },
      ]},
      { type: 'tip', text: "💡 La récupération entre les intervalles est aussi importante que l'effort lui-même. Si vous raccourcissez les repos, vous ne pourrez pas maintenir l'intensité — et c'est l'intensité qui fait progresser." },
    ],
  },
  // Tempo
  {
    sport: 'velo',
    sessionType: 'tempo',
    title: 'Le tempo, repousser votre seuil',
    subtitle: 'Rouler au seuil pour habituer votre corps à maintenir un effort soutenu.',
    blocks: [
      { type: 'hero', tag: 'Tempo', title: 'Le tempo, repousser votre seuil', subtitle: 'Rouler au seuil pour habituer votre corps à maintenir un effort soutenu.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 3', label: 'zone cible' },
        { value: '76-90%', label: 'de la FC max' },
        { value: '20-60 min', label: "durée d'effort" },
      ]},
      { type: 'intro', title: "C'est quoi une sortie tempo ?", text: "Le tempo, c'est rouler à une intensité « confortablement difficile ». Vous êtes au-dessus de l'endurance, mais en dessous du seuil anaérobie (le point où l'acide lactique s'accumule plus vite que votre corps ne peut l'éliminer). En zone 3, vous pouvez dire quelques mots, mais pas tenir une vraie conversation. C'est l'effort que vous pourriez maintenir pendant environ une heure en compétition — le fameux « sweet spot » (la zone d'entraînement qui offre le meilleur rapport effort/bénéfice)." },
      { type: 'benefits-grid', title: 'Pourquoi en faire ?', items: [
        { emoji: '📈', title: 'Seuil plus haut', text: "Repousse le point où votre corps bascule en mode anaérobie — vous roulez plus vite avant de « craquer »" },
        { emoji: '💪', title: 'Endurance musculaire', text: "Habitue vos muscles à produire un effort soutenu pendant longtemps sans fatigue excessive" },
        { emoji: '🎯', title: 'Gestion de l\'allure', text: "Développe votre capacité à maintenir un rythme régulier — essentiel pour les chronos et les sorties en groupe" },
        { emoji: '🔋', title: 'Efficacité métabolique', text: "Entraîne votre corps à mieux recycler le lactate (déchet de l'effort intense) et à l'utiliser comme carburant" },
      ]},
      { type: 'caution', items: [
        "Le tempo ne doit pas virer au seuil — si vous ne pouvez plus du tout parler, vous êtes trop haut. Restez sur un effort contrôlé",
        "Limitez-vous à 2 séances de tempo par semaine. Le reste doit être de l'endurance facile",
        "Mangez correctement avant une séance de tempo — c'est un effort gourmand en glycogène (les réserves de sucre dans vos muscles)",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Bloc unique — Découverte', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '50 min' }, { label: 'Tempo', value: '1×20 min' }, { label: 'Intensité', value: 'Zone 3' }], description: "15 min d'échauffement progressif, puis 20 minutes d'effort constant en zone 3 (respiration soutenue mais contrôlée). Terminez par 15 min de retour au calme. Concentrez-vous sur la régularité : même rythme du début à la fin." },
        { name: '2×20 min — Référence', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '1h10' }, { label: 'Tempo', value: '2×20 min' }, { label: 'Intensité', value: 'Zone 3' }], description: "La séance classique des cyclistes sérieux. Deux blocs de 20 minutes au seuil, séparés par 5 minutes de récupération facile. Visez un effort identique sur les deux blocs — si le deuxième est nettement plus dur, le premier était trop intense." },
        { name: '1h tempo — Performance', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '1h30' }, { label: 'Tempo', value: '1×60 min' }, { label: 'Intensité', value: 'Zone 3' }], description: "Un bloc de 60 minutes en zone tempo après un bon échauffement. Simulation d'effort de compétition. Demande une excellente gestion de l'allure et une nutrition adaptée (barres ou boisson énergétique pendant l'effort). Le graal de la régularité." },
      ]},
      { type: 'tip', text: "💡 Le tempo est l'art de la patience. Commencez toujours par le bas de la zone et laissez l'intensité monter naturellement. Si vous partez trop fort, vous finirez en zone 4 et la séance change complètement d'objectif." },
    ],
  },
  // Recovery
  {
    sport: 'velo',
    sessionType: 'recovery',
    title: 'La sortie récup, indispensable et sous-estimée',
    subtitle: 'Pourquoi rouler doucement est aussi important que rouler fort.',
    blocks: [
      { type: 'hero', tag: 'Récupération', title: 'La sortie récup, indispensable et sous-estimée', subtitle: 'Pourquoi rouler doucement est aussi important que rouler fort.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 1', label: 'zone cible' },
        { value: '<65%', label: 'de la FC max' },
        { value: '30-60 min', label: 'durée idéale' },
      ]},
      { type: 'intro', title: 'Pourquoi rouler sans forcer ?', text: "Quand vous vous entraînez dur, vous créez des micro-dommages dans vos muscles et vous épuisez vos réserves d'énergie. C'est normal — c'est même le but. Mais la progression ne se fait pas pendant l'effort, elle se fait pendant la récupération. C'est le principe de surcompensation (votre corps se reconstruit un peu plus fort qu'avant pour mieux encaisser le prochain effort). La sortie récup en zone 1 (effort très léger, zéro essoufflement) accélère ce processus en augmentant la circulation sanguine sans ajouter de stress supplémentaire." },
      { type: 'benefits-grid', title: 'Pourquoi la faire ?', items: [
        { emoji: '🔄', title: 'Récupération active', text: "Le pédalage léger augmente le flux sanguin vers les muscles fatigués, apportant nutriments et évacuant les déchets métaboliques" },
        { emoji: '🧘', title: 'Détente mentale', text: "Une sortie sans objectif de performance, juste pour le plaisir de rouler — ça recharge aussi la tête" },
        { emoji: '🛡️', title: 'Prévention des blessures', text: "Maintient la mobilité et la souplesse articulaire sans surcharger les tendons et les muscles" },
        { emoji: '📅', title: 'Volume sans fatigue', text: "Permet d'accumuler du temps de selle et du volume d'entraînement sans compromettre la récupération" },
      ]},
      { type: 'caution', items: [
        "Le piège n°1 : rouler trop fort. Si vous êtes essoufflé, ce n'est plus de la récupération. Mettez votre ego de côté et gardez un rythme très facile",
        "Ne remplacez pas un jour de repos complet par une sortie récup si votre corps est vraiment épuisé — parfois, ne rien faire est la meilleure option",
        "Évitez les parcours avec de grosses côtes qui vous forceront à monter en intensité malgré vous",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Tour du quartier', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '30 min' }, { label: 'Distance', value: '8–12 km' }, { label: 'Intensité', value: 'Zone 1' }], description: "Un petit tour à allure de promenade. Pédalez souplement, sans forcer, sur du plat. Vous devez pouvoir chanter (pas seulement parler). L'objectif est de bouger les jambes, rien de plus." },
        { name: 'Coffee ride tranquille', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '45 min' }, { label: 'Distance', value: '15–20 km' }, { label: 'Intensité', value: 'Zone 1' }], description: "Une sortie à vélo jusqu'au café du coin et retour. Pédalage souple, petit braquet, pas de pression. L'idéal le lendemain d'une grosse séance de fractionné. Profitez du paysage." },
        { name: 'Balade longue avec pause café', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '1h' }, { label: 'Distance', value: '20–30 km' }, { label: 'Intensité', value: 'Zone 1' }], description: "Une heure de pédalage très facile, idéalement avec un ou deux arrêts café ou photo. Même les pros roulent doucement sur leurs jours de récup. C'est le jour où on roule avec les amis qui débutent, pas celui où on attaque les bosses." },
      ]},
      { type: 'tip', text: "💡 Les meilleurs cyclistes du monde passent plus de temps à rouler doucement qu'à rouler fort. La récupération n'est pas une perte de temps — c'est là que votre corps transforme l'entraînement en progrès." },
    ],
  },
  // Climbing
  {
    sport: 'velo',
    sessionType: 'climbing',
    title: 'Grimper plus fort, grimper mieux',
    subtitle: 'Techniques et entraînements pour progresser en montée.',
    blocks: [
      { type: 'hero', tag: 'Côtes / Grimpée', title: 'Grimper plus fort, grimper mieux', subtitle: 'Techniques et entraînements pour progresser en montée.' },
      { type: 'big-numbers', items: [
        { value: '70-90', label: 'RPM en côte' },
        { value: 'Zone 3-4', label: 'zone effort' },
        { value: '3-5%', label: 'pente idéale pour débuter' },
      ]},
      { type: 'intro', title: 'Comment progresser en montée ?', text: "La montée est le moment où la gravité ne pardonne pas : chaque kilo compte, et la technique fait toute la différence. Deux facteurs clés entrent en jeu : votre rapport puissance/poids (les watts que vous produisez divisés par votre poids — c'est ce qui vous propulse vers le haut) et votre cadence de pédalage (le nombre de tours de pédale par minute). Un bon grimpeur ne force pas brutalement : il maintient un rythme régulier, choisit le bon braquet et alterne entre les positions assise et debout pour répartir l'effort sur différents muscles." },
      { type: 'benefits-grid', title: 'Pourquoi travailler les côtes ?', items: [
        { emoji: '⛰️', title: 'Puissance pure', text: "La montée exige plus de watts que le plat — c'est le meilleur entraînement de force sur le vélo" },
        { emoji: '🫁', title: 'Capacité cardio', text: "Grimper pousse votre cœur et vos poumons dans leurs retranchements, améliorant votre système cardiovasculaire" },
        { emoji: '🦵', title: 'Force musculaire', text: "Développe les quadriceps, les fessiers et les mollets de façon spécifique au pédalage" },
        { emoji: '🧠', title: 'Gestion du mental', text: "Apprend à rester calme et patient quand ça monte — résister à l'envie de partir trop vite" },
      ]},
      { type: 'caution', items: [
        "Ne partez jamais trop vite en bas d'une côte — dosez votre effort pour tenir jusqu'en haut. Mieux vaut finir un peu en réserve que craquer à mi-pente",
        "Si vous pédalez en dessous de 60 tours/min en forçant, changez de braquet. Mouliner trop lentement use les genoux",
        "En position danseuse (debout sur les pédales), gardez les mains sur les cocottes et balancez le vélo doucement — ne tirez pas sur le guidon",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Répétitions de bosses courtes', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '45 min' }, { label: 'Côtes', value: '5×2 min' }, { label: 'Intensité', value: 'Zone 3-4' }], description: "Trouvez une côte de 2 à 3 minutes. Montez à un effort soutenu mais contrôlé, redescendez en récupération, et recommencez 5 fois. Concentrez-vous sur la régularité : même rythme à chaque montée. Terminez par 10 min de plat en souplesse." },
        { name: 'Col de 20-30 min', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '1h15' }, { label: 'Montée', value: '1×20-30 min' }, { label: 'Intensité', value: 'Zone 3' }], description: "Choisissez une montée longue et régulière. Montez en zone 3, avec une cadence de 75-85 tours/min. Alternez toutes les 5 minutes entre position assise et quelques coups de pédale en danseuse pour soulager les muscles. Dosez pour arriver en haut sans avoir « explosé »." },
        { name: 'Col de montagne', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '2h+' }, { label: 'Montée', value: '45-90 min' }, { label: 'Intensité', value: 'Zone 3' }], description: "Un vrai col de montagne (800 m+ de dénivelé). Partez au bas de votre zone 3, mangez et buvez régulièrement pendant l'ascension. Gardez un braquet qui vous permet au minimum 70 tours/min. Le secret des longs cols : la patience dans le premier tiers, la régularité dans le deuxième, la lucidité dans le dernier." },
      ]},
      { type: 'tip', text: "💡 En côte, regardez 10 mètres devant vous, pas le sommet. Concentrez-vous sur votre rythme, pas sur la distance qu'il reste. Une montée se gagne pédale après pédale." },
    ],
  },
];

export const CYCLING_ARTICLES_EN: LibraryArticle[] = [
  // Intervals
  {
    sport: 'velo',
    sessionType: 'intervals',
    title: 'Intervals, your performance accelerator',
    subtitle: 'Alternating hard efforts and recovery to progress faster.',
    blocks: [
      { type: 'hero', tag: 'Intervals', title: 'Intervals, your performance accelerator', subtitle: 'Alternating hard efforts and recovery to progress faster.' },
      { type: 'big-numbers', items: [
        { value: '2-3×', label: 'per week max' },
        { value: 'Zone 4-5', label: 'effort zone' },
        { value: '+15%', label: 'VO2max in 6 wks' },
      ]},
      { type: 'intro', title: 'What is interval training?', text: "Interval training means alternating bursts of intense effort with recovery periods. The idea is simple: by breaking up the effort, you accumulate more total time at high intensity than if you rode hard non-stop. This pushes your VO2max (the maximum amount of oxygen your body can use — the single best indicator of your cardio fitness). The higher your VO2max, the more energy you can produce and the faster you can ride." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '🚀', title: 'Higher VO2max', text: "Stimulates your maximum oxygen-processing capacity — the number one factor in endurance performance" },
        { emoji: '⚡', title: 'More power', text: "Builds your ability to produce intense effort and repeat it" },
        { emoji: '⏱️', title: 'Time-efficient', text: "45 minutes of intervals stimulate your cardiovascular system as much as 2 hours of steady riding" },
        { emoji: '🧠', title: 'Mental resilience', text: "Teaches you to manage discomfort and push through when your legs are burning" },
      ]},
      { type: 'caution', items: [
        "Always warm up 15 to 20 minutes in Zone 2 before starting intervals — going hard from cold increases injury risk",
        "Don't exceed 2 to 3 interval sessions per week — your body needs time to absorb the stress",
        "If you can't maintain intensity on the last reps, stop — quality matters more than quantity",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: '30/30 — Introduction', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '45 min' }, { label: 'Intervals', value: '10×30s' }, { label: 'Intensity', value: 'Zone 4-5' }], description: "After a 15-minute warm-up, alternate 30 seconds of hard effort with 30 seconds of easy recovery. Repeat 10 times, then 10 minutes of cool-down. The perfect format to discover intervals without going into the red zone." },
        { name: '4×4 min — Development', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '1h' }, { label: 'Intervals', value: '4×4 min' }, { label: 'Intensity', value: 'Zone 4' }], description: "4 blocks of 4 minutes at high intensity (clearly out of breath, conversation impossible), separated by 3 minutes of active recovery spinning easy. This research-backed format is one of the most effective for improving your VO2max." },
        { name: 'Pyramid — Advanced', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '1h15' }, { label: 'Intervals', value: '1-2-3-4-3-2-1 min' }, { label: 'Intensity', value: 'Zone 4-5' }], description: "Progressively increase interval duration (1 min, 2 min, 3 min, 4 min) then come back down (3, 2, 1 min). Recovery equals half the effort time. The pyramid works different energy systems and teaches you to manage effort across varying durations." },
      ]},
      { type: 'tip', text: "💡 Recovery between intervals is just as important as the effort itself. If you shorten the rest, you won't maintain intensity — and it's the intensity that drives progress." },
    ],
  },
  // Tempo
  {
    sport: 'velo',
    sessionType: 'tempo',
    title: 'Tempo rides, pushing your threshold',
    subtitle: 'Riding at threshold to build sustained power.',
    blocks: [
      { type: 'hero', tag: 'Tempo', title: 'Tempo rides, pushing your threshold', subtitle: 'Riding at threshold to build sustained power.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 3', label: 'target zone' },
        { value: '76-90%', label: 'of max HR' },
        { value: '20-60 min', label: 'effort duration' },
      ]},
      { type: 'intro', title: 'What is a tempo ride?', text: "Tempo means riding at an intensity that feels \"comfortably hard.\" You're above endurance pace but below your anaerobic threshold (the point where lactic acid builds up faster than your body can clear it). In Zone 3, you can say a few words but can't hold a real conversation. It's the effort you could sustain for about an hour in a race — the famous \"sweet spot\" (the training zone that gives you the best return on effort)." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '📈', title: 'Higher threshold', text: "Pushes up the point where your body switches to anaerobic mode — you ride faster before \"cracking\"" },
        { emoji: '💪', title: 'Muscular endurance', text: "Trains your muscles to produce sustained effort for long periods without excessive fatigue" },
        { emoji: '🎯', title: 'Pacing skills', text: "Develops your ability to hold a steady rhythm — essential for time trials and group rides" },
        { emoji: '🔋', title: 'Metabolic efficiency', text: "Trains your body to better recycle lactate (a byproduct of intense effort) and use it as fuel" },
      ]},
      { type: 'caution', items: [
        "Tempo shouldn't turn into threshold — if you can't speak at all, you're too high. Stay at a controlled effort",
        "Limit yourself to 2 tempo sessions per week. The rest should be easy endurance",
        "Eat properly before a tempo session — it's a glycogen-hungry effort (the sugar reserves stored in your muscles)",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Single block — Discovery', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '50 min' }, { label: 'Tempo', value: '1×20 min' }, { label: 'Intensity', value: 'Zone 3' }], description: "15 minutes of progressive warm-up, then 20 minutes of constant effort in Zone 3 (sustained but controlled breathing). Finish with 15 minutes of cool-down. Focus on consistency: same rhythm from start to finish." },
        { name: '2×20 min — The classic', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '1h10' }, { label: 'Tempo', value: '2×20 min' }, { label: 'Intensity', value: 'Zone 3' }], description: "The benchmark session for serious cyclists. Two 20-minute blocks at threshold, separated by 5 minutes of easy recovery. Aim for identical effort on both blocks — if the second is significantly harder, the first was too intense." },
        { name: '1h tempo — Performance', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '1h30' }, { label: 'Tempo', value: '1×60 min' }, { label: 'Intensity', value: 'Zone 3' }], description: "A 60-minute block in the tempo zone after a solid warm-up. Race-effort simulation. Requires excellent pacing and proper nutrition (bars or energy drink during the effort). The ultimate test of consistency." },
      ]},
      { type: 'tip', text: "💡 Tempo is the art of patience. Always start at the bottom of the zone and let the intensity rise naturally. If you go out too hard, you'll end up in Zone 4 and the session completely changes its purpose." },
    ],
  },
  // Recovery
  {
    sport: 'velo',
    sessionType: 'recovery',
    title: 'Recovery rides, essential and underrated',
    subtitle: 'Why riding easy is just as important as riding hard.',
    blocks: [
      { type: 'hero', tag: 'Recovery', title: 'Recovery rides, essential and underrated', subtitle: 'Why riding easy is just as important as riding hard.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 1', label: 'target zone' },
        { value: '<65%', label: 'of max HR' },
        { value: '30-60 min', label: 'ideal duration' },
      ]},
      { type: 'intro', title: 'Why ride without pushing?', text: "When you train hard, you create micro-damage in your muscles and deplete your energy reserves. That's normal — it's the whole point. But progress doesn't happen during the effort, it happens during recovery. This is the principle of supercompensation (your body rebuilds a little stronger than before to better handle the next effort). A recovery ride in Zone 1 (very light effort, zero breathlessness) accelerates this process by increasing blood flow without adding extra stress." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '🔄', title: 'Active recovery', text: "Light pedaling increases blood flow to tired muscles, delivering nutrients and flushing out metabolic waste" },
        { emoji: '🧘', title: 'Mental reset', text: "A ride with no performance target, just for the joy of riding — it recharges your mind too" },
        { emoji: '🛡️', title: 'Injury prevention', text: "Maintains joint mobility and flexibility without overloading tendons and muscles" },
        { emoji: '📅', title: 'Volume without fatigue', text: "Lets you accumulate saddle time and training volume without compromising recovery" },
      ]},
      { type: 'caution', items: [
        "Trap number one: riding too hard. If you're out of breath, it's no longer recovery. Put your ego aside and keep it very easy",
        "Don't replace a full rest day with a recovery ride if your body is truly exhausted — sometimes doing nothing is the best option",
        "Avoid routes with big hills that will force you to ramp up intensity despite yourself",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Neighborhood spin', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '30 min' }, { label: 'Distance', value: '8–12 km' }, { label: 'Intensity', value: 'Zone 1' }], description: "A quick spin around the block at walking pace. Pedal smoothly, no forcing, on flat terrain. You should be able to sing (not just talk). The goal is to move your legs, nothing more." },
        { name: 'Easy coffee ride', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '45 min' }, { label: 'Distance', value: '15–20 km' }, { label: 'Intensity', value: 'Zone 1' }], description: "A ride to the local coffee shop and back. Smooth pedaling, easy gear, no pressure. Perfect for the day after a hard interval session. Enjoy the scenery." },
        { name: 'Long spin with cafe stop', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '1h' }, { label: 'Distance', value: '20–30 km' }, { label: 'Intensity', value: 'Zone 1' }], description: "One hour of very easy pedaling, ideally with one or two coffee or photo stops. Even the pros ride easy on recovery days. This is the day you ride with friends who are beginners, not the day you attack the hills." },
      ]},
      { type: 'tip', text: "💡 The best cyclists in the world spend more time riding easy than riding hard. Recovery isn't wasted time — it's where your body turns training into progress." },
    ],
  },
  // Climbing
  {
    sport: 'velo',
    sessionType: 'climbing',
    title: 'Climb stronger, climb smarter',
    subtitle: 'Techniques and workouts to improve on hills.',
    blocks: [
      { type: 'hero', tag: 'Climbing', title: 'Climb stronger, climb smarter', subtitle: 'Techniques and workouts to improve on hills.' },
      { type: 'big-numbers', items: [
        { value: '70-90', label: 'RPM on climbs' },
        { value: 'Zone 3-4', label: 'effort zone' },
        { value: '3-5%', label: 'ideal grade to start' },
      ]},
      { type: 'intro', title: 'How to get better at climbing?', text: "Climbing is where gravity shows no mercy: every kilogram counts, and technique makes all the difference. Two key factors come into play: your power-to-weight ratio (the watts you produce divided by your weight — that's what propels you uphill) and your pedaling cadence (the number of pedal revolutions per minute). A good climber doesn't force brutally: they maintain a steady rhythm, choose the right gear, and alternate between seated and standing positions to spread the effort across different muscles." },
      { type: 'benefits-grid', title: 'Why train on hills?', items: [
        { emoji: '⛰️', title: 'Raw power', text: "Climbing demands more watts than flat riding — it's the best on-bike strength workout" },
        { emoji: '🫁', title: 'Cardio capacity', text: "Climbing pushes your heart and lungs to their limits, improving your entire cardiovascular system" },
        { emoji: '🦵', title: 'Leg strength', text: "Builds quads, glutes, and calves in a way specific to pedaling" },
        { emoji: '🧠', title: 'Mental management', text: "Teaches you to stay calm and patient when the road goes up — resisting the urge to go out too fast" },
      ]},
      { type: 'caution', items: [
        "Never start too fast at the bottom of a climb — pace your effort to last until the top. Better to finish with a little in reserve than to blow up halfway",
        "If you're pedaling below 60 RPM while straining, shift to an easier gear. Grinding too slowly wears out your knees",
        "When standing out of the saddle, keep your hands on the hoods and gently rock the bike side to side — don't pull on the handlebars",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Short hill repeats', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '45 min' }, { label: 'Climbs', value: '5×2 min' }, { label: 'Intensity', value: 'Zone 3-4' }], description: "Find a hill that takes 2 to 3 minutes. Ride up at a sustained but controlled effort, descend for recovery, and repeat 5 times. Focus on consistency: same rhythm on each climb. Finish with 10 minutes of easy flat riding." },
        { name: '20-30 min sustained climb', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '1h15' }, { label: 'Climb', value: '1×20-30 min' }, { label: 'Intensity', value: 'Zone 3' }], description: "Choose a long, steady climb. Ride up in Zone 3 at a cadence of 75-85 RPM. Alternate every 5 minutes between seated riding and a few pedal strokes standing to relieve different muscles. Pace it so you reach the top without having \"blown up.\"" },
        { name: 'Mountain pass', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '2h+' }, { label: 'Climb', value: '45-90 min' }, { label: 'Intensity', value: 'Zone 3' }], description: "A real mountain pass (800m+ of elevation gain). Start at the bottom of your Zone 3, eat and drink regularly during the ascent. Keep a gear that allows at least 70 RPM. The secret of long climbs: patience in the first third, consistency in the second, lucidity in the last." },
      ]},
      { type: 'tip', text: "💡 On a climb, look 10 meters ahead of you, not at the summit. Focus on your rhythm, not on how far you have left. A climb is won one pedal stroke at a time." },
    ],
  },
];
