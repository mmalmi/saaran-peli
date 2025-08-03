import kaboom from 'kaboom'
import beanSprite from './src/sprites/bean.png'
import ghostySprite from './src/sprites/ghosty.png'

// Alusta Kaboom
kaboom({
    width: 800,
    height: 600,
    background: [135, 206, 235], // Taivaansininen
    gravity: 2500,
});

// Lataa resurssit käyttäen tuotuja URL-osoitteita
loadSprite("bean", beanSprite);
loadSprite("ghosty", ghostySprite);

// Lataa äänet
loadSound("bgmusic", "sounds/musa.mp3");

// Äänitila - lataa localStoragesta
let onMykistetty = localStorage.getItem('gameAudioMuted') === 'true';
let taustaMusiikki = null;

// Peliskene
scene("game", (data) => {
    // Käynnistä taustamusiikki
    if (!taustaMusiikki) {
        taustaMusiikki = play("bgmusic", {
            loop: true,
            volume: onMykistetty ? 0 : 0.5
        });
    }
    
    // Pelaajan tiedot
    let pelaajanNimi = (data && data.pelaajanNimi) || "Pelaaja";
    
    // Tasojärjestelmä
    let taso = (data && data.taso) || 1;
    let vaikeuskerroin = 1 + (taso - 1) * 0.5; // Jokainen taso lisää nopeutta 50%
    
    // Pisteytys
    let pisteet = (data && data.siirrettavatPisteet) || 0;
    const pisteTeksti = add([
        text("Pisteet: " + pisteet, {
            size: 24,
        }),
        pos(20, 20),
        fixed(),
        color(0, 0, 0),
    ]);
    
    add([
        text("Taso: " + taso, {
            size: 20,
        }),
        pos(width() - 120, 20),
        fixed(),
        color(0, 0, 150),
    ]);
    
    // Kaiutinkuvake äänen kytkemiseen
    const kaiutinKuvake = add([
        text(onMykistetty ? "🔇" : "🔊", {
            size: 24,
        }),
        pos(width() - 160, 20),
        fixed(),
        area(),
        color(100, 100, 100),
        "kaiutin"
    ]);
    
    // Yhtenäinen äänen kytkemisfunktio
    function vaihdaMykistys() {
        onMykistetty = !onMykistetty;
        localStorage.setItem('gameAudioMuted', onMykistetty);
        if (taustaMusiikki) {
            taustaMusiikki.volume = onMykistetty ? 0 : 0.5;
        }
        kaiutinKuvake.text = onMykistetty ? "🔇" : "🔊";
    }

    // Kaiutinkuvakkeen klikkauksen käsittelijä
    kaiutinKuvake.onClick(() => {
        vaihdaMykistys();
    });
    
    add([
        text("Pelaaja: " + pelaajanNimi, {
            size: 18,
        }),
        pos(20, 100),
        fixed(),
        color(100, 50, 150),
    ]);

    function paivitaPisteet() {
        pisteet += 10;
        pisteTeksti.text = "Pisteet: " + pisteet;
        
        // Tarkista onko saavutettu seuraava 100 pisteen raja tason loppumiseksi
        if (pisteet % 100 === 0 && pisteet > 0) {
            luoMaali();
        }
    }
    
    // Maalin luominen
    let maaliLuotu = false;
    function luoMaali() {
        if (!maaliLuotu) {
            // Luo maalilippu
            add([
                text("🏁", {
                    size: 60,
                }),
                pos(pelaaja.pos.x + 300, height() - 150),
                area(),
                "maali"
            ]);
            
            // Luo kaveri odottamaan maaliin
            add([
                sprite("bean"),
                pos(pelaaja.pos.x + 350, height() - 100),
                area(),
                "kaveri",
                "odottava_kaveri", // Lisätagi helpompaan tunnistukseen
                {
                    odottaa: true
                }
            ]);
            
            maaliLuotu = true;
            
            // Näytä maaliviesti
            add([
                text("MAALI ILMESTYI! 🏁", {
                    size: 24,
                }),
                pos(width() / 2, 100),
                anchor("center"),
                fixed(),
                color(0, 200, 0),
                lifespan(3),
            ]);
        }
    }
    

    // Lisää pelaaja
    const pelaaja = add([
        sprite("bean"),
        pos(200, 300),
        area(),
        body({ gravityScale: 1 }),
        "pelaaja"
    ]);

    // Kamera seuraa pelaajaa (vain liikuttaessa oikealle)
    let maxKameraX = 0;
    pelaaja.onUpdate(() => {
        if (pelaaja.pos.x > maxKameraX) {
            maxKameraX = pelaaja.pos.x;
        }
        camPos(maxKameraX, height() / 2);
    });

    // Dynamic terrain generation
    let viimeinenMaastoX = 0;
    let alustat = [];
    
    function luoMaasto() {
        // Generate ground segments with gaps (pits)
        for (let x = viimeinenMaastoX; x < viimeinenMaastoX + 2000; x += 200) {
            // 20% chance to create a pit (skip ground segment)
            if (rand() > 0.2) {
                add([
                    rect(200, 48),
                    pos(x, height() - 48),
                    area(),
                    body({ isStatic: true }),
                    color(127, 200, 25),
                    "maasto"
                ]);
            } else {
                // Create a pit marker for death detection
                add([
                    rect(200, 20),
                    pos(x, height() + 100),
                    area(),
                    color(0, 0, 0, 0), // Invisible
                    "kuoppa"
                ]);
            }
        }
        
        // Generate random alustat
        for (let x = viimeinenMaastoX; x < viimeinenMaastoX + 2000; x += rand(150, 400)) {
            let alusta = add([
                rect(rand(100, 250), 20),
                pos(x, rand(200, 450)),
                area(),
                body({ isStatic: true }),
                color(255, 180, 255),
                "alusta"
            ]);
            alustat.push(alusta);
        }
        
        viimeinenMaastoX += 2000;
    }
    
    // Generate initial terrain
    luoMaasto();

    // Player controls - manual jump
    let hyppyVoima = 0;
    
    onKeyPress("space", () => {
        hyppyVoima = 15;
    });

    onKeyPress("up", () => {
        hyppyVoima = 15;
    });
    
    // Mute toggle
    onKeyPress("m", () => {
        vaihdaMykistys();
    });
    
    pelaaja.onUpdate(() => {
        if (hyppyVoima > 0) {
            pelaaja.pos.y -= hyppyVoima;
            hyppyVoima -= 0.8;
        }
        
        // Manual gravity
        pelaaja.pos.y += 4;
        
        // Generate more terrain as pelaaja moves right
        if (pelaaja.pos.x > viimeinenMaastoX - 1000) {
            luoMaasto();
        }
        
        // Keep pelaaja in vertical bounds only (can move horizontally freely)
        if (pelaaja.pos.y < 0) {
            pelaaja.pos.y = 0;
            hyppyVoima = 0;
        }
        
        // Check for ground collision and pit detection
        let onGround = false;
        get("maasto").forEach(terrain => {
            if (pelaaja.pos.x >= terrain.pos.x && 
                pelaaja.pos.x <= terrain.pos.x + 200 &&
                pelaaja.pos.y >= terrain.pos.y - 48 &&
                pelaaja.pos.y <= terrain.pos.y + 10) {
                onGround = true;
                pelaaja.pos.y = terrain.pos.y - 48; // Stop on ground
            }
        });
        
        // Check alusta collision too
        get("alusta").forEach(alusta => {
            if (pelaaja.pos.x >= alusta.pos.x && 
                pelaaja.pos.x <= alusta.pos.x + alusta.width &&
                pelaaja.pos.y >= alusta.pos.y - 48 &&
                pelaaja.pos.y <= alusta.pos.y + 10) {
                onGround = true;
                pelaaja.pos.y = alusta.pos.y - 48; // Stop on alusta
            }
        });
        
        // If fallen too far and no ground, died in pit
        if (pelaaja.pos.y > height() - 20 && !onGround) {
            go("peliLoppu", { lopullisetPisteet: pisteet, kuolinsyy: "Putosit kuoppaan!" });
        }
        
        // Clean up old terrain behind pelaaja
        get("maasto").forEach(terrain => {
            if (terrain.pos.x < pelaaja.pos.x - 1000) {
                destroy(terrain);
            }
        });
        
        get("alusta").forEach(alusta => {
            if (alusta.pos.x < pelaaja.pos.x - 1000) {
                destroy(alusta);
            }
        });
        
        get("kuoppa").forEach(pit => {
            if (pit.pos.x < pelaaja.pos.x - 1000) {
                destroy(pit);
            }
        });
        
        // Check if current cake is too far behind, spawn new one
        if (nykyinenKakku && nykyinenKakku.pos.x < pelaaja.pos.x - 800) {
            destroy(nykyinenKakku);
            nykyinenKakku = luoKakku();
        }
    });

    onKeyDown("left", () => {
        // Prevent moving left beyond camera view
        if (pelaaja.pos.x > maxKameraX - width()/2 + 50) {
            pelaaja.move(-200, 0);
        }
    });

    onKeyDown("right", () => {
        pelaaja.move(200, 0);
    });

    // Dynamic enemy spawning system
    let enemies = [];
    let lastEnemySpawn = 0;
    
    function spawnEnemy() {
        let baseSpeed = rand(40, 100);
        let enemy = add([
            sprite("ghosty"),
            pos(pelaaja.pos.x + rand(400, 800), rand(200, 400)),
            area(),
            body(),
            "vihollinen",
            {
                dirX: choose([-1, 1]),
                dirY: choose([-1, 0, 1]),
                speed: baseSpeed * vaikeuskerroin, // Speed increases with level
                followPlayer: rand() < 0.3, // 30% chance to follow pelaaja
            }
        ]);
        
        enemy.onUpdate(() => {
            if (enemy.followPlayer) {
                // Follow pelaaja slowly
                let dx = pelaaja.pos.x - enemy.pos.x;
                let dy = pelaaja.pos.y - enemy.pos.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 50) {
                    enemy.move((dx/dist) * enemy.speed * 0.5, (dy/dist) * enemy.speed * 0.3);
                }
            } else {
                // Random movement
                enemy.move(enemy.dirX * enemy.speed, enemy.dirY * enemy.speed * 0.5);
                
                // Bounce off boundaries
                if (enemy.pos.y > 500 || enemy.pos.y < 150) {
                    enemy.dirY *= -1;
                }
                
                // Random direction change
                if (rand() < 0.01) {
                    enemy.dirX = choose([-1, 1]);
                    enemy.dirY = choose([-1, 0, 1]);
                }
            }
        });
        
        enemies.push(enemy);
        return enemy;
    }
    
    // Spawn initial enemies
    for (let i = 0; i < 3; i++) {
        spawnEnemy();
    }
    
    // Enemy management
    pelaaja.onUpdate(() => {
        // Spawn new enemies as pelaaja progresses
        if (pelaaja.pos.x > lastEnemySpawn + 300) {
            spawnEnemy();
            lastEnemySpawn = pelaaja.pos.x;
        }
        
        // Clean up enemies that are too far behind
        enemies = enemies.filter(enemy => {
            if (enemy.pos.x < pelaaja.pos.x - 1200) {
                destroy(enemy);
                return false;
            }
            return true;
        });
    });

    // Game over on collision with enemy
    pelaaja.onCollide("vihollinen", () => {
        go("peliLoppu", { lopullisetPisteet: pisteet, kuolinsyy: "Törmäsit haamuun!" });
    });
    
    // Goal collision - next level
    pelaaja.onCollide("maali", () => {
        console.log("Player reached maali!");
        
        // When reaching maali, kaveri automatically thanks
        let kaveris = get("waiting_kaveri");
        console.log("Found kaveris:", kaveris.length);
        
        if (kaveris.length > 0) {
            let kaveri = kaveris[0];
            console.log("Friend found, isWaiting:", kaveri.isWaiting);
            
            if (kaveri.isWaiting) {
                console.log("Friend is thanking!");
                // Friend thanks
                add([
                    text("Kiitos että pelastit minut!", {
                        size: 24,
                    }),
                    pos(kaveri.pos.x, kaveri.pos.y - 60),
                    color(0, 150, 200),
                    lifespan(3),
                    fixed(),
                ]);
                
                // Make kaveri walk away
                kaveri.isWaiting = false;
                kaveri.onUpdate(() => {
                    kaveri.move(100, 0); // Walk to the right
                    if (kaveri.pos.x > pelaaja.pos.x + 1000) {
                        destroy(kaveri); // Remove when far away
                    }
                });
            }
        } else {
            console.log("No kaveris found at maali");
        }
        
        // Small delay before going to next level so pelaaja can see the thanks
        wait(1, () => {
            go("seuraavaTaso", { lopullisetPisteet: pisteet, taso: taso, pelaajanNimi: pelaajanNimi });
        });
    });

    // Spawn new cake function
    function luoKakku() {
        return add([
            text("🎂", {
                size: 40,
            }),
            pos(pelaaja.pos.x + rand(300, 600), rand(100, 300)),
            area(),
            "kakku"
        ]);
    }

    // Initial cake
    let nykyinenKakku = luoKakku();

    // Cake collection
    pelaaja.onCollide("kakku", (cake) => {
        destroy(cake);
        paivitaPisteet();
        
        // Create "nam nam" text effect and sound
        add([
            text("NAM NAM!", {
                size: 32,
            }),
            pos(cake.pos.x, cake.pos.y - 50),
            color(0, 200, 0),
            lifespan(1.5),
        ]);
        
        // Try to play sound - fallback to text if sound fails
        try {
            play("chomp");
        } catch {
            // Sound failed, text effect is enough
        }
        
        // Spawn new cake after short delay
        wait(0.5, () => {
            nykyinenKakku = luoKakku();
        });
    });

    // Add instructions
    add([
        text("NUOLET liikkumiseen, YLÖS/VÄLILYÖNTI hyppimiseen!", {
            size: 16,
        }),
        pos(20, 50),
        fixed(),
        color(0, 0, 0),
    ]);

    add([
        text("Kerää kakkuja! Vältä haamuja ja kuoppia! Hyppele alustoille!", {
            size: 14,
        }),
        pos(20, 70),
        fixed(),
        color(255, 0, 0),
    ]);
});

// Game over scene
scene("peliLoppu", (data) => {
    add([
        text("Peli päättyi!", {
            size: 48,
        }),
        pos(width() / 2, height() / 2 - 100),
        anchor("center"),
        color(255, 0, 0),
    ]);
    
    add([
        text(data.kuolinsyy || "Kuolit!", {
            size: 28,
        }),
        pos(width() / 2, height() / 2 - 50),
        anchor("center"),
        color(255, 100, 0),
    ]);
    
    add([
        text("Lopulliset pisteet: " + (data.lopullisetPisteet || 0), {
            size: 32,
        }),
        pos(width() / 2, height() / 2 - 10),
        anchor("center"),
        color(0, 150, 0),
    ]);
    
    add([
        text("Paina VÄLILYÖNTI aloittaaksesi uudestaan", {
            size: 24,
        }),
        pos(width() / 2, height() / 2 + 50),
        anchor("center"),
        color(0, 0, 0),
    ]);
    
    onKeyPress("space", () => {
        go("nimenSyotto");
    });
});

// Next level scene
scene("seuraavaTaso", (data) => {
    add([
        text("Taso läpäisty!", {
            size: 48,
        }),
        pos(width() / 2, height() / 2 - 80),
        anchor("center"),
        color(0, 200, 0),
    ]);
    
    add([
        text("Pisteet: " + (data.lopullisetPisteet || 0), {
            size: 32,
        }),
        pos(width() / 2, height() / 2 - 20),
        anchor("center"),
        color(0, 150, 0),
    ]);
    
    add([
        text("Seuraava taso on vaikeampi!", {
            size: 24,
        }),
        pos(width() / 2, height() / 2 + 20),
        anchor("center"),
        color(255, 100, 0),
    ]);
    
    add([
        text("Paina VÄLILYÖNTI jatkaaksesi", {
            size: 20,
        }),
        pos(width() / 2, height() / 2 + 60),
        anchor("center"),
        color(0, 0, 0),
    ]);
    
    onKeyPress("space", () => {
        go("game", { 
            level: (data.taso || 1) + 1, 
            siirrettavatPisteet: data.lopullisetPisteet || 0,
            pelaajanNimi: data.pelaajanNimi || "Pelaaja"
        });
    });
});

// Load last used name from localStorage
let edellinenPelaajanNimi = localStorage.getItem("saaranPeliPlayerName") || "";

// Name input scene
scene("nimenSyotto", () => {
    let pelaajanNimi = edellinenPelaajanNimi; // Start with last used name
    
    add([
        text("Saaran Peli", {
            size: 48,
        }),
        pos(width() / 2, height() / 2 - 120),
        anchor("center"),
        color(0, 100, 200),
    ]);
    
    add([
        text("Kirjoita hahmon nimi:", {
            size: 24,
        }),
        pos(width() / 2, height() / 2 - 40),
        anchor("center"),
        color(0, 0, 0),
    ]);
    
    const nameDisplay = add([
        text(pelaajanNimi || "_", {
            size: 32,
        }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        color(0, 150, 0),
    ]);
    
    add([
        text(edellinenPelaajanNimi ? "Paina ENTER/VÄLILYÖNTI aloittaaksesi tai muokkaa nimeä" : "Paina ENTER/VÄLILYÖNTI aloittaaksesi", {
            size: 16,
        }),
        pos(width() / 2, height() / 2 + 60),
        anchor("center"),
        color(100, 100, 100),
    ]);
    
    // Handle text input
    onCharInput((ch) => {
        if (pelaajanNimi.length < 12) { // Max 12 characters
            pelaajanNimi += ch;
            nameDisplay.text = pelaajanNimi || "_";
        }
    });
    
    // Handle backspace
    onKeyPress("backspace", () => {
        if (pelaajanNimi.length > 0) {
            pelaajanNimi = pelaajanNimi.slice(0, -1);
            nameDisplay.text = pelaajanNimi || "_";
        }
    });
    
    // Start game
    function startGame() {
        if (pelaajanNimi.trim() === "") {
            pelaajanNimi = "Pelaaja";
        }
        edellinenPelaajanNimi = pelaajanNimi; // Remember this name for next time
        localStorage.setItem("saaranPeliPlayerName", pelaajanNimi); // Save to localStorage
        go("game", { pelaajanNimi: pelaajanNimi });
    }
    
    onKeyPress("enter", () => {
        startGame();
    });
    
    onKeyPress("space", () => {
        startGame();
    });
});

// Start with name input
go("nimenSyotto");
