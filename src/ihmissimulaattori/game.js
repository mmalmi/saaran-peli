import kaboom from 'kaboom'
import jacobSprite from './sprites/ukkeli.png'
import appleSprite from './sprites/apple.png'
import meatSprite from './sprites/meat.png'
import mushroomSprite from './sprites/mushroom.png'
import watermelonSprite from './sprites/watermelon.png'

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
        text("Nuolinäppäimet = liikkuminen", {
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
    
    // Kamera seuraa pelaajaa ja keskittää sen ruutuun
    pelaaja.onUpdate(() => {
        camPos(pelaaja.pos.x, pelaaja.pos.y);
    });
    
    // Liikkuminen (isometrinen/yläviisto tyyli)
    const nopeus = 200;
    
    onKeyDown("up", () => {
        pelaaja.move(0, -nopeus); // Ylös
    });
    
    onKeyDown("down", () => {
        pelaaja.move(0, nopeus); // Alas
    });
    
    onKeyDown("left", () => {
        pelaaja.move(-nopeus, 0); // Vasemmalle
    });
    
    onKeyDown("right", () => {
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
    
    // Luo alkuruokaa pelaajan ympärille (vähemmän)
    for (let i = 0; i < 5; i++) {
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
        
        // Luo uutta ruokaa (useampi kerralla)
        for (let i = 0; i < 2; i++) {
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
        
        // Varmista että on aina tarpeeksi ruokaa näkyvissä
        const ruokaMaara = get("ruoka").length;
        if (ruokaMaara < 8) {
            // Luo lisää ruokaa jos on liian vähän
            for (let i = 0; i < 3; i++) {
                luoRuoka();
            }
        }
    });
    
    // Kylläisyyden hallinta
    onUpdate(() => {
        kyllaisyys -= kyllaisyysVahenee;
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
            go("kuolema");
        }
    });
});

// Kuolema scene
scene("kuolema", () => {
    add([
        text("Kuolit nälkään!", {
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
