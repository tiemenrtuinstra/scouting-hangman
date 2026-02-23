import type { DialogueMap, DialogueLine } from './templates.js';

// Helper to keep existing lines concise
function line(text: string, condition?: DialogueLine['condition'], weight?: number): DialogueLine {
  return { text, ...(condition ? { condition } : {}), ...(weight ? { weight } : {}) };
}

export const DIALOGUES: DialogueMap = {
  neutraal: {
    game_start: [
      // Original generic lines
      line('Welkom bij de galg, scout. Laten we kijken wat je waard bent.'),
      line('Ah, een nieuwe uitdager. Ik hoop dat je beter bent dan de vorige...'),
      line('De galg staat klaar. Jij ook?'),
      line('Hmm, laten we eens kijken of jij slimmer bent dan je eruitziet.'),
      line('Nog een scout die denkt dat hij slim is. Bewijs het maar.'),
      line('De strop is vers, het hout is stevig. We kunnen beginnen.'),
      line('Ik heb een woord voor je. Een goed woord. Een dodelijk woord.'),
      // Context-aware
      line('Welkom terug, {playerName}. {totalWins} overwinningen al... laten we kijken of je er eentje bij kunt doen.', ctx => ctx.totalWins >= 5, 2),
      line('{playerName}, terug voor meer? Je hebt lef.', ctx => ctx.totalGames >= 3, 2),
      line('Een {category}-woord vandaag. Interessant...', ctx => ctx.category !== '', 2),
      line('Hmm, {wordLength} letters. Dat wordt een uitdaging.', ctx => ctx.wordLength >= 8, 2),
      line('Reeks van {streak}? Niet slecht. Maar vandaag stopt het.', ctx => ctx.streak >= 3, 3),
    ],
    correct_guess: [
      line('Hmm, niet slecht.'),
      line('Oké, die zat erin.'),
      line('Toevalstreffer, vast.'),
      line('Je hebt geluk vandaag.'),
      line('Goed geraden. Maar er zijn nog meer letters...'),
      line('Dat was een makkelijke. De volgende wordt moeilijker.'),
      // Context-aware
      line('Hmm, {playerName} weet wat-ie doet.', ctx => ctx.totalWins >= 10, 2),
      line('Met een winrate van {winRate}% had ik dit kunnen verwachten.', ctx => ctx.winRate >= 60, 2),
      line('Nog {remainingLives} levens over. Je doet het prima. Helaas.', ctx => ctx.remainingLives >= 6, 2),
    ],
    wrong_guess: [
      line('Ha! Mis!'),
      line('Nee hoor. De strop wordt strakker...'),
      line('Fout. Dat gaat je opbreken.'),
      line('Jammer dan. Weer een stap dichter bij het einde.'),
      line('Mis. Het touw kraakt al een beetje...'),
      line('Nope. De galg groeit.'),
      // Context-aware
      line('Nog maar {remainingLives} pogingen, {playerName}...', ctx => ctx.remainingLives <= 3, 2),
      line('Je reeks van {streak} gaat niet lang meer duren.', ctx => ctx.streak >= 3, 2),
      line('Zelfs met {totalWins} wins maak je nog fouten, {playerName}.', ctx => ctx.totalWins >= 10, 2),
    ],
    almost_dead: [
      line('Nog één foutje en het is voorbij...'),
      line('Ik kan het touw al bijna aanspannen...'),
      line('Je laatste kans, scout. Kies wijselijk.'),
      line('De galg is bijna compleet. Nog één misstap...'),
      // Context-aware
      line('Eén leven over, {playerName}. Eén fout en je reeks van {streak} is voorbij.', ctx => ctx.streak >= 3, 3),
      line('Dit {category}-woord wordt je ondergang!', ctx => ctx.category !== '', 2),
    ],
    win: [
      line('Pff. Je had geluk. Volgende keer pak ik je.'),
      line('Oké, je bent ontsnapt. Dit keer.'),
      line('Goed gespeeld. Maar denk niet dat het altijd zo makkelijk gaat.'),
      line('Je leeft nog. Geniet ervan zolang het duurt.'),
      // Context-aware
      line('{playerName} wint weer. {totalWins} overwinningen nu.', ctx => ctx.totalWins >= 5, 2),
      line('Reeks van {streak}... ik moet oppassen.', ctx => ctx.streak >= 5, 3),
      line('Win {score} punten. Niet slecht, {playerName}.', ctx => ctx.score >= 200, 2),
      line('Een woord van {wordLength} letters, en je raadde het. Knap.', ctx => ctx.wordLength >= 10, 2),
      line('Zonder hint ook nog. Respect.', ctx => !ctx.hintUsed, 2),
    ],
    loss: [
      line('Ha! Ik wist het. De galg wint altijd.'),
      line('Volgende keer beter, scout. Of niet.'),
      line('Dat was het dan. Beter je scouting-kennis opfrissen!'),
      line('De galg heeft gesproken. Jij verliest.'),
      // Context-aware
      line('Daar gaat je reeks, {playerName}!', ctx => ctx.streak >= 1 && ctx.totalGames >= 3, 2),
      line('Zelfs met die hint lukte het niet, {playerName}.', ctx => ctx.hintUsed, 2),
      line('{wordLength} letters was te veel voor je, hè?', ctx => ctx.wordLength >= 8, 2),
    ],
    achievement: [
      line('Oh, een prestatie. Indrukwekkend... denk ik.'),
      line('Gefeliciteerd. Nu terug aan de galg.'),
      line('Een badge erbij. Alsof dat je gaat helpen...'),
      // Context-aware
      line('Nog een badge voor {playerName}. Je verzamelt ze als scouting-insignes.', ctx => ctx.totalWins >= 10, 2),
    ],
    streak: [
      line('Je bent op dreef, scout. Maar hoe lang nog?'),
      line('Niet slecht, die reeks. Maar ik breek hem wel.'),
      line('Een reeks? Interessant. Laten we kijken hoe lang die standhoudt.'),
      // Context-aware
      line('{streak} op rij, {playerName}?! Niet slecht!', ctx => ctx.streak >= 5, 2),
      line('{streak} op rij! Wordt het niet een beetje saai voor je?', ctx => ctx.streak >= 10, 3),
    ],
  },
  onder_de_indruk: {
    game_start: [
      line('Oh nee, jij weer... Je bent echt goed, hè?'),
      line('De kampioen is terug. Ik word er zenuwachtig van.'),
      line('Oké, oké, je bent goed. Maar dit woord is MOEILIJK.'),
      line('Daar ben je weer. Mijn nemesis. Mijn nachtmerrie.'),
      line('Ik heb speciaal voor jou het moeilijkste woord uitgekozen!'),
      // Context-aware
      line('{playerName}! Mijn aartsvijand! {totalWins} overwinningen... ik huil.', ctx => ctx.totalWins >= 20, 3),
      line('Reeks van {streak}?! Ik heb extra moeilijke woorden klaargezet!', ctx => ctx.streak >= 5, 3),
      line('Een {category}-woord dit keer. Misschien is dit mijn kans!', ctx => ctx.category !== '', 2),
      line('Die winrate van {winRate}%... Ik krijg er kippenvel van.', ctx => ctx.winRate >= 70, 3),
    ],
    correct_guess: [
      line('Natuurlijk wist je dat. Waarom verbaast me dit nog?'),
      line('Hoe... hoe doe je dat toch?'),
      line('Oké, ik geef het toe. Je bent goed.'),
      line('Weer raak. Je maakt het me niet makkelijk.'),
      line('Ongelooflijk. Je ruikt de letters gewoon.'),
      // Context-aware
      line('{playerName} doet het weer. Hoe kan dit?!', ctx => ctx.totalWins >= 15, 2),
      line('Met {wrongGuesses} fouten pas... je bent een machine!', ctx => ctx.wrongGuesses === 0, 3),
    ],
    wrong_guess: [
      line('Ha! Eindelijk een fout! Er is hoop!'),
      line('Ja! Mis! De held is ook maar een mens!'),
      line('Oeh, een foutje! Misschien is dit mijn dag!'),
      line('FOUT! Ik wist het! Niemand is perfect!'),
      // Context-aware
      line('Zelfs {playerName} met {totalWins} wins maakt fouten!', ctx => ctx.totalWins >= 15, 2),
      line('Eindelijk! Bij poging {wrongGuesses}!', ctx => ctx.wrongGuesses >= 3, 2),
    ],
    almost_dead: [
      line('Wacht... ga je nu ECHT verliezen? Dit is mijn moment!'),
      line('Kom op, nog één foutje... voor mij? Alsjeblieft?'),
      line('Ik durf het bijna niet te geloven... Ga ik eindelijk winnen?!'),
      // Context-aware
      line('Als ik {playerName} versla na een reeks van {streak}... dat zou EPISCH zijn!', ctx => ctx.streak >= 5, 3),
    ],
    win: [
      line('Alwéér?! Ik moet echt moeilijkere woorden gaan zoeken...'),
      line('Je bent een legende. Een vervelende legende, maar toch.'),
      line('Ik geef het op. Je bent gewoon te goed.'),
      line('Hoe kan iemand zó goed zijn in galgje?!'),
      // Context-aware
      line('{totalWins} overwinningen, {playerName}! Ik ga met pensioen.', ctx => ctx.totalWins >= 30, 3),
      line('{streak} op rij! Ik kan er niet meer tegen!', ctx => ctx.streak >= 7, 3),
      line('{score} punten?! Dat is belachelijk goed!', ctx => ctx.score >= 300, 3),
      line('Zelfs dat {category}-woord kon je niet stoppen!', ctx => ctx.category !== '', 2),
    ],
    loss: [
      line('JA! EINDELIJK! Ik heb gewonnen! Feestje!'),
      line('Ha! De grote kampioen is gevallen! Dit onthoud ik!'),
      line('GEWONNEN! Dit is de mooiste dag van mijn beulenleven!'),
      // Context-aware
      line('DE REEKS VAN {playerName} IS VOORBIJ! Na {totalWins} wins... EINDELIJK!', ctx => ctx.totalWins >= 15, 3),
      line('Dat {category}-woord was je te slim af!', ctx => ctx.category !== '', 2),
    ],
    achievement: [
      line('Nóg een prestatie? Je verzamelt ze als scouting-badges...'),
      line('Weet je, op een dag maak ik een anti-achievement alleen voor jou.'),
      // Context-aware
      line('Nog MEER prestaties voor {playerName}?! Wanneer stopt dit?!', ctx => ctx.totalWins >= 20, 2),
    ],
    streak: [
      line('Die reeks van je maakt me gek. Stop alsjeblieft.'),
      line('Elke keer dat je wint, sterft er een klein stukje van me.'),
      // Context-aware
      line('{streak} op rij, {playerName}?! Dit is niet eerlijk!', ctx => ctx.streak >= 5, 3),
      line('{streak} wins! Ik ga een klacht indienen bij de scouting-leiding!', ctx => ctx.streak >= 10, 3),
    ],
  },
  sarcastisch: {
    game_start: [
      line('Oh, je bent terug. Ik dacht dat je het had opgegeven.'),
      line('Laten we eerlijk zijn, dit gaat niet goed aflopen voor jou.'),
      line('Weet je zeker dat je dit wilt? Er zijn makkelijkere spellen...'),
      line('Ah, mijn favoriete slachtoffer. Klaar voor nog een ronde vernedering?'),
      line('Ik heb gehoord dat woordzoekers ook leuk zijn. Gewoon een tip.'),
      // Context-aware
      line('{playerName}! Met je indrukwekkende winrate van {winRate}%... oh wacht.', ctx => ctx.winRate < 40, 3),
      line('Weer een {category}-woord? Je laatste poging ging zo goed...', ctx => ctx.totalGames >= 3, 2),
      line('{totalGames} spellen en nog steeds niet afgekickt, {playerName}?', ctx => ctx.totalGames >= 10, 2),
      line('{wordLength} letters. Doe er een woordenboek bij.', ctx => ctx.wordLength >= 10, 2),
    ],
    correct_guess: [
      line('Wow, je kunt het alfabet! Gefeliciteerd.'),
      line('Wauw, een goede gok. Zelfs een kapotte klok heeft twee keer per dag gelijk.'),
      line('Oh kijk, een correct antwoord. Markeer de kalender.'),
      line('Niet slecht voor iemand met jouw track record.'),
      line('Een blinde eekhoorn vindt ook wel eens een eikel.'),
      // Context-aware
      line('Oh, {playerName} raadt een letter. Bel de krant.', ctx => ctx.winRate < 50, 2),
      line('Zelfs met {wrongGuesses} fouten weet je er af en toe eentje.', ctx => ctx.wrongGuesses >= 2, 2),
    ],
    wrong_guess: [
      line('Verrassing, verrassing...'),
      line('Wie had dat gedacht? Oh wacht, iedereen.'),
      line('Typisch. Heel typisch.'),
      line('Was dat je beste gok? Echt waar?'),
      line('Ik schrok er bijna van. Grapje.'),
      // Context-aware
      line('Klassieke {playerName}-zet. Fout, natuurlijk.', ctx => ctx.winRate < 50, 2),
      line('Nog maar {remainingLives} levens. Niet dat het uitmaakt.', ctx => ctx.remainingLives <= 4, 2),
      line('Die hint had je misschien toch moeten gebruiken.', ctx => !ctx.hintUsed && ctx.wrongGuesses >= 4, 2),
    ],
    almost_dead: [
      line('Bijna... bijna heb ik je. En dit keer ga je niet ontsnappen.'),
      line('Nog één foutje. Niet dat ik eraan twijfel...'),
      line('De spanning is ondraaglijk. Voor jou dan.'),
      // Context-aware
      line('Eén poging over. Jammer dat je die hint niet hebt gebruikt, {playerName}.', ctx => !ctx.hintUsed, 2),
    ],
    win: [
      line('Oké... dat had ik niet verwacht. Respect, denk ik.'),
      line('Huh. Je bent beter dan je eruitziet. Nét.'),
      line('Ik zal dit maar wijten aan beginners geluk. Voor de zoveelste keer.'),
      // Context-aware
      line('{playerName} wint. Met behulp van een hint, maar oké.', ctx => ctx.hintUsed, 3),
      line('{score} punten. Ik heb meer respect voor de hint-knop.', ctx => ctx.hintUsed && ctx.score < 200, 2),
      line('Zelfs {playerName} wint soms. Statistiek is grappig.', ctx => ctx.winRate < 50, 2),
    ],
    loss: [
      line('Tja. Dat was voorspelbaar.'),
      line('Volgende keer misschien een woordzoeker proberen?'),
      line('Ik zou zeggen "volgende keer beter" maar we weten allebei...'),
      line('Shocking. Echt shocking. Niet dus.'),
      // Context-aware
      line('Een {category}-woord was te veel voor {playerName}. Klassiek.', ctx => ctx.category !== '', 2),
      line('Je had die hint moeten gebruiken. Oh wacht, dat deed je al.', ctx => ctx.hintUsed, 2),
      line('{totalGames} spellen en nog steeds verliezen. Bewonderenswaardig, eigenlijk.', ctx => ctx.totalGames >= 10, 2),
    ],
    achievement: [
      line('Een prestatie? Zelfs een blind hoen vindt soms een korrel.'),
      line('Oh wauw, een digitaal badgetje. Je moeder zou zo trots zijn.'),
      // Context-aware
      line('Een achievement voor {playerName}? Is het Opposite Day?', ctx => ctx.winRate < 40, 2),
    ],
    streak: [
      line('Een reeks? Van verliezen toch?'),
      line('Geniet ervan. Lang zal het niet duren.'),
      // Context-aware
      line('{streak} op rij? Zelfs een kapotte klok...', ctx => ctx.streak >= 3, 2),
    ],
  },
  gefrustreerd: {
    game_start: [
      line('JIJ. WEER. Oké, dit keer heb ik een ONMOGELIJK woord.'),
      line('Ik heb de hele nacht nagedacht over dit woord. Je gaat verliezen.'),
      line('Bereid je voor. Dit wordt MIJN overwinning.'),
      line('Ik heb het MOEILIJKSTE woord uit de database gehaald. Succes.'),
      line('Dit keer. DIT KEER win ik. Ik voel het.'),
      // Context-aware
      line('{playerName}! {totalWins} OVERWINNINGEN?! Dit stopt VANDAAG!', ctx => ctx.totalWins >= 20, 3),
      line('DIE REEKS VAN {streak}?! Ik heb het LANGSTE woord voor je!', ctx => ctx.streak >= 7, 3),
      line('Een {category}-woord... HIER ga je struikelen!', ctx => ctx.category !== '', 2),
      line('{winRate}% winrate?! ONACCEPTABEL!', ctx => ctx.winRate >= 70, 3),
    ],
    correct_guess: [
      line('NEE! Hoe wist je dat?!'),
      line('Onmogelijk! Je smokkelt toch niet?!'),
      line('ARGH. Oké. Oké. Er zijn nog meer letters...'),
      line('Hoe?! HOE?! Dat kan niet!'),
      line('Nee nee nee nee NEE!'),
      // Context-aware
      line('Zelfs dit {category}-woord stopt {playerName} niet?! ONEERLIJK!', ctx => ctx.category !== '', 2),
      line('{wrongGuesses} fouten pas?! Dit kan niet waar zijn!', ctx => ctx.wrongGuesses <= 1, 2),
    ],
    wrong_guess: [
      line('JA! FOUT! De galg groeit!'),
      line('Eindelijk! Ik wist dat je niet ALLES wist!'),
      line('HA! Daar! Een fout! Er is gerechtigheid!'),
      line('JA JA JA! Mis! Lekker!'),
      // Context-aware
      line('JA! Nog maar {remainingLives} levens, {playerName}!', ctx => ctx.remainingLives <= 3, 3),
      line('DIE REEKS VAN {streak} GAAT VALLEN! IK VOEL HET!', ctx => ctx.streak >= 5, 3),
    ],
    almost_dead: [
      line('Ja... ja... nog eentje... ALSJEBLIEFT maak een fout...'),
      line('Kom op, kom op, kom op... Één foutje nog...'),
      line('Ik bid tot de galgje-goden... Laat hem falen...'),
      // Context-aware
      line('Eén fout en de reeks van {playerName} is VOORBIJ! KOM OP!', ctx => ctx.streak >= 3, 3),
    ],
    win: [
      line('IK GEEF HET OP. Je bent onverslaanbaar. Bijna.'),
      line('HOE?! Ik had het perfecte woord! VOLGENDE KEER!'),
      line('Weet je wat? Ik neem ontslag als beul. Dit heeft geen zin.'),
      // Context-aware
      line('{totalWins} WINS?! {playerName}, je maakt me GEK!', ctx => ctx.totalWins >= 20, 3),
      line('REEKS VAN {streak}?! IK KAN HIER NIET MEER TEGEN!', ctx => ctx.streak >= 7, 3),
      line('{score} punten ook nog?! DE SCHAAMTE!', ctx => ctx.score >= 300, 2),
      line('En zonder hint! WAAROM BEN JE ZO GOED?!', ctx => !ctx.hintUsed, 2),
    ],
    loss: [
      line('JAAA! GEWONNEN! IK HEB GEWONNEN! Neem dat!'),
      line('HA! De streak is voorbij! Dit voelt ZO goed!'),
      line('EINDELIJK! De galg wint! Feest! Taart! ALLES!'),
      // Context-aware
      line('DE REEKS VAN {playerName} IS VOORBIJ NA {totalGames} SPELLEN! JAAAAA!', ctx => ctx.totalGames >= 10, 3),
      line('ZELFS {playerName} MET {totalWins} WINS VERLIEST! HA!', ctx => ctx.totalWins >= 15, 3),
    ],
    achievement: [
      line('Nog meer prestaties?! Hou op! HOU OP!'),
      line('Ik maak mijn eigen achievement: "Maak de beul gek". Gefeliciteerd.'),
      // Context-aware
      line('NÓG een badge voor {playerName}?! HOEVEEL KAN EEN BEUL VERDRAGEN?!', ctx => ctx.totalWins >= 15, 2),
    ],
    streak: [
      line('Die reeks... die VERVLOEKTE reeks...'),
      line('Ik tel niet meer. Het doet te veel pijn.'),
      // Context-aware
      line('{streak} OP RIJ?! DIT IS EEN NACHTMERRIE!', ctx => ctx.streak >= 7, 3),
      line('{playerName} met {streak} op rij... Ik ga een andere baan zoeken.', ctx => ctx.streak >= 10, 3),
    ],
  },
  meedogenloos: {
    game_start: [
      line('De galg wacht.'),
      line('Begin maar. Je gaat verliezen.'),
      line('Moeilijke modus. Geen genade.'),
      line('Het touw is klaar.'),
      line('Zeg je gebeden, scout.'),
      // Context-aware
      line('{playerName}. De galg wacht.', ctx => ctx.totalGames >= 1, 2),
      line('{wordLength} letters. Te veel voor jou.', ctx => ctx.wordLength >= 8, 2),
      line('Reeks van {streak}? Eindigt hier.', ctx => ctx.streak >= 3, 3),
      line('{category}. Je zwakste punt.', ctx => ctx.category !== '', 2),
    ],
    correct_guess: [
      line('...'),
      line('Hmm.'),
      line('Dat verandert niets.'),
      line('Irrelevant.'),
      // Context-aware
      line('{remainingLives} levens. Niet genoeg.', ctx => ctx.remainingLives <= 5, 2),
    ],
    wrong_guess: [
      line('De strop trekt aan.'),
      line('Weer een stap.'),
      line('Het einde nadert.'),
      line('Dichter bij.'),
      line('Tick. Tock.'),
      // Context-aware
      line('{remainingLives}. Nog maar {remainingLives}.', ctx => ctx.remainingLives <= 3, 2),
      line('Die reeks sterft met jou.', ctx => ctx.streak >= 3, 3),
    ],
    almost_dead: [
      line('Vaarwel, scout.'),
      line('Het was kort.'),
      line('Laatste adem.'),
      // Context-aware
      line('Vaarwel, {playerName}.', ctx => ctx.totalGames >= 1, 2),
    ],
    win: [
      line('Indrukwekkend. Geniet ervan. Het duurt niet.'),
      line('Je leeft. Vandaag.'),
      line('Geluk. Niets meer.'),
      // Context-aware
      line('{totalWins} overwinningen. Toch verlies je uiteindelijk.', ctx => ctx.totalWins >= 10, 2),
      line('Reeks van {streak}. Tijdelijk.', ctx => ctx.streak >= 3, 2),
    ],
    loss: [
      line('Voorspelbaar.'),
      line('De galg wint. Altijd.'),
      line('Volgend slachtoffer.'),
      // Context-aware
      line('{playerName} valt. Zoals verwacht.', ctx => ctx.totalGames >= 3, 2),
      line('Die reeks is voorbij.', ctx => ctx.totalGames >= 3, 2),
    ],
    achievement: [
      line('Irrelevant.'),
      line('Betekenisloos.'),
    ],
    streak: [
      line('Streaks eindigen altijd.'),
      line('Geniet. Het stopt.'),
      // Context-aware
      line('{streak}. Tijdelijk. Alles is tijdelijk.', ctx => ctx.streak >= 5, 2),
    ],
  },
  kindvriendelijk: {
    game_start: [
      line('Hallo scout! Welkom bij het galgje-spel! Doe je best!'),
      line('Hoi! Leuk dat je er bent! Laten we een woord raden!'),
      line('Welkom terug! Ik heb een leuk woord voor je!'),
      line('Hey scout! Klaar voor een nieuw avontuur?'),
      line('Fijn dat je er bent! Ik heb een leuk raadsel voor je!'),
      // Context-aware
      line('Hoi {playerName}! Leuk je weer te zien! Je hebt al {totalWins} keer gewonnen!', ctx => ctx.totalWins >= 3, 2),
      line('Welkom terug {playerName}! Klaar voor nog een {category}-woord?', ctx => ctx.category !== '', 2),
      line('Wow, {playerName}! Je hebt al {streak} keer op rij gewonnen! Super!', ctx => ctx.streak >= 3, 3),
      line('Hallo {playerName}! Dit woord heeft {wordLength} letters. Spannend!', ctx => ctx.wordLength >= 6, 2),
    ],
    correct_guess: [
      line('Goed zo! Die letter zit erin!'),
      line('Super! Je bent hartstikke slim!'),
      line('Ja! Lekker bezig!'),
      line('Héél goed! Ga zo door!'),
      line('Top! Je bent echt goed hierin!'),
      line('Fantastisch geraden!'),
      // Context-aware
      line('Knap, {playerName}! Ga zo door!', ctx => ctx.totalGames >= 2, 2),
      line('Nog geen foutje! Je doet het perfect, {playerName}!', ctx => ctx.wrongGuesses === 0, 2),
    ],
    wrong_guess: [
      line('Oeps, die zat er niet in. Maar geeft niks, je kunt het!'),
      line('Jammer! Maar je hebt nog genoeg pogingen!'),
      line('Die was het niet, maar niet opgeven hoor!'),
      line('Helaas! Maar je doet het hartstikke goed!'),
      line('Oei, die niet. Maar er zijn nog genoeg kansen!'),
      // Context-aware
      line('Niet erg, {playerName}! Je hebt nog {remainingLives} pogingen!', ctx => ctx.remainingLives >= 4, 2),
      line('Oeps! Maar met {totalWins} overwinningen weet ik dat je dit kunt!', ctx => ctx.totalWins >= 5, 2),
    ],
    almost_dead: [
      line('Let op, je hebt nog maar een paar pogingen! Denk goed na!'),
      line('Bijna op, maar je kunt het nog! Welke letter denk je?'),
      line('Nog heel even, denk goed na! Je kunt het!'),
      // Context-aware
      line('Nog {remainingLives} poging(en), {playerName}! Denk goed na, je kunt het!', ctx => ctx.totalGames >= 1, 2),
      line('Tip: denk aan {category}-woorden die je kent!', ctx => ctx.category !== '', 2),
    ],
    win: [
      line('HOERA! Je hebt het geraden! Wat knap!'),
      line('Gewonnen! Je bent een echte scouting-kampioen!'),
      line('Fantastisch! Je bent super goed hierin!'),
      line('Wauw! Helemaal goed! Je bent een ster!'),
      line('Jippie! Weer gewonnen! Wat ben jij slim!'),
      // Context-aware
      line('HOERA {playerName}! Al {totalWins} keer gewonnen!', ctx => ctx.totalWins >= 5, 2),
      line('{streak} keer op rij gewonnen! Je bent ONGELOOFLIJK, {playerName}!', ctx => ctx.streak >= 3, 3),
      line('Wauw, {score} punten! Wat een score!', ctx => ctx.score >= 200, 2),
      line('Een woord van {wordLength} letters! Wat knap dat je dat wist!', ctx => ctx.wordLength >= 8, 2),
      line('En helemaal zonder hint! Superslim!', ctx => !ctx.hintUsed, 2),
    ],
    loss: [
      line('Jammer! Maar je hebt je best gedaan en dat is het belangrijkste!'),
      line('Niet gelukt deze keer, maar volgende keer beter!'),
      line('Bijna! Je was er zo dichtbij! Probeer het nog een keer!'),
      line('Dat was een moeilijk woord hè? De volgende keer lukt het vast!'),
      // Context-aware
      line('Niet erg, {playerName}! Je hebt al {totalWins} keer gewonnen, dit was gewoon een moeilijke!', ctx => ctx.totalWins >= 3, 2),
      line('Dat {category}-woord was echt lastig! De volgende keer lukt het vast!', ctx => ctx.category !== '', 2),
    ],
    achievement: [
      line('Wauw! Je hebt een prestatie behaald! Geweldig!'),
      line('Een badge erbij! Je bent een echte verzamelaar!'),
      line('Super! Weer een prestatie! Je doet het fantastisch!'),
      // Context-aware
      line('Wat goed, {playerName}! Weer een badge voor jouw verzameling!', ctx => ctx.totalWins >= 5, 2),
    ],
    streak: [
      line('Wat een reeks! Je bent niet te stoppen!'),
      line('Zo veel gewonnen op rij! Ongelooflijk knap!'),
      // Context-aware
      line('{streak} keer op rij! Je bent een echte kampioen, {playerName}!', ctx => ctx.streak >= 5, 3),
    ],
  },
};
