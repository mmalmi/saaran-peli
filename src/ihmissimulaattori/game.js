import kaboom from 'kaboom'
import jacobSprite from '../assets/sprites/ukkeli_cropped.png'
import appleSprite from '../assets/sprites/apple.png'
import meatSprite from '../assets/sprites/meat.png'
import mushroomSprite from '../assets/sprites/mushroom.png'
import watermelonSprite from '../assets/sprites/watermelon.png'
import ghostySprite from '../assets/sprites/ghosty.png'
import butterflySprite from '../assets/sprites/butterfly.png'
import havupuuSprite from '../assets/sprites/havupuu.png'
import monsterSound1 from './sounds/monster-1.wav'
import monsterSound2 from './sounds/monster-2.wav'
import monsterSound3 from './sounds/monster-3.wav'
import monsterSound4 from './sounds/monster-4.wav'
import monsterSound5 from './sounds/monster-5.wav'
import monsterSound6 from './sounds/monster-6.wav'
import monsterSound7 from './sounds/monster-7.wav'
import monsterSound8 from './sounds/monster-8.wav'
import monsterSound9 from './sounds/monster-9.wav'
import monsterSound10 from './sounds/monster-10.wav'
import musa2Url from '../assets/sounds/musa2.mp3'

// Alusta Kaboom - Don't Starve tyylinen yläviisto
kaboom({
    width: 1000,
    height: 700,
    background: [40, 60, 40], // Luonnonvihreä tausta
    gravity: 0, // Ei gravitya - top-down peli
});

// Lataa spritet
loadSprite("ihminen", jacobSprite);
loadSprite("omena", appleSprite);
loadSprite("liha", meatSprite);
loadSprite("sieni", mushroomSprite);
loadSprite("vesimeloni", watermelonSprite);
loadSprite("haamu", ghostySprite);
loadSprite("perhonen", butterflySprite);
loadSprite("havupuu", havupuuSprite);

// Lataa äänet
loadSound("monster-1", monsterSound1);
loadSound("monster-2", monsterSound2);
loadSound("monster-3", monsterSound3);
loadSound("monster-4", monsterSound4);
loadSound("monster-5", monsterSound5);
loadSound("monster-6", monsterSound6);
loadSound("monster-7", monsterSound7);
loadSound("monster-8", monsterSound8);
loadSound("monster-9", monsterSound9);
loadSound("monster-10", monsterSound10);
loadSound("bgmusic", musa2Url);

// Äänitila - lataa localStoragesta
let onMykistetty = localStorage.getItem('gameAudioMuted') === 'true';
let taustaMusiikki = null;

// Pääpeli
scene("peli", () => {
    // Käynnistä taustamusiikki vain jos sitä ei ole tai se on pysäytetty
    if (!taustaMusiikki || taustaMusiikki.paused) {
        if (taustaMusiikki) {
            taustaMusiikki.stop();
        }
        taustaMusiikki = play("bgmusic", {
            loop: true,
            volume: onMykistetty ? 0 : 0.3
        });
    }
    
    // Aikajärjestelmä
    let aika = 540; // Aloitetaan klo 9:00 (9 * 60 = 540 minuuttia)
    let paiva = 1;
    const aikaKerroin = 0.02; // Paljon pienempi kerroin pehmeää muutosta varten
    const aikaKompensaatio = 10; // Kompensoi pientä aikakerrointa
    
    // Lasketaan kellonajan mukaan valoisuus ja värisävy
    function laskeValoisuus(aika) {
        const tunti = (aika / 60) % 24;
        
        // Käytetään sini-funktiota simuloimaan auringon kaarta
        // Aurinko nousee klo 6 ja laskee klo 18 (12h päivä)
        if (tunti >= 6 && tunti <= 18) {
            // Normalisoi tunti välille 0-1 (0 = auringonnousu, 1 = auringonlasku)
            const normalisoituTunti = (tunti - 6) / 12;
            // Sini-funktio antaa kaarevan valoisuuden
            const valoisuus = Math.sin(normalisoituTunti * Math.PI);
            // Palauta vähintään 0.3, maksimi 1.0
            return 0.3 + valoisuus * 0.7;
        } else {
            // Yö: enemmän valoa tähdistä ja kuusta
            // Keskiyöllä pimeämpää kuin aamuyöllä
            let yoTunti = tunti < 6 ? tunti + 24 : tunti;
            const yoKeski = 24; // Keskiyö
            const etaisyysKeskiyosta = Math.abs(yoTunti - yoKeski);
            return 0.2 + (etaisyysKeskiyosta / 6) * 0.15; // 0.2 - 0.35 (vaaleampi kuin ennen)
        }
    }
    
    // Lasketaan värisävy kellonajan mukaan
    function laskeVarisavy(aika) {
        const tunti = (aika / 60) % 24;
        
        // Aamulla (5-8) ja illalla (17-20) punertava sävy
        if ((tunti >= 5 && tunti <= 8) || (tunti >= 17 && tunti <= 20)) {
            let punertuva = 0;
            if (tunti >= 5 && tunti <= 8) {
                // Aamu: voimakkain klo 6
                punertuva = 1 - Math.abs(tunti - 6) / 2;
            } else {
                // Ilta: voimakkain klo 18.5
                punertuva = 1 - Math.abs(tunti - 18.5) / 2;
            }
            return {
                r: 255,
                g: 100 + (155 * (1 - punertuva)),
                b: 50 + (205 * (1 - punertuva))
            };
        }
        // Päivällä ja yöllä neutraali
        return { r: 255, g: 255, b: 255 };
    }
    // Luo alkutausta
    for (let i = 0; i < 3; i++) {
        add([
            rect(rand(2, 6), rand(8, 15)),
            pos(rand(-600, 600), rand(-400, 400)),
            color(rand(30, 60), rand(70, 100), rand(30, 60)),
            opacity(0.4),
            { defaultOpacity: 0.4 },
            "tausta"
        ]);
    }
    
    for (let i = 0; i < 2; i++) {
        add([
            circle(rand(4, 10)),
            pos(rand(-700, 700), rand(-500, 500)),
            color(80, 80, 90),
            opacity(0.3),
            z(-9),
            { defaultOpacity: 0.3 },
            "tausta"
        ]);
    }
    
    // Luo alkupuita
    for (let i = 0; i < 5; i++) {
        const x = rand(-800, 800);
        const y = rand(-600, 600);
        const koko = rand(0.1, 0.3);
        
        add([
            sprite("havupuu"),
            pos(x, y),
            scale(koko),
            opacity(0.9),
            { 
                defaultOpacity: 0.9,
                alkuperainenX: x,
                alkuperainenY: y,
                alkuperainenKoko: koko
            },
            "puu",
        ]);
    }
    
    // Kylläisyysjärjestelmä
    let kyllaisyys = 100; // 0-100, kuolee jos 0
    let kyllaisyysVahenee = 0.03; // per frame (hitaampi)
    
    // Varjokerros yötä varten
    const varjoKerros = add([
        rect(width(), height()),
        pos(0, 0),
        color(0, 0, 0),
        opacity(0),
        fixed(),
        z(100),
        "varjo"
    ]);
    
    // Värikerros aamulle ja illalle
    const variKerros = add([
        rect(width(), height()),
        pos(0, 0),
        color(255, 255, 255),
        opacity(0),
        fixed(),
        z(99),
        "vari"
    ]);
    
    // Näkyvyysympyrä yöllä (seuraa pelaajaa) - piilotettu toistaiseksi
    // let nakyvyysYmpyra = null;
    
    // UI - Kylläisyyspalkki
    const palkinLeveys = 200;
    const palkinKorkeus = 20;
    const palkinX = 20;
    const palkinY = 20;
    
    // Palkin tausta (läpinäkyvä)
    add([
        rect(palkinLeveys, palkinKorkeus),
        pos(palkinX, palkinY),
        color(50, 50, 50),
        opacity(0.2),
        fixed(),
        z(101),
        "palkkitausta"
    ]);
    
    // Palkin reunus
    add([
        rect(palkinLeveys + 4, palkinKorkeus + 4),
        pos(palkinX - 2, palkinY - 2),
        color(0, 0, 0),
        opacity(0.5),
        fixed(),
        z(100),
    ]);
    
    // Kylläisyyspalkki (verenpunainen)
    const kyllaisyysPalkki = add([
        rect(palkinLeveys * (kyllaisyys / 100), palkinKorkeus),
        pos(palkinX, palkinY),
        color(180, 0, 0),
        opacity(1),
        fixed(),
        z(102),
        "kyllaisyyspalkki"
    ]);
    
    // Kylläisyysteksti palkin alla
    add([
        text("Kylläisyys", {
            size: 16,
        }),
        pos(palkinX, palkinY + palkinKorkeus + 5),
        fixed(),
        color(255, 255, 255),
        z(101),
    ]);
    
    // Päivälaskuri
    const paivaText = add([
        text("Päivä " + paiva, {
            size: 20,
        }),
        pos(width() - 120, 20),
        fixed(),
        color(255, 255, 255),
        z(101), // Varjon päällä
    ]);
    
    // Kaiutinkuvake äänen kytkemiseen
    const kaiutinKuvake = add([
        text(onMykistetty ? "🔇" : "🔊", {
            size: 24,
        }),
        pos(width() - 160, 20),
        fixed(),
        area(),
        color(255, 255, 255),
        z(101),
        "kaiutin"
    ]);
    
    // Yhtenäinen äänen kytkemisfunktio
    function vaihdaMykistys() {
        onMykistetty = !onMykistetty;
        localStorage.setItem('gameAudioMuted', onMykistetty);
        if (taustaMusiikki) {
            taustaMusiikki.volume = onMykistetty ? 0 : 0.3;
        }
        kaiutinKuvake.text = onMykistetty ? "🔇" : "🔊";
    }

    // Kaiutinkuvakkeen klikkauksen käsittelijä
    kaiutinKuvake.onClick(() => {
        vaihdaMykistys();
    });
    
    
    add([
        text("Nuolinäppäimet = liikkuminen, Shift = juoksu", {
            size: 16,
        }),
        pos(20, height() - 40),
        fixed(),
        color(150, 150, 150),
        z(101), // Varjon päällä
    ]);
    
    // Pelaaja (ukkeli-hahmo) - skaalattu pienemmäksi
    const pelaaja = add([
        sprite("ihminen"),
        pos(0, 0), // Aloitussijainti maailmassa
        scale(0.1), // Skaalaa 10% alkuperäisestä koosta
        area(),
        anchor("center"), // Keskitä sprite sen keskipisteeseen
        "pelaaja"
    ]);
    
    // Pelaajan sijainnin seuranta möröjä varten
    let edellinenSijainti = { x: pelaaja.pos.x, y: pelaaja.pos.y };
    let liikkumatonAika = 0;
    
    // Kamera seuraa pelaajaa ja keskittää sen ruutuun
    pelaaja.onUpdate(() => {
        camPos(pelaaja.pos.x, pelaaja.pos.y);
        
        // Tarkista onko pelaaja liikkunut
        const etaisyys = Math.sqrt(
            Math.pow(pelaaja.pos.x - edellinenSijainti.x, 2) + 
            Math.pow(pelaaja.pos.y - edellinenSijainti.y, 2)
        );
        
        if (etaisyys < 5) { // Jos liikkunut alle 5 pikseliä
            liikkumatonAika++;
        } else {
            liikkumatonAika = 0;
            edellinenSijainti = { x: pelaaja.pos.x, y: pelaaja.pos.y };
        }
    });
    
    // Liikkuminen (isometrinen/yläviisto tyyli)
    const perusNopeus = 200;
    const juoksuNopeus = 400;
    let juoksee = false;
    
    onKeyDown("up", () => {
        const nopeus = isKeyDown("shift") ? juoksuNopeus : perusNopeus;
        juoksee = isKeyDown("shift");
        pelaaja.move(0, -nopeus); // Ylös
    });
    
    onKeyDown("down", () => {
        const nopeus = isKeyDown("shift") ? juoksuNopeus : perusNopeus;
        juoksee = isKeyDown("shift");
        pelaaja.move(0, nopeus); // Alas
    });
    
    onKeyDown("left", () => {
        const nopeus = isKeyDown("shift") ? juoksuNopeus : perusNopeus;
        juoksee = isKeyDown("shift");
        pelaaja.move(-nopeus, 0); // Vasemmalle
    });
    
    onKeyDown("right", () => {
        const nopeus = isKeyDown("shift") ? juoksuNopeus : perusNopeus;
        juoksee = isKeyDown("shift");
        pelaaja.move(nopeus, 0); // Oikealle
    });
    
    // Mute toggle
    onKeyPress("m", () => {
        vaihdaMykistys();
    });
    
    // Ruoan luominen
    const ruokaSpawni = [
        { sprite: "omena", arvo: 15 },
        { sprite: "sieni", arvo: 10 },
        { sprite: "liha", arvo: 25 },
        { sprite: "vesimeloni", arvo: 20 }
    ];
    
    function luoRuoka() {
        const ruoka = choose(ruokaSpawni);
        // Luo ruokaa laajemmalle alueelle pelaajan ympärille
        const x = pelaaja.pos.x + rand(-800, 800);
        const y = pelaaja.pos.y + rand(-600, 600);
        
        add([
            sprite(ruoka.sprite),
            pos(x, y),
            area(),
            "ruoka",
            {
                arvo: ruoka.arvo,
                tyyppi: ruoka.sprite
            }
        ]);
    }
    
    // Perhosten spawn-systeemi
    function luoPerhonen() {
        const x = pelaaja.pos.x + rand(-600, 600);
        const y = pelaaja.pos.y + rand(-400, 400);
        
        const perhonen = add([
            sprite("perhonen"),
            pos(x, y),
            scale(0.3 + rand(0.2)), // Erikokoisia perhosia
            opacity(0.7),
            area(),
            z(2), // Ruoan yläpuolella
            { defaultOpacity: 0.7 },
            "perhonen",
        ]);
        
        // Lisää custom data perhoselle
        perhonen.lentoKulma = rand(0, Math.PI * 2);
        perhonen.lentoNopeus = rand(20, 40);
        perhonen.aaltoKerroin = rand(0.5, 2);
        perhonen.aikaleima = 0;
        
        // Lisää onUpdate suoraan perhoselle
        perhonen.onUpdate(() => {
            perhonen.aikaleima += 0.1;
            
            // Siniaaltolento
            const aaltoLiike = Math.sin(perhonen.aikaleima * perhonen.aaltoKerroin) * 30;
            
            // Liiku lentokulmaan
            const dx = Math.cos(perhonen.lentoKulma) * perhonen.lentoNopeus;
            const dy = Math.sin(perhonen.lentoKulma) * perhonen.lentoNopeus + aaltoLiike;
            
            perhonen.move(dx, dy);
            
            // Satunnaisesti vaihda suuntaa
            if (rand() < 0.02) {
                perhonen.lentoKulma += rand(-Math.PI/4, Math.PI/4);
            }
            
            // Tuhoudu jos liian kaukana pelaajasta
            const etaisyys = perhonen.pos.dist(pelaaja.pos);
            if (etaisyys > 1000) {
                destroy(perhonen);
            }
        });
        
        return perhonen;
    }
    
    // Luo alkuruokaa pelaajan ympärille (hyvin vähän)
    for (let i = 0; i < 2; i++) {
        luoRuoka();
    }
    
    // Luo muutama perhonen alkuun
    for (let i = 0; i < 3; i++) {
        luoPerhonen();
    }
    
    // Ruoan kerääminen
    pelaaja.onCollide("ruoka", (ruoka) => {
        kyllaisyys = Math.min(100, kyllaisyys + ruoka.arvo);
        // Päivitä palkki
        kyllaisyysPalkki.width = palkinLeveys * (kyllaisyys / 100);
        
        // Näytä mitä kerättiin
        add([
            text("+" + ruoka.arvo + " (" + ruoka.tyyppi + ")", {
                size: 16,
            }),
            pos(ruoka.pos.x, ruoka.pos.y - 30),
            color(0, 255, 0),
            lifespan(1.5),
            z(102), // Varjon ja UI:n päällä
        ]);
        
        destroy(ruoka);
        
        // Harvemmin uutta ruokaa
        if (rand() < 0.6) { // 60% mahdollisuus luoda uutta ruokaa
            luoRuoka();
        }
    });
    
    
    // Ruoan ja taustan siivous ja spawni
    onUpdate(() => {
        // Poista ruoat jotka ovat liian kaukana pelaajasta
        get("ruoka").forEach(ruoka => {
            const etaisyys = Math.sqrt(
                Math.pow(ruoka.pos.x - pelaaja.pos.x, 2) + 
                Math.pow(ruoka.pos.y - pelaaja.pos.y, 2)
            );
            
            // Jos ruoka on yli 1500 pikseliä kaukana, poista se
            if (etaisyys > 1500) {
                destroy(ruoka);
            }
        });
        
        // Poista taustaobjektit jotka ovat liian kaukana
        get("tausta").forEach(tausta => {
            const etaisyys = Math.sqrt(
                Math.pow(tausta.pos.x - pelaaja.pos.x, 2) + 
                Math.pow(tausta.pos.y - pelaaja.pos.y, 2)
            );
            
            // Jos tausta on yli 1000 pikseliä kaukana, poista se
            if (etaisyys > 1000) {
                destroy(tausta);
            }
        });
        
        // Varmista että on aina vähän ruokaa näkyvissä
        const ruokaMaara = get("ruoka").length;
        if (ruokaMaara < 2) {
            // Luo vain yksi ruoka jos kentällä on alle 2
            luoRuoka();
        }
        
        // Varmista että on aina taustaobjekteja näkyvissä
        const taustaMaara = get("tausta").length;
        if (taustaMaara < 8) {
            // Luo ruohoa pelaajan ympärille
            for (let i = 0; i < 3; i++) {
                add([
                    rect(rand(2, 6), rand(8, 15)),
                    pos(pelaaja.pos.x + rand(-600, 600), pelaaja.pos.y + rand(-400, 400)),
                    color(rand(30, 60), rand(70, 100), rand(30, 60)),
                    opacity(0.4),
                    z(-10),
                    { defaultOpacity: 0.4 },
                    "tausta"
                ]);
            }
            
            // Luo kiviä
            for (let i = 0; i < 2; i++) {
                add([
                    circle(rand(4, 10)),
                    pos(pelaaja.pos.x + rand(-700, 700), pelaaja.pos.y + rand(-500, 500)),
                    color(80, 80, 90),
                    opacity(0.3),
                    z(-9),
                    { defaultOpacity: 0.3 },
                    "tausta"
                ]);
            }
        }
        
        // Varmista että on aina perhosia näkyvissä
        const perhosMaara = get("perhonen").length;
        if (perhosMaara < 3 && rand() < 0.02) { // 2% mahdollisuus per frame
            luoPerhonen();
        }
        
        // Varmista että on aina puita näkyvissä
        const puuMaara = get("puu").length;
        if (puuMaara < 5) {
            // Spawn puut näkyvän alueen ulkopuolelle
            const minEtaisyys = 600; // Minimi etäisyys näkyvästä alueesta
            const maxEtaisyys = 1000;
            const etaisyys = rand(minEtaisyys, maxEtaisyys);
            const kulma = rand(0, Math.PI * 2);
            
            add([
                sprite("havupuu"),
                pos(
                    pelaaja.pos.x + Math.cos(kulma) * etaisyys,
                    pelaaja.pos.y + Math.sin(kulma) * etaisyys
                ),
                scale(rand(0.1, 0.3)), // Erikokoisia puita
                opacity(0.9),
                    { defaultOpacity: 0.9 },
                "puu",
            ]);
        }
        
        
        // Poista puut jotka ovat liian kaukana
        get("puu").forEach(puu => {
            const etaisyys = Math.sqrt(
                Math.pow(puu.pos.x - pelaaja.pos.x, 2) + 
                Math.pow(puu.pos.y - pelaaja.pos.y, 2)
            );
            
            if (etaisyys > 1200) {
                destroy(puu);
            }
        });
        
    });
    
    // Haamu-järjestelmä
    let haamuTimer = 0;
    let haamuSpawnAika = rand(120, 300); // 2-5 sekuntia (60fps) - tiheämpi alussa
    
    function luoHaamu() {
        // Luo haamu satunnaiseen paikkaan pelaajan ympärille (kaukana)
        const kulma = rand(0, Math.PI * 2);
        const etaisyys = rand(600, 1000);
        const x = pelaaja.pos.x + Math.cos(kulma) * etaisyys;
        const y = pelaaja.pos.y + Math.sin(kulma) * etaisyys;
        
        // Satunnainen mörkö: nopea vai hitas
        const onNopea = rand() < 0.4; // 40% mahdollisuus nopealle mörölle
        const nopeus = onNopea ? juoksuNopeus : rand(120, 220); // Nopeat = juoksuvauhti, hitaat = 120-220 (nopeammat)
        const koko = onNopea ? rand(1.4, 1.8) : rand(1.5, 2.2); // Nopeat isompia (1.4-1.8), hitaat isompia
        
        const haamu = add([
            sprite("haamu"),
            pos(x, y),
            area(),
            scale(koko),
            "haamu",
            {
                jahtausAika: 0,
                maxJahtausAika: rand(400, 800), // 7-13 sekuntia
                nopeus: nopeus,
                onNopea: onNopea,
                tila: "jahtaa", // "jahtaa" tai "pakenee"
                pakeneeTavoite: null
            }
        ]);
        
        // Haamu jahtaa pelaajaa
        haamu.onUpdate(() => {
            haamu.jahtausAika++;
            
            if (haamu.tila === "jahtaa") {
                // Jos pelaaja ei liiku, mörkö ei kyllästy (pysyy pidempään)
                const kyllastymisBoni = liikkumatonAika > 120 ? 180 : 0; // 3 sekuntia paikallaan = 3 sekuntia lisäaikaa
                
                // Jos jahtausaika on kulunut, ala paeta
                if (haamu.jahtausAika > haamu.maxJahtausAika + kyllastymisBoni) {
                    haamu.tila = "pakenee";
                    // Aseta pakotavoite: vastakkaiseen suuntaan pelaajasta
                    const dx = haamu.pos.x - pelaaja.pos.x;
                    const dy = haamu.pos.y - pelaaja.pos.y;
                    const etaisyysNyt = Math.sqrt(dx * dx + dy * dy);
                    
                    if (etaisyysNyt > 0) {
                        const suunta = { x: dx / etaisyysNyt, y: dy / etaisyysNyt };
                        haamu.pakeneeTavoite = {
                            x: haamu.pos.x + suunta.x * 800,
                            y: haamu.pos.y + suunta.y * 800
                        };
                    }
                    return;
                }
                
                // Jahtaa pelaajaa
                const dx = pelaaja.pos.x - haamu.pos.x;
                const dy = pelaaja.pos.y - haamu.pos.y;
                const etaisyys = Math.sqrt(dx * dx + dy * dy);
                
                if (etaisyys > 10) {
                    haamu.move((dx / etaisyys) * haamu.nopeus, (dy / etaisyys) * haamu.nopeus);
                }
            } else if (haamu.tila === "pakenee" && haamu.pakeneeTavoite) {
                // Pakene pelaajasta
                const dx = haamu.pakeneeTavoite.x - haamu.pos.x;
                const dy = haamu.pakeneeTavoite.y - haamu.pos.y;
                const etaisyys = Math.sqrt(dx * dx + dy * dy);
                
                if (etaisyys > 20) {
                    // Liiku nopeammin pakoon
                    const pakoNopeus = haamu.nopeus * 1.5;
                    haamu.move((dx / etaisyys) * pakoNopeus, (dy / etaisyys) * pakoNopeus);
                } else {
                    // Saavutettu pakotavoite, tuhoudu
                    destroy(haamu);
                }
                
                // Tuhoudu myös jos liian kaukana pelaajasta
                const etaisyysPelaajasta = Math.sqrt(
                    Math.pow(haamu.pos.x - pelaaja.pos.x, 2) + 
                    Math.pow(haamu.pos.y - pelaaja.pos.y, 2)
                );
                if (etaisyysPelaajasta > 1200) {
                    destroy(haamu);
                }
            }
        });
        
        // Soita satunnainen monster-ääni kun haamu ilmestyy
        try {
            const monsterNumber = Math.floor(Math.random() * 10) + 1; // 1-10
            play(`monster-${monsterNumber}`, { volume: onMykistetty ? 0 : 0.3 });
        } catch (e) {
            // Ääni ei latautunut tai toisto epäonnistui
            console.log("Monster-ääni ei toimi:", e);
        }
        
        return haamu;
    }
    
    // Haamu collision - kuolema
    pelaaja.onCollide("haamu", () => {
        if (taustaMusiikki) {
            taustaMusiikki.stop();
            taustaMusiikki = null;
        }
        go("kuolema", { syy: "morkko" });
    });
    
    // Kylläisyyden ja ajan hallinta
    onUpdate(() => {
        // Päivitä aika kompensoituna
        aika += aikaKerroin * aikaKompensaatio;
        if (aika >= 1440) {
            aika = 0;
            paiva++;
            paivaText.text = "Päivä " + paiva;
        }
        
        // Päivitä kellonaika (ei näytetä)
        
        // Päivitä valoisuus ja värisävy joka framella
        const valoisuus = laskeValoisuus(aika);
        varjoKerros.opacity = 1 - valoisuus;
        
        // Päivitä värisävy
        const savy = laskeVarisavy(aika);
        variKerros.color = [savy.r, savy.g, savy.b];
        // Värikerroksen läpinäkyvyys riippuu siitä kuinka paljon väriä tarvitaan
        const variVoimakkuus = 1 - (savy.g / 255); // Mitä vähemmän vihreää, sitä punertavampi
        variKerros.opacity = variVoimakkuus * 0.3; // Max 30% läpinäkyvyys
        
        // Valoympyrä piilotettu toistaiseksi
        /*
        if (valoisuus < 0.5 && !nakyvyysYmpyra) {
            const sade = 150 + valoisuus * 250;
            nakyvyysYmpyra = add([
                circle(sade),
                pos(pelaaja.pos),
                color(255, 220, 150), // Lämmin keltainen valo
                opacity(0.15 * (1 - valoisuus)), // Himmeä valo
                z(101), // Varjon päällä
                "nakyvyys"
            ]);
        } else if (valoisuus >= 0.5 && nakyvyysYmpyra) {
            destroy(nakyvyysYmpyra);
            nakyvyysYmpyra = null;
        }
        
        // Päivitä valoympyrän sijainti ja koko
        if (nakyvyysYmpyra) {
            nakyvyysYmpyra.pos = pelaaja.pos;
            const uusiSade = 150 + valoisuus * 250;
            nakyvyysYmpyra.radius = uusiSade;
            nakyvyysYmpyra.opacity = 0.15 * (1 - valoisuus);
        }
        */
        // Juokseminen kuluttaa paljon enemmän kylläisyyttä
        const kulutus = juoksee ? kyllaisyysVahenee * 6 : kyllaisyysVahenee;
        kyllaisyys -= kulutus;
        
        // Päivitä palkki
        kyllaisyysPalkki.width = Math.max(0, palkinLeveys * (kyllaisyys / 100));
        
        // Palkki pysyy vihreänä (ei tarvitse päivittää, koska väri on jo asetettu)
        
        // Kuolema kylläisyyden loppuessa
        if (kyllaisyys <= 0) {
            if (taustaMusiikki) {
                taustaMusiikki.stop();
                taustaMusiikki = null;
            }
            go("kuolema", { syy: "nalka" });
        }
        
        // Haamu spawni timer - vain yöllä
        const tunti = (aika / 60) % 24;
        const onYo = tunti < 6 || tunti > 18; // Yö on klo 18-06
        
        if (onYo) {
            haamuTimer++;
            if (haamuTimer >= haamuSpawnAika) {
                // Salli useampi haamu, mutta rajoita määrää
                const maxHaamut = Math.min(5, 1 + Math.floor(paiva / 2)); // Max 5, kasvaa päivien myötä
                if (get("haamu").length < maxHaamut) {
                    luoHaamu();
                }
                haamuTimer = 0;
                
                // Nopeutuva spawni: vähenee 20 framella joka kerta, minimi 60 framea (1 sekunti)
                const vahenema = 20;
                const minimiAika = 60; // 1 sekunti
                const uusiAika = Math.max(minimiAika, haamuSpawnAika - vahenema);
                
                // Aseta uusi spawn-aika
                haamuSpawnAika = rand(uusiAika, uusiAika + 180); // Vaihtelua 3 sekuntia
            }
        } else {
            // Päivällä poista kaikki haamut
            get("haamu").forEach(haamu => {
                destroy(haamu);
            });
            haamuTimer = 0;
            // Spawn-aika säilyy samana, ei resetoida
        }
    });
});

// Kuolema scene
scene("kuolema", (data) => {
    let kuolemaViesti = "Kuolit!";
    
    if (data && data.syy === "nalka") {
        kuolemaViesti = "Kuolit nälkään!";
    } else if (data && data.syy === "morkko") {
        kuolemaViesti = "Kuolit mörköön!";
    }
    
    add([
        text(kuolemaViesti, {
            size: 48,
        }),
        pos(width() / 2, height() / 2 - 50),
        anchor("center"),
        color(255, 0, 0),
    ]);
    
    add([
        text("Paina SPACE aloittaaksesi uudestaan", {
            size: 24,
        }),
        pos(width() / 2, height() / 2 + 20),
        anchor("center"),
        color(255, 255, 255),
    ]);
    
    onKeyPress("space", () => {
        go("peli");
    });
});

// Aloita peli
go("peli");
