window.PistiPageI18n = {
  tr: {
    meta: {
      title: "Hesap Silme | Pişti: Online",
      description:
        "Pişti Online hesabını ve ilişkili oyun verilerini uygulama içinden kalıcı olarak silme adımları.",
    },
  },
  en: {
    meta: {
      title: "Delete Account | Pişti: Online",
      description:
        "How to permanently delete your Pişti Online account and associated game data from within the app.",
    },
    blocks: {
      hero: `<p class="eyebrow">Account and Data Deletion</p><h1>You can delete your Pişti account from within the app.</h1><p class="hero-copy">Deletion permanently removes the Pişti player profile and associated game data.</p><p class="hero-note">Last updated: July 20, 2026</p>`,
      steps: `<h2>Delete your account in the app</h2><ol><li>Open Pişti: Online and sign in to the account you want to delete.</li><li>Tap your player name or avatar on the main menu to open <strong>Profile</strong>.</li><li>Tap <strong>Delete Account</strong> at the bottom of the page.</li><li>Read the permanent-deletion warning and confirm the action.</li></ol>`,
      deleted: `<h2>Data that is deleted</h2><ul><li>Pişti player profile and display name</li><li>Session and refresh tokens</li><li>Coin balance, scores, statistics, and league progress</li><li>Matchmaking records, friendships, and active game state tied to the player</li><li>Player blocks and report relationships</li><li>Active remove-ads entitlement tied to the account</li></ul><p>The action is permanent and deleted Pişti data cannot be restored.</p>`,
      firebase: `<h2>Firebase and app installation</h2><p>Firebase Analytics and Crashlytics data are not associated with your Pişti player ID. During deletion, possible user fields in these SDKs are cleared and deletion of the current Firebase installation identifier is requested. If you continue using the app, a new installation identifier unrelated to the previous one may be created. Previously aggregated analytics and diagnostic data that cannot be linked to your Pişti account may remain subject to Firebase retention periods.</p>`,
      retained: `<h2>Records that may be retained for a limited period</h2><p>To prevent duplicate entitlements and fraud, process refunds or cancellations, and meet legal or accounting obligations, store transaction identifiers, products, and transaction-status records may be retained for the necessary period after their link to the Pişti account is removed. Security records, mandatory store notifications, and technical backups are also kept only as long as necessary, then deleted or anonymized.</p>`,
      external: `<h2>External accounts are not deleted</h2><p>Deleting your Pişti account does not delete your Apple ID or Google account. You can separately manage the app's access in the relevant Apple or Google account settings.</p>`,
      guest: `<h2>Guest accounts</h2><p>After a guest account is deleted, the former profile cannot be restored with the same installation identifier. Continuing as a guest again creates a new Pişti profile.</p>`,
      help: `<h2>Need help?</h2><p>If you cannot access the in-app deletion tool, email <a href="mailto:umitcagdas@gmail.com?subject=Pişti%20Online%20Account%20Deletion">umitcagdas@gmail.com</a>. Additional information may be requested to verify your account; never send a password or verification code.</p>`,
    },
  },
  de: {
    meta: {
      title: "Konto löschen | Pişti: Online",
      description:
        "So löschst du dein Pişti-Online-Konto und die zugehörigen Spieldaten dauerhaft in der App.",
    },
    blocks: {
      hero: `<p class="eyebrow">Konto- und Datenlöschung</p><h1>Du kannst dein Pişti-Konto direkt in der App löschen.</h1><p class="hero-copy">Die Löschung entfernt das Pişti-Spielerprofil und die zugehörigen Spieldaten dauerhaft.</p><p class="hero-note">Zuletzt aktualisiert: 20. Juli 2026</p>`,
      steps: `<h2>Konto in der App löschen</h2><ol><li>Öffne Pişti: Online und melde dich mit dem zu löschenden Konto an.</li><li>Tippe im Hauptmenü auf deinen Spielernamen oder Avatar, um das <strong>Profil</strong> zu öffnen.</li><li>Tippe unten auf <strong>Konto löschen</strong>.</li><li>Lies den Hinweis zur dauerhaften Löschung und bestätige den Vorgang.</li></ol>`,
      deleted: `<h2>Gelöschte Daten</h2><ul><li>Pişti-Spielerprofil und Anzeigename</li><li>Sitzungs- und Aktualisierungstoken</li><li>Münzen, Punktestände, Statistiken und Ligafortschritt</li><li>Spielersuche, Freundschaften und aktiver Spielstatus des Spielers</li><li>Spielerblockierungen und Meldungsbeziehungen</li><li>Aktive Werbefrei-Berechtigung des Kontos</li></ul><p>Der Vorgang ist dauerhaft; gelöschte Pişti-Daten können nicht wiederhergestellt werden.</p>`,
      firebase: `<h2>Firebase und App-Installation</h2><p>Daten aus Firebase Analytics und Crashlytics werden nicht mit deiner Pişti-Spieler-ID verknüpft. Bei der Kontolöschung werden mögliche Benutzerfelder in diesen SDKs geleert und die Löschung der aktuellen Firebase-Installations-ID angefordert. Bei weiterer Nutzung kann eine neue, unabhängige Installations-ID entstehen. Bereits aggregierte Analyse- und Diagnosedaten, die deinem Pişti-Konto nicht zugeordnet werden können, können den Firebase-Aufbewahrungsfristen unterliegen.</p>`,
      retained: `<h2>Begrenzt aufbewahrte Datensätze</h2><p>Zur Verhinderung doppelter Berechtigungen und von Betrug, zur Bearbeitung von Erstattungen oder Stornierungen sowie zur Erfüllung rechtlicher oder buchhalterischer Pflichten können Store-Transaktions-ID, Produkt und Transaktionsstatus nach Entfernung der Kontoverknüpfung für den erforderlichen Zeitraum gespeichert werden. Sicherheitsprotokolle, vorgeschriebene Store-Mitteilungen und technische Sicherungen werden ebenfalls nur so lange wie nötig aufbewahrt und anschließend gelöscht oder anonymisiert.</p>`,
      external: `<h2>Externe Konten werden nicht gelöscht</h2><p>Das Löschen deines Pişti-Kontos löscht weder deine Apple-ID noch dein Google-Konto. Den App-Zugriff kannst du separat in den jeweiligen Apple- oder Google-Kontoeinstellungen verwalten.</p>`,
      guest: `<h2>Gastkonten</h2><p>Nach dem Löschen eines Gastkontos kann das frühere Profil nicht mit derselben Installations-ID wiederhergestellt werden. Wenn du erneut als Gast fortfährst, wird ein neues Pişti-Profil erstellt.</p>`,
      help: `<h2>Brauchst du Hilfe?</h2><p>Wenn du das Löschwerkzeug in der App nicht erreichen kannst, schreibe an <a href="mailto:umitcagdas@gmail.com?subject=Pişti%20Online%20Kontolöschung">umitcagdas@gmail.com</a>. Zur Verifizierung des Kontos können weitere Angaben erforderlich sein; sende niemals Passwörter oder Bestätigungscodes.</p>`,
    },
  },
  el: {
    meta: {
      title: "Διαγραφή λογαριασμού | Pişti: Online",
      description:
        "Πώς να διαγράψεις μόνιμα τον λογαριασμό Pişti Online και τα σχετικά δεδομένα παιχνιδιού μέσα από την εφαρμογή.",
    },
    blocks: {
      hero: `<p class="eyebrow">Διαγραφή λογαριασμού και δεδομένων</p><h1>Μπορείς να διαγράψεις τον λογαριασμό Pişti μέσα από την εφαρμογή.</h1><p class="hero-copy">Η διαγραφή αφαιρεί μόνιμα το προφίλ παίκτη και τα σχετικά δεδομένα παιχνιδιού.</p><p class="hero-note">Τελευταία ενημέρωση: 20 Ιουλίου 2026</p>`,
      steps: `<h2>Διαγραφή μέσα από την εφαρμογή</h2><ol><li>Άνοιξε το Pişti: Online και συνδέσου στον λογαριασμό που θέλεις να διαγράψεις.</li><li>Πάτησε το όνομα ή το avatar σου στο κύριο μενού για να ανοίξεις το <strong>Προφίλ</strong>.</li><li>Πάτησε <strong>Διαγραφή λογαριασμού</strong> στο κάτω μέρος.</li><li>Διάβασε την προειδοποίηση μόνιμης διαγραφής και επιβεβαίωσε.</li></ol>`,
      deleted: `<h2>Δεδομένα που διαγράφονται</h2><ul><li>Προφίλ παίκτη Pişti και εμφανιζόμενο όνομα</li><li>Διακριτικά συνεδρίας και ανανέωσης</li><li>Υπόλοιπο νομισμάτων, σκορ, στατιστικά και πρόοδος λίγκας</li><li>Εγγραφές εύρεσης αγώνα, φιλίες και ενεργή κατάσταση παιχνιδιού</li><li>Αποκλεισμοί παικτών και σχέσεις αναφορών</li><li>Ενεργό δικαίωμα αφαίρεσης διαφημίσεων του λογαριασμού</li></ul><p>Η ενέργεια είναι μόνιμη και τα διαγραμμένα δεδομένα Pişti δεν επαναφέρονται.</p>`,
      firebase: `<h2>Firebase και εγκατάσταση συσκευής</h2><p>Τα δεδομένα Firebase Analytics και Crashlytics δεν συνδέονται με το αναγνωριστικό παίκτη Pişti. Κατά τη διαγραφή καθαρίζονται πιθανά πεδία χρήστη στα SDK και ζητείται η διαγραφή του τρέχοντος αναγνωριστικού εγκατάστασης Firebase. Αν συνεχίσεις να χρησιμοποιείς την εφαρμογή, μπορεί να δημιουργηθεί νέο, ανεξάρτητο αναγνωριστικό. Συγκεντρωτικά δεδομένα ανάλυσης και διάγνωσης που δεν συνδέονται με τον λογαριασμό ενδέχεται να υπόκεινται στις περιόδους διατήρησης της Firebase.</p>`,
      retained: `<h2>Αρχεία που μπορεί να διατηρηθούν για περιορισμένο διάστημα</h2><p>Για αποτροπή διπλών δικαιωμάτων και απάτης, επεξεργασία επιστροφών ή ακυρώσεων και τήρηση νομικών ή λογιστικών υποχρεώσεων, το αναγνωριστικό συναλλαγής καταστήματος, το προϊόν και η κατάσταση συναλλαγής μπορεί να διατηρηθούν για το αναγκαίο διάστημα αφού αφαιρεθεί η σύνδεση με τον λογαριασμό Pişti. Αρχεία ασφαλείας, υποχρεωτικές ειδοποιήσεις καταστήματος και τεχνικά αντίγραφα διατηρούνται μόνο όσο χρειάζεται και έπειτα διαγράφονται ή ανωνυμοποιούνται.</p>`,
      external: `<h2>Οι εξωτερικοί λογαριασμοί δεν διαγράφονται</h2><p>Η διαγραφή του λογαριασμού Pişti δεν διαγράφει το Apple ID ή τον λογαριασμό Google. Μπορείς να διαχειριστείς ξεχωριστά την πρόσβαση της εφαρμογής στις αντίστοιχες ρυθμίσεις.</p>`,
      guest: `<h2>Λογαριασμοί επισκέπτη</h2><p>Μετά τη διαγραφή λογαριασμού επισκέπτη, το προηγούμενο προφίλ δεν επαναφέρεται με το ίδιο αναγνωριστικό εγκατάστασης. Αν συνεχίσεις ξανά ως επισκέπτης, δημιουργείται νέο προφίλ Pişti.</p>`,
      help: `<h2>Χρειάζεσαι βοήθεια;</h2><p>Αν δεν έχεις πρόσβαση στο εργαλείο διαγραφής, γράψε στο <a href="mailto:umitcagdas@gmail.com?subject=Pişti%20Online%20Account%20Deletion">umitcagdas@gmail.com</a>. Μπορεί να ζητηθούν πρόσθετες πληροφορίες για επαλήθευση· μην στέλνεις κωδικούς πρόσβασης ή επαλήθευσης.</p>`,
    },
  },
  sq: {
    meta: {
      title: "Fshi llogarinë | Pişti: Online",
      description:
        "Si të fshish përgjithmonë llogarinë Pişti Online dhe të dhënat e lojës nga aplikacioni.",
    },
    blocks: {
      hero: `<p class="eyebrow">Fshirja e llogarisë dhe të dhënave</p><h1>Mund ta fshish llogarinë Pişti nga aplikacioni.</h1><p class="hero-copy">Fshirja heq përgjithmonë profilin e lojtarit dhe të dhënat përkatëse të lojës.</p><p class="hero-note">Përditësuar më: 20 korrik 2026</p>`,
      steps: `<h2>Fshirja nga aplikacioni</h2><ol><li>Hap Pişti: Online dhe hyr në llogarinë që dëshiron të fshish.</li><li>Prek emrin ose avatarin në menunë kryesore për të hapur <strong>Profilin</strong>.</li><li>Prek <strong>Fshi llogarinë</strong> në fund të faqes.</li><li>Lexo paralajmërimin për fshirjen e përhershme dhe konfirmo veprimin.</li></ol>`,
      deleted: `<h2>Të dhënat që fshihen</h2><ul><li>Profili i lojtarit Pişti dhe emri i shfaqur</li><li>Tokenët e sesionit dhe rifreskimit</li><li>Monedhat, rezultatet, statistikat dhe përparimi në ligë</li><li>Regjistrimet e ndeshjeve, miqësitë dhe gjendja aktive e lojës</li><li>Bllokimet e lojtarëve dhe lidhjet e raportimeve</li><li>E drejta aktive për heqjen e reklamave e lidhur me llogarinë</li></ul><p>Veprimi është i përhershëm dhe të dhënat e fshira Pişti nuk mund të rikthehen.</p>`,
      firebase: `<h2>Firebase dhe instalimi i pajisjes</h2><p>Të dhënat e Firebase Analytics dhe Crashlytics nuk lidhen me ID-në e lojtarit Pişti. Gjatë fshirjes pastrohen fushat e mundshme të përdoruesit në SDK dhe kërkohet fshirja e identifikuesit aktual të instalimit Firebase. Nëse vazhdon ta përdorësh aplikacionin, mund të krijohet një identifikues i ri, i palidhur me të mëparshmin. Të dhënat e grumbulluara të analizës dhe diagnostikimit që nuk lidhen me llogarinë mund t'u nënshtrohen afateve të ruajtjes së Firebase.</p>`,
      retained: `<h2>Regjistrime që mund të ruhen për një kohë të kufizuar</h2><p>Për të parandaluar të drejta të dyfishta dhe mashtrim, për të trajtuar rimbursime ose anulime dhe për të përmbushur detyrime ligjore apo kontabël, ID-ja e transaksionit të dyqanit, produkti dhe gjendja e transaksionit mund të ruhen për kohën e nevojshme pasi hiqet lidhja me llogarinë Pişti. Regjistrimet e sigurisë, njoftimet e detyrueshme të dyqanit dhe kopjet teknike ruhen vetëm sa duhet dhe më pas fshihen ose anonimizohen.</p>`,
      external: `<h2>Llogaritë e jashtme nuk fshihen</h2><p>Fshirja e llogarisë Pişti nuk fshin Apple ID-në ose llogarinë Google. Qasjen e aplikacionit mund ta menaxhosh veçmas në cilësimet përkatëse të Apple ose Google.</p>`,
      guest: `<h2>Llogaritë e vizitorëve</h2><p>Pas fshirjes së një llogarie vizitori, profili i vjetër nuk mund të rikthehet me të njëjtin identifikues instalimi. Nëse vazhdon përsëri si vizitor, krijohet një profil i ri Pişti.</p>`,
      help: `<h2>Ke nevojë për ndihmë?</h2><p>Nëse nuk mund të përdorësh mjetin e fshirjes në aplikacion, shkruaj te <a href="mailto:umitcagdas@gmail.com?subject=Pişti%20Online%20Account%20Deletion">umitcagdas@gmail.com</a>. Mund të kërkohen të dhëna shtesë për verifikim; mos dërgo fjalëkalime ose kode verifikimi.</p>`,
    },
  },
};
