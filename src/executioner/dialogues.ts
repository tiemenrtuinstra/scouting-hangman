import type { ExecutionerMood, DialogueMoment } from './moods.js';

type DialogueMap = Record<ExecutionerMood, Record<DialogueMoment, string[]>>;

export const DIALOGUES: DialogueMap = {
  neutraal: {
    game_start: [
      'Welkom bij de galg, scout. Laten we kijken wat je waard bent.',
      'Ah, een nieuwe uitdager. Ik hoop dat je beter bent dan de vorige...',
      'De galg staat klaar. Jij ook?',
      'Hmm, laten we eens kijken of jij slimmer bent dan je eruitziet.',
      'Nog een scout die denkt dat hij slim is. Bewijs het maar.',
      'De strop is vers, het hout is stevig. We kunnen beginnen.',
      'Ik heb een woord voor je. Een goed woord. Een dodelijk woord.',
    ],
    correct_guess: [
      'Hmm, niet slecht.',
      'Oké, die zat erin.',
      'Toevalstreffer, vast.',
      'Je hebt geluk vandaag.',
      'Goed geraden. Maar er zijn nog meer letters...',
      'Dat was een makkelijke. De volgende wordt moeilijker.',
    ],
    wrong_guess: [
      'Ha! Mis!',
      'Nee hoor. De strop wordt strakker...',
      'Fout. Dat gaat je opbreken.',
      'Jammer dan. Weer een stap dichter bij het einde.',
      'Mis. Het touw kraakt al een beetje...',
      'Nope. De galg groeit.',
    ],
    almost_dead: [
      'Nog één foutje en het is voorbij...',
      'Ik kan het touw al bijna aanspannen...',
      'Je laatste kans, scout. Kies wijselijk.',
      'De galg is bijna compleet. Nog één misstap...',
    ],
    win: [
      'Pff. Je had geluk. Volgende keer pak ik je.',
      'Oké, je bent ontsnapt. Dit keer.',
      'Goed gespeeld. Maar denk niet dat het altijd zo makkelijk gaat.',
      'Je leeft nog. Geniet ervan zolang het duurt.',
    ],
    loss: [
      'Ha! Ik wist het. De galg wint altijd.',
      'Volgende keer beter, scout. Of niet.',
      'Dat was het dan. Beter je scouting-kennis opfrissen!',
      'De galg heeft gesproken. Jij verliest.',
    ],
    achievement: [
      'Oh, een prestatie. Indrukwekkend... denk ik.',
      'Gefeliciteerd. Nu terug aan de galg.',
      'Een badge erbij. Alsof dat je gaat helpen...',
    ],
    streak: [
      'Je bent op dreef, scout. Maar hoe lang nog?',
      'Niet slecht, die reeks. Maar ik breek hem wel.',
      'Een reeks? Interessant. Laten we kijken hoe lang die standhoudt.',
    ],
  },
  onder_de_indruk: {
    game_start: [
      'Oh nee, jij weer... Je bent echt goed, hè?',
      'De kampioen is terug. Ik word er zenuwachtig van.',
      'Oké, oké, je bent goed. Maar dit woord is MOEILIJK.',
      'Daar ben je weer. Mijn nemesis. Mijn nachtmerrie.',
      'Ik heb speciaal voor jou het moeilijkste woord uitgekozen!',
    ],
    correct_guess: [
      'Natuurlijk wist je dat. Waarom verbaast me dit nog?',
      'Hoe... hoe doe je dat toch?',
      'Oké, ik geef het toe. Je bent goed.',
      'Weer raak. Je maakt het me niet makkelijk.',
      'Ongelooflijk. Je ruikt de letters gewoon.',
    ],
    wrong_guess: [
      'Ha! Eindelijk een fout! Er is hoop!',
      'Ja! Mis! De held is ook maar een mens!',
      'Oeh, een foutje! Misschien is dit mijn dag!',
      'FOUT! Ik wist het! Niemand is perfect!',
    ],
    almost_dead: [
      'Wacht... ga je nu ECHT verliezen? Dit is mijn moment!',
      'Kom op, nog één foutje... voor mij? Alsjeblieft?',
      'Ik durf het bijna niet te geloven... Ga ik eindelijk winnen?!',
    ],
    win: [
      'Alwéér?! Ik moet echt moeilijkere woorden gaan zoeken...',
      'Je bent een legende. Een vervelende legende, maar toch.',
      'Ik geef het op. Je bent gewoon te goed.',
      'Hoe kan iemand zó goed zijn in galgje?!',
    ],
    loss: [
      'JA! EINDELIJK! Ik heb gewonnen! Feestje!',
      'Ha! De grote kampioen is gevallen! Dit onthoud ik!',
      'GEWONNEN! Dit is de mooiste dag van mijn beulenleven!',
    ],
    achievement: [
      'Nóg een prestatie? Je verzamelt ze als scouting-badges...',
      'Weet je, op een dag maak ik een anti-achievement alleen voor jou.',
    ],
    streak: [
      'Die reeks van je maakt me gek. Stop alsjeblieft.',
      'Elke keer dat je wint, sterft er een klein stukje van me.',
    ],
  },
  sarcastisch: {
    game_start: [
      'Oh, je bent terug. Ik dacht dat je het had opgegeven.',
      'Laten we eerlijk zijn, dit gaat niet goed aflopen voor jou.',
      'Weet je zeker dat je dit wilt? Er zijn makkelijkere spellen...',
      'Ah, mijn favoriete slachtoffer. Klaar voor nog een ronde vernedering?',
      'Ik heb gehoord dat woordzoekers ook leuk zijn. Gewoon een tip.',
    ],
    correct_guess: [
      'Wow, je kunt het alfabet! Gefeliciteerd.',
      'Wauw, een goede gok. Zelfs een kapotte klok heeft twee keer per dag gelijk.',
      'Oh kijk, een correct antwoord. Markeer de kalender.',
      'Niet slecht voor iemand met jouw track record.',
      'Een blinde eekhoorn vindt ook wel eens een eikel.',
    ],
    wrong_guess: [
      'Verrassing, verrassing...',
      'Wie had dat gedacht? Oh wacht, iedereen.',
      'Typisch. Heel typisch.',
      'Was dat je beste gok? Echt waar?',
      'Ik schrok er bijna van. Grapje.',
    ],
    almost_dead: [
      'Bijna... bijna heb ik je. En dit keer ga je niet ontsnappen.',
      'Nog één foutje. Niet dat ik eraan twijfel...',
      'De spanning is ondraaglijk. Voor jou dan.',
    ],
    win: [
      'Oké... dat had ik niet verwacht. Respect, denk ik.',
      'Huh. Je bent beter dan je eruitziet. Nét.',
      'Ik zal dit maar wijten aan beginners geluk. Voor de zoveelste keer.',
    ],
    loss: [
      'Tja. Dat was voorspelbaar.',
      'Volgende keer misschien een woordzoeker proberen?',
      'Ik zou zeggen "volgende keer beter" maar we weten allebei...',
      'Shocking. Echt shocking. Niet dus.',
    ],
    achievement: [
      'Een prestatie? Zelfs een blind hoen vindt soms een korrel.',
      'Oh wauw, een digitaal badgetje. Je moeder zou zo trots zijn.',
    ],
    streak: [
      'Een reeks? Van verliezen toch?',
      'Geniet ervan. Lang zal het niet duren.',
    ],
  },
  gefrustreerd: {
    game_start: [
      'JIJ. WEER. Oké, dit keer heb ik een ONMOGELIJK woord.',
      'Ik heb de hele nacht nagedacht over dit woord. Je gaat verliezen.',
      'Bereid je voor. Dit wordt MIJN overwinning.',
      'Ik heb het MOEILIJKSTE woord uit de database gehaald. Succes.',
      'Dit keer. DIT KEER win ik. Ik voel het.',
    ],
    correct_guess: [
      'NEE! Hoe wist je dat?!',
      'Onmogelijk! Je smokkelt toch niet?!',
      'ARGH. Oké. Oké. Er zijn nog meer letters...',
      'Hoe?! HOE?! Dat kan niet!',
      'Nee nee nee nee NEE!',
    ],
    wrong_guess: [
      'JA! FOUT! De galg groeit!',
      'Eindelijk! Ik wist dat je niet ALLES wist!',
      'HA! Daar! Een fout! Er is gerechtigheid!',
      'JA JA JA! Mis! Lekker!',
    ],
    almost_dead: [
      'Ja... ja... nog eentje... ALSJEBLIEFT maak een fout...',
      'Kom op, kom op, kom op... Één foutje nog...',
      'Ik bid tot de galgje-goden... Laat hem falen...',
    ],
    win: [
      'IK GEEF HET OP. Je bent onverslaanbaar. Bijna.',
      'HOE?! Ik had het perfecte woord! VOLGENDE KEER!',
      'Weet je wat? Ik neem ontslag als beul. Dit heeft geen zin.',
    ],
    loss: [
      'JAAA! GEWONNEN! IK HEB GEWONNEN! Neem dat!',
      'HA! De streak is voorbij! Dit voelt ZO goed!',
      'EINDELIJK! De galg wint! Feest! Taart! ALLES!',
    ],
    achievement: [
      'Nog meer prestaties?! Hou op! HOU OP!',
      'Ik maak mijn eigen achievement: "Maak de beul gek". Gefeliciteerd.',
    ],
    streak: [
      'Die reeks... die VERVLOEKTE reeks...',
      'Ik tel niet meer. Het doet te veel pijn.',
    ],
  },
  meedogenloos: {
    game_start: [
      'De galg wacht.',
      'Begin maar. Je gaat verliezen.',
      'Moeilijke modus. Geen genade.',
      'Het touw is klaar.',
      'Zeg je gebeden, scout.',
    ],
    correct_guess: [
      '...',
      'Hmm.',
      'Dat verandert niets.',
      'Irrelevant.',
    ],
    wrong_guess: [
      'De strop trekt aan.',
      'Weer een stap.',
      'Het einde nadert.',
      'Dichter bij.',
      'Tick. Tock.',
    ],
    almost_dead: [
      'Vaarwel, scout.',
      'Het was kort.',
      'Laatste adem.',
    ],
    win: [
      'Indrukwekkend. Geniet ervan. Het duurt niet.',
      'Je leeft. Vandaag.',
      'Geluk. Niets meer.',
    ],
    loss: [
      'Voorspelbaar.',
      'De galg wint. Altijd.',
      'Volgend slachtoffer.',
    ],
    achievement: [
      'Irrelevant.',
      'Betekenisloos.',
    ],
    streak: [
      'Streaks eindigen altijd.',
      'Geniet. Het stopt.',
    ],
  },
  kindvriendelijk: {
    game_start: [
      'Hallo scout! Welkom bij het galgje-spel! Doe je best!',
      'Hoi! Leuk dat je er bent! Laten we een woord raden!',
      'Welkom terug! Ik heb een leuk woord voor je!',
      'Hey scout! Klaar voor een nieuw avontuur?',
      'Fijn dat je er bent! Ik heb een leuk raadsel voor je!',
    ],
    correct_guess: [
      'Goed zo! Die letter zit erin!',
      'Super! Je bent hartstikke slim!',
      'Ja! Lekker bezig!',
      'Héél goed! Ga zo door!',
      'Top! Je bent echt goed hierin!',
      'Fantastisch geraden!',
    ],
    wrong_guess: [
      'Oeps, die zat er niet in. Maar geeft niks, je kunt het!',
      'Jammer! Maar je hebt nog genoeg pogingen!',
      'Die was het niet, maar niet opgeven hoor!',
      'Helaas! Maar je doet het hartstikke goed!',
      'Oei, die niet. Maar er zijn nog genoeg kansen!',
    ],
    almost_dead: [
      'Let op, je hebt nog maar een paar pogingen! Denk goed na!',
      'Bijna op, maar je kunt het nog! Welke letter denk je?',
      'Nog heel even, denk goed na! Je kunt het!',
    ],
    win: [
      'HOERA! Je hebt het geraden! Wat knap!',
      'Gewonnen! Je bent een echte scouting-kampioen!',
      'Fantastisch! Je bent super goed hierin!',
      'Wauw! Helemaal goed! Je bent een ster!',
      'Jippie! Weer gewonnen! Wat ben jij slim!',
    ],
    loss: [
      'Jammer! Maar je hebt je best gedaan en dat is het belangrijkste!',
      'Niet gelukt deze keer, maar volgende keer beter!',
      'Bijna! Je was er zo dichtbij! Probeer het nog een keer!',
      'Dat was een moeilijk woord hè? De volgende keer lukt het vast!',
    ],
    achievement: [
      'Wauw! Je hebt een prestatie behaald! Geweldig!',
      'Een badge erbij! Je bent een echte verzamelaar!',
      'Super! Weer een prestatie! Je doet het fantastisch!',
    ],
    streak: [
      'Wat een reeks! Je bent niet te stoppen!',
      'Zo veel gewonnen op rij! Ongelooflijk knap!',
    ],
  },
};
