(function (window, document) {
  const STORAGE_KEY = 'frauda_lang';

  const dictionaries = {
    lv: {
      'doc.title.index': 'Frauda — Ziņojumu pārbaudes rīks',
      'doc.title.dashboard': 'Frauda — Banku izlūkdatu panelis',

      'common.api.connected': 'API savienots',
      'common.data.connected': 'Dati savienoti',
      'common.theme.toggle': 'Tēma',
      'common.auth.logout': 'Izrakstīties',
      'common.lang.switch_to_en': 'Pārslēgt uz angļu valodu',
      'common.lang.switch_to_lv': 'Pārslēgt uz latviešu valodu',

      'index.nav.subtitle': 'Iekšējais pārbaudes rīks',
      'index.nav.link.dashboard': 'Datu panelis',
      'index.page.title': 'Krāpniecisko ziņojumu analīze',
      'index.page.desc': 'Iesniedziet teksta vai balss ziņojuma paraugu automatizētai krāpniecības noteikšanai. Rezultāti ietver riska novērtējumu, metadatus, transkriptu un galvenos indikatorus.',
      'index.section.flow': 'Analīzes plūsma',
      'index.flow.input': 'Ievade',
      'index.flow.preprocess': 'Priekšapstrāde',
      'index.flow.nlp': 'NLP skenēšana',
      'index.flow.pattern': 'Paraugu atpazīšana',
      'index.flow.scoring': 'Vērtēšana',
      'index.flow.result': 'Rezultāts',
      'index.section.submit': 'Iesniegt paraugu',
      'index.btn.add_text': 'Pievienot teksta ziņojumu',
      'index.btn.add_voice': 'Pievienot balss ziņojumu',
      'index.loading.default': 'Analizē ziņojumu…',
      'index.loading.text': 'Analizē teksta ziņojumu…',
      'index.loading.voice': 'Analizē balss ziņojumu…',
      'index.loading.step1': 'Saņem un priekšapstrādā ievadi',
      'index.loading.step2': 'Veic NLP tokenizāciju un entitāšu izvilkšanu',
      'index.loading.step3': 'Salīdzina ar krāpniecības paraugu bibliotēku',
      'index.loading.step4': 'Aprēķina riska novērtējumu un indikatorus',
      'index.loading.step5': 'Ģenerē noteikšanas rezultātu',
      'index.awaiting': 'Nav iesniegts neviens paraugs. Nospiediet "Pievienot teksta ziņojumu" vai "Pievienot balss ziņojumu", lai sāktu.',
      'index.result.title': 'Noteikšanas rezultāts',
      'index.score.unit': 'Riska novērtējums',
      'index.meta.type': 'Tips',
      'index.meta.duration': 'Ilgums / Garums',
      'index.meta.caller': 'Zvanītāja numurs',
      'index.meta.origin': 'Izcelsme',
      'index.meta.language': 'Valoda',
      'index.meta.analyzed': 'Analizēts',
      'index.transcript.default': 'Transkripts',
      'index.transcript.text_content': 'Ziņojuma saturs',
      'index.transcript.call_transcript': 'Zvana transkripts',
      'index.section.indicators': 'Galvenie indikatori',
      'index.legend.low': 'Visticamāk nav krāpniecība (0–35)',
      'index.legend.mid': 'Neskaidrs (36–65)',
      'index.legend.high': 'Visticamāk krāpniecība (66–100)',
      'index.btn.copy': 'Kopēt transkriptu',
      'index.copy.success': 'Nokopēts starpliktuvē',
      'index.btn.reset': 'Veikt vēl vienu pārbaudi',
      'index.data.error': 'Neizdevās ielādēt scenārijus no data/scenarios.csv. Pārbaudiet serveri un mēģiniet vēlreiz.',
      'index.no_samples.text': 'CSV datos nav pieejams neviens teksta scenārijs.',
      'index.no_samples.voice': 'CSV datos nav pieejams neviens balss scenārijs.',
      'index.case.text': 'Teksta ziņojums',
      'index.case.voice': 'Balss ziņojums',
      'index.risk.red': 'Visticamāk krāpniecība',
      'index.risk.yellow': 'Neskaidrs',
      'index.risk.green': 'Visticamāk nav krāpniecība',
      'index.type.sms': 'SMS',
      'index.type.voice_call': 'Balss zvans',
      'index.lang.lv': 'Latviešu',
      'index.lang.ru': 'Krievu',
      'index.lang.en': 'Angļu',
      'index.no_transcript': 'Nav transkripts.',
      'index.caller.scammer': 'Zvanītājs (iespējams, krāpnieks)',
      'index.caller.agent': 'Zvanītājs (aģents)',
      'index.recipient': 'Saņēmējs',
      'index.title.loading_data': 'Dati tiek ielādēti…',
      'index.copy.unknown': 'Nezināms numurs',
      'index.copy.recipient': 'Saņēmējs',
      'index.section.request': 'Pieteikuma dati',
      'index.form.full_name.label': 'Pilns vārds',
      'index.form.full_name.placeholder': 'Piemēram, Anna Bērziņa',
      'index.form.full_name.help': 'Nepieciešams identifikācijai pārskatā.',
      'index.form.email.label': 'E-pasts',
      'index.form.email.placeholder': 'anna@example.com',
      'index.form.email.help': 'Izmantojam paziņojumu simulācijai.',
      'index.form.phone.label': 'Tālrunis',
      'index.form.phone.placeholder': '+37120000000',
      'index.form.phone.help': 'Atļauti cipari un "+" prefikss.',
      'index.form.age.label': 'Vecums',
      'index.form.age.placeholder': '35',
      'index.form.age.help': 'Vecumam jābūt 18–100 robežās.',
      'index.form.channel.label': 'Vēlamais saziņas kanāls',
      'index.form.channel.placeholder': 'Izvēlieties kanālu',
      'index.form.channel.email': 'E-pasts',
      'index.form.channel.phone': 'Tālrunis',
      'index.form.channel.sms': 'SMS',
      'index.form.channel.help': 'Nepieciešams turpmākai saziņas plūsmai.',
      'index.form.context.label': 'Situācijas apraksts',
      'index.form.context.placeholder': 'Īsi aprakstiet situāciju un galveno risku.',
      'index.form.context.help': 'Vismaz 12 rakstzīmes, lai ģenerētu kvalitatīvu pārskatu.',
      'index.form.error.full_name': 'Ievadiet pilnu vārdu (vismaz 3 rakstzīmes).',
      'index.form.error.email': 'Ievadiet derīgu e-pasta adresi.',
      'index.form.error.phone': 'Ievadiet derīgu tālruņa numuru.',
      'index.form.error.age': 'Vecumam jābūt no 18 līdz 100.',
      'index.form.error.channel': 'Izvēlieties saziņas kanālu.',
      'index.form.error.context': 'Aprakstam jābūt vismaz 12 rakstzīmes garam.',
      'index.form.error.fix_fields': 'Pirms iesniegšanas izlabojiet kļūdainos laukus.',
      'index.section.report_history': 'Pārskatu vēsture',
      'index.report.filter.label': 'Statuss',
      'index.report.filter.all': 'Visi',
      'index.report.filter.in_work': 'Procesā',
      'index.report.filter.success': 'Veiksmīgs',
      'index.report.filter.fail': 'Neveiksmīgs',
      'index.report.auth.title': 'Vēsture ir aizsargāta',
      'index.report.auth.desc': 'Piesakieties, lai skatītu savus pārskatus.',
      'index.report.auth.cta': 'Pieteikties',
      'index.report.empty.title': 'Pārskatu vēl nav',
      'index.report.empty.desc': 'Iesniedziet pirmo pieprasījumu, lai izveidotu pārskatu.',
      'index.report.status.in_work': 'Procesā',
      'index.report.status.success': 'Veiksmīgs',
      'index.report.status.fail': 'Neveiksmīgs',

      'onboarding.title': 'Laipni lūdzam Frauda',
      'onboarding.desc': 'Šis rīks palīdz analizēt aizdomīgus ziņojumus, novērtēt risku un uzturēt vietējo pārskatu vēsturi.',
      'onboarding.cta': 'Sākt darbu',

      'auth.title': 'Pieteikšanās',
      'auth.default_message': 'Ievadiet testa piekļuves datus, lai turpinātu.',
      'auth.username': 'Lietotājvārds',
      'auth.password': 'Parole',
      'auth.cancel': 'Atcelt',
      'auth.submit': 'Pieteikties',
      'auth.error.required': 'Ievadiet lietotājvārdu un paroli.',
      'auth.error.invalid': 'Nepareizi piekļuves dati. Izmantojiet test / test.',
      'auth.required_for_upload': 'Lai iesniegtu pirmo pieprasījumu, vispirms piesakieties.',
      'auth.required_for_history': 'Lai skatītu pārskatu vēsturi, piesakieties.',
      'index.section.user_submission': 'Lietotāja ziņojums testēšanai',
      'index.submission.type.label': 'Ziņojuma tips',
      'index.submission.type.text': 'Teksta ziņojums',
      'index.submission.type.voice': 'Balss ziņojums (mp4)',
      'index.submission.type.help': 'Dati tiks saglabāti atsevišķā `scenarios_test` glabātuvē.',
      'index.submission.text.label': 'Ziņojuma saturs',
      'index.submission.text.placeholder': 'Ievadiet aizdomīgā teksta saturu...',
      'index.submission.voice.label': 'MP4 faila nosaukums',
      'index.submission.voice.placeholder': 'call_001.mp4',
      'index.submission.voice.help': 'Saglabājam tikai faila nosaukumu, nevis faila saturu.',
      'index.submission.save': 'Saglabāt ziņojumu',
      'index.submission.error.text': 'Teksta ziņojumam jābūt vismaz 6 rakstzīmes garam.',
      'index.submission.error.voice': 'Ievadiet derīgu .mp4 faila nosaukumu.',
      'index.submission.error.fix': 'Izlabojiet ievades laukus pirms saglabāšanas.',
      'index.submission.saved': 'Saglabāts scenarios_test: {id}',
      'index.submission.empty.title': 'Nav lietotāja ziņojumu',
      'index.submission.empty.desc': 'Pievienojiet pirmo testēšanas ziņojumu, lai pārbaudītu saglabāšanu.',

      'dashboard.nav.subtitle': 'Banku izlūkdatu panelis',
      'dashboard.nav.link.tool': 'Pārbaudes rīks',
      'dashboard.filter.label': 'Filtri',
      'dashboard.filter.date': 'Datums',
      'dashboard.filter.age.all': 'Visas vecuma grupas',
      'dashboard.filter.gender.all': 'Visi dzimumi',
      'dashboard.filter.gender.male': 'Vīrietis',
      'dashboard.filter.gender.female': 'Sieviete',
      'dashboard.filter.type.all': 'Visi krāpniecības veidi',
      'dashboard.filter.type.bank': 'Bankas uzdošanās',
      'dashboard.filter.type.gov': 'VID / valsts drauds',
      'dashboard.filter.type.otp': 'OTP iegūšana',
      'dashboard.filter.type.delivery': 'Piegādes maksa',
      'dashboard.filter.type.investment': 'Investīciju krāpniecība',
      'dashboard.filter.type.utility': 'Komunālie pakalpojumi',
      'dashboard.filter.type.phishing': 'Phishing saite',
      'dashboard.filter.type.legitimate': 'Likumīgi',
      'dashboard.filter.channel.all': 'Visi kanāli',
      'dashboard.filter.channel.voice': 'Balss zvans',
      'dashboard.filter.channel.sms': 'SMS / Teksts',
      'dashboard.filter.region.all': 'Visi reģioni',
      'dashboard.filter.region.voip': 'LV (VoIP)',
      'dashboard.filter.region.mobile': 'LV (Mobilais)',
      'dashboard.filter.region.fixed': 'LV (Fiksētais)',
      'dashboard.filter.region.shortcode': 'LV (Īssavilkums)',
      'dashboard.filter.region.lt_mobile': 'LT (Mobilais)',
      'dashboard.btn.refresh': 'Atjaunināt',

      'dashboard.kpi.total_suspicious': 'Aizdomīgie gadījumi kopā',
      'dashboard.kpi.trend.total': '↑ +12% vs vakar',
      'dashboard.kpi.high_risk': 'Augsta riska gadījumi',
      'dashboard.kpi.trend.high_risk': '↑ +9% vs vakar',
      'dashboard.kpi.active_campaigns': 'Aktīvās kampaņas',
      'dashboard.kpi.trend.campaigns': '↑ 2 jaunas šodien',
      'dashboard.kpi.age_risk': 'Visvairāk apdraudētā vecuma gr.',
      'dashboard.kpi.activity_peak': 'Aktivitātes maksimums',
      'dashboard.kpi.avg_risk': 'Vidējais riska novērtējums',
      'dashboard.kpi.trend.avg_risk': '↓ Augsta ticamība',
      'dashboard.kpi.age_sub': '{count} no {total} scenārijiem ({pct}%)',
      'dashboard.kpi.peak_window': 'Logs {from}–{to}',

      'dashboard.section.pipeline.title': 'Datu iegūšanas konveijers',
      'dashboard.section.pipeline.meta': 'Cikla intervāls: 60s · Latvija',
      'dashboard.pipeline.app_flow': 'Lietotnes datu plūsma',
      'dashboard.pipeline.cycle': 'Katru 60s ciklu',
      'dashboard.pipeline.engine': 'Frauda dzinējs',
      'dashboard.pipeline.receive_split': 'Saņem un sadala',
      'dashboard.pipeline.meta_flow': 'Metadatu plūsma',
      'dashboard.pipeline.meta_detail': 'Zvanītāja ID · izcelsme · ilgums · kanāls · laiks',
      'dashboard.pipeline.content_flow': 'Satura plūsma',
      'dashboard.pipeline.content_detail': 'Frāzes · tēmas · nolūks · riska marķieri',
      'dashboard.pipeline.intel_engine': 'Izlūkdatu dzinējs',
      'dashboard.pipeline.intel_detail': 'Paraugu atpazīšana · vērtēšana',
      'dashboard.pipeline.panel': 'Panelis',
      'dashboard.pipeline.panel_detail': 'Ieskati · brīdinājumi · tendences',

      'dashboard.chart.hourly.title': 'C. Aktivitāte pēc stundas',
      'dashboard.chart.hourly.meta': 'Scenāriji · visi kanāli',
      'dashboard.chart.strategies.title': 'D. Populārākās krāpniecības shēmas',
      'dashboard.chart.strategies.meta': 'Pašreizējais periods · ranžēts',
      'dashboard.chart.age.title': 'A. Krāpniecības shēmas pēc vecuma grupas',
      'dashboard.chart.age.meta': 'Top 4 kategorijas',
      'dashboard.chart.gender.title': 'B. Krāpniecības kategorijas pēc dzimuma',
      'dashboard.chart.gender.meta': 'Proporcionāls sadalījums',
      'dashboard.chart.keywords.title': 'E. Atslēgvārdu / frāžu izlūkdati',
      'dashboard.chart.keywords.meta': 'Izvilkts no zvanu satura · riska svērts',
      'dashboard.legend.risk.high': 'Augsts risks',
      'dashboard.legend.risk.mid': 'Vidējs',
      'dashboard.legend.risk.low': 'Zems',
      'dashboard.chart.metadata.title': 'F. Metadatu ieskati',
      'dashboard.chart.metadata.meta': 'Zvanītāja izcelsme · kanāls · nedēļas diena',
      'dashboard.section.combined.title': 'Kombinētie izlūkdati — metadati × satura signāli',
      'dashboard.section.combined.meta': 'Automātiski ģenerēti operatīvie ieskati',
      'dashboard.section.alerts.title': 'Aktīvie brīdinājumi un novērošanas saraksts',
      'dashboard.section.table.title': 'Apkopotie krāpniecības paraugu ieraksti',
      'dashboard.section.table.meta': 'Visi kanāli · pašreizējais periods',

      'dashboard.table.type': 'Krāpniecības veids',
      'dashboard.table.segment': 'Mērķa segments',
      'dashboard.table.phrases': 'Galvenās frāzes',
      'dashboard.table.peak': 'Aktivitātes maksimums',
      'dashboard.table.risk': 'Riska līmenis',
      'dashboard.table.delta': 'Nedēļas Δ',
      'dashboard.table.status': 'Statuss',
      'dashboard.table.no_data': 'Nav datu izvēlētajiem filtriem.',

      'dashboard.timestamp.last_sync': 'Pēdējā sinhronizācija',
      'dashboard.timestamp.as_of': 'Uz',
      'dashboard.hour.tooltip': '{hour}:00 — {count} gadījumi',
      'dashboard.hour.peak': 'Maksimums',
      'dashboard.age.tooltip': '{age} · {fraud}: {count} gadījumi',
      'dashboard.gender.male': 'Vīrietis',
      'dashboard.gender.female': 'Sieviete',
      'dashboard.gender.tooltip': '{gender} · {fraud}: {pct}%',
      'dashboard.keyword.tooltip': 'Biežums: {count} gadījumi šajā periodā',
      'dashboard.meta.origin': 'Zvanītāja izcelsme',
      'dashboard.meta.channel_split': 'Kanālu sadalījums',
      'dashboard.meta.language': 'Valoda',
      'dashboard.meta.weekday_activity': 'Aktivitāte pa nedēļas dienām',
      'dashboard.channel.voice': 'Balss zvans',
      'dashboard.channel.sms': 'SMS',
      'dashboard.weekday.mon': 'P',
      'dashboard.weekday.tue': 'O',
      'dashboard.weekday.wed': 'T',
      'dashboard.weekday.thu': 'C',
      'dashboard.weekday.fri': 'Pk',
      'dashboard.weekday.sat': 'S',
      'dashboard.weekday.sun': 'Sv',
      'dashboard.alert.level.crit': 'Kritisks',
      'dashboard.alert.level.warn': 'Brīdinājums',
      'dashboard.alert.level.info': 'Informācija',
      'dashboard.no_data': 'Nav datu izvēlētajiem filtriem',
      'dashboard.risk.high': 'Augsts',
      'dashboard.risk.mid': 'Vidējs',
      'dashboard.risk.low': 'Zems',
      'dashboard.status.active': 'Aktīvs',
      'dashboard.status.decreasing': 'Samazinās',
      'dashboard.status.increasing': 'Pieaug',
      'dashboard.status.stable': 'Stabils',
      'dashboard.dynamic.top_strategy.title': 'Dominējošā shēma',
      'dashboard.dynamic.top_strategy.text': '{label} veido {pct}% no atbilstošajiem gadījumiem ({count} gadījumi).',
      'dashboard.dynamic.top_origin.title': 'Dominējošā izcelsme',
      'dashboard.dynamic.top_origin.text': '{origin} avoti veido {pct}% no gadījumiem.',
      'dashboard.dynamic.high_risk.title': 'Augsta riska īpatsvars',
      'dashboard.dynamic.high_risk.text': '{pct}% gadījumu šajā skatā ir klasificēti kā augsta riska.',
      'dashboard.dynamic.top_age.title': 'Mērķētākā vecuma grupa',
      'dashboard.dynamic.top_age.text': 'Vecuma grupa {age} veido lielāko daļu ({pct}%) no gadījumiem.',
      'dashboard.dynamic.peak_hour.title': 'Aktivitātes maksimums',
      'dashboard.dynamic.peak_hour.text': 'Lielākais apjoms ir {hour}:00 ar {count} gadījumiem.',
      'dashboard.dynamic.language_mix.title': 'Valodu sadalījums',
      'dashboard.dynamic.language_mix.text': 'Top valoda: {lang} ({pct}% no gadījumiem).',
      'dashboard.dynamic.alert.high_risk': 'Augsta riska gadījumi: {high}/{total} ({pct}%).',
      'dashboard.dynamic.alert.top_strategy': 'Aktīvākā shēma: {label} ({count} gadījumi).',
      'dashboard.dynamic.alert.channel_mix': 'Kanālu sadalījums: balss {voice}% · SMS {sms}%.',

      'dashboard.intel.1.title': 'VID uzdošanās — maksimums rīta stundās',
      'dashboard.intel.1.text': 'Personas vecumā 65+ uzrāda paaugstinātu iedarbību ar valdības uzdošanos saistītiem zvaniem laikā no 09:00 līdz 12:00. 87% gadījumu izcelsme ir VoIP.',
      'dashboard.intel.2.title': 'OTP frāžu pieaugums īsos zvanos',
      'dashboard.intel.2.text': 'OTP saistītas frāzes pieaugušas par 13% šonedēļ. Koncentrējas zvanos īsākos par 2 minūtēm. Galvenokārt mērķē uz 25–34 demogrāfisko grupu.',
      'dashboard.intel.3.title': 'Bankas uzdošanās + steidzamības korelācija',
      'dashboard.intel.3.text': 'Bankas uzdošanās kampaņas uzrāda 89% ko-biedrošanu ar steidzamības valodu un VoIP izcelsmes numuriem. Vidējais zvana ilgums: 3m 44s.',
      'dashboard.intel.4.title': 'Piegādes SMS krāpniecība — pusdienas stundas',
      'dashboard.intel.4.text': 'Piegādes maksas krāpniecība grupējas 11:30–13:30 logā, SMS kanālā. Galvenokārt mērķē uz 35–49 vecuma grupu.',
      'dashboard.intel.5.title': 'Atkārtota mērķēšanas modelis identificēts',
      'dashboard.intel.5.text': '118 saņēmēji saņēmuši 3+ kontaktu mēģinājumus 48 stundu laikā. Atzvani no dažādiem VoIP numuriem liecina par koordinētām kampaņām.',
      'dashboard.intel.6.title': 'Jauna frāžu kopa — "drošā konta pārskaitījums"',
      'dashboard.intel.6.text': 'Jaunā frāžu kopa "pagaidu drošais konts" konstatēta 76 zvanos šonedēļ. Šis modelis nav bijis iepriekšējā mēneša bāzlīnijā.',

      'dashboard.alert.1.text': '<strong>VID uzdošanās + aizturēšanas valoda pieaugusi par 19%</strong> salīdzinājumā ar 7 dienu vidējo rādītāju. 78 gadījumi pēdējo 4 stundu laikā.',
      'dashboard.alert.2.text': '<strong>Jauna frāžu kopa konstatēta:</strong> "pagaidu drošais konts pārskaitīšanai" — 76 gadījumi kopš 08:00. Nav bijis bāzlīnijā.',
      'dashboard.alert.3.text': '<strong>VoIP izcelsmes konta verifikācijas zvanu pieaugums</strong> kopš vakardienas 14:00. Par 58% virs stundas dienas vidējā rādītāja.',
      'dashboard.alert.4.text': '<strong>Investīciju krāpniecības zvani pieaugusi par 27%</strong> nedēļā. Mērķē uz 25–34 vīriešu segmentu. Zvani vidēji 6m 52s.',
      'dashboard.alert.5.text': '<strong>Piegādes krāpniecības apjoms samazinās.</strong> Par 9% mazāk nedēļā. Paraugu atpazīšanas ticamība stabila virs 91%.',
      'dashboard.alert.6.text': '<strong>Jauns VoIP numuru bloks identificēts:</strong> +371 6738xx diapazons — 9 atzīmēti numuri pievienoti novērošanas sarakstam.'
    },

    en: {
      'doc.title.index': 'Frauda — Message Verification Tool',
      'doc.title.dashboard': 'Frauda — Banking Intelligence Dashboard',

      'common.api.connected': 'API connected',
      'common.data.connected': 'Data connected',
      'common.theme.toggle': 'Theme',
      'common.auth.logout': 'Logout',
      'common.lang.switch_to_en': 'Switch to English',
      'common.lang.switch_to_lv': 'Switch to Latvian',

      'index.nav.subtitle': 'Internal verification tool',
      'index.nav.link.dashboard': 'Data dashboard',
      'index.page.title': 'Fraud message analysis',
      'index.page.desc': 'Submit a text or voice message sample for automated fraud detection. Results include risk score, metadata, transcript, and key indicators.',
      'index.section.flow': 'Analysis flow',
      'index.flow.input': 'Input',
      'index.flow.preprocess': 'Pre-processing',
      'index.flow.nlp': 'NLP scan',
      'index.flow.pattern': 'Pattern recognition',
      'index.flow.scoring': 'Scoring',
      'index.flow.result': 'Result',
      'index.section.submit': 'Submit sample',
      'index.btn.add_text': 'Add text message',
      'index.btn.add_voice': 'Add voice message',
      'index.loading.default': 'Analyzing message…',
      'index.loading.text': 'Analyzing text message…',
      'index.loading.voice': 'Analyzing voice message…',
      'index.loading.step1': 'Receive and pre-process input',
      'index.loading.step2': 'Run NLP tokenization and entity extraction',
      'index.loading.step3': 'Compare against fraud pattern library',
      'index.loading.step4': 'Calculate risk score and indicators',
      'index.loading.step5': 'Generate detection result',
      'index.awaiting': 'No sample submitted yet. Press "Add text message" or "Add voice message" to start.',
      'index.result.title': 'Detection result',
      'index.score.unit': 'Risk score',
      'index.meta.type': 'Type',
      'index.meta.duration': 'Duration / Length',
      'index.meta.caller': 'Caller number',
      'index.meta.origin': 'Origin',
      'index.meta.language': 'Language',
      'index.meta.analyzed': 'Analyzed',
      'index.transcript.default': 'Transcript',
      'index.transcript.text_content': 'Message content',
      'index.transcript.call_transcript': 'Call transcript',
      'index.section.indicators': 'Key indicators',
      'index.legend.low': 'Likely not fraud (0–35)',
      'index.legend.mid': 'Uncertain (36–65)',
      'index.legend.high': 'Likely fraud (66–100)',
      'index.btn.copy': 'Copy transcript',
      'index.copy.success': 'Copied to clipboard',
      'index.btn.reset': 'Run another check',
      'index.data.error': 'Failed to load scenarios from data/scenarios.csv. Check server setup and try again.',
      'index.no_samples.text': 'No text scenarios are available in the CSV data.',
      'index.no_samples.voice': 'No voice scenarios are available in the CSV data.',
      'index.case.text': 'Text message',
      'index.case.voice': 'Voice message',
      'index.risk.red': 'Likely fraud',
      'index.risk.yellow': 'Uncertain',
      'index.risk.green': 'Likely not fraud',
      'index.type.sms': 'SMS',
      'index.type.voice_call': 'Voice call',
      'index.lang.lv': 'Latvian',
      'index.lang.ru': 'Russian',
      'index.lang.en': 'English',
      'index.no_transcript': 'No transcript.',
      'index.caller.scammer': 'Caller (possible scammer)',
      'index.caller.agent': 'Caller (agent)',
      'index.recipient': 'Recipient',
      'index.title.loading_data': 'Data is loading…',
      'index.copy.unknown': 'Unknown number',
      'index.copy.recipient': 'Recipient',
      'index.section.request': 'Request details',
      'index.form.full_name.label': 'Full name',
      'index.form.full_name.placeholder': 'For example, Anna Berzina',
      'index.form.full_name.help': 'Used for report identification.',
      'index.form.email.label': 'Email',
      'index.form.email.placeholder': 'anna@example.com',
      'index.form.email.help': 'Used for notification simulation.',
      'index.form.phone.label': 'Phone',
      'index.form.phone.placeholder': '+37120000000',
      'index.form.phone.help': 'Digits and "+" prefix are allowed.',
      'index.form.age.label': 'Age',
      'index.form.age.placeholder': '35',
      'index.form.age.help': 'Age must be between 18 and 100.',
      'index.form.channel.label': 'Preferred contact channel',
      'index.form.channel.placeholder': 'Select channel',
      'index.form.channel.email': 'Email',
      'index.form.channel.phone': 'Phone',
      'index.form.channel.sms': 'SMS',
      'index.form.channel.help': 'Required for follow-up flow.',
      'index.form.context.label': 'Situation details',
      'index.form.context.placeholder': 'Briefly describe the situation and primary risk.',
      'index.form.context.help': 'At least 12 characters for meaningful report generation.',
      'index.form.error.full_name': 'Enter full name (at least 3 characters).',
      'index.form.error.email': 'Enter a valid email address.',
      'index.form.error.phone': 'Enter a valid phone number.',
      'index.form.error.age': 'Age must be between 18 and 100.',
      'index.form.error.channel': 'Select a contact channel.',
      'index.form.error.context': 'Description must be at least 12 characters.',
      'index.form.error.fix_fields': 'Please fix invalid fields before submitting.',
      'index.section.report_history': 'Report history',
      'index.report.filter.label': 'Status',
      'index.report.filter.all': 'All',
      'index.report.filter.in_work': 'In work',
      'index.report.filter.success': 'Success',
      'index.report.filter.fail': 'Fail',
      'index.report.auth.title': 'History is protected',
      'index.report.auth.desc': 'Sign in to view your reports.',
      'index.report.auth.cta': 'Sign in',
      'index.report.empty.title': 'No reports yet',
      'index.report.empty.desc': 'Submit your first request to create a report.',
      'index.report.status.in_work': 'In work',
      'index.report.status.success': 'Success',
      'index.report.status.fail': 'Fail',

      'onboarding.title': 'Welcome to Frauda',
      'onboarding.desc': 'This tool helps you analyze suspicious messages, assess risk, and keep local report history.',
      'onboarding.cta': 'Get started',

      'auth.title': 'Sign in',
      'auth.default_message': 'Enter test credentials to continue.',
      'auth.username': 'Username',
      'auth.password': 'Password',
      'auth.cancel': 'Cancel',
      'auth.submit': 'Sign in',
      'auth.error.required': 'Enter username and password.',
      'auth.error.invalid': 'Invalid credentials. Use test / test.',
      'auth.required_for_upload': 'Sign in before your first upload.',
      'auth.required_for_history': 'Sign in to view report history.',
      'index.section.user_submission': 'User scam submission (testing)',
      'index.submission.type.label': 'Message type',
      'index.submission.type.text': 'Text message',
      'index.submission.type.voice': 'Voice message (mp4)',
      'index.submission.type.help': 'Data is stored in a separate `scenarios_test` store.',
      'index.submission.text.label': 'Message content',
      'index.submission.text.placeholder': 'Enter suspicious text content...',
      'index.submission.voice.label': 'MP4 file name',
      'index.submission.voice.placeholder': 'call_001.mp4',
      'index.submission.voice.help': 'Only file name is stored; file content is not processed yet.',
      'index.submission.save': 'Save message',
      'index.submission.error.text': 'Text message must be at least 6 characters.',
      'index.submission.error.voice': 'Enter a valid .mp4 file name.',
      'index.submission.error.fix': 'Fix invalid inputs before saving.',
      'index.submission.saved': 'Saved to scenarios_test: {id}',
      'index.submission.empty.title': 'No user submissions yet',
      'index.submission.empty.desc': 'Add your first test submission to validate storage.',

      'dashboard.nav.subtitle': 'Banking intelligence dashboard',
      'dashboard.nav.link.tool': 'Verification tool',
      'dashboard.filter.label': 'Filters',
      'dashboard.filter.date': 'Date',
      'dashboard.filter.age.all': 'All age groups',
      'dashboard.filter.gender.all': 'All genders',
      'dashboard.filter.gender.male': 'Male',
      'dashboard.filter.gender.female': 'Female',
      'dashboard.filter.type.all': 'All fraud types',
      'dashboard.filter.type.bank': 'Bank impersonation',
      'dashboard.filter.type.gov': 'Government impersonation',
      'dashboard.filter.type.otp': 'OTP theft',
      'dashboard.filter.type.delivery': 'Delivery fee fraud',
      'dashboard.filter.type.investment': 'Investment fraud',
      'dashboard.filter.type.utility': 'Utility fraud',
      'dashboard.filter.type.phishing': 'Phishing link',
      'dashboard.filter.type.legitimate': 'Legitimate',
      'dashboard.filter.channel.all': 'All channels',
      'dashboard.filter.channel.voice': 'Voice call',
      'dashboard.filter.channel.sms': 'SMS / Text',
      'dashboard.filter.region.all': 'All regions',
      'dashboard.filter.region.voip': 'LV (VoIP)',
      'dashboard.filter.region.mobile': 'LV (Mobile)',
      'dashboard.filter.region.fixed': 'LV (Fixed)',
      'dashboard.filter.region.shortcode': 'LV (Shortcode)',
      'dashboard.filter.region.lt_mobile': 'LT (Mobile)',
      'dashboard.btn.refresh': 'Refresh',

      'dashboard.kpi.total_suspicious': 'Total suspicious cases',
      'dashboard.kpi.trend.total': '↑ +12% vs yesterday',
      'dashboard.kpi.high_risk': 'High-risk cases',
      'dashboard.kpi.trend.high_risk': '↑ +9% vs yesterday',
      'dashboard.kpi.active_campaigns': 'Active campaigns',
      'dashboard.kpi.trend.campaigns': '↑ 2 new today',
      'dashboard.kpi.age_risk': 'Most targeted age group',
      'dashboard.kpi.activity_peak': 'Activity peak',
      'dashboard.kpi.avg_risk': 'Average risk score',
      'dashboard.kpi.trend.avg_risk': '↓ High confidence',
      'dashboard.kpi.age_sub': '{count} of {total} scenarios ({pct}%)',
      'dashboard.kpi.peak_window': 'Window {from}–{to}',

      'dashboard.section.pipeline.title': 'Data ingestion pipeline',
      'dashboard.section.pipeline.meta': 'Cycle interval: 60s · Latvia',
      'dashboard.pipeline.app_flow': 'Application data flow',
      'dashboard.pipeline.cycle': 'Every 60s cycle',
      'dashboard.pipeline.engine': 'Frauda engine',
      'dashboard.pipeline.receive_split': 'Receive and split',
      'dashboard.pipeline.meta_flow': 'Metadata flow',
      'dashboard.pipeline.meta_detail': 'Caller ID · origin · duration · channel · time',
      'dashboard.pipeline.content_flow': 'Content flow',
      'dashboard.pipeline.content_detail': 'Phrases · themes · intent · risk markers',
      'dashboard.pipeline.intel_engine': 'Intelligence engine',
      'dashboard.pipeline.intel_detail': 'Pattern recognition · scoring',
      'dashboard.pipeline.panel': 'Dashboard',
      'dashboard.pipeline.panel_detail': 'Insights · alerts · trends',

      'dashboard.chart.hourly.title': 'C. Activity by hour',
      'dashboard.chart.hourly.meta': 'Scenarios · all channels',
      'dashboard.chart.strategies.title': 'D. Top fraud schemes',
      'dashboard.chart.strategies.meta': 'Current period · ranked',
      'dashboard.chart.age.title': 'A. Fraud schemes by age group',
      'dashboard.chart.age.meta': 'Top 4 categories',
      'dashboard.chart.gender.title': 'B. Fraud categories by gender',
      'dashboard.chart.gender.meta': 'Proportional split',
      'dashboard.chart.keywords.title': 'E. Keyword / phrase intelligence',
      'dashboard.chart.keywords.meta': 'Extracted from call content · risk-weighted',
      'dashboard.legend.risk.high': 'High risk',
      'dashboard.legend.risk.mid': 'Medium',
      'dashboard.legend.risk.low': 'Low',
      'dashboard.chart.metadata.title': 'F. Metadata insights',
      'dashboard.chart.metadata.meta': 'Caller origin · channel · day of week',
      'dashboard.section.combined.title': 'Combined intelligence — metadata × content signals',
      'dashboard.section.combined.meta': 'Automatically generated operational insights',
      'dashboard.section.alerts.title': 'Active alerts and watchlist',
      'dashboard.section.table.title': 'Aggregated fraud pattern records',
      'dashboard.section.table.meta': 'All channels · current period',

      'dashboard.table.type': 'Fraud type',
      'dashboard.table.segment': 'Target segment',
      'dashboard.table.phrases': 'Key phrases',
      'dashboard.table.peak': 'Activity peak',
      'dashboard.table.risk': 'Risk level',
      'dashboard.table.delta': 'Weekly Δ',
      'dashboard.table.status': 'Status',
      'dashboard.table.no_data': 'No data for selected filters.',

      'dashboard.timestamp.last_sync': 'Last sync',
      'dashboard.timestamp.as_of': 'As of',
      'dashboard.hour.tooltip': '{hour}:00 — {count} cases',
      'dashboard.hour.peak': 'Peak',
      'dashboard.age.tooltip': '{age} · {fraud}: {count} cases',
      'dashboard.gender.male': 'Male',
      'dashboard.gender.female': 'Female',
      'dashboard.gender.tooltip': '{gender} · {fraud}: {pct}%',
      'dashboard.keyword.tooltip': 'Frequency: {count} cases in this period',
      'dashboard.meta.origin': 'Caller origin',
      'dashboard.meta.channel_split': 'Channel split',
      'dashboard.meta.language': 'Language',
      'dashboard.meta.weekday_activity': 'Activity by weekday',
      'dashboard.channel.voice': 'Voice call',
      'dashboard.channel.sms': 'SMS',
      'dashboard.weekday.mon': 'M',
      'dashboard.weekday.tue': 'T',
      'dashboard.weekday.wed': 'W',
      'dashboard.weekday.thu': 'Th',
      'dashboard.weekday.fri': 'F',
      'dashboard.weekday.sat': 'Sa',
      'dashboard.weekday.sun': 'Su',
      'dashboard.alert.level.crit': 'Critical',
      'dashboard.alert.level.warn': 'Warning',
      'dashboard.alert.level.info': 'Info',
      'dashboard.no_data': 'No data for selected filters',
      'dashboard.risk.high': 'High',
      'dashboard.risk.mid': 'Medium',
      'dashboard.risk.low': 'Low',
      'dashboard.status.active': 'Active',
      'dashboard.status.decreasing': 'Decreasing',
      'dashboard.status.increasing': 'Increasing',
      'dashboard.status.stable': 'Stable',
      'dashboard.dynamic.top_strategy.title': 'Top scheme',
      'dashboard.dynamic.top_strategy.text': '{label} represents {pct}% of matching cases ({count} cases).',
      'dashboard.dynamic.top_origin.title': 'Top origin',
      'dashboard.dynamic.top_origin.text': '{origin} sources represent {pct}% of cases.',
      'dashboard.dynamic.high_risk.title': 'High-risk share',
      'dashboard.dynamic.high_risk.text': '{pct}% of cases in this view are classified as high risk.',
      'dashboard.dynamic.top_age.title': 'Most targeted age group',
      'dashboard.dynamic.top_age.text': 'Age group {age} has the largest share ({pct}%) of cases.',
      'dashboard.dynamic.peak_hour.title': 'Peak activity',
      'dashboard.dynamic.peak_hour.text': 'The highest volume is at {hour}:00 with {count} cases.',
      'dashboard.dynamic.language_mix.title': 'Language split',
      'dashboard.dynamic.language_mix.text': 'Top language: {lang} ({pct}% of cases).',
      'dashboard.dynamic.alert.high_risk': 'High-risk cases: {high}/{total} ({pct}%).',
      'dashboard.dynamic.alert.top_strategy': 'Most active scheme: {label} ({count} cases).',
      'dashboard.dynamic.alert.channel_mix': 'Channel split: voice {voice}% · SMS {sms}%.',

      'dashboard.intel.1.title': 'Government impersonation — morning peak',
      'dashboard.intel.1.text': 'Individuals aged 65+ show elevated exposure to government impersonation calls from 09:00 to 12:00. 87% of cases originate from VoIP.',
      'dashboard.intel.2.title': 'OTP phrase growth in short calls',
      'dashboard.intel.2.text': 'OTP-related phrases increased by 13% this week. Concentrated in calls under 2 minutes. Mainly targets the 25–34 demographic.',
      'dashboard.intel.3.title': 'Bank impersonation + urgency correlation',
      'dashboard.intel.3.text': 'Bank impersonation campaigns show 89% co-occurrence with urgency language and VoIP-origin numbers. Average call duration: 3m 44s.',
      'dashboard.intel.4.title': 'Delivery SMS fraud — lunchtime window',
      'dashboard.intel.4.text': 'Delivery fee fraud clusters in the 11:30–13:30 window on SMS. Primarily targets the 35–49 age group.',
      'dashboard.intel.5.title': 'Repeat targeting pattern identified',
      'dashboard.intel.5.text': '118 recipients received 3+ contact attempts within 48 hours. Callbacks from different VoIP numbers indicate coordinated campaigns.',
      'dashboard.intel.6.title': 'New phrase cluster — "safe account transfer"',
      'dashboard.intel.6.text': 'The new phrase cluster "temporary safe account" was detected in 76 calls this week. This pattern was absent from last month’s baseline.',

      'dashboard.alert.1.text': '<strong>Government impersonation + detention language up 19%</strong> vs 7-day average. 78 cases in the last 4 hours.',
      'dashboard.alert.2.text': '<strong>New phrase cluster detected:</strong> "temporary safe account for transfer" — 76 cases since 08:00. Not present in baseline.',
      'dashboard.alert.3.text': '<strong>VoIP-origin account verification calls increased</strong> since yesterday 14:00. 58% above intraday average.',
      'dashboard.alert.4.text': '<strong>Investment scam calls increased by 27%</strong> week-over-week. Targets males 25–34. Average call length 6m 52s.',
      'dashboard.alert.5.text': '<strong>Delivery scam volume is decreasing.</strong> 9% fewer week-over-week. Pattern recognition confidence remains above 91%.',
      'dashboard.alert.6.text': '<strong>New VoIP number block identified:</strong> +371 6738xx range — 9 flagged numbers added to watchlist.'
    }
  };

  let currentLang = 'lv';

  function normalizeLanguage(lang) {
    return lang === 'en' ? 'en' : 'lv';
  }

  function format(template, vars) {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      if (Object.prototype.hasOwnProperty.call(vars, key)) {
        return vars[key];
      }
      return `{${key}}`;
    });
  }

  function t(key, vars) {
    const active = dictionaries[currentLang] || dictionaries.lv;
    const base = dictionaries.lv;
    const value = active[key] || base[key] || key;
    return format(value, vars);
  }

  function applyTranslations(root = document) {
    const scope = root || document;
    const queryRoot = scope.querySelectorAll ? scope : document;

    queryRoot.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });

    queryRoot.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });

    queryRoot.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', t(key));
    });

    document.documentElement.lang = currentLang;

    const path = (window.location.pathname || '').toLowerCase();
    const titleKey = path.endsWith('dashboard.html') ? 'doc.title.dashboard' : 'doc.title.index';
    document.title = t(titleKey);

    const btn = document.getElementById('btnLang');
    if (btn) {
      const targetIsEnglish = currentLang === 'lv';
      btn.textContent = targetIsEnglish ? 'EN' : 'LV';
      btn.classList.toggle('is-target-en', targetIsEnglish);
      btn.classList.toggle('is-target-lv', !targetIsEnglish);
      const titleKey = targetIsEnglish ? 'common.lang.switch_to_en' : 'common.lang.switch_to_lv';
      const title = t(titleKey);
      btn.setAttribute('title', title);
      btn.setAttribute('aria-label', title);
    }
  }

  function getLanguage() {
    return currentLang;
  }

  function setLanguage(lang) {
    currentLang = normalizeLanguage(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, currentLang);
    } catch (err) {
      console.warn('Could not persist language preference:', err);
    }

    applyTranslations(document);

    window.dispatchEvent(new CustomEvent('frauda:lang-changed', {
      detail: { lang: currentLang }
    }));

    return currentLang;
  }

  function toggleLanguage() {
    return setLanguage(currentLang === 'lv' ? 'en' : 'lv');
  }

  function initLanguage() {
    let stored = 'lv';
    try {
      stored = window.localStorage.getItem(STORAGE_KEY) || 'lv';
    } catch (err) {
      console.warn('Could not read language preference:', err);
      stored = 'lv';
    }
    currentLang = normalizeLanguage(stored);
    applyTranslations(document);
  }

  window.FraudaI18n = {
    t,
    setLanguage,
    getLanguage,
    toggleLanguage,
    applyTranslations,
    dictionaries,
  };

  window.toggleLang = function () {
    window.FraudaI18n.toggleLanguage();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage, { once: true });
  } else {
    initLanguage();
  }
})(window, document);
