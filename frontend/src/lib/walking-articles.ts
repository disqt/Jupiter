import type { LibraryArticle } from './library-content';

export const WALKING_ARTICLES_FR: LibraryArticle[] = [
  // 1. Walk — La balade
  {
    sport: 'marche',
    sessionType: 'walk',
    title: 'La balade, le sport le plus sous-estimé',
    subtitle: 'Marcher régulièrement transforme votre santé — sans forcer.',
    blocks: [
      { type: 'hero', tag: 'Balade', title: 'La balade, le sport le plus sous-estimé', subtitle: 'Marcher régulièrement transforme votre santé — sans forcer.' },
      { type: 'big-numbers', items: [
        { value: '7 500', label: 'pas/jour suffisent' },
        { value: '-40%', label: 'risque cardiovasculaire' },
        { value: '30 min', label: 'par jour recommandées' },
      ]},
      { type: 'intro', title: 'Pourquoi la marche est un vrai sport ?', text: "On entend souvent qu'il faut faire 10 000 pas par jour. En réalité, ce chiffre vient d'une campagne marketing japonaise des années 1960, pas de la science. Les études récentes montrent que les bénéfices majeurs arrivent dès 7 500 pas par jour, et que chaque pas supplémentaire compte. La marche active votre NEAT (thermogénèse par activité non sportive — c'est-à-dire toutes les calories que vous brûlez en bougeant sans faire de sport : marcher, monter des escaliers, gesticuler). Ce NEAT représente jusqu'à 15% de votre dépense calorique quotidienne, et la marche en est le levier le plus facile à activer." },
      { type: 'benefits-grid', title: 'Les bienfaits prouvés', items: [
        { emoji: '❤️', title: 'Santé cardiovasculaire', text: "30 minutes de marche quotidienne réduisent le risque de maladie cardiaque de 35 à 40% selon l'American Heart Association" },
        { emoji: '🧠', title: 'Humeur et créativité', text: "La marche libère des endorphines (hormones du bien-être) et stimule la pensée créative — Stanford a montré +60% de créativité en marchant" },
        { emoji: '🦴', title: 'Os et articulations', text: "Contrairement à la course, la marche est douce pour les articulations tout en renforçant la densité osseuse grâce à l'impact modéré" },
        { emoji: '😴', title: 'Meilleur sommeil', text: "Marcher en journée aide à réguler votre rythme circadien (horloge biologique) et améliore la qualité du sommeil" },
      ]},
      { type: 'caution', items: [
        "Portez des chaussures confortables avec un bon amorti — des chaussures inadaptées peuvent causer des douleurs aux pieds, genoux ou dos",
        "Hydratez-vous même pour une balade de 30 minutes, surtout par temps chaud",
        "Si vous reprenez après une longue période sédentaire, commencez par 10 à 15 minutes et augmentez progressivement chaque semaine",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Balade du quartier', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '20 min' }, { label: 'Distance', value: '1,5–2 km' }, { label: 'Rythme', value: 'Tranquille' }], description: "Sortez de chez vous et marchez à votre rythme naturel. Pas besoin de chrono ni d'objectif. L'idée est simplement de bouger et de prendre l'air. Faites-en une habitude quotidienne, par exemple après le déjeuner." },
        { name: 'Marche active 45 min', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '45 min' }, { label: 'Distance', value: '4–5 km' }, { label: 'Rythme', value: '5–6 km/h' }], description: "Marchez d'un bon pas, assez vite pour sentir votre respiration s'accélérer légèrement sans être essoufflé. Variez les parcours pour garder la motivation : parcs, bords de rivière, nouveaux quartiers." },
        { name: 'Exploration urbaine 1h+', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '1h–1h30' }, { label: 'Distance', value: '6–9 km' }, { label: 'Rythme', value: '5,5–6,5 km/h' }], description: "Longue sortie à travers la ville ou en périphérie. Incluez des escaliers, des côtes, des passages variés. Emportez une bouteille d'eau. C'est une vraie séance d'endurance qui brûle 300 à 450 calories." },
      ]},
      { type: 'tip', text: "La meilleure marche est celle que vous faites tous les jours. Pas besoin de tenue spéciale ni de parcours précis — sortez, marchez, et laissez votre corps vous remercier." },
    ],
  },
  // 2. Brisk — Marche rapide
  {
    sport: 'marche',
    sessionType: 'brisk',
    title: 'La marche rapide, du cardio sans courir',
    subtitle: 'Accélérer le pas pour un vrai travail cardiovasculaire.',
    blocks: [
      { type: 'hero', tag: 'Marche rapide', title: 'La marche rapide, du cardio sans courir', subtitle: 'Accélérer le pas pour un vrai travail cardiovasculaire.' },
      { type: 'big-numbers', items: [
        { value: '6–8', label: 'km/h rythme cible' },
        { value: 'Zone 3', label: 'zone cardiaque' },
        { value: '~400', label: 'kcal/heure' },
      ]},
      { type: 'intro', title: "La marche rapide, c'est quoi exactement ?", text: "La marche rapide (ou power walking) consiste à marcher à un rythme soutenu, généralement entre 6 et 8 km/h, suffisamment vite pour élever votre fréquence cardiaque en Zone 3 (70 à 80% de votre fréquence cardiaque maximale — le rythme où vous respirez fort mais pouvez encore dire quelques mots). À cette intensité, vous brûlez presque autant de calories qu'en courant à faible allure, mais avec beaucoup moins d'impact sur vos articulations. Une étude publiée dans Medicine & Science in Sports & Exercise montre que la marche rapide régulière réduit la tension artérielle aussi efficacement que la course." },
      { type: 'benefits-grid', title: 'Pourquoi la pratiquer ?', items: [
        { emoji: '🔥', title: 'Dépense calorique élevée', text: "À 7 km/h, vous brûlez environ 350 à 450 kcal par heure — comparable à un jogging lent, sans le stress articulaire" },
        { emoji: '💪', title: 'Renforcement musculaire', text: "Sollicite intensément les mollets, fessiers et muscles du tronc (gainage naturel pour maintenir la posture)" },
        { emoji: '❤️', title: 'Capacité cardiovasculaire', text: "Améliore votre VO2max (quantité maximale d'oxygène que votre corps peut utiliser) de façon significative" },
        { emoji: '🏃', title: 'Accessible à tous', text: "Pas besoin de savoir courir ni d'équipement spécial — idéal si la course est contre-indiquée ou si vous reprenez le sport" },
      ]},
      { type: 'caution', items: [
        "Gardez une posture droite : regard devant, épaules relâchées, bras qui balancent naturellement. Se pencher en avant fatigue le dos inutilement",
        "Échauffez-vous 5 minutes à allure normale avant d'accélérer — démarrer trop vite peut provoquer des douleurs aux tibias",
        "Si vous sentez une douleur aux articulations (genoux, chevilles), ralentissez. La marche rapide ne doit jamais faire mal",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Intervalles marche rapide', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '20 min' }, { label: 'Format', value: '2 min vite / 2 min normal' }, { label: 'Rythme rapide', value: '6–6,5 km/h' }], description: "Alternez 2 minutes de marche rapide et 2 minutes de marche normale. Répétez 5 fois. C'est la meilleure façon de commencer — votre corps s'habitue progressivement à l'effort." },
        { name: 'Marche soutenue 40 min', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '40 min' }, { label: 'Distance', value: '4,5–5 km' }, { label: 'Rythme', value: '6,5–7,5 km/h' }], description: "Maintenez un rythme soutenu pendant toute la séance. Vous devez respirer plus fort que d'habitude mais pouvoir encore prononcer des phrases courtes. Utilisez vos bras activement pour aider la propulsion." },
        { name: 'Power walk 1h', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '1h' }, { label: 'Distance', value: '7–8 km' }, { label: 'Rythme', value: '7–8 km/h' }], description: "Séance longue à haute intensité. Incluez des montées si possible. À ce rythme, la frontière avec le jogging est mince — gardez toujours un pied au sol (c'est ce qui distingue la marche de la course). Excellent entraînement pour le cœur et les jambes." },
      ]},
      { type: 'tip', text: "La marche rapide est le secret le mieux gardé du fitness : 80% des bénéfices cardiovasculaires de la course, avec une fraction des blessures. Parfait pour ceux qui veulent progresser sans s'abîmer." },
    ],
  },
  // 3. Hike — Randonnée
  {
    sport: 'marche',
    sessionType: 'hike',
    title: 'La randonnée, effort et évasion',
    subtitle: 'Longues distances et dénivelé pour un entraînement complet.',
    blocks: [
      { type: 'hero', tag: 'Randonnée', title: 'La randonnée, effort et évasion', subtitle: 'Longues distances et dénivelé pour un entraînement complet.' },
      { type: 'big-numbers', items: [
        { value: '500+', label: 'kcal/heure en montée' },
        { value: '×2', label: 'effort vs marche à plat' },
        { value: '3–5%', label: 'pente moyenne sentier' },
      ]},
      { type: 'intro', title: 'La randonnée, bien plus que de la marche', text: "La randonnée combine endurance, renforcement musculaire et équilibre dans un même effort. Dès que vous ajoutez du dénivelé (la différence d'altitude entre le point de départ et le point le plus haut), l'intensité grimpe considérablement : monter une pente de 10% double quasiment votre dépense énergétique par rapport à la marche à plat. Vos quadriceps (muscles avant de la cuisse), vos fessiers et vos mollets travaillent en continu. En descente, ce sont vos muscles qui freinent le mouvement — un travail dit excentrique (le muscle résiste en s'allongeant) qui renforce les articulations. Et au-delà du physique, l'immersion en nature réduit le cortisol (hormone du stress) de 12 à 16% selon les études sur les bains de forêt." },
      { type: 'benefits-grid', title: 'Pourquoi randonner ?', items: [
        { emoji: '⛰️', title: 'Entraînement complet', text: "Travaille le cardio, la force des jambes, l'équilibre et la proprioception (la capacité à sentir la position de votre corps dans l'espace) sur terrain irrégulier" },
        { emoji: '🧘', title: 'Anti-stress naturel', text: "L'immersion en nature réduit l'anxiété et améliore la concentration — les Japonais appellent ça le shinrin-yoku (bain de forêt)" },
        { emoji: '🔥', title: 'Dépense calorique majeure', text: "En montée avec un sac, vous pouvez brûler 500 à 700 kcal par heure — plus que la plupart des sports en salle" },
        { emoji: '🦵', title: 'Renforcement articulaire', text: "Les terrains variés renforcent les chevilles et les genoux de manière fonctionnelle, réduisant le risque de blessure au quotidien" },
      ]},
      { type: 'caution', items: [
        "Vérifiez la météo avant de partir et prévoyez toujours une couche supplémentaire — en altitude, la température chute d'environ 6°C tous les 1 000 mètres",
        "Emportez suffisamment d'eau (au moins 0,5 L par heure d'effort) et des encas énergétiques pour les sorties de plus de 2 heures",
        "Adaptez le poids de votre sac : un sac trop lourd (plus de 10-15% de votre poids corporel) fatigue le dos et les genoux. Commencez léger et augmentez progressivement",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Sentier nature 1h', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '1h' }, { label: 'Dénivelé', value: '100–200 m' }, { label: 'Distance', value: '4–5 km' }], description: "Choisissez un sentier balisé proche de chez vous, avec un faible dénivelé. Marchez à votre rythme, faites des pauses pour profiter du paysage. L'objectif est de vous habituer au terrain irrégulier et de prendre du plaisir." },
        { name: 'Randonnée montagne 3h', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '3h' }, { label: 'Dénivelé', value: '500–800 m' }, { label: 'Distance', value: '10–14 km' }], description: "Sortie avec une vraie montée et un objectif (sommet, refuge, lac). Emportez de l'eau, des barres et un coupe-vent. Montez à votre rythme en respirant régulièrement. La descente sollicite beaucoup les genoux — utilisez des bâtons si possible." },
        { name: 'Trek journée complète', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '6–8h' }, { label: 'Dénivelé', value: '1 000+ m' }, { label: 'Distance', value: '18–25 km' }], description: "Grande sortie nécessitant une vraie préparation : sac à dos (eau, nourriture, vêtements, trousse de secours), chaussures de randonnée montantes, et une bonne connaissance du parcours. Mangez régulièrement (toutes les 2 heures) et hydratez-vous en continu. Le mental est aussi important que le physique sur ces distances." },
      ]},
      { type: 'tip', text: "En randonnée, le rythme idéal est celui que vous pouvez maintenir toute la journée. Si vous êtes essoufflé en montée, ralentissez — il vaut mieux avancer régulièrement que s'arrêter toutes les 5 minutes." },
    ],
  },
  // 4. Recovery — Marche de récupération
  {
    sport: 'marche',
    sessionType: 'recovery',
    title: 'La marche de récupération',
    subtitle: 'Bouger doucement pour aider le corps à récupérer.',
    blocks: [
      { type: 'hero', tag: 'Récupération', title: 'La marche de récupération', subtitle: 'Bouger doucement pour aider le corps à récupérer.' },
      { type: 'big-numbers', items: [
        { value: '+40%', label: 'flux sanguin musculaire' },
        { value: 'Zone 1', label: 'zone cardiaque cible' },
        { value: '15–45', label: 'minutes suffisent' },
      ]},
      { type: 'intro', title: 'Pourquoi marcher après un entraînement dur ?', text: "Après un effort intense (musculation, fractionné, match), vos muscles accumulent des déchets métaboliques (comme les ions hydrogène et le lactate) et subissent des micro-lésions normales. Le repos total semble logique, mais la récupération active — bouger doucement — est en réalité plus efficace. Une marche légère en Zone 1 (50 à 60% de votre fréquence cardiaque maximale, c'est-à-dire un rythme très tranquille) augmente le flux sanguin vers les muscles d'environ 40%, accélérant l'élimination des déchets et l'apport de nutriments nécessaires à la réparation. C'est le principe de la récupération active : bouger pour guérir plus vite." },
      { type: 'benefits-grid', title: 'Les bienfaits de la marche récup', items: [
        { emoji: '🩸', title: 'Circulation améliorée', text: "Le mouvement doux pompe le sang vers les muscles fatigués, apportant oxygène et nutriments pour accélérer la réparation" },
        { emoji: '🧘', title: 'Réduction des courbatures', text: "La marche réduit les DOMS (courbatures retardées qui apparaissent 24 à 48h après l'effort) en évitant la raideur musculaire" },
        { emoji: '😌', title: 'Baisse du cortisol', text: "Une marche calme, surtout en extérieur, fait baisser le cortisol (hormone du stress) et active le système nerveux parasympathique (mode repos et récupération)" },
        { emoji: '💤', title: 'Meilleur sommeil', text: "Une marche de récupération en fin de journée aide à la transition vers le repos et améliore la qualité du sommeil réparateur" },
      ]},
      { type: 'caution', items: [
        "Restez vraiment en zone légère : si vous sentez le moindre effort musculaire, c'est trop rapide. La marche récup ne doit jamais fatiguer",
        "Évitez les terrains accidentés ou les montées le jour de récup — préférez un chemin plat et confortable",
        "Si vous avez une vraie blessure (douleur aiguë, gonflement), la marche récup ne remplace pas le repos complet. Consultez un professionnel en cas de doute",
      ]},
      { type: 'examples', title: 'Exemples de séances', items: [
        { name: 'Balade post-entraînement', level: 'beginner' as const, metrics: [{ label: 'Durée', value: '15 min' }, { label: 'Rythme', value: 'Très lent' }, { label: 'Quand', value: 'Après la séance' }], description: "Juste après votre entraînement, marchez 15 minutes à allure très tranquille. Ça peut être un retour à pied de la salle, un tour du pâté de maisons. L'objectif est de ramener le rythme cardiaque au calme et de commencer la récupération." },
        { name: 'Marche douce 30 min', level: 'intermediate' as const, metrics: [{ label: 'Durée', value: '30 min' }, { label: 'Rythme', value: '4–5 km/h' }, { label: 'Quand', value: 'Jour de repos' }], description: "Le lendemain d'une grosse séance, sortez marcher 30 minutes à allure tranquille. Pas d'objectif de distance ni de vitesse. Concentrez-vous sur votre respiration, relâchez les épaules, laissez vos muscles se décontracter. Un podcast ou de la musique douce accompagnent bien cette séance." },
        { name: 'Marche nature 45 min', level: 'advanced' as const, metrics: [{ label: 'Durée', value: '45 min' }, { label: 'Rythme', value: '4,5–5 km/h' }, { label: 'Terrain', value: 'Parc ou forêt' }], description: "Marche de récupération prolongée en milieu naturel. La nature amplifie l'effet récupérateur grâce à la réduction du stress. Idéal entre deux gros blocs d'entraînement. Gardez un rythme très confortable — cette sortie doit vous laisser plus détendu qu'au départ." },
      ]},
      { type: 'tip', text: "La récupération ne se fait pas sur le canapé. 15 minutes de marche douce après l'effort valent mieux que 2 heures immobile — votre corps a besoin de mouvement pour se réparer." },
    ],
  },
];

export const WALKING_ARTICLES_EN: LibraryArticle[] = [
  // 1. Walk
  {
    sport: 'marche',
    sessionType: 'walk',
    title: 'Walking, the most underrated exercise',
    subtitle: 'Regular walking transforms your health — no strain needed.',
    blocks: [
      { type: 'hero', tag: 'Walk', title: 'Walking, the most underrated exercise', subtitle: 'Regular walking transforms your health — no strain needed.' },
      { type: 'big-numbers', items: [
        { value: '7,500', label: 'steps/day is enough' },
        { value: '-40%', label: 'cardiovascular risk' },
        { value: '30 min', label: 'daily recommended' },
      ]},
      { type: 'intro', title: 'Why is walking a real workout?', text: "You've probably heard you need 10,000 steps a day. In reality, that number comes from a 1960s Japanese marketing campaign, not from science. Recent studies show that the major health benefits kick in at around 7,500 steps per day, and every additional step counts. Walking activates your NEAT (non-exercise activity thermogenesis — all the calories you burn by moving without formally exercising: walking, climbing stairs, fidgeting). NEAT accounts for up to 15% of your daily calorie expenditure, and walking is the easiest way to boost it." },
      { type: 'benefits-grid', title: 'Proven benefits', items: [
        { emoji: '❤️', title: 'Heart health', text: '30 minutes of daily walking reduces the risk of heart disease by 35 to 40% according to the American Heart Association' },
        { emoji: '🧠', title: 'Mood and creativity', text: "Walking releases endorphins (feel-good hormones) and boosts creative thinking — a Stanford study showed a 60% increase in creativity while walking" },
        { emoji: '🦴', title: 'Bones and joints', text: 'Unlike running, walking is gentle on your joints while still strengthening bone density through moderate impact' },
        { emoji: '😴', title: 'Better sleep', text: 'Walking during the day helps regulate your circadian rhythm (biological clock) and improves sleep quality' },
      ]},
      { type: 'caution', items: [
        "Wear comfortable shoes with good cushioning — poorly fitted shoes can cause pain in your feet, knees, or back",
        "Stay hydrated even on a 30-minute walk, especially in warm weather",
        "If you're coming back from a long sedentary period, start with 10 to 15 minutes and gradually increase each week",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Neighborhood stroll', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '20 min' }, { label: 'Distance', value: '1.5–2 km' }, { label: 'Pace', value: 'Easy' }], description: "Step outside and walk at your natural pace. No timer, no goal needed. The idea is simply to move and get some fresh air. Make it a daily habit, for example after lunch." },
        { name: 'Active walk 45 min', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '45 min' }, { label: 'Distance', value: '4–5 km' }, { label: 'Pace', value: '5–6 km/h' }], description: "Walk at a brisk pace, fast enough to feel your breathing pick up slightly without being out of breath. Switch up your routes to stay motivated: parks, riverside paths, new neighborhoods." },
        { name: 'Urban exploration 1h+', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '1h–1h30' }, { label: 'Distance', value: '6–9 km' }, { label: 'Pace', value: '5.5–6.5 km/h' }], description: "Long outing through the city or outskirts. Include stairs, hills, and varied terrain. Bring a water bottle. This is a real endurance session that burns 300 to 450 calories." },
      ]},
      { type: 'tip', text: "The best walk is the one you do every day. No special outfit or mapped route needed — just step outside, walk, and let your body thank you." },
    ],
  },
  // 2. Brisk
  {
    sport: 'marche',
    sessionType: 'brisk',
    title: 'Brisk walking, cardio without running',
    subtitle: 'Pick up the pace for a real cardiovascular workout.',
    blocks: [
      { type: 'hero', tag: 'Brisk walk', title: 'Brisk walking, cardio without running', subtitle: 'Pick up the pace for a real cardiovascular workout.' },
      { type: 'big-numbers', items: [
        { value: '6–8', label: 'km/h target pace' },
        { value: 'Zone 3', label: 'heart rate zone' },
        { value: '~400', label: 'kcal/hour' },
      ]},
      { type: 'intro', title: 'What exactly is brisk walking?', text: "Brisk walking (or power walking) means walking at a sustained pace, typically between 6 and 8 km/h, fast enough to raise your heart rate into Zone 3 (70 to 80% of your maximum heart rate — the pace where you're breathing hard but can still say a few words). At this intensity, you burn nearly as many calories as slow jogging, but with far less impact on your joints. A study published in Medicine & Science in Sports & Exercise shows that regular brisk walking lowers blood pressure just as effectively as running." },
      { type: 'benefits-grid', title: 'Why do it?', items: [
        { emoji: '🔥', title: 'High calorie burn', text: "At 7 km/h, you burn roughly 350 to 450 kcal per hour — comparable to a slow jog, without the joint stress" },
        { emoji: '💪', title: 'Muscle strengthening', text: "Intensely engages your calves, glutes, and core muscles (natural bracing to maintain posture)" },
        { emoji: '❤️', title: 'Cardiovascular fitness', text: "Significantly improves your VO2max (the maximum amount of oxygen your body can use during exercise)" },
        { emoji: '🏃', title: 'Accessible to everyone', text: "No running skills or special equipment needed — ideal if running is contraindicated or you're returning to exercise" },
      ]},
      { type: 'caution', items: [
        "Maintain upright posture: eyes forward, shoulders relaxed, arms swinging naturally. Leaning forward strains your back unnecessarily",
        "Warm up for 5 minutes at normal pace before speeding up — starting too fast can cause shin pain",
        "If you feel joint pain (knees, ankles), slow down. Brisk walking should never hurt",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Brisk intervals', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '20 min' }, { label: 'Format', value: '2 min fast / 2 min normal' }, { label: 'Fast pace', value: '6–6.5 km/h' }], description: "Alternate 2 minutes of brisk walking and 2 minutes of normal walking. Repeat 5 times. This is the best way to start — your body gradually adapts to the effort." },
        { name: 'Sustained brisk 40 min', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '40 min' }, { label: 'Distance', value: '4.5–5 km' }, { label: 'Pace', value: '6.5–7.5 km/h' }], description: "Maintain a brisk pace throughout the entire session. You should be breathing harder than usual but still able to say short sentences. Use your arms actively to help propulsion." },
        { name: 'Power walk 1h', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '1h' }, { label: 'Distance', value: '7–8 km' }, { label: 'Pace', value: '7–8 km/h' }], description: "Long session at high intensity. Include hills if possible. At this pace, the line between walking and jogging is thin — always keep one foot on the ground (that's what distinguishes walking from running). Excellent training for heart and legs." },
      ]},
      { type: 'tip', text: "Brisk walking is fitness's best-kept secret: 80% of running's cardiovascular benefits, with a fraction of the injuries. Perfect for those who want to progress without breaking down." },
    ],
  },
  // 3. Hike
  {
    sport: 'marche',
    sessionType: 'hike',
    title: 'Hiking, effort meets adventure',
    subtitle: 'Long distances and elevation for a complete workout.',
    blocks: [
      { type: 'hero', tag: 'Hiking', title: 'Hiking, effort meets adventure', subtitle: 'Long distances and elevation for a complete workout.' },
      { type: 'big-numbers', items: [
        { value: '500+', label: 'kcal/hour uphill' },
        { value: '×2', label: 'effort vs flat walking' },
        { value: '3–5%', label: 'average trail grade' },
      ]},
      { type: 'intro', title: 'Hiking is much more than walking', text: "Hiking combines endurance, strength training, and balance into a single workout. As soon as you add elevation gain (the altitude difference between your starting point and the highest point), the intensity rises dramatically: climbing a 10% grade nearly doubles your energy expenditure compared to flat walking. Your quadriceps (front thigh muscles), glutes, and calves work continuously. On the descent, your muscles brake the movement — an eccentric contraction (the muscle resists while lengthening) that strengthens joints. And beyond the physical benefits, nature immersion reduces cortisol (the stress hormone) by 12 to 16% according to forest bathing studies." },
      { type: 'benefits-grid', title: 'Why hike?', items: [
        { emoji: '⛰️', title: 'Full-body workout', text: "Trains cardio, leg strength, balance, and proprioception (your body's ability to sense its position in space) on uneven terrain" },
        { emoji: '🧘', title: 'Natural stress relief', text: "Nature immersion reduces anxiety and improves focus — the Japanese call it shinrin-yoku (forest bathing)" },
        { emoji: '🔥', title: 'Major calorie burn', text: "Climbing with a pack, you can burn 500 to 700 kcal per hour — more than most gym workouts" },
        { emoji: '🦵', title: 'Joint strengthening', text: "Varied terrain functionally strengthens ankles and knees, reducing everyday injury risk" },
      ]},
      { type: 'caution', items: [
        "Check the weather before heading out and always bring an extra layer — at altitude, temperature drops about 6°C for every 1,000 meters gained",
        "Carry enough water (at least 0.5 L per hour of effort) and energy snacks for outings over 2 hours",
        "Adjust your pack weight: a bag that's too heavy (more than 10-15% of your body weight) strains your back and knees. Start light and increase gradually",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Nature trail 1h', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '1h' }, { label: 'Elevation', value: '100–200 m' }, { label: 'Distance', value: '4–5 km' }], description: "Choose a marked trail near you with gentle elevation. Walk at your own pace, take breaks to enjoy the scenery. The goal is to get used to uneven terrain and have fun." },
        { name: 'Mountain hike 3h', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '3h' }, { label: 'Elevation', value: '500–800 m' }, { label: 'Distance', value: '10–14 km' }], description: "An outing with a real climb and a goal (summit, refuge, lake). Bring water, bars, and a windbreaker. Climb at your own pace with steady breathing. The descent is tough on knees — use trekking poles if possible." },
        { name: 'Full-day trek', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '6–8h' }, { label: 'Elevation', value: '1,000+ m' }, { label: 'Distance', value: '18–25 km' }], description: "A big outing requiring real preparation: backpack (water, food, clothes, first aid kit), ankle-high hiking boots, and solid knowledge of the route. Eat regularly (every 2 hours) and hydrate continuously. Mental strength matters as much as physical fitness at these distances." },
      ]},
      { type: 'tip', text: "On a hike, the ideal pace is one you can maintain all day. If you're gasping on the climb, slow down — steady progress beats stopping every 5 minutes." },
    ],
  },
  // 4. Recovery
  {
    sport: 'marche',
    sessionType: 'recovery',
    title: 'Recovery walks',
    subtitle: 'Move gently to help your body recover.',
    blocks: [
      { type: 'hero', tag: 'Recovery', title: 'Recovery walks', subtitle: 'Move gently to help your body recover.' },
      { type: 'big-numbers', items: [
        { value: '+40%', label: 'muscle blood flow' },
        { value: 'Zone 1', label: 'target heart zone' },
        { value: '15–45', label: 'minutes is enough' },
      ]},
      { type: 'intro', title: 'Why walk after a hard workout?', text: "After intense exercise (strength training, intervals, a match), your muscles accumulate metabolic waste (like hydrogen ions and lactate) and suffer normal micro-tears. Complete rest seems logical, but active recovery — gentle movement — is actually more effective. A light walk in Zone 1 (50 to 60% of your maximum heart rate, meaning a very easy pace) increases blood flow to your muscles by about 40%, speeding up waste removal and delivering the nutrients needed for repair. This is the principle of active recovery: move to heal faster." },
      { type: 'benefits-grid', title: 'Benefits of recovery walks', items: [
        { emoji: '🩸', title: 'Improved circulation', text: 'Gentle movement pumps blood to tired muscles, delivering oxygen and nutrients to speed up repair' },
        { emoji: '🧘', title: 'Reduced soreness', text: 'Walking reduces DOMS (delayed onset muscle soreness that appears 24 to 48 hours after exercise) by preventing muscle stiffness' },
        { emoji: '😌', title: 'Lower cortisol', text: 'A calm walk, especially outdoors, lowers cortisol (the stress hormone) and activates the parasympathetic nervous system (rest and recovery mode)' },
        { emoji: '💤', title: 'Better sleep', text: 'An evening recovery walk helps transition into rest mode and improves the quality of restorative sleep' },
      ]},
      { type: 'caution', items: [
        "Stay truly in the easy zone: if you feel any muscular effort, you're going too fast. A recovery walk should never tire you out",
        "Avoid rough terrain or hills on recovery day — stick to flat, comfortable paths",
        "If you have a real injury (sharp pain, swelling), a recovery walk doesn't replace complete rest. See a professional if in doubt",
      ]},
      { type: 'examples', title: 'Session examples', items: [
        { name: 'Post-workout stroll', level: 'beginner' as const, metrics: [{ label: 'Duration', value: '15 min' }, { label: 'Pace', value: 'Very slow' }, { label: 'When', value: 'After training' }], description: "Right after your workout, walk for 15 minutes at a very easy pace. It can be a walk home from the gym or a loop around the block. The goal is to bring your heart rate back down and kickstart recovery." },
        { name: 'Gentle walk 30 min', level: 'intermediate' as const, metrics: [{ label: 'Duration', value: '30 min' }, { label: 'Pace', value: '4–5 km/h' }, { label: 'When', value: 'Rest day' }], description: "The day after a tough session, go for a 30-minute walk at an easy pace. No distance or speed targets. Focus on your breathing, relax your shoulders, let your muscles loosen up. A podcast or some chill music pairs nicely with this session." },
        { name: 'Nature recovery walk 45 min', level: 'advanced' as const, metrics: [{ label: 'Duration', value: '45 min' }, { label: 'Pace', value: '4.5–5 km/h' }, { label: 'Setting', value: 'Park or forest' }], description: "Extended recovery walk in nature. Being outdoors amplifies the recovery effect through stress reduction. Ideal between two hard training blocks. Keep a very comfortable pace — you should feel more relaxed after this walk than before." },
      ]},
      { type: 'tip', text: "Recovery doesn't happen on the couch. 15 minutes of gentle walking after exercise beats 2 hours sitting still — your body needs movement to repair itself." },
    ],
  },
];
