# Saaran Peli - Claude Muistiinpanot

## Projektin rakenne
- Kaboom.js-pohjainen 2D-peli
- Spritet sijaitsevat `src/sprites/` hakemistossa
- Äänet sijaitsevat `public/sounds/` hakemistossa
- Koodi on käännetty suomeksi (kommentit ja muuttujat)

## Kehitystyökalut

### Linting
**TÄRKEÄÄ**: Aja aina `yarn lint` koodimuutosten jälkeen
```bash
yarn lint
```

### Muut komennot
```bash
yarn dev      # Käynnistä kehityspalvelin
yarn build    # Rakenna tuotantoversiota varten
yarn preview  # Esikatsele rakennettu versio
```

## Tekniset huomiot
- Peli käyttää UTF-8 merkistöä skandinaavisten merkkien tukemiseksi
- Kaikki pelielementit on nimetty suomeksi (pelaaja, vihollinen, maali, jne.)
- ESLint konfiguroitu Kaboom.js globaalien funktioiden kanssa
- Vite build-järjestelmä käytössä

## Pelin toiminnallisuudet
- Dynaaminen maastonluonti
- Tasojärjestelmä vaikeusasteen kanssa
- Pisteytys ja maalien saavuttaminen
- Äänen kytkeminen päälle/pois
- Nimen tallentaminen localStorageen