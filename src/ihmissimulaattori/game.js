import kaboom from 'kaboom'
import jacobSprite from './sprites/ukkeli.png'
import appleSprite from './sprites/apple.png'
import meatSprite from './sprites/meat.png'
import mushroomSprite from './sprites/mushroom.png'
import watermelonSprite from './sprites/watermelon.png'
import ghostySprite from './sprites/ghosty.png'

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

// Pääpeli
scene("peli", () => {
    // Kylläisyysjärjestelmä
    let kyllaisyys = 100; // 0-100, kuolee jos 0
    let kyllaisyysVahenee = 0.03; // per frame (hitaampi)
    
    // UI
    const kyllaisyysText = add([
        text("Kylläisyys: " + Math.floor(kyllaisyys), {
            size: 24,
        }),
        pos(20, 20),
        fixed(),
        color(255, 255, 255),
    ]);
    
    add([
        text("Kerää ruokaa selviytyäksesi!", {
            size: 18,
        }),
        pos(20, 50),
        fixed(),
        color(200, 200, 200),
    ]);
    
    add([
        text("Nuolinäppäimet = liikkuminen, Shift = juoksu", {
            size: 16,
        }),
        pos(20, height() - 40),
        fixed(),
        color(150, 150, 150),
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
    
    // Luo alkuruokaa pelaajan ympärille (hyvin vähän)
    for (let i = 0; i < 2; i++) {
        luoRuoka();
    }
    
    // Ruoan kerääminen
    pelaaja.onCollide("ruoka", (ruoka) => {
        kyllaisyys = Math.min(100, kyllaisyys + ruoka.arvo);
        kyllaisyysText.text = "Kylläisyys: " + Math.floor(kyllaisyys);
        
        // Näytä mitä kerättiin
        add([
            text("+" + ruoka.arvo + " (" + ruoka.tyyppi + ")", {
                size: 16,
            }),
            pos(ruoka.pos.x, ruoka.pos.y - 30),
            color(0, 255, 0),
            lifespan(1.5),
        ]);
        
        destroy(ruoka);
        
        // Harvemmin uutta ruokaa
        if (rand() < 0.6) { // 60% mahdollisuus luoda uutta ruokaa
            luoRuoka();
        }
    });
    
    // Ruoan siivous ja spawni
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
        
        // Varmista että on aina vähän ruokaa näkyvissä
        const ruokaMaara = get("ruoka").length;
        if (ruokaMaara < 2) {
            // Luo vain yksi ruoka jos kentällä on alle 2
            luoRuoka();
        }
    });
    
    // Haamu-järjestelmä
    let haamuTimer = 0;
    let haamuSpawnAika = rand(300, 900); // 5-15 sekuntia (60fps)
    
    function luoHaamu() {
        // Luo haamu satunnaiseen paikkaan pelaajan ympärille (kaukana)
        const kulma = rand(0, Math.PI * 2);
        const etaisyys = rand(600, 1000);
        const x = pelaaja.pos.x + Math.cos(kulma) * etaisyys;
        const y = pelaaja.pos.y + Math.sin(kulma) * etaisyys;
        
        // Satunnainen mörkö: nopea vai hidas
        const onNopea = rand() < 0.4; // 40% mahdollisuus nopealle mörölle
        const nopeus = onNopea ? juoksuNopeus : rand(80, 180); // Nopeat = juoksuvauhti, hitaat = 80-180
        const koko = onNopea ? 1.2 : rand(1.5, 2.2); // Nopeat keskikokoiset, hitaat isompia
        
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
        
        return haamu;
    }
    
    // Haamu collision - kuolema
    pelaaja.onCollide("haamu", () => {
        go("kuolema", { syy: "morkko" });
    });
    
    // Kylläisyyden hallinta
    onUpdate(() => {
        // Juokseminen kuluttaa paljon enemmän kylläisyyttä
        const kulutus = juoksee ? kyllaisyysVahenee * 6 : kyllaisyysVahenee;
        kyllaisyys -= kulutus;
        kyllaisyysText.text = "Kylläisyys: " + Math.floor(kyllaisyys);
        
        // Kylläisyyden värin muutos
        if (kyllaisyys > 60) {
            kyllaisyysText.color = [0, 255, 0]; // Vihreä
        } else if (kyllaisyys > 30) {
            kyllaisyysText.color = [255, 255, 0]; // Keltainen
        } else {
            kyllaisyysText.color = [255, 0, 0]; // Punainen
        }
        
        // Kuolema kylläisyyden loppuessa
        if (kyllaisyys <= 0) {
            go("kuolema", { syy: "nalka" });
        }
        
        // Haamu spawni timer
        haamuTimer++;
        if (haamuTimer >= haamuSpawnAika) {
            // Varmista että ei ole jo haamua kentällä
            if (get("haamu").length === 0) {
                luoHaamu();
            }
            haamuTimer = 0;
            haamuSpawnAika = rand(300, 900); // Seuraava spawni 5-15 sekunnin päästä
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
