'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Locale = 'fr' | 'en';

const translations = {
  fr: {
    // App
    appTitle: 'Jupiter',
    appSubtitle: 'Tracker',

    // Nav
    calendar: 'Calendrier',
    stats: 'Stats',

    // Month names
    months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthsShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    weekdays: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],

    // Calendar
    today: "aujourd'hui",
    loading: 'Chargement...',
    noWorkout: 'Aucune séance',
    thisMonth: 'Ce mois-ci',
    strengthSessions: 'Séances muscu',
    cyclingSessions: 'Séances vélo',
    distanceCovered: 'Distance parcourue',
    totalElevation: 'Dénivelé cumulé',
    newWorkout: 'Nouvelle séance',
    cycling: 'Vélo',
    strength: 'Musculation',
    cancel: 'Annuler',
    cyclingTag: '🚴 Vélo',
    strengthTag: '🏋️ Muscu',
    running: 'Course à pied',
    swimming: 'Natation',
    customWorkout: 'Personnalisé',
    runningTag: '🏃 Course',
    swimmingTag: '🏊 Natation',
    customTag: '🎯 Perso',
    laps: 'Longueurs',
    lapsPlaceholder: 'ex: 40',
    addField: '+ Ajouter un champ',
    removeField: 'Retirer',
    chooseEmoji: 'Choisir un emoji',
    editName: 'Modifier le nom',
    workoutName: 'Nom de la séance',
    runningWorkout: 'Course à pied',
    swimmingWorkout: 'Natation',
    customWorkoutTitle: 'Séance personnalisée',
    totalSessions: 'Séances totales',
    workoutTypeLabels: {
      velo: 'Vélo',
      musculation: 'Musculation',
      course: 'Course à pied',
      natation: 'Natation',
      custom: 'Personnalisé',
    } as Record<string, string>,
    workoutTypeTags: {
      velo: '🚴 Vélo',
      musculation: '🏋️ Muscu',
      course: '🏃 Course',
      natation: '🏊 Natation',
      custom: '🎯 Perso',
    } as Record<string, string>,

    // Weekly progress
    weekCount: (count: number) => `${count}/3 cette semaine`,
    medals: 'Médailles',
    medalsDescription: "Gagne des médailles en t'entraînant régulièrement chaque semaine (lundi au dimanche).",
    sessions3: '3 séances',
    sessions4: '4 séances',
    sessions5: '5 séances',
    sessions6plus: '6+',
    medal1: '1 médaille',
    medals2: '2 médailles',
    medals3: '3 médailles',
    medalsExtra: '+1 par séance supplémentaire',
    currentMedals: (count: number) => `Tu as actuellement ${count} médaille${count > 1 ? 's' : ''}.`,
    understood: 'Compris',

    // Stats
    totalMedals: 'Médailles cumulées',

    // Save animation
    workoutSaved: 'Séance sauvegardée',

    // Cycling form
    cyclingWorkout: 'Séance vélo',
    rideType: 'Type de sortie',
    duration: 'Durée',
    durationPlaceholder: 'ex: 1h30',
    distance: 'Distance (km)',
    elevation: 'Dénivelé (m)',
    save: 'Sauvegarder',
    saving: 'Sauvegarde...',
    editWorkout: 'Modifier la séance',
    deleteWorkout: 'Supprimer la séance',
    deleteConfirmTitle: 'Supprimer cette séance ?',
    deleteConfirmCycling: 'Cette action est irréversible. Toutes les données de cette sortie seront supprimées.',
    deleteConfirmStrength: 'Cette action est irréversible. Tous les exercices et séries enregistrés seront supprimés.',
    deleteConfirmGeneric: 'Cette action est irréversible. Toutes les données de cette séance seront supprimées.',
    deleting: 'Suppression...',
    delete: 'Supprimer',
    loadingWorkout: 'Chargement de la séance...',
    unsavedChanges: 'Modifications non sauvegardées',

    // Strength form
    strengthWorkout: 'Séance musculation',
    set: 'Série',
    previous: 'Précéd.',
    reps: 'Reps',
    weight: 'Poids',
    addNote: 'Ajouter une note...',
    unpin: 'Désépingler',
    pin: 'Épingler',
    note: 'Note',
    addSet: '+ Ajouter une série',
    viewHistory: "Voir l'historique",
    noHistory: 'Aucun historique disponible',
    addExercise: '+ Ajouter un exercice',
    saveWorkout: 'Sauvegarder la séance',

    // Exercise picker
    chooseExercise: 'Choisir un exercice',
    search: 'Rechercher...',
    enableFilter: 'Active au moins un filtre',
    noExerciseFound: 'Aucun exercice trouvé',
    createExercise: '+ Créer un nouvel exercice',
    newExercise: 'Nouvel exercice',
    exerciseName: "Nom de l'exercice",
    muscleGroup: 'Groupe musculaire',
    choose: 'Choisir...',
    createAndAdd: 'Créer et ajouter',

    // Workout detail text (api.ts)
    exerciseCount: (n: number) => `${n} exercice${n > 1 ? 's' : ''}`,
    cyclingDefault: 'Vélo',
    strengthDefault: 'Musculation',

    // Muscle groups
    muscleGroups: {
      'Pectoraux': 'Pectoraux',
      'Dos': 'Dos',
      'Épaules': 'Épaules',
      'Biceps': 'Biceps',
      'Triceps': 'Triceps',
      'Abdominaux': 'Abdominaux',
      'Quadriceps': 'Quadriceps',
      'Ischios': 'Ischios',
      'Fessiers': 'Fessiers',
      'Mollets': 'Mollets',
    } as Record<string, string>,

    // Ride types
    rideTypes: {
      'Route': 'Route',
      'Gravel': 'Gravel',
      'Home trainer': 'Home trainer',
      'VTT': 'VTT',
      'Vélotaf': 'Vélotaf',
    } as Record<string, string>,

    // Auth
    login: 'Connexion',
    register: 'Créer un compte',
    nickname: 'Pseudo',
    password: 'Mot de passe',
    inviteCode: "Code d'invitation",
    loginButton: 'Se connecter',
    registerButton: 'Créer mon compte',
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà un compte ?',
    logout: 'Déconnexion',

    // Profile
    profile: 'Profil',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    saveChanges: 'Enregistrer',
    profileUpdated: 'Profil mis à jour',

    // Auth errors
    errorInvalidCredentials: 'Pseudo ou mot de passe incorrect',
    errorNicknameTaken: 'Ce pseudo est déjà pris',
    errorInvalidInviteCode: "Code d'invitation invalide",
    errorPasswordTooShort: 'Le mot de passe doit faire au moins 6 caractères',
    errorCurrentPasswordRequired: 'Le mot de passe actuel est requis',
    errorCurrentPasswordWrong: 'Le mot de passe actuel est incorrect',
    errorAllFieldsRequired: 'Tous les champs sont requis',
  },
  en: {
    appTitle: 'Jupiter',
    appSubtitle: 'Tracker',

    calendar: 'Calendar',
    stats: 'Stats',

    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    today: 'today',
    loading: 'Loading...',
    noWorkout: 'No workout',
    thisMonth: 'This month',
    strengthSessions: 'Strength sessions',
    cyclingSessions: 'Cycling sessions',
    distanceCovered: 'Distance covered',
    totalElevation: 'Total elevation',
    newWorkout: 'New workout',
    cycling: 'Cycling',
    strength: 'Strength',
    cancel: 'Cancel',
    cyclingTag: '🚴 Cycling',
    strengthTag: '🏋️ Strength',
    running: 'Running',
    swimming: 'Swimming',
    customWorkout: 'Custom',
    runningTag: '🏃 Running',
    swimmingTag: '🏊 Swimming',
    customTag: '🎯 Custom',
    laps: 'Laps',
    lapsPlaceholder: 'e.g. 40',
    addField: '+ Add a field',
    removeField: 'Remove',
    chooseEmoji: 'Choose an emoji',
    editName: 'Edit name',
    workoutName: 'Workout name',
    runningWorkout: 'Running workout',
    swimmingWorkout: 'Swimming workout',
    customWorkoutTitle: 'Custom workout',
    totalSessions: 'Total sessions',
    workoutTypeLabels: {
      velo: 'Cycling',
      musculation: 'Strength',
      course: 'Running',
      natation: 'Swimming',
      custom: 'Custom',
    } as Record<string, string>,
    workoutTypeTags: {
      velo: '🚴 Cycling',
      musculation: '🏋️ Strength',
      course: '🏃 Running',
      natation: '🏊 Swimming',
      custom: '🎯 Custom',
    } as Record<string, string>,

    weekCount: (count: number) => `${count}/3 this week`,
    medals: 'Medals',
    medalsDescription: 'Earn medals by training regularly each week (Monday to Sunday).',
    sessions3: '3 sessions',
    sessions4: '4 sessions',
    sessions5: '5 sessions',
    sessions6plus: '6+',
    medal1: '1 medal',
    medals2: '2 medals',
    medals3: '3 medals',
    medalsExtra: '+1 per extra session',
    currentMedals: (count: number) => `You currently have ${count} medal${count > 1 ? 's' : ''}.`,
    understood: 'Got it',

    totalMedals: 'Total medals',

    workoutSaved: 'Workout saved',

    cyclingWorkout: 'Cycling workout',
    rideType: 'Ride type',
    duration: 'Duration',
    durationPlaceholder: 'e.g. 1h30',
    distance: 'Distance (km)',
    elevation: 'Elevation (m)',
    save: 'Save',
    saving: 'Saving...',
    editWorkout: 'Edit workout',
    deleteWorkout: 'Delete workout',
    deleteConfirmTitle: 'Delete this workout?',
    deleteConfirmCycling: 'This action is irreversible. All data for this ride will be deleted.',
    deleteConfirmStrength: 'This action is irreversible. All exercises and sets will be deleted.',
    deleteConfirmGeneric: 'This action is irreversible. All data for this workout will be deleted.',
    deleting: 'Deleting...',
    delete: 'Delete',
    loadingWorkout: 'Loading workout...',
    unsavedChanges: 'Unsaved changes',

    strengthWorkout: 'Strength workout',
    set: 'Set',
    previous: 'Prev.',
    reps: 'Reps',
    weight: 'Weight',
    addNote: 'Add a note...',
    unpin: 'Unpin',
    pin: 'Pin',
    note: 'Note',
    addSet: '+ Add a set',
    viewHistory: 'View history',
    noHistory: 'No history available',
    addExercise: '+ Add an exercise',
    saveWorkout: 'Save workout',

    chooseExercise: 'Choose an exercise',
    search: 'Search...',
    enableFilter: 'Enable at least one filter',
    noExerciseFound: 'No exercise found',
    createExercise: '+ Create a new exercise',
    newExercise: 'New exercise',
    exerciseName: 'Exercise name',
    muscleGroup: 'Muscle group',
    choose: 'Choose...',
    createAndAdd: 'Create and add',

    exerciseCount: (n: number) => `${n} exercise${n > 1 ? 's' : ''}`,
    cyclingDefault: 'Cycling',
    strengthDefault: 'Strength',

    muscleGroups: {
      'Pectoraux': 'Chest',
      'Dos': 'Back',
      'Épaules': 'Shoulders',
      'Biceps': 'Biceps',
      'Triceps': 'Triceps',
      'Abdominaux': 'Abs',
      'Quadriceps': 'Quads',
      'Ischios': 'Hamstrings',
      'Fessiers': 'Glutes',
      'Mollets': 'Calves',
    } as Record<string, string>,

    rideTypes: {
      'Route': 'Road',
      'Gravel': 'Gravel',
      'Home trainer': 'Indoor trainer',
      'VTT': 'MTB',
      'Vélotaf': 'Commute',
    } as Record<string, string>,

    // Auth
    login: 'Log in',
    register: 'Create account',
    nickname: 'Nickname',
    password: 'Password',
    inviteCode: 'Invite code',
    loginButton: 'Log in',
    registerButton: 'Create account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    logout: 'Log out',

    // Profile
    profile: 'Profile',
    currentPassword: 'Current password',
    newPassword: 'New password',
    saveChanges: 'Save changes',
    profileUpdated: 'Profile updated',

    // Auth errors
    errorInvalidCredentials: 'Invalid nickname or password',
    errorNicknameTaken: 'This nickname is already taken',
    errorInvalidInviteCode: 'Invalid invite code',
    errorPasswordTooShort: 'Password must be at least 6 characters',
    errorCurrentPasswordRequired: 'Current password is required',
    errorCurrentPasswordWrong: 'Current password is incorrect',
    errorAllFieldsRequired: 'All fields are required',
  },
};

export type Translations = {
  [K in keyof typeof translations.fr]: (typeof translations.fr)[K] extends (...args: infer A) => infer R
    ? (...args: A) => R
    : (typeof translations.fr)[K] extends readonly string[]
      ? string[]
      : (typeof translations.fr)[K] extends Record<string, string>
        ? Record<string, string>
        : string;
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'fr',
  setLocale: () => {},
  t: translations.fr,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && (saved === 'fr' || saved === 'en')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
