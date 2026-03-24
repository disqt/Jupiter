import type { LibraryArticle } from './library-content';

export const RUNNING_ARTICLES_FR: LibraryArticle[] = [
  // 1. Endurance
  {
    sport: 'course',
    sessionType: 'endurance',
    title: 'Le footing long, la base de tout',
    subtitle: 'Courir lentement pour courir longtemps — et progresser.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'Le footing long, la base de tout', subtitle: 'Courir lentement pour courir longtemps — et progresser.' },
      { type: 'big-numbers', items: [
        { value: '80%', label: 'du volume total' },
        { value: 'Zone 2', label: 'zone cible' },
        { value: '45min+', label: 'durée idéale' },
      ]},
      { type: 'intro', title: "C'est quoi le footing long ?", text: "Le footing long, c'est courir à une allure où vous pouvez discuter avec un partenaire sans être essoufflé. Votre cœur travaille en Zone 2 (entre 60 et 75% de votre fréquence cardiaque maximale). À cette intensité, votre corps fonctionne en mode aérobie (il utilise l'oxygène pour transformer les graisses et les glucides en énergie). C'est la règle du 80/20 : 80% de votre entraînement devrait se faire à cette intensité confortable, et seulement 20% en intensité élevée. Les meilleurs coureurs du monde s'entraînent ainsi — et ça marche aussi pour les débutants." },
      { type: 'benefits-grid', title: 'Pourquoi courir lentement ?', items: [
        { emoji: '❤️', title: 'Cœur plus efficace', text: "Augmente le volume d'éjection systolique (la quantité de sang pompée à chaque battement) — votre cœur fait plus avec moins d'effort" },
        { emoji: '🔥', title: 'Oxydation des graisses', text: "En Zone 2, votre corps puise majoritairement dans les réserves de graisse — vous apprenez à votre métabolisme à brûler les lipides" },
        { emoji: '🦴', title: 'Renforcement progressif', text: "Les tendons, ligaments et os s'adaptent lentement — le footing long leur laisse le temps de se renforcer sans surcharge" },
        { emoji: '🧠', title: 'Endurance mentale', text: "Apprend à gérer l'ennui, maintenir un rythme régulier et rester concentré sur la durée" },
      ]},
      { type: 'caution', items: [
        "L'erreur numéro 1 : courir trop vite. Si vous ne pouvez pas parler en phrases complètes, ralentissez — même si ça vous semble ridiculement lent",
        "Augmentez la durée progressivement : pas plus de 10% par semaine pour éviter les blessures",
        "Hydratez-vous avant et pendant les sorties de plus de 45 minutes, surtout par temps chaud",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Premier footing', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '30 min' }, { label: 'Allure', value: 'Conversation' }, { label: 'Intensité', value: 'Zone 2' }], description: "Alternez marche et course si besoin (ex : 3 min de course, 1 min de marche). L'objectif est de tenir 30 minutes en mouvement, pas de courir sans s'arrêter. Finissez en vous disant « j'aurais pu continuer »." },
        { name: 'Sortie longue', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '1h' }, { label: 'Distance', value: '9–11 km' }, { label: 'Intensité', value: 'Zone 2' }], description: "Courez à allure régulière du début à la fin. Si votre fréquence cardiaque monte dans les dernières minutes, ralentissez. Emportez de l'eau pour les sorties par temps chaud." },
        { name: 'Sortie longue avancée', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '1h30–2h' }, { label: 'Distance', value: '16–22 km' }, { label: 'Intensité', value: 'Zone 1-2' }], description: "La sortie qui prépare aux semi-marathons et marathons. Prévoyez une nutrition pendant l'effort (gel ou barre toutes les 45 min). Les derniers kilomètres en fatigue musculaire sont précieux pour l'adaptation." },
      ]},
      { type: 'tip', text: "💡 Si vous ne deviez faire qu'un seul type de séance, ce serait celle-ci. L'endurance fondamentale est la base invisible qui rend tous vos autres entraînements plus efficaces." },
    ],
  },
  // 2. Intervals
  {
    sport: 'course',
    sessionType: 'intervals',
    title: 'Le fractionné en course à pied',
    subtitle: 'Des séries courtes et intenses pour gagner en vitesse.',
    blocks: [
      { type: 'hero', tag: 'Intervalles', title: 'Le fractionné en course à pied', subtitle: 'Des séries courtes et intenses pour gagner en vitesse.' },
      { type: 'big-numbers', items: [
        { value: '1–2×', label: 'par semaine max' },
        { value: 'Zone 4-5', label: 'intensité effort' },
        { value: '+5%', label: 'gain VO2max typique' },
      ]},
      { type: 'intro', title: "C'est quoi le fractionné ?", text: "Le fractionné (ou interval training), c'est alterner des phases d'effort intense avec des phases de récupération. L'objectif est de solliciter votre VO2max (la quantité maximale d'oxygène que votre corps peut utiliser pendant l'effort). En courant à haute intensité par intervalles, vous passez plus de temps total à cette intensité que si vous essayiez de tenir un effort continu — votre corps s'adapte et devient plus performant. Les formats classiques vont du 30/30 (30 secondes vite, 30 secondes lent) aux séries de 400m ou 1000m sur piste." },
      { type: 'benefits-grid', title: 'Pourquoi faire du fractionné ?', items: [
        { emoji: '⚡', title: 'VO2max en hausse', text: "Améliore votre consommation maximale d'oxygène — le meilleur indicateur de votre capacité cardio" },
        { emoji: '🏃', title: 'Vitesse pure', text: "Recrute les fibres musculaires rapides et améliore votre économie de course (l'énergie dépensée par foulée)" },
        { emoji: '🔋', title: 'Capacité anaérobie', text: "Entraîne votre corps à tolérer et éliminer le lactate (le déchet métabolique qui crée la sensation de brûlure)" },
        { emoji: '⏱️', title: 'Efficacité du temps', text: "20 minutes d'intervalles bien faits stimulent autant d'adaptation qu'une heure de footing" },
      ]},
      { type: 'caution', items: [
        "Échauffez-vous au moins 10–15 minutes en footing lent avant de commencer les intervalles — muscles et tendons froids = risque de blessure",
        "La récupération entre les séries est aussi importante que l'effort : si vous ne récupérez pas assez, la qualité des dernières répétitions chute",
        "Ne dépassez pas 2 séances de fractionné par semaine — votre corps a besoin de 48h minimum pour assimiler ce type de stress",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: '8×30/30', level: 'beginner' as const, metrics: [{ label: 'Effort', value: '30s vite' }, { label: 'Récup', value: '30s lent' }, { label: 'Total', value: '~30 min' }], description: "Après 10 min d'échauffement, courez 30 secondes à allure soutenue (vous ne pouvez pas parler) puis 30 secondes de trot léger. Répétez 8 fois. Terminez par 10 min de retour au calme. Idéal pour débuter le fractionné sans piste." },
        { name: '6×400m', level: 'intermediate' as const, metrics: [{ label: 'Effort', value: '400m rapide' }, { label: 'Récup', value: "200m marche" }, { label: 'Total', value: '~40 min' }], description: "Sur piste ou terrain plat balisé. Courez chaque 400m à une allure que vous ne pourriez pas tenir plus de 3-4 minutes. Récupérez en marchant ou trottant 200m entre chaque. Visez la régularité : les 6 répétitions au même chrono." },
        { name: '5×1000m', level: 'advanced' as const, metrics: [{ label: 'Effort', value: '1000m à allure 5K' }, { label: 'Récup', value: "2 min trot" }, { label: 'Total', value: '~50 min' }], description: "Après 15 min d'échauffement avec gammes (montées de genoux, talons-fesses). Courez chaque 1000m à votre allure de course de 5 km. 2 minutes de trot entre les séries. Finissez avec 10 min de retour au calme. La dernière série doit être aussi rapide que la première." },
      ]},
      { type: 'tip', text: "💡 La clé du fractionné, c'est la régularité des efforts, pas la vitesse maximale. Si votre dernière répétition est beaucoup plus lente que la première, vous êtes parti trop vite." },
    ],
  },
  // 3. Tempo
  {
    sport: 'course',
    sessionType: 'tempo',
    title: "L'allure tempo, votre vitesse de croisière",
    subtitle: 'Courir au seuil pour repousser vos limites en compétition.',
    blocks: [
      { type: 'hero', tag: 'Tempo', title: "L'allure tempo, votre vitesse de croisière", subtitle: 'Courir au seuil pour repousser vos limites en compétition.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 3-4', label: 'zone cible' },
        { value: '~85%', label: 'FC maximale' },
        { value: '20–45min', label: 'bloc tempo' },
      ]},
      { type: 'intro', title: "C'est quoi l'allure tempo ?", text: "L'allure tempo se situe à votre seuil lactique (le point où votre corps commence à produire plus de lactate qu'il ne peut en éliminer). Concrètement, c'est une allure « confortablement difficile » — vous pouvez dire quelques mots mais pas tenir une conversation. C'est typiquement votre allure de semi-marathon, ou une allure que vous pourriez maintenir environ 1 heure en compétition. L'objectif est d'apprendre à votre corps à repousser ce seuil, ce qui vous permettra de courir plus vite plus longtemps sans vous « griller »." },
      { type: 'benefits-grid', title: 'Pourquoi faire du tempo ?', items: [
        { emoji: '📈', title: 'Seuil lactique repoussé', text: "Votre corps apprend à recycler le lactate plus efficacement — vous pouvez maintenir une allure élevée plus longtemps" },
        { emoji: '🎯', title: 'Sens de l\'allure', text: "Vous apprenez à sentir et maintenir une intensité précise — indispensable le jour de la course" },
        { emoji: '💪', title: 'Résistance musculaire', text: "Entraîne vos muscles à fonctionner sous tension prolongée sans décrocher" },
        { emoji: '🏅', title: 'Préparation compétition', text: "C'est la séance qui se rapproche le plus de l'effort de course — du 10 km au semi-marathon" },
      ]},
      { type: 'caution', items: [
        "Ne transformez pas votre tempo en course à fond : l'effort doit être soutenu mais contrôlé. Si vous finissez épuisé, vous étiez trop rapide",
        "Échauffez-vous 10–15 minutes en footing lent avant d'attaquer le bloc tempo",
        "Évitez le tempo la veille ou le lendemain d'une séance de fractionné — espacez vos séances intenses d'au moins 48 heures",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Tempo découverte', level: 'beginner' as const, metrics: [{ label: 'Bloc tempo', value: '15 min' }, { label: 'Allure', value: 'Semi-marathon' }, { label: 'Total', value: '~35 min' }], description: "10 min d'échauffement en footing, puis 15 min à allure « confortablement difficile » (vous pouvez dire quelques mots mais pas une phrase entière). Terminez par 10 min de retour au calme. Ne regardez pas votre montre, concentrez-vous sur la sensation." },
        { name: 'Tempo classique', level: 'intermediate' as const, metrics: [{ label: 'Bloc tempo', value: '30 min' }, { label: 'Allure', value: '~4:50–5:20/km' }, { label: 'Total', value: '~50 min' }], description: "Après l'échauffement, maintenez 30 minutes à allure tempo stable. Le premier kilomètre doit être au même rythme que le dernier. Si vous accélérez à la fin, vous n'étiez pas assez rapide au début — et inversement." },
        { name: 'Tempo long', level: 'advanced' as const, metrics: [{ label: 'Bloc tempo', value: '45 min' }, { label: 'Allure', value: '~4:15–4:45/km' }, { label: 'Total', value: '~1h10' }], description: "La séance roi pour préparer un semi-marathon ou un marathon. 15 min d'échauffement progressif, 45 min de tempo soutenu, 10 min de retour au calme. Ravitaillement possible en eau pendant le bloc. Le mental est aussi important que les jambes sur ce format." },
      ]},
      { type: 'tip', text: "💡 L'allure tempo se résume en une phrase : « Je pourrais aller plus vite, mais je choisis de tenir. » C'est cette discipline qui fait la différence en compétition." },
    ],
  },
  // 4. Recovery
  {
    sport: 'course',
    sessionType: 'recovery',
    title: 'Le footing de récupération',
    subtitle: 'Courir sans forcer pour mieux assimiler les entraînements durs.',
    blocks: [
      { type: 'hero', tag: 'Récupération', title: 'Le footing de récupération', subtitle: 'Courir sans forcer pour mieux assimiler les entraînements durs.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 1', label: 'intensité maximale' },
        { value: '20–40min', label: 'durée suffisante' },
        { value: '+30%', label: "d'assimilation" },
      ]},
      { type: 'intro', title: 'Pourquoi courir doucement ?', text: "Le footing de récupération est la séance la plus lente de votre semaine — et pourtant l'une des plus importantes. Après un entraînement dur (fractionné, tempo, compétition), votre corps a besoin de réparer les micro-lésions musculaires et de reconstituer ses réserves d'énergie. La récupération active (courir très doucement plutôt que rester immobile) accélère ce processus en augmentant le flux sanguin vers les muscles sans créer de stress supplémentaire. C'est pendant la récupération que votre corps s'adapte et devient plus fort — pas pendant l'effort lui-même." },
      { type: 'benefits-grid', title: 'Les bienfaits de courir lentement', items: [
        { emoji: '🩹', title: 'Réparation musculaire', text: "Le flux sanguin augmenté apporte oxygène et nutriments aux muscles endommagés, accélérant la guérison" },
        { emoji: '🧹', title: 'Élimination des déchets', text: "Aide à évacuer les déchets métaboliques accumulés pendant les séances intenses (lactate, ions hydrogène)" },
        { emoji: '😌', title: 'Récupération nerveuse', text: "Permet à votre système nerveux central de se reposer — il est sollicité autant que vos muscles lors des efforts intenses" },
        { emoji: '🔄', title: 'Habitude de courir', text: "Ajoute du volume d'entraînement sans fatigue — votre corps s'habitue à courir plus souvent" },
      ]},
      { type: 'caution', items: [
        "Votre ego est votre pire ennemi : si vous croisez d'autres coureurs et accélérez, vous ratez l'objectif de la séance",
        "Ne faites pas de récupération active si vous avez une vraie douleur articulaire ou musculaire — dans ce cas, le repos complet est préférable",
        "Pas de montre, pas de chrono : courez à la sensation, en Zone 1 (vous devez pouvoir chanter, pas juste parler)",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Trot de décrassage', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '20 min' }, { label: 'Allure', value: 'Très lent' }, { label: 'Intensité', value: 'Zone 1' }], description: "Courez (ou alternez marche rapide et trot) pendant 20 minutes à une allure où vous pourriez chanter. Aucun objectif de distance ou de vitesse. Si vous avez mal quelque part, marchez simplement. L'idée est de bouger, pas de forcer." },
        { name: 'Footing récup', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '30 min' }, { label: 'Allure', value: '6:30–7:30/km' }, { label: 'Intensité', value: 'Zone 1' }], description: "Le lendemain d'une séance de fractionné ou de tempo. Courez 30 minutes à allure très confortable. Votre fréquence cardiaque doit rester sous les 65% de votre FC max. Si elle monte, ralentissez sans hésiter." },
        { name: 'Récup avec gammes', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '40 min' }, { label: 'Allure', value: 'Lent + 4 accélérations' }, { label: 'Intensité', value: 'Zone 1 + strides' }], description: "30 minutes de footing très léger suivies de 4 lignes droites de 80m en accélération progressive (strides). Ces courtes accélérations réactivent les fibres rapides sans fatigue. 1 minute de marche entre chaque accélération. Terminez par 5 minutes de trot lent." },
      ]},
      { type: 'tip', text: "💡 Un bon footing de récupération, c'est celui où vous avez l'impression de ne pas avoir couru assez. Si vous finissez fatigué, ce n'était plus de la récupération." },
    ],
  },
  // 5. Fartlek
  {
    sport: 'course',
    sessionType: 'fartlek',
    title: 'Le fartlek, le jeu de vitesse',
    subtitle: 'Varier les allures au feeling pour le plaisir et la progression.',
    blocks: [
      { type: 'hero', tag: 'Fartlek', title: 'Le fartlek, le jeu de vitesse', subtitle: 'Varier les allures au feeling pour le plaisir et la progression.' },
      { type: 'big-numbers', items: [
        { value: '1937', label: 'inventé en Suède' },
        { value: 'RPE', label: 'basé sur le ressenti' },
        { value: 'Zone 1-5', label: 'toutes les allures' },
      ]},
      { type: 'intro', title: "C'est quoi le fartlek ?", text: "Le fartlek (mot suédois qui signifie « jeu de vitesse ») est une forme d'entraînement inventée dans les années 1930 par le coach suédois Gösta Holmér. Le principe est simple : vous variez votre allure de façon libre, selon votre envie et votre ressenti (ce qu'on appelle le RPE, « Rating of Perceived Exertion » — l'échelle d'effort perçu). Pas de chrono, pas de distance imposée — vous accélérez quand vous en avez envie, vous ralentissez quand votre corps le demande. C'est un mélange d'endurance, de tempo et de vitesse dans une seule séance, guidé par le plaisir de courir." },
      { type: 'benefits-grid', title: 'Pourquoi faire du fartlek ?', items: [
        { emoji: '🎮', title: 'Plaisir de courir', text: "Sans structure rigide, chaque séance est différente — ça casse la routine et ravive la motivation" },
        { emoji: '🌡️', title: 'Toutes les filières', text: "En variant les allures, vous sollicitez à la fois le système aérobie (endurance) et anaérobie (vitesse) dans une même séance" },
        { emoji: '🧭', title: 'Sens du rythme', text: "Apprend à écouter votre corps et à ajuster votre effort sans dépendre d'une montre ou d'un plan" },
        { emoji: '🏔️', title: 'Adapté au terrain', text: "Parfait pour les parcours vallonnés ou en nature — le terrain dicte naturellement les changements de rythme" },
      ]},
      { type: 'caution', items: [
        "Le fartlek n'est pas une excuse pour courir n'importe comment : gardez une intention derrière chaque accélération et chaque récupération",
        "Évitez de transformer toutes les accélérations en sprint maximal — variez les intensités (certaines modérées, d'autres fortes)",
        "Comme pour le fractionné, échauffez-vous 10 minutes en footing lent avant de commencer les changements d'allure",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Fartlek lampadaires', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '25–30 min' }, { label: 'Méthode', value: 'Repères visuels' }, { label: 'Intensité', value: 'Zone 2-3' }], description: "Après 10 min d'échauffement, accélérez d'un lampadaire au suivant (ou d'un arbre à l'autre), puis récupérez en trottant entre les deux prochains. Répétez 6–8 fois. C'est ludique et ça s'adapte à n'importe quel parcours urbain. Terminez par 5 min de retour au calme." },
        { name: 'Fartlek 40 min', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '40 min' }, { label: 'Accélérations', value: '6–8 surges' }, { label: 'Intensité', value: 'Zone 2-4' }], description: "10 min d'échauffement, puis 20 min de jeu : alternez des accélérations de 1 à 3 minutes à allure tempo (confortablement difficile) avec des récupérations en footing lent de durée égale ou supérieure. Pas de schéma fixe — laissez-vous guider par le terrain et vos sensations. 10 min de retour au calme." },
        { name: 'Fartlek vallonné', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '50–60 min' }, { label: 'Terrain', value: 'Collines / sentiers' }, { label: 'Intensité', value: 'Zone 2-5' }], description: "Choisissez un parcours avec du relief. Attaquez chaque montée à allure tempo ou plus rapide (Zone 3-5 selon la pente), récupérez en descente et sur le plat. Les montées de 30 secondes à 2 minutes deviennent des intervalles naturels. Visez 8–12 accélérations dans la séance. Le terrain est votre coach." },
      ]},
      { type: 'tip', text: "💡 Le fartlek est né de l'idée que courir doit rester un jeu. Si vous courez toujours avec un plan strict, offrez-vous un fartlek : laissez votre corps décider, et redécouvrez le plaisir simple de courir." },
    ],
  },
];

export const RUNNING_ARTICLES_EN: LibraryArticle[] = [
  // 1. Endurance
  {
    sport: 'course',
    sessionType: 'endurance',
    title: 'The long run, foundation of everything',
    subtitle: 'Run slow to run long — and get faster.',
    blocks: [
      { type: 'hero', tag: 'Endurance', title: 'The long run, foundation of everything', subtitle: 'Run slow to run long — and get faster.' },
      { type: 'big-numbers', items: [
        { value: '80%', label: 'of total volume' },
        { value: 'Zone 2', label: 'target zone' },
        { value: '45min+', label: 'ideal duration' },
      ]},
      { type: 'intro', title: 'What is the long run?', text: "The long run means running at a pace where you can hold a full conversation without gasping. Your heart works in Zone 2 (between 60 and 75% of your maximum heart rate). At this intensity, your body operates in aerobic mode (it uses oxygen to convert fat and carbohydrates into energy). This is the 80/20 rule: 80% of your training should be at this comfortable intensity, and only 20% at high intensity. The world's best runners train this way — and it works for beginners too." },
      { type: 'benefits-grid', title: 'Why run slowly?', items: [
        { emoji: '❤️', title: 'More efficient heart', text: "Increases stroke volume (the amount of blood pumped per beat) — your heart does more with less effort" },
        { emoji: '🔥', title: 'Fat oxidation', text: "In Zone 2, your body primarily draws from fat reserves — you're training your metabolism to burn lipids" },
        { emoji: '🦴', title: 'Progressive strengthening', text: "Tendons, ligaments and bones adapt slowly — easy running gives them time to strengthen without overload" },
        { emoji: '🧠', title: 'Mental endurance', text: "Teaches you to manage boredom, hold a steady pace, and stay focused over long periods" },
      ]},
      { type: 'caution', items: [
        "Mistake number 1: running too fast. If you can't speak in full sentences, slow down — even if it feels ridiculously slow",
        "Increase duration gradually: no more than 10% per week to avoid injuries",
        "Hydrate before and during runs over 45 minutes, especially in hot weather",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'First easy run', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '30 min' }, { label: 'Pace', value: 'Conversational' }, { label: 'Intensity', value: 'Zone 2' }], description: "Alternate walking and running if needed (e.g., 3 min running, 1 min walking). The goal is to keep moving for 30 minutes, not to run non-stop. Finish thinking \"I could have kept going.\"" },
        { name: 'Long run', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '1h' }, { label: 'Distance', value: '9–11 km' }, { label: 'Intensity', value: 'Zone 2' }], description: "Run at a steady pace from start to finish. If your heart rate climbs in the final minutes, slow down. Bring water for hot weather runs." },
        { name: 'Advanced long run', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '1h30–2h' }, { label: 'Distance', value: '16–22 km' }, { label: 'Intensity', value: 'Zone 1-2' }], description: "The run that prepares you for half-marathons and marathons. Plan nutrition during the effort (gel or bar every 45 min). The last kilometres in muscular fatigue are valuable for adaptation." },
      ]},
      { type: 'tip', text: "💡 If you could only do one type of session, this would be it. Base endurance is the invisible foundation that makes all your other workouts more effective." },
    ],
  },
  // 2. Intervals
  {
    sport: 'course',
    sessionType: 'intervals',
    title: 'Running intervals',
    subtitle: 'Short, intense reps to build speed.',
    blocks: [
      { type: 'hero', tag: 'Intervals', title: 'Running intervals', subtitle: 'Short, intense reps to build speed.' },
      { type: 'big-numbers', items: [
        { value: '1–2×', label: 'per week max' },
        { value: 'Zone 4-5', label: 'effort intensity' },
        { value: '+5%', label: 'typical VO2max gain' },
      ]},
      { type: 'intro', title: 'What are intervals?', text: "Interval training means alternating between hard efforts and recovery periods. The goal is to stress your VO2max (the maximum amount of oxygen your body can use during exercise). By running at high intensity in intervals, you accumulate more total time at that intensity than if you tried to sustain one continuous effort — your body adapts and becomes more capable. Classic formats range from 30/30 (30 seconds fast, 30 seconds easy) to 400m or 1000m track repeats." },
      { type: 'benefits-grid', title: 'Why do intervals?', items: [
        { emoji: '⚡', title: 'Higher VO2max', text: "Improves your maximum oxygen consumption — the single best indicator of cardiovascular fitness" },
        { emoji: '🏃', title: 'Raw speed', text: "Recruits fast-twitch muscle fibers and improves running economy (the energy cost per stride)" },
        { emoji: '🔋', title: 'Anaerobic capacity', text: "Trains your body to tolerate and clear lactate (the metabolic byproduct that creates the burning sensation)" },
        { emoji: '⏱️', title: 'Time efficiency', text: "20 minutes of well-executed intervals stimulate as much adaptation as an hour of easy running" },
      ]},
      { type: 'caution', items: [
        "Warm up for at least 10–15 minutes of easy jogging before starting intervals — cold muscles and tendons mean injury risk",
        "Recovery between reps is just as important as the effort: if you don't recover enough, the quality of your last reps drops",
        "Don't exceed 2 interval sessions per week — your body needs at least 48 hours to absorb this type of stress",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: '8×30/30', level: 'beginner' as const, metrics: [{ label: 'Effort', value: '30s fast' }, { label: 'Recovery', value: '30s easy' }, { label: 'Total', value: '~30 min' }], description: "After a 10-min warm-up, run 30 seconds at a hard pace (you can't talk) then 30 seconds of light jogging. Repeat 8 times. Finish with a 10-min cool-down. Perfect for starting intervals without a track." },
        { name: '6×400m', level: 'intermediate' as const, metrics: [{ label: 'Effort', value: '400m fast' }, { label: 'Recovery', value: '200m walk/jog' }, { label: 'Total', value: '~40 min' }], description: "On a track or flat measured route. Run each 400m at a pace you couldn't hold for more than 3–4 minutes. Recover by walking or jogging 200m between each. Aim for consistency: all 6 reps at the same time." },
        { name: '5×1000m', level: 'advanced' as const, metrics: [{ label: 'Effort', value: '1000m at 5K pace' }, { label: 'Recovery', value: '2 min jog' }, { label: 'Total', value: '~50 min' }], description: "After a 15-min warm-up with drills (high knees, butt kicks). Run each 1000m at your 5K race pace. 2 minutes of jogging between sets. Finish with a 10-min cool-down. The last rep should be as fast as the first." },
      ]},
      { type: 'tip', text: "💡 The key to intervals is consistency across reps, not maximum speed. If your last rep is much slower than your first, you started too fast." },
    ],
  },
  // 3. Tempo
  {
    sport: 'course',
    sessionType: 'tempo',
    title: 'Tempo runs, your race pace builder',
    subtitle: 'Running at threshold to push your race limits.',
    blocks: [
      { type: 'hero', tag: 'Tempo', title: 'Tempo runs, your race pace builder', subtitle: 'Running at threshold to push your race limits.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 3-4', label: 'target zone' },
        { value: '~85%', label: 'of max HR' },
        { value: '20–45min', label: 'tempo block' },
      ]},
      { type: 'intro', title: 'What is tempo pace?', text: "Tempo pace sits right at your lactate threshold (the point where your body starts producing more lactate than it can clear). In practice, it's a \"comfortably hard\" pace — you can say a few words but can't hold a conversation. It's typically your half-marathon pace, or a pace you could sustain for about 1 hour in a race. The goal is to teach your body to push that threshold higher, allowing you to run faster for longer without \"blowing up.\"" },
      { type: 'benefits-grid', title: 'Why do tempo runs?', items: [
        { emoji: '📈', title: 'Higher lactate threshold', text: "Your body learns to recycle lactate more efficiently — you can sustain a faster pace for longer" },
        { emoji: '🎯', title: 'Pace awareness', text: "You learn to feel and hold a precise intensity — essential on race day" },
        { emoji: '💪', title: 'Muscular endurance', text: "Trains your muscles to work under sustained tension without falling apart" },
        { emoji: '🏅', title: 'Race preparation', text: "The session that most closely mimics race effort — from 10K to half-marathon" },
      ]},
      { type: 'caution', items: [
        "Don't turn your tempo into an all-out effort: the pace should be sustained but controlled. If you finish exhausted, you were too fast",
        "Warm up for 10–15 minutes of easy jogging before starting the tempo block",
        "Avoid tempo the day before or after an interval session — space your hard sessions at least 48 hours apart",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Intro tempo', level: 'beginner' as const, metrics: [{ label: 'Tempo block', value: '15 min' }, { label: 'Pace', value: 'Half-marathon' }, { label: 'Total', value: '~35 min' }], description: "10-min warm-up jog, then 15 min at \"comfortably hard\" pace (you can say a few words but not a full sentence). Finish with a 10-min cool-down. Don't watch your watch — focus on the feeling." },
        { name: 'Classic tempo', level: 'intermediate' as const, metrics: [{ label: 'Tempo block', value: '30 min' }, { label: 'Pace', value: '~7:45–8:30/mi' }, { label: 'Total', value: '~50 min' }], description: "After warm-up, hold 30 minutes at a steady tempo pace. Your first kilometre should be at the same pace as your last. If you speed up at the end, you weren't fast enough at the start — and vice versa." },
        { name: 'Long tempo', level: 'advanced' as const, metrics: [{ label: 'Tempo block', value: '45 min' }, { label: 'Pace', value: '~6:50–7:30/mi' }, { label: 'Total', value: '~1h10' }], description: "The king session for half-marathon and marathon prep. 15-min progressive warm-up, 45 min of sustained tempo, 10-min cool-down. Water intake possible during the block. Your mind matters as much as your legs on this format." },
      ]},
      { type: 'tip', text: "💡 Tempo pace boils down to one sentence: \"I could go faster, but I choose to hold.\" That discipline is what makes the difference on race day." },
    ],
  },
  // 4. Recovery
  {
    sport: 'course',
    sessionType: 'recovery',
    title: 'Recovery jogs',
    subtitle: 'Easy running to absorb hard workouts.',
    blocks: [
      { type: 'hero', tag: 'Recovery', title: 'Recovery jogs', subtitle: 'Easy running to absorb hard workouts.' },
      { type: 'big-numbers', items: [
        { value: 'Zone 1', label: 'max intensity' },
        { value: '20–40min', label: 'plenty enough' },
        { value: '+30%', label: 'absorption boost' },
      ]},
      { type: 'intro', title: 'Why run easy?', text: "The recovery jog is the slowest run of your week — yet one of the most important. After a hard workout (intervals, tempo, race), your body needs to repair micro-tears in muscle fibers and replenish energy stores. Active recovery (running very slowly rather than staying still) speeds up this process by increasing blood flow to muscles without adding extra stress. It's during recovery that your body adapts and gets stronger — not during the effort itself." },
      { type: 'benefits-grid', title: 'Benefits of running easy', items: [
        { emoji: '🩹', title: 'Muscle repair', text: "Increased blood flow delivers oxygen and nutrients to damaged muscles, speeding up healing" },
        { emoji: '🧹', title: 'Waste clearance', text: "Helps flush metabolic waste accumulated during hard sessions (lactate, hydrogen ions)" },
        { emoji: '😌', title: 'Nervous system recovery', text: "Lets your central nervous system rest — it's taxed just as much as your muscles during hard efforts" },
        { emoji: '🔄', title: 'Running habit', text: "Adds training volume without fatigue — your body gets used to running more often" },
      ]},
      { type: 'caution', items: [
        "Your ego is your worst enemy: if you pass other runners and speed up, you're missing the point of the session",
        "Skip active recovery if you have real joint or muscle pain — in that case, complete rest is better",
        "No watch, no splits: run by feel, in Zone 1 (you should be able to sing, not just talk)",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Shake-out jog', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '20 min' }, { label: 'Pace', value: 'Very slow' }, { label: 'Intensity', value: 'Zone 1' }], description: "Run (or alternate brisk walking and jogging) for 20 minutes at a pace where you could sing. No distance or speed goal. If something hurts, just walk. The idea is to move, not to push." },
        { name: 'Recovery run', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '30 min' }, { label: 'Pace', value: '10:30–12:00/mi' }, { label: 'Intensity', value: 'Zone 1' }], description: "The day after intervals or tempo. Run 30 minutes at a very comfortable pace. Your heart rate should stay under 65% of your max HR. If it climbs, slow down without hesitation." },
        { name: 'Recovery + strides', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '40 min' }, { label: 'Pace', value: 'Easy + 4 strides' }, { label: 'Intensity', value: 'Zone 1 + strides' }], description: "30 minutes of very light jogging followed by 4 × 80m progressive accelerations (strides). These short bursts reactivate fast-twitch fibers without fatigue. 1 minute of walking between each stride. Finish with 5 minutes of easy jogging." },
      ]},
      { type: 'tip', text: "💡 A good recovery run is one where you feel like you didn't run enough. If you finish tired, it wasn't recovery anymore." },
    ],
  },
  // 5. Fartlek
  {
    sport: 'course',
    sessionType: 'fartlek',
    title: 'Fartlek, the speed play',
    subtitle: 'Vary your pace by feel for fun and fitness.',
    blocks: [
      { type: 'hero', tag: 'Fartlek', title: 'Fartlek, the speed play', subtitle: 'Vary your pace by feel for fun and fitness.' },
      { type: 'big-numbers', items: [
        { value: '1937', label: 'invented in Sweden' },
        { value: 'RPE', label: 'effort-based' },
        { value: 'Zone 1-5', label: 'all paces' },
      ]},
      { type: 'intro', title: 'What is fartlek?', text: "Fartlek (a Swedish word meaning \"speed play\") is a training method invented in the 1930s by Swedish coach Gösta Holmér. The concept is simple: you vary your pace freely, based on how you feel (what's called RPE, or \"Rating of Perceived Exertion\" — a scale of how hard the effort feels). No stopwatch, no set distances — you speed up when you feel like it, slow down when your body asks. It's a blend of endurance, tempo and speed in a single session, guided by the joy of running." },
      { type: 'benefits-grid', title: 'Why do fartlek?', items: [
        { emoji: '🎮', title: 'Joy of running', text: "Without rigid structure, every session is different — it breaks routine and reignites motivation" },
        { emoji: '🌡️', title: 'All energy systems', text: "By varying paces, you stress both the aerobic (endurance) and anaerobic (speed) systems in one session" },
        { emoji: '🧭', title: 'Pace intuition', text: "Teaches you to listen to your body and adjust effort without relying on a watch or a plan" },
        { emoji: '🏔️', title: 'Terrain-friendly', text: "Perfect for hilly routes or trails — the terrain naturally dictates pace changes" },
      ]},
      { type: 'caution', items: [
        "Fartlek isn't an excuse to run aimlessly: keep an intention behind each surge and each recovery",
        "Avoid turning every acceleration into an all-out sprint — vary intensities (some moderate, some hard)",
        "Like intervals, warm up for 10 minutes of easy jogging before starting pace changes",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Lamppost fartlek', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '25–30 min' }, { label: 'Method', value: 'Visual landmarks' }, { label: 'Intensity', value: 'Zone 2-3' }], description: "After a 10-min warm-up, speed up from one lamppost to the next (or tree to tree), then recover by jogging between the next two. Repeat 6–8 times. It's playful and works on any urban route. Finish with a 5-min cool-down." },
        { name: '40-min fartlek', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '40 min' }, { label: 'Surges', value: '6–8' }, { label: 'Intensity', value: 'Zone 2-4' }], description: "10-min warm-up, then 20 min of play: alternate surges of 1–3 minutes at tempo pace (comfortably hard) with equal or longer easy jog recoveries. No fixed pattern — let the terrain and your feelings guide you. 10-min cool-down." },
        { name: 'Hilly fartlek', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '50–60 min' }, { label: 'Terrain', value: 'Hills / trails' }, { label: 'Intensity', value: 'Zone 2-5' }], description: "Pick a route with rolling hills. Attack every climb at tempo pace or faster (Zone 3-5 depending on the grade), recover on descents and flats. Hills of 30 seconds to 2 minutes become natural intervals. Aim for 8–12 surges in the session. The terrain is your coach." },
      ]},
      { type: 'tip', text: "💡 Fartlek was born from the idea that running should be play. If you always follow a strict plan, treat yourself to a fartlek: let your body decide, and rediscover the simple joy of running." },
    ],
  },
];
