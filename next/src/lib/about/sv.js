export const swedishAboutText = {
  meta: {
    title: "Om oss",
    socialTitle: "Om Transfer.zip",
    description: "Så gick Transfer.zip från en enda webbsida 2023 till en fildelningstjänst med öppen källkod som tusentals personer använder varje månad.",
  },
  breadcrumbs: { home: "Hem", page: "Om oss" },
  hero: {
    title: "Om Transfer.zip",
    description: "Transfer.zip är en oberoende svensk tjänst för filöverföring, med öppen källkod. Så här växte den från en enda webbsida till det den är idag.",
  },
  stats: [
    { value: "{years} år", label: "i branschen" },
    { value: "Tusentals", label: "användare varje månad" },
    { value: "Öppen källkod", label: "sedan dag ett" },
  ],
  timeline: {
    title: "Milstolparna hittills",
    years: [
      {
        year: "2023",
        entries: [
          {
            id: "first-file",
            date: "Maj 2023",
            title: "Den första filen",
            body: "Projektet startar den 15 maj, med öppen källkod från dag ett. Tre dagar senare skickas en fil direkt från en webbläsare till en annan. Transfer.zip är en enda sida med en filväljare och en knapp för att skicka, och filerna krypteras i webbläsaren innan de lämnar den.",
            imageAlt: "Startsidan för Transfer.zip i juni 2023: en filväljare och en knapp för att skicka mot mörk bakgrund.",
          },
          {
            id: "no-size-limit",
            date: "Juni 2023",
            title: "Ingen storleksgräns",
            body: "Nedladdningar börjar strömmas direkt till disk i stället för att hållas i minnet, så en fil kan vara hur stor som helst. En QR-kod gör det enkelt att öppna en överföring i mobilen, och de första bidragen från andra utvecklare kommer in.",
          },
        ],
      },
      {
        year: "2024",
        entries: [
          {
            id: "stored-transfers",
            date: "April 2024",
            title: "Överföringar som kan vänta",
            body: "Fram till nu måste båda vara online samtidigt. En omskrivning ger konton och lagrade överföringar: ladda upp en gång, dela länken och låt mottagaren ladda ner när det passar.",
            imageAlt: "Kontrollpanelen i Transfer.zip 2024, med filerna i en lagrad överföring.",
          },
          {
            id: "quick-share",
            date: "Juni 2024",
            title: "Quick Share",
            body: "Realtidsläget Quick Share får ett nytt utseende. Nu går det att skicka flera filer på en gång, och när en brandvägg stoppar direktanslutningen skickas den krypterade datan via ett relä i stället.",
            imageAlt: "Quick Share 2024: en QR-kod bredvid fyra steg för att skicka filer mellan två enheter.",
          },
          {
            id: "self-hosting",
            date: "Juli 2024",
            title: "Egen drift",
            body: "Transfer.zip går nu att köra på egen server, så att vem som helst kan drifta hela tjänsten själv. Strax efter kommer de första gratisverktygen i webbläsaren, för att skapa och packa upp zip-filer utan att ladda upp dem någonstans.",
          },
        ],
      },
      {
        year: "2025",
        entries: [
          {
            id: "redesign",
            date: "Februari 2025",
            title: "Nytt utseende och abonnemang",
            body: "En helt ny design lanseras tillsammans med abonnemang. Abonnemangen betalar för servrar och lagring, och det är därför tjänsten kan förbli oberoende.",
            imageAlt: "Den nya kontrollpanelen i Transfer.zip 2025, med en översikt över de senaste överföringarna.",
          },
          {
            id: "email-requests",
            date: "Mars 2025",
            title: "Mejl och filförfrågningar",
            body: "Skicka en överföring till flera mejladresser samtidigt, eller skapa en länk som låter vem som helst ladda upp filer till dig utan konto.",
          },
          {
            id: "branding",
            date: "Juli 2025",
            title: "Ditt varumärke på varje överföring",
            body: "Hela appen byggs om i Next.js. Samtidigt kommer varumärkesprofiler, med din egen logotyp och bakgrund på nedladdningssidor och i mejl.",
          },
          {
            id: "uploads",
            date: "Oktober 2025",
            title: "Uppladdningar som tål dåligt wifi",
            body: "Filer laddas nu upp i delar, direkt från webbläsaren till lagringen. Om nätverket bryts fortsätter uppladdningen där den slutade.",
          },
        ],
      },
      {
        year: "2026",
        entries: [
          {
            id: "teams",
            date: "Maj 2026",
            title: "Teams och egna domäner",
            body: "Med Teams delar ett företag på ett abonnemang, och medlemmar och varumärkesprofiler hanteras på ett ställe. Med Pro och Teams går det också att använda en egen domän i överföringslänkarna.",
          },
          {
            id: "quick-transfers",
            date: "Juni 2026",
            title: "Snabböverföringar i ny tappning",
            body: "Quick Share, som nu heter snabböverföringar, får en ny motor. Alla överföringar går via ett totalsträckskrypterat relä och fungerar därför i alla nätverk, och två enheter kan paras ihop med en sexsiffrig kod i stället för en länk.",
          },
          {
            id: "swedish",
            date: "Oktober 2026",
            title: "Nu på svenska",
            body: "Transfer.zip lanseras på svenska, med priser i kronor.",
          },
        ],
      },
    ],
  },
  today: {
    title: "Fortfarande oberoende, fortfarande öppen källkod",
    body: "Tusentals personer använder Transfer.zip varje månad för att skicka och ta emot stora filer. Robin Karlberg leder utvecklingen, med hjälp av bidrag från andra på GitHub.",
    goal: "Målet är detsamma som 2023: filöverföringar som är snabba, pålitliga och enkla, och filer som förblir dina.",
    sourceLink: "Utforska källkoden",
    profileLink: "Robins GitHub-profil",
    imageAlt: "Transfer.zip 2026: en uppladdning pågår ovanför kontrollpanelens meny.",
  },
  handling: {
    title: "Så hanterar Transfer.zip filer",
    items: [
      {
        title: "Verktyg i webbläsaren",
        body: "Verktyg som zip-skaparen och uppackaren bearbetar filerna lokalt i webbläsaren. De laddas inte upp till Transfer.zip.",
      },
      {
        title: "Snabböverföringar",
        body: "Snabböverföringar krypterar filerna i webbläsaren och strömmar dem genom ett relä, utan att de lagras på Transfer.zips servrar.",
      },
      {
        title: "Lagrade överföringar",
        body: "Lagrade överföringar skickar filerna från webbläsaren till lagringen och raderar dem när överföringen har upphört.",
      },
    ],
  },
}
