import type { Validity } from "./domain";

export type Locale = "en" | "fr";
export const locales: Locale[] = ["en", "fr"];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "skills-lang";

const en = {
  nav: {
    workspaceSection: "WORKSPACE",
    toolsSection: "TOOLS",
    overview: "Overview",
    employees: "Employees",
    matrix: "Skills matrix",
    competencies: "Competencies",
    documents: "Documents",
    passports: "QR passports",
    reports: "Excel connection",
  },
  sidebar: {
    companyWorkspace: "Company workspace",
    tipTitle: "Every skill. One scan.",
    tipBody: "A live skills passport for every person on your team.",
    viewPassports: "View passports",
    role: "Human Resources",
    signOut: "Sign out",
  },
  topbar: {
    workspace: "Workspace",
    liveWorkspace: "Live workspace",
    toggleTheme: "Toggle theme",
    viewExpiring: "View expiring qualifications",
    openNav: "Open navigation",
    closeNav: "Close navigation",
    language: "Language",
  },
  common: {
    save: "Save changes",
    cancel: "Cancel",
    confirm: "Confirm",
    dismiss: "Dismiss",
    tryAgain: "Try again",
    backToSignIn: "Back to sign in",
    refreshing: "Refreshing…",
    refreshWorkspace: "Refresh workspace",
    changesSaved: "Changes saved",
    previous: "Previous",
    next: "Next",
    page: (n: number) => `Page ${n}`,
    saving: "Saving…",
    workspaceUnavailable: "Workspace unavailable",
    openingWorkspace: "Opening your workspace…",
  },
  status: {
    valid: "Valid",
    expiringSoon: "Expiring soon",
    expired: "Expired",
    upcoming: "Upcoming",
    revoked: "Revoked",
    verified: "Verified",
    pendingReview: "Pending review",
    pending: "Pending",
    expiring: "Expiring",
    active: "Active",
    inactive: "Inactive",
  },
  overview: {
    eyebrowProfile: "EMPLOYEES / PROFILE",
    eyebrowWorkforce: "WORKFORCE MANAGEMENT",
    eyebrowGlance: "YOUR WORKFORCE, AT A GLANCE",
    employeeProfile: "Employee profile",
    subtitleProfile:
      "Qualifications, evidence and a passport that stays up to date.",
    subtitleEmployees: "The people behind every project.",
    subtitleMatrix: "See capabilities and qualification gaps across your team.",
    subtitleCompetencies:
      "A shared vocabulary for your company’s capabilities.",
    subtitleDocuments: "The evidence behind your team’s qualifications.",
    subtitlePassports:
      "Print a label. Share a profile. Keep qualifications within reach.",
    subtitleReports: "Connect Excel directly to your company’s live data.",
    subtitleDefault:
      "A clear view of your team’s skills and what needs attention.",
  },
  stats: {
    activeEmployees: "Active employees",
    acrossSites: (n: number) => `Across ${n} sites`,
    validQualifications: "Valid qualifications",
    verifiedWithinValidity: "Verified and within validity",
    expiring30: "Expiring in 30 days",
    planNextRenewal: "Plan the next renewal",
    expiredQualifications: "Expired qualifications",
    reviewWithTeam: "Review with your team",
  },
  attention: {
    needsAttention: "Needs attention",
    upcomingRenewals: "Upcoming renewals and expired qualifications",
    viewMatrix: "View matrix",
    expiryDate: "Expiry date",
    allCaughtUp: "All caught up",
    allCaughtUpDesc: "No qualifications are expired or due within 30 days.",
  },
  health: {
    title: "Qualification health",
    subtitle: "Active employee records",
    verifiedAndValid: "verified & valid",
    validQualifications: "Valid qualifications",
    pendingReview: "Pending review",
    expired: "Expired",
    footnote: "Validity and verification are tracked separately.",
  },
  yourPeople: {
    title: "Your people",
    subtitle: "Employee credentials, all in one place",
    allEmployees: "All employees",
  },
  activity: {
    title: "Recent activity",
    subtitle: "Latest changes in this company",
    none: "No activity yet",
    noneDesc: "Changes will appear here.",
  },
  banner: {
    title: "Credentials that travel with your team",
    desc: "Each employee has a live, public passport. Print their QR label for quick access on site.",
    open: "Open QR passports",
  },
  table: {
    name: "Name",
    employee: "Employee",
    employeeId: "Employee ID",
    qualification: "Qualification",
    department: "Department",
    departmentSite: "Department / site",
    qualifications: "Qualifications",
    status: "Status",
    openEmployee: "Open employee",
    viewEmployee: (name: string) => `View ${name}`,
    validSuffix: (n: number) => `/ ${n} valid`,
  },
  employees: {
    noneFound: "No employees found",
    noneFoundDesc: "Try another search, or add your first employee.",
    addEmployee: "Add employee",
    exportCsv: "Export CSV",
    searchPlaceholder: "Search name, ID, role or site…",
    searchLabel: "Search employees",
    statusLabel: "Employee status",
    allStatuses: "All statuses",
    showing: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total}`,
    count: (n: number) => `${n} employees`,
    notFound: "Employee not found",
    notFoundDesc: "Return to Employees to choose someone in this company.",
  },
  detail: {
    editProfile: "Edit profile",
    publicPassport: "Public passport",
    qualifications: "Qualifications",
    qualificationsDesc: "Validity, verification and supporting documents",
    addQualification: "Add qualification",
    validFrom: "Valid from",
    validUntil: "Valid until",
    verification: "Verification",
    uploadDiploma: "Upload diploma",
    markVerified: "Mark verified",
    revoke: "Revoke",
    verifyTitle: "Verify qualification?",
    verifyDesc: (name: string) =>
      `Confirm that HR has checked the supporting evidence for ${name}.`,
    revokeTitle: "Revoke qualification?",
    revokeDesc: (name: string) =>
      `${name} will be marked revoked on the public passport. Its history and evidence will remain.`,
    noQualifications: "No qualifications recorded",
    noQualificationsDesc:
      "Add a competency and its validity dates to start this passport.",
    employeePhotograph: "Employee photograph",
    shownOnPassport: "Shown on the passport and helmet label.",
    addPhotoHint: "Add a photo so people can identify this worker.",
    replacePhoto: "Replace photo",
    uploadPhoto: "Upload photo",
    helmetLabel: "Helmet label",
    printLabelHint:
      "Print a label with the employee’s name, photograph and unique QR code.",
    openPrintLayout: "Open print layout",
    replaceQr: "Replace QR code",
    replaceQrTitle: "Replace this QR code?",
    replaceQrDesc:
      "The old QR code will stop working immediately. You will need to print a new helmet label.",
    ssnHidden:
      "SSN and internal contact details are not shown on the public passport.",
  },
  matrix: {
    searchLabel: "Search skills matrix",
    searchPlaceholder: "Search employees…",
    legendValid: "Valid",
    legendExpiringPending: "Expiring / pending",
    legendExpiredRevoked: "Expired / revoked",
    notRecorded: "— Not recorded",
    footer:
      "Best current record shown per employee and competency. Open a profile for full history.",
  },
  competencies: {
    searchLabel: "Search competencies",
    searchPlaceholder: "Search competencies…",
    count: (n: number) => `${n} competencies`,
    noDescription: "No description added.",
    employeesCount: "employees",
    expiringSoonCount: "expiring soon",
    buildCatalogue: "Build your competency catalogue",
    buildCatalogueDesc:
      "Add a competency to start recording employee qualifications.",
    newCompetency: "New competency",
    categorySafety: "Safety",
    categoryTechnical: "Technical",
    categoryEquipment: "Equipment",
    categoryOnboarding: "Onboarding",
  },
  documents: {
    searchLabel: "Search documents",
    searchPlaceholder: "Search documents or employees…",
    uploadFromProfile: "Upload diplomas from an employee profile",
    document: "Document",
    type: "Type",
    added: "Added",
    diplomaCertificate: "Diploma / certificate",
    open: "Open",
    noDiplomas: "No diplomas uploaded yet",
    noDiplomasDesc:
      "HR can open an employee profile and attach a diploma to a qualification.",
  },
  passports: {
    openAccess: "Open access, always up to date",
    openAccessDesc:
      "Anyone with the QR code can view the employee’s skills and diplomas. No employee account needed.",
    searchLabel: "Search passports",
    searchPlaceholder: "Find an employee passport…",
    viewPassport: "View passport",
    printLabel: "Print label",
  },
  reports: {
    connectWorkbook: "Connect your workbook",
    useExcel: "Use Excel Power Query to refresh company data",
    defaultKeyName: "Excel reporting",
    step1Title: "Create a reporting key",
    step1DescPre: "Your key gives read-only access to",
    step1DescPost: ". It expires after 90 days.",
    step2Title: "Open Excel → Data → From Web",
    step2DescPre: "Choose a dataset below. In the credentials dialog choose",
    step2DescMid: ", use",
    step2DescPost: "as the username and your reporting key as the password.",
    step3Title: "Expand the data and build your report",
    step3DescPre: "Choose the",
    step3DescMid:
      "list, convert it to a table, then expand the columns you need. Refresh the query to fetch current records.",
    datasetEmployees: "Employees",
    datasetQualifications: "Qualifications",
    datasetCompetencies: "Competencies",
    copyUrl: (name: string) => `Copy ${name} URL`,
    moreThan1000: "Working with more than 1,000 records?",
    moreThan1000Desc:
      "The API is paginated. Use the supplied Power Query template to load every page.",
    downloadTemplate: "Download Power Query template",
    reportingKeys: "Reporting keys",
    privateToAccount: "Private to your account",
    keyName: "Key name",
    creating: "Creating…",
    createReportingKey: "Create reporting key",
    copyYourKey: "Copy your key now",
    shownOnce: "It will only be shown once. Keep it private.",
    copyKey: "Copy key",
    copied: "Copied",
    expires: (date: string) => `Expires ${date}`,
    revokeKey: (name: string) => `Revoke ${name}`,
    revokeKeyConfirm:
      "Revoke this reporting key? Connected workbooks using it will stop refreshing.",
    reportingKeysNote:
      "Reporting keys cannot change records or upload files. They only access data from this company.",
  },
  dialogs: {
    editEmployee: "Edit employee",
    addEmployee: "Add employee",
    addQualification: "Add qualification",
    newCompetency: "New competency",
    uploadDiploma: "Upload diploma",
    uploadPhoto: "Upload employee photo",
    fullName: "Full name",
    fullNamePlaceholder: "e.g. Thomas Bernard",
    employeeIdSsn: "Employee ID / SSN",
    employeeIdSsnPlaceholder: "Unique within the company",
    jobTitle: "Job title",
    jobTitlePlaceholder: "e.g. Site supervisor",
    department: "Department",
    departmentPlaceholder: "e.g. Operations",
    site: "Site",
    sitePlaceholder: "e.g. Riverside project",
    email: "Email",
    optionalInternalOnly: "(optional, internal only)",
    activeEmployeeCheckbox: "Active employee — public passport enabled",
    employeesNoAccount:
      "Employees do not receive an account. HR maintains their information.",
    competencyName: "Competency name",
    competencyNamePlaceholder: "e.g. Working at height",
    category: "Category",
    categoryPlaceholder: "e.g. Safety",
    description: "Description",
    recordingForPre: "Recording a qualification for",
    recordingForPost:
      ". Renewals are added as new records to preserve history.",
    competency: "Competency",
    selectCompetency: "Select competency",
    issuingOrg: "Issuing organization",
    issuingOrgPlaceholder: "Training provider or issuing body",
    optional: "(optional)",
    verificationPending: "Pending review",
    verificationVerified: "Verified by HR",
    leaveEndDateEmpty:
      "Leave the end date empty for a qualification without expiry. Attach the diploma after saving.",
    chooseFile: "Choose file",
    acceptPdfPngJpeg: "PDF, PNG or JPEG",
    acceptPngJpeg: "PNG or JPEG",
    upTo10mb: "Up to 10 MB",
    willBeVisible:
      "This file will be visible to anyone opening the employee’s QR passport. Uploading a diploma does not verify the qualification.",
    uploadFile: "Upload file",
  },
  footer: {
    brand: "Workforce credentials",
    hrWorkspace: (company: string) => `${company} · HR workspace`,
  },
  errors: {
    unableToComplete: "Unable to complete the request.",
    pageNotFound: "Page not found",
    pageNotFoundDesc: "Choose a page from the navigation.",
  },
  modal: {
    closeDialog: "Close dialog",
  },
  login: {
    eyebrow: "PEOPLE. CAPABILITIES. CONFIDENCE.",
    headline1: "The right skills.",
    headline2: "Ready for the job.",
    subline1: "One place for your people’s qualifications.",
    subline2: "One scan to see where they stand.",
    check1: "Employee skills and supporting diplomas",
    check2: "Live, accessible QR passports",
    check3: "Your data, connected to Excel",
    footerNote: "Workforce competency management",
    welcomeBack: "Welcome back",
    signInPrompt: "Sign in to your company workspace.",
    emailAddress: "Email address",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    signingIn: "Signing in…",
    signIn: "Sign in",
    hrNote:
      "For Human Resources. Employees don’t need an account to use their skills passport.",
  },
  landing: {
    navLogin: "Log in",
    eyebrow: "DIGITAL SKILLS PASSPORTS FOR YOUR WORKFORCE",
    title1: "See every qualification.",
    title2: "One QR code at a time.",
    subtitle:
      "Skills gives HR one place to manage employee competencies, and gives every worker a live, scannable passport of their qualifications and diplomas.",
    cta: "Sign in to your workspace",
    featuresTitle: "Built for HR, open to everyone on site",
    feature1Title: "One dashboard for HR",
    feature1Desc:
      "Manage employees, competencies and qualifications, with a clear view of what's expiring soon.",
    feature2Title: "A passport in every pocket",
    feature2Desc:
      "Each employee gets a public, scannable QR passport. No account, no app to install.",
    feature3Title: "Connected to Excel",
    feature3Desc:
      "Pull live company data into Excel with a revocable, company-scoped reporting key.",
    shotOverviewAlt: "HR workspace overview dashboard",
    shotOverviewCaption: "A clear overview for HR",
    shotMatrixAlt: "Skills matrix showing employee qualifications",
    shotMatrixCaption: "Spot qualification gaps at a glance",
    shotPassportAlt: "Public employee skills passport on a phone",
    shotPassportCaption: "A live passport, scannable on any phone",
    footerNote: "Workforce competency management",
  },
  publicProfile: {
    tag: "DIGITAL SKILLS PASSPORT",
    verifiedAndValid: "Verified & valid",
    expiringSoon: "Expiring soon",
    supportingDocuments: "Supporting documents",
    sectionTitle: "Competencies & qualifications",
    records: (n: number) => `${n} records`,
    validFrom: "Valid from",
    validUntil: "Valid until",
    verification: "Verification",
    noDocument: "No supporting document uploaded",
    noneYet: "No qualifications recorded yet",
    noneYetDesc: "Contact the employer’s HR team for more information.",
    maintainedBy: (company: string, date: string) =>
      `Records maintained by ${company}. Status checked ${date} (UTC).`,
    verificationNote:
      "Verification reflects the employer’s review of evidence. Site or task authorization may require additional checks.",
  },
  label: {
    title: "Helmet label",
    subtitle: "Print at actual size, then check the QR with a phone.",
    scanNote: "Scan for skills & diplomas",
    addPhoto: "Add an employee photograph before printing the final label.",
    widthNote:
      "Label width: 105 mm. Use a durable label suitable for your equipment.",
    destination: "Destination:",
    domainNote:
      "The QR must use your public domain before labels are issued. A localhost link is only usable on this computer.",
    printLabel: "Print label",
  },
  meta: {
    title: "Skills · Workforce credentials",
    description:
      "Manage employee competencies, qualifications and digital skills passports.",
  },
};

const fr: typeof en = {
  nav: {
    workspaceSection: "ESPACE DE TRAVAIL",
    toolsSection: "OUTILS",
    overview: "Aperçu",
    employees: "Employés",
    matrix: "Matrice des compétences",
    competencies: "Compétences",
    documents: "Documents",
    passports: "Passeports QR",
    reports: "Connexion Excel",
  },
  sidebar: {
    companyWorkspace: "Espace de l’entreprise",
    tipTitle: "Chaque compétence. Un seul scan.",
    tipBody:
      "Un passeport de compétences à jour pour chaque membre de l’équipe.",
    viewPassports: "Voir les passeports",
    role: "Ressources humaines",
    signOut: "Se déconnecter",
  },
  topbar: {
    workspace: "Espace de travail",
    liveWorkspace: "Espace de travail en direct",
    toggleTheme: "Changer de thème",
    viewExpiring: "Voir les qualifications expirant bientôt",
    openNav: "Ouvrir la navigation",
    closeNav: "Fermer la navigation",
    language: "Langue",
  },
  common: {
    save: "Enregistrer les modifications",
    cancel: "Annuler",
    confirm: "Confirmer",
    dismiss: "Fermer",
    tryAgain: "Réessayer",
    backToSignIn: "Retour à la connexion",
    refreshing: "Actualisation…",
    refreshWorkspace: "Actualiser l’espace de travail",
    changesSaved: "Modifications enregistrées",
    previous: "Précédent",
    next: "Suivant",
    page: (n: number) => `Page ${n}`,
    saving: "Enregistrement…",
    workspaceUnavailable: "Espace de travail indisponible",
    openingWorkspace: "Ouverture de votre espace de travail…",
  },
  status: {
    valid: "Valide",
    expiringSoon: "Expire bientôt",
    expired: "Expirée",
    upcoming: "À venir",
    revoked: "Révoquée",
    verified: "Vérifiée",
    pendingReview: "En attente de vérification",
    pending: "En attente",
    expiring: "Expire bientôt",
    active: "Actif",
    inactive: "Inactif",
  },
  overview: {
    eyebrowProfile: "EMPLOYÉS / PROFIL",
    eyebrowWorkforce: "GESTION DES EFFECTIFS",
    eyebrowGlance: "VOTRE EFFECTIF, EN UN COUP D’ŒIL",
    employeeProfile: "Profil de l’employé",
    subtitleProfile: "Qualifications, preuves et un passeport toujours à jour.",
    subtitleEmployees: "Les personnes derrière chaque projet.",
    subtitleMatrix:
      "Visualisez les compétences et les écarts de qualification de votre équipe.",
    subtitleCompetencies:
      "Un vocabulaire commun pour les compétences de votre entreprise.",
    subtitleDocuments:
      "Les preuves derrière les qualifications de votre équipe.",
    subtitlePassports:
      "Imprimez une étiquette. Partagez un profil. Gardez les qualifications à portée de main.",
    subtitleReports:
      "Connectez Excel directement aux données en direct de votre entreprise.",
    subtitleDefault:
      "Une vue claire des compétences de votre équipe et de ce qui nécessite votre attention.",
  },
  stats: {
    activeEmployees: "Employés actifs",
    acrossSites: (n: number) => `Sur ${n} sites`,
    validQualifications: "Qualifications valides",
    verifiedWithinValidity: "Vérifiées et dans leur période de validité",
    expiring30: "Expirent sous 30 jours",
    planNextRenewal: "Planifier le prochain renouvellement",
    expiredQualifications: "Qualifications expirées",
    reviewWithTeam: "À revoir avec votre équipe",
  },
  attention: {
    needsAttention: "Nécessite une attention",
    upcomingRenewals: "Renouvellements à venir et qualifications expirées",
    viewMatrix: "Voir la matrice",
    expiryDate: "Date d’expiration",
    allCaughtUp: "Tout est à jour",
    allCaughtUpDesc:
      "Aucune qualification n’est expirée ou n’arrive à échéance sous 30 jours.",
  },
  health: {
    title: "Santé des qualifications",
    subtitle: "Dossiers des employés actifs",
    verifiedAndValid: "vérifiées et valides",
    validQualifications: "Qualifications valides",
    pendingReview: "En attente de vérification",
    expired: "Expirées",
    footnote: "La validité et la vérification sont suivies séparément.",
  },
  yourPeople: {
    title: "Vos collaborateurs",
    subtitle: "Les qualifications des employés, réunies au même endroit",
    allEmployees: "Tous les employés",
  },
  activity: {
    title: "Activité récente",
    subtitle: "Derniers changements dans cette entreprise",
    none: "Aucune activité pour le moment",
    noneDesc: "Les changements apparaîtront ici.",
  },
  banner: {
    title: "Des qualifications qui suivent votre équipe",
    desc: "Chaque employé dispose d’un passeport public en direct. Imprimez son étiquette QR pour un accès rapide sur site.",
    open: "Ouvrir les passeports QR",
  },
  table: {
    name: "Nom",
    employee: "Employé",
    employeeId: "Identifiant employé",
    qualification: "Qualification",
    department: "Service",
    departmentSite: "Service / site",
    qualifications: "Qualifications",
    status: "Statut",
    openEmployee: "Ouvrir la fiche employé",
    viewEmployee: (name: string) => `Voir ${name}`,
    validSuffix: (n: number) => `/ ${n} valides`,
  },
  employees: {
    noneFound: "Aucun employé trouvé",
    noneFoundDesc:
      "Essayez une autre recherche, ou ajoutez votre premier employé.",
    addEmployee: "Ajouter un employé",
    exportCsv: "Exporter en CSV",
    searchPlaceholder: "Rechercher un nom, un ID, un poste ou un site…",
    searchLabel: "Rechercher des employés",
    statusLabel: "Statut de l’employé",
    allStatuses: "Tous les statuts",
    showing: (from: number, to: number, total: number) =>
      `Affichage de ${from} à ${to} sur ${total}`,
    count: (n: number) => `${n} employés`,
    notFound: "Employé introuvable",
    notFoundDesc:
      "Retournez à Employés pour choisir une personne de cette entreprise.",
  },
  detail: {
    editProfile: "Modifier le profil",
    publicPassport: "Passeport public",
    qualifications: "Qualifications",
    qualificationsDesc: "Validité, vérification et documents justificatifs",
    addQualification: "Ajouter une qualification",
    validFrom: "Valide à partir du",
    validUntil: "Valide jusqu’au",
    verification: "Vérification",
    uploadDiploma: "Téléverser un diplôme",
    markVerified: "Marquer comme vérifiée",
    revoke: "Révoquer",
    verifyTitle: "Vérifier la qualification ?",
    verifyDesc: (name: string) =>
      `Confirmez que les RH ont vérifié les preuves justificatives pour ${name}.`,
    revokeTitle: "Révoquer la qualification ?",
    revokeDesc: (name: string) =>
      `${name} sera marquée révoquée sur le passeport public. Son historique et ses preuves resteront disponibles.`,
    noQualifications: "Aucune qualification enregistrée",
    noQualificationsDesc:
      "Ajoutez une compétence et ses dates de validité pour démarrer ce passeport.",
    employeePhotograph: "Photographie de l’employé",
    shownOnPassport: "Affichée sur le passeport et l’étiquette de casque.",
    addPhotoHint:
      "Ajoutez une photo pour permettre d’identifier cette personne.",
    replacePhoto: "Remplacer la photo",
    uploadPhoto: "Téléverser une photo",
    helmetLabel: "Étiquette de casque",
    printLabelHint:
      "Imprimez une étiquette avec le nom, la photo et le QR code unique de l’employé.",
    openPrintLayout: "Ouvrir la mise en page d’impression",
    replaceQr: "Remplacer le QR code",
    replaceQrTitle: "Remplacer ce QR code ?",
    replaceQrDesc:
      "L’ancien QR code cessera de fonctionner immédiatement. Vous devrez imprimer une nouvelle étiquette de casque.",
    ssnHidden:
      "Le numéro d’identifiant et les coordonnées internes ne sont pas affichés sur le passeport public.",
  },
  matrix: {
    searchLabel: "Rechercher dans la matrice des compétences",
    searchPlaceholder: "Rechercher des employés…",
    legendValid: "Valide",
    legendExpiringPending: "Expire bientôt / en attente",
    legendExpiredRevoked: "Expirée / révoquée",
    notRecorded: "— Non renseignée",
    footer:
      "Le dossier le plus récent est affiché par employé et par compétence. Ouvrez un profil pour l’historique complet.",
  },
  competencies: {
    searchLabel: "Rechercher des compétences",
    searchPlaceholder: "Rechercher des compétences…",
    count: (n: number) => `${n} compétences`,
    noDescription: "Aucune description ajoutée.",
    employeesCount: "employés",
    expiringSoonCount: "expirent bientôt",
    buildCatalogue: "Constituez votre catalogue de compétences",
    buildCatalogueDesc:
      "Ajoutez une compétence pour commencer à enregistrer les qualifications des employés.",
    newCompetency: "Nouvelle compétence",
    categorySafety: "Sécurité",
    categoryTechnical: "Technique",
    categoryEquipment: "Équipement",
    categoryOnboarding: "Intégration",
  },
  documents: {
    searchLabel: "Rechercher des documents",
    searchPlaceholder: "Rechercher des documents ou des employés…",
    uploadFromProfile: "Téléversez les diplômes depuis un profil employé",
    document: "Document",
    type: "Type",
    added: "Ajouté",
    diplomaCertificate: "Diplôme / certificat",
    open: "Ouvrir",
    noDiplomas: "Aucun diplôme téléversé pour le moment",
    noDiplomasDesc:
      "Les RH peuvent ouvrir un profil employé et joindre un diplôme à une qualification.",
  },
  passports: {
    openAccess: "Accès ouvert, toujours à jour",
    openAccessDesc:
      "Toute personne disposant du QR code peut consulter les compétences et diplômes de l’employé. Aucun compte employé requis.",
    searchLabel: "Rechercher des passeports",
    searchPlaceholder: "Trouver le passeport d’un employé…",
    viewPassport: "Voir le passeport",
    printLabel: "Imprimer l’étiquette",
  },
  reports: {
    connectWorkbook: "Connectez votre classeur",
    useExcel:
      "Utilisez Excel Power Query pour actualiser les données de l’entreprise",
    defaultKeyName: "Reporting Excel",
    step1Title: "Créer une clé de reporting",
    step1DescPre: "Votre clé donne un accès en lecture seule à",
    step1DescPost: ". Elle expire après 90 jours.",
    step2Title: "Ouvrez Excel → Données → Depuis le Web",
    step2DescPre:
      "Choisissez un jeu de données ci-dessous. Dans la boîte de dialogue d’identifiants, choisissez",
    step2DescMid: ", utilisez",
    step2DescPost:
      "comme nom d’utilisateur et votre clé de reporting comme mot de passe.",
    step3Title: "Développez les données et créez votre rapport",
    step3DescPre: "Choisissez la liste",
    step3DescMid:
      ", convertissez-la en tableau, puis développez les colonnes voulues. Actualisez la requête pour récupérer les données à jour.",
    datasetEmployees: "Employés",
    datasetQualifications: "Qualifications",
    datasetCompetencies: "Compétences",
    copyUrl: (name: string) => `Copier l’URL ${name}`,
    moreThan1000: "Plus de 1 000 enregistrements ?",
    moreThan1000Desc:
      "L’API est paginée. Utilisez le modèle Power Query fourni pour charger toutes les pages.",
    downloadTemplate: "Télécharger le modèle Power Query",
    reportingKeys: "Clés de reporting",
    privateToAccount: "Privées à votre compte",
    keyName: "Nom de la clé",
    creating: "Création…",
    createReportingKey: "Créer une clé de reporting",
    copyYourKey: "Copiez votre clé maintenant",
    shownOnce:
      "Elle ne sera affichée qu’une seule fois. Gardez-la confidentielle.",
    copyKey: "Copier la clé",
    copied: "Copiée",
    expires: (date: string) => `Expire le ${date}`,
    revokeKey: (name: string) => `Révoquer ${name}`,
    revokeKeyConfirm:
      "Révoquer cette clé de reporting ? Les classeurs connectés qui l’utilisent cesseront de s’actualiser.",
    reportingKeysNote:
      "Les clés de reporting ne peuvent pas modifier les données ni téléverser de fichiers. Elles n’accèdent qu’aux données de cette entreprise.",
  },
  dialogs: {
    editEmployee: "Modifier l’employé",
    addEmployee: "Ajouter un employé",
    addQualification: "Ajouter une qualification",
    newCompetency: "Nouvelle compétence",
    uploadDiploma: "Téléverser un diplôme",
    uploadPhoto: "Téléverser la photo de l’employé",
    fullName: "Nom complet",
    fullNamePlaceholder: "ex. Thomas Bernard",
    employeeIdSsn: "Identifiant employé",
    employeeIdSsnPlaceholder: "Unique au sein de l’entreprise",
    jobTitle: "Intitulé du poste",
    jobTitlePlaceholder: "ex. Chef de chantier",
    department: "Service",
    departmentPlaceholder: "ex. Opérations",
    site: "Site",
    sitePlaceholder: "ex. Chantier Riverside",
    email: "E-mail",
    optionalInternalOnly: "(facultatif, usage interne uniquement)",
    activeEmployeeCheckbox: "Employé actif — passeport public activé",
    employeesNoAccount:
      "Les employés ne reçoivent pas de compte. Les RH gèrent leurs informations.",
    competencyName: "Nom de la compétence",
    competencyNamePlaceholder: "ex. Travail en hauteur",
    category: "Catégorie",
    categoryPlaceholder: "ex. Sécurité",
    description: "Description",
    recordingForPre: "Enregistrement d’une qualification pour",
    recordingForPost:
      ". Les renouvellements sont ajoutés comme de nouveaux dossiers afin de préserver l’historique.",
    competency: "Compétence",
    selectCompetency: "Sélectionner une compétence",
    issuingOrg: "Organisme émetteur",
    issuingOrgPlaceholder: "Organisme de formation ou émetteur",
    optional: "(facultatif)",
    verificationPending: "En attente de vérification",
    verificationVerified: "Vérifiée par les RH",
    leaveEndDateEmpty:
      "Laissez la date de fin vide pour une qualification sans expiration. Joignez le diplôme après l’enregistrement.",
    chooseFile: "Choisir un fichier",
    acceptPdfPngJpeg: "PDF, PNG ou JPEG",
    acceptPngJpeg: "PNG ou JPEG",
    upTo10mb: "Jusqu’à 10 Mo",
    willBeVisible:
      "Ce fichier sera visible par toute personne ouvrant le passeport QR de l’employé. Téléverser un diplôme ne vérifie pas la qualification.",
    uploadFile: "Téléverser le fichier",
  },
  footer: {
    brand: "Qualifications des effectifs",
    hrWorkspace: (company: string) => `${company} · Espace RH`,
  },
  errors: {
    unableToComplete: "Impossible d’effectuer cette action.",
    pageNotFound: "Page introuvable",
    pageNotFoundDesc: "Choisissez une page dans la navigation.",
  },
  modal: {
    closeDialog: "Fermer la fenêtre",
  },
  login: {
    eyebrow: "PERSONNES. COMPÉTENCES. CONFIANCE.",
    headline1: "Les bonnes compétences.",
    headline2: "Prêtes pour le poste.",
    subline1: "Un seul endroit pour les qualifications de votre équipe.",
    subline2: "Un scan pour savoir où elles en sont.",
    check1: "Compétences des employés et diplômes justificatifs",
    check2: "Passeports QR accessibles en direct",
    check3: "Vos données, connectées à Excel",
    footerNote: "Gestion des compétences des effectifs",
    welcomeBack: "Content de vous revoir",
    signInPrompt: "Connectez-vous à l’espace de votre entreprise.",
    emailAddress: "Adresse e-mail",
    password: "Mot de passe",
    passwordPlaceholder: "Saisissez votre mot de passe",
    rememberMe: "Se souvenir de moi",
    signingIn: "Connexion…",
    signIn: "Se connecter",
    hrNote:
      "Réservé aux ressources humaines. Les employés n’ont pas besoin de compte pour utiliser leur passeport de compétences.",
  },
  landing: {
    navLogin: "Connexion",
    eyebrow: "PASSEPORTS NUMÉRIQUES DE COMPÉTENCES POUR VOTRE EFFECTIF",
    title1: "Visualisez chaque qualification.",
    title2: "Un QR code à la fois.",
    subtitle:
      "Skills donne aux RH un seul endroit pour gérer les compétences des employés, et donne à chaque travailleur un passeport en direct et scannable de ses qualifications et diplômes.",
    cta: "Se connecter à votre espace de travail",
    featuresTitle: "Conçu pour les RH, accessible à tous sur le terrain",
    feature1Title: "Un tableau de bord pour les RH",
    feature1Desc:
      "Gérez les employés, les compétences et les qualifications, avec une vue claire de ce qui expire bientôt.",
    feature2Title: "Un passeport dans chaque poche",
    feature2Desc:
      "Chaque employé reçoit un passeport QR public et scannable. Aucun compte, aucune application à installer.",
    feature3Title: "Connecté à Excel",
    feature3Desc:
      "Importez les données en direct de l’entreprise dans Excel avec une clé de reporting révocable et limitée à l’entreprise.",
    shotOverviewAlt: "Tableau de bord de l’espace de travail RH",
    shotOverviewCaption: "Une vue claire pour les RH",
    shotMatrixAlt:
      "Matrice des compétences montrant les qualifications des employés",
    shotMatrixCaption: "Repérez les écarts de qualification en un coup d’œil",
    shotPassportAlt:
      "Passeport de compétences public d’un employé sur un téléphone",
    shotPassportCaption:
      "Un passeport en direct, scannable sur n’importe quel téléphone",
    footerNote: "Gestion des compétences des effectifs",
  },
  publicProfile: {
    tag: "PASSEPORT NUMÉRIQUE DE COMPÉTENCES",
    verifiedAndValid: "Vérifiées et valides",
    expiringSoon: "Expirent bientôt",
    supportingDocuments: "Documents justificatifs",
    sectionTitle: "Compétences et qualifications",
    records: (n: number) => `${n} dossiers`,
    validFrom: "Valide à partir du",
    validUntil: "Valide jusqu’au",
    verification: "Vérification",
    noDocument: "Aucun document justificatif téléversé",
    noneYet: "Aucune qualification enregistrée pour le moment",
    noneYetDesc:
      "Contactez le service RH de l’employeur pour plus d’informations.",
    maintainedBy: (company: string, date: string) =>
      `Dossiers maintenus par ${company}. Statut vérifié le ${date} (UTC).`,
    verificationNote:
      "La vérification reflète l’examen des preuves par l’employeur. L’autorisation d’accès à un site ou à une tâche peut nécessiter des vérifications supplémentaires.",
  },
  label: {
    title: "Étiquette de casque",
    subtitle:
      "Imprimez à taille réelle, puis vérifiez le QR avec un téléphone.",
    scanNote: "Scanner pour les compétences et diplômes",
    addPhoto:
      "Ajoutez une photo de l’employé avant d’imprimer l’étiquette finale.",
    widthNote:
      "Largeur de l’étiquette : 105 mm. Utilisez une étiquette durable adaptée à votre équipement.",
    destination: "Destination :",
    domainNote:
      "Le QR doit utiliser votre domaine public avant l’émission des étiquettes. Un lien localhost n’est utilisable que sur cet ordinateur.",
    printLabel: "Imprimer l’étiquette",
  },
  meta: {
    title: "Skills · Qualifications des effectifs",
    description:
      "Gérez les compétences, qualifications et passeports numériques de vos employés.",
  },
};

export const messages = { en, fr };
export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return messages[locale] || messages[defaultLocale];
}

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fr";
}

const statusKey: Record<Validity, keyof Dictionary["status"]> = {
  Valid: "valid",
  "Expiring soon": "expiringSoon",
  Expired: "expired",
  Upcoming: "upcoming",
  Revoked: "revoked",
};
const statusToneMap: Record<
  Validity,
  "success" | "danger" | "warning" | "neutral"
> = {
  Valid: "success",
  "Expiring soon": "warning",
  Expired: "danger",
  Upcoming: "neutral",
  Revoked: "danger",
};

export function statusLabel(status: Validity, t: Dictionary) {
  return t.status[statusKey[status]];
}
export function statusTone(status: Validity) {
  return statusToneMap[status];
}
export function verificationLabel(
  verification: "PENDING" | "VERIFIED",
  t: Dictionary,
) {
  return verification === "VERIFIED"
    ? t.status.verified
    : t.status.pendingReview;
}
export function verificationTone(verification: "PENDING" | "VERIFIED") {
  return verification === "VERIFIED" ? "success" : "warning";
}
export function activeLabel(active: boolean | number, t: Dictionary) {
  return active ? t.status.active : t.status.inactive;
}
export function activeTone(active: boolean | number) {
  return active ? "success" : "danger";
}
export function matrixCellLabel(
  q: { status: Validity; verification: "PENDING" | "VERIFIED" },
  t: Dictionary,
) {
  return q.verification === "PENDING"
    ? t.status.pending
    : q.status === "Expiring soon"
      ? t.status.expiring
      : statusLabel(q.status, t);
}
