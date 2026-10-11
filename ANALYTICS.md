# Produktmätning i Umami

Trackern är aktiv i den hostade produktionsmiljön när `UMAMI_ANALYTICS_WEBSITE_ID` är satt. Utvecklingsmiljön och self-host skickar inga events. Eventnamnen definieras i `next/src/lib/analytics.js`.

## Rapporter för den svenska lanseringen

Filtrera på `language = sv`. Använd unika besökare för konverteringsandelar och antal events för användning och fel. En besökare kan göra flera överföringar.

1. **Anskaffning:** besök på `/sv`, uppdelat på kampanj. Följ `Signup CTA clicked`, `Sign-in email sent` och `Google sign-in started` för att hitta avhopp.
2. **Registrering och abonnemang:** `Account created` -> `Checkout started` -> `Subscription ready`. Visa `plan`, `currency` och `trial` när de finns på respektive event.
3. **Aktivering:** `Onboarding completed` -> `Upload completed` med `mode = stored`, alternativt `File request created`. För förfrågningar är nästa tecken på värde `Upload completed` med `mode = request`.
4. **Tillförlitlighet:** jämför `Upload started`, `Upload completed` och `Upload failed`. Bryt ner efter filstorleksgrupp och språk. Följ snabböverföringar separat.

Kampanjlänk, till exempel:

`https://transfer.zip/sv?utm_source=outreach&utm_medium=email&utm_campaign=sweden_oct`

Använd samma kampanjnamn för hela utskicket. Lägg inte mottagarens namn, e-post eller ett personligt ID i parametrarna. Endast `utm_source`, `utm_medium` och `utm_campaign` behålls, med högst 64 bokstäver, siffror, understreck eller bindestreck.

Rapporterna ovan är instruktioner för Umami-gränssnittet. De skapas inte automatiskt av applikationen.

## Vad ett event betyder

| Event | Utlöses när |
| --- | --- |
| Signup CTA clicked | Besökaren klickar på en inloggnings- eller registreringsknapp. `placement` skiljer placeringarna åt. |
| Plan selected | Ett abonnemang väljs. `placement`, `plan`, `interval`, `currency` och vid teamval `seats` beskriver valet. |
| Sign-in email sent | API:t har accepterat begäran om inloggningsmejl. Det bekräftar inte leverans till inkorgen. |
| Google sign-in started | Google-inloggningen öppnas. |
| Account created | Ett nytt konto slutför sin första verifierade inloggning. Ett klick på registreringsknappen räknas inte som ett konto. |
| Sign-in completed | Ett befintligt konto loggar in. `method` skiljer mejllänk, kod, Google och inbjudan åt. |
| Checkout started | Servern har skapat Stripe Checkout-sessionen och webbläsaren ska lämna sidan. |
| Checkout failed | Det gick inte att skapa en Checkout-session. Det betyder inte att ett kort nekats av Stripe. |
| Subscription ready | Sidan efter Checkout har läst tillbaka ett aktivt abonnemang från appens API. `trial` skiljer provperiod från övriga abonnemang. |
| Onboarding completed | Servern har sparat att solo- eller teamonboardingen är klar. |
| Upload started | Klienten börjar ett försök att ladda upp filer efter att överföringen skapats. |
| Upload completed | Alla filer har laddats upp och servern har bekräftat att överföringen är klar. |
| Upload failed | Uppladdningen eller bekräftelsen misslyckades. |
| File request created | Servern har skapat en förfrågan. `method` är `link` eller `email`. |
| Download requested | Klienten har registrerat en nedladdningsbegäran. Det bekräftar inte att webbläsaren sparat filen. |
| Quick transfer started/completed/failed | Snabböverföringens protokoll går in i respektive status. Filtrera på `mode = send` för avsändare och `mode = receive` för mottagare, annars räknas båda sidorna. |
| Upgrade CTA clicked | Besökaren klickar vidare från snabböverföringens erbjudande om lagrade filer. |
| Swedish suggestion accepted | Besökaren väljer svenska via språkförslaget. |

## Tolka siffrorna rätt

`Subscription ready` är en bekräftelse i produktflödet, inte bokförd intäkt eller en unik betalning. Ett återbesök på bekräftelsesidan kan skapa ett nytt event. Betalande kunder, betalda fakturor och intäkter ska läsas från Stripe. Knappar, provperioder och intäkter får inte summeras som samma konvertering.

Umami kan inte ge ett fullständigt flöde över olika enheter eller blockerade trackers. Inga konto-ID:n skickas för att sammanfoga användare. När ett konto skapas på en annan enhet kan det därför saknas en koppling till kampanjbesöket.

De tidigare eventnamnen ersätts vid driftsättning. Jämför inte de gamla registreringsklicken med det nya `Account created` som om de mätte samma sak.

## Data som skickas

Varje event får `language` och `surface` (`marketing`, `auth`, `onboarding`, `dashboard`, `recipient` eller `quick`). Uppladdningar får antal filer, filstorleksgrupp och vid avslutat försök tidsåtgång. Övriga tillåtna fält finns i `analyticsData`.

Sidvisningar skickas manuellt. Hemliga länkkoder och interna objekt-ID:n ersätts med `:id`; sidtiteln är samma grupperade sökväg. Alla URL-fragment och övriga query-parametrar tas bort. Hänvisaren begränsas till sitt ursprung. Filnamn, mejladresser, teamnamn, konto-ID:n och felmeddelanden skickas inte i våra events.

Inga nya beständiga analysidentifierare lagras i webbläsaren. Språkvalet använder en separat sessionscookie och kan sparas på kontot. Språkförslaget använder det delade GEO-anropet i klienten, utan ett nytt GEO-anrop i serverrenderingen.
