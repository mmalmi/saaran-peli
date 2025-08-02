import kaboom from 'kaboom'
import beanSprite from '/sprites/bean.png'
import ghostySprite from '/sprites/ghosty.png'
import bgMusicFile from '/sounds/musa.mp3'

// Initialize Kaboom
kaboom({
    width: 800,
    height: 600,
    background: [135, 206, 235], // Sky blue
    gravity: 980,
});

// Load assets using imported URLs
loadSprite("bean", beanSprite);
loadSprite("ghosty", ghostySprite);

// Load sounds
loadSound("bgmusic", bgMusicFile);

// Audio state - load from localStorage
let isMuted = localStorage.getItem('gameAudioMuted') === 'true';
let bgMusic = null;

// Game scene
scene("game", (data) => {
    // Start background music
    if (!bgMusic) {
        bgMusic = play("bgmusic", {
            loop: true,
            volume: isMuted ? 0 : 0.5
        });
    }
    
    // Player info
    let playerName = (data && data.playerName) || "Pelaaja";
    
    // Level system
    let level = (data && data.level) || 1;
    let difficultyMultiplier = 1 + (level - 1) * 0.5; // Each level increases speed by 50%
    
    // Score system
    let score = (data && data.carryScore) || 0;
    const scoreText = add([
        text("Pisteet: " + score, {
            size: 24,
        }),
        pos(20, 20),
        fixed(),
        color(0, 0, 0),
    ]);
    
    const levelText = add([
        text("Taso: " + level, {
            size: 20,
        }),
        pos(width() - 120, 20),
        fixed(),
        color(0, 0, 150),
    ]);
    
    // Speaker icon for mute toggle
    const speakerIcon = add([
        text(isMuted ? "🔇" : "🔊", {
            size: 24,
        }),
        pos(width() - 50, 20),
        fixed(),
        area(),
        color(100, 100, 100),
        "speaker"
    ]);
    
    // Unified mute toggle function
    function toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem('gameAudioMuted', isMuted);
        if (bgMusic) {
            bgMusic.volume = isMuted ? 0 : 0.5;
        }
        speakerIcon.text = isMuted ? "🔇" : "🔊";
    }

    // Speaker icon click handler
    speakerIcon.onClick(() => {
        toggleMute();
    });
    
    const nameText = add([
        text("Pelaaja: " + playerName, {
            size: 18,
        }),
        pos(20, 100),
        fixed(),
        color(100, 50, 150),
    ]);

    function updateScore() {
        score += 10;
        scoreText.text = "Pisteet: " + score;
        
        // Check if reached next 100 point milestone to finish level
        if (score % 100 === 0 && score > 0) {
            spawnGoal();
        }
    }
    
    // Goal spawning
    let goalSpawned = false;
    function spawnGoal() {
        if (!goalSpawned) {
            // Spawn goal flag
            add([
                text("🏁", {
                    size: 60,
                }),
                pos(player.pos.x + 300, height() - 150),
                area(),
                "goal"
            ]);
            
            // Spawn friend waiting at goal
            add([
                sprite("bean"),
                pos(player.pos.x + 350, height() - 100),
                area(),
                "friend",
                "waiting_friend", // Extra tag for easier identification
                {
                    isWaiting: true
                }
            ]);
            
            goalSpawned = true;
            
            // Show goal message
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
    
    // Reset goal when moving to next level
    function resetGoal() {
        goalSpawned = false;
        get("goal").forEach(goal => destroy(goal));
        get("friend").forEach(friend => destroy(friend));
    }

    // Add player
    const player = add([
        sprite("bean"),
        pos(200, 300),
        area(),
        body({ gravityScale: 1 }),
        "player"
    ]);

    // Camera follows player (only when moving right)
    let maxCameraX = 0;
    player.onUpdate(() => {
        if (player.pos.x > maxCameraX) {
            maxCameraX = player.pos.x;
        }
        camPos(maxCameraX, height() / 2);
    });

    // Dynamic terrain generation
    let lastTerrainX = 0;
    let platforms = [];
    
    function generateTerrain() {
        // Generate ground segments with gaps (pits)
        for (let x = lastTerrainX; x < lastTerrainX + 2000; x += 200) {
            // 20% chance to create a pit (skip ground segment)
            if (rand() > 0.2) {
                add([
                    rect(200, 48),
                    pos(x, height() - 48),
                    area(),
                    body({ isStatic: true }),
                    color(127, 200, 25),
                    "terrain"
                ]);
            } else {
                // Create a pit marker for death detection
                add([
                    rect(200, 20),
                    pos(x, height() + 100),
                    area(),
                    color(0, 0, 0, 0), // Invisible
                    "pit"
                ]);
            }
        }
        
        // Generate random platforms
        for (let x = lastTerrainX; x < lastTerrainX + 2000; x += rand(150, 400)) {
            let platform = add([
                rect(rand(100, 250), 20),
                pos(x, rand(200, 450)),
                area(),
                body({ isStatic: true }),
                color(255, 180, 255),
                "platform"
            ]);
            platforms.push(platform);
        }
        
        lastTerrainX += 2000;
    }
    
    // Generate initial terrain
    generateTerrain();

    // Player controls - manual jump
    let jumpPower = 0;
    
    onKeyPress("space", () => {
        jumpPower = 15;
    });

    onKeyPress("up", () => {
        jumpPower = 15;
    });
    
    // Mute toggle
    onKeyPress("m", () => {
        toggleMute();
    });
    
    player.onUpdate(() => {
        if (jumpPower > 0) {
            player.pos.y -= jumpPower;
            jumpPower -= 0.8;
        }
        
        // Manual gravity
        player.pos.y += 4;
        
        // Generate more terrain as player moves right
        if (player.pos.x > lastTerrainX - 1000) {
            generateTerrain();
        }
        
        // Keep player in vertical bounds only (can move horizontally freely)
        if (player.pos.y < 0) {
            player.pos.y = 0;
            jumpPower = 0;
        }
        
        // Check for ground collision and pit detection
        let onGround = false;
        get("terrain").forEach(terrain => {
            if (player.pos.x >= terrain.pos.x && 
                player.pos.x <= terrain.pos.x + 200 &&
                player.pos.y >= terrain.pos.y - 48 &&
                player.pos.y <= terrain.pos.y + 10) {
                onGround = true;
                player.pos.y = terrain.pos.y - 48; // Stop on ground
            }
        });
        
        // Check platform collision too
        get("platform").forEach(platform => {
            if (player.pos.x >= platform.pos.x && 
                player.pos.x <= platform.pos.x + platform.width &&
                player.pos.y >= platform.pos.y - 48 &&
                player.pos.y <= platform.pos.y + 10) {
                onGround = true;
                player.pos.y = platform.pos.y - 48; // Stop on platform
            }
        });
        
        // If fallen too far and no ground, died in pit
        if (player.pos.y > height() - 20 && !onGround) {
            go("gameOver", { finalScore: score, deathReason: "Putosit kuoppaan!" });
        }
        
        // Clean up old terrain behind player
        get("terrain").forEach(terrain => {
            if (terrain.pos.x < player.pos.x - 1000) {
                destroy(terrain);
            }
        });
        
        get("platform").forEach(platform => {
            if (platform.pos.x < player.pos.x - 1000) {
                destroy(platform);
            }
        });
        
        get("pit").forEach(pit => {
            if (pit.pos.x < player.pos.x - 1000) {
                destroy(pit);
            }
        });
        
        // Check if current cake is too far behind, spawn new one
        if (currentCake && currentCake.pos.x < player.pos.x - 800) {
            destroy(currentCake);
            currentCake = spawnCake();
        }
    });

    onKeyDown("left", () => {
        // Prevent moving left beyond camera view
        if (player.pos.x > maxCameraX - width()/2 + 50) {
            player.move(-200, 0);
        }
    });

    onKeyDown("right", () => {
        player.move(200, 0);
    });

    // Dynamic enemy spawning system
    let enemies = [];
    let lastEnemySpawn = 0;
    
    function spawnEnemy() {
        let baseSpeed = rand(40, 100);
        let enemy = add([
            sprite("ghosty"),
            pos(player.pos.x + rand(400, 800), rand(200, 400)),
            area(),
            body(),
            "enemy",
            {
                dirX: choose([-1, 1]),
                dirY: choose([-1, 0, 1]),
                speed: baseSpeed * difficultyMultiplier, // Speed increases with level
                followPlayer: rand() < 0.3, // 30% chance to follow player
            }
        ]);
        
        enemy.onUpdate(() => {
            if (enemy.followPlayer) {
                // Follow player slowly
                let dx = player.pos.x - enemy.pos.x;
                let dy = player.pos.y - enemy.pos.y;
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
    player.onUpdate(() => {
        // Spawn new enemies as player progresses
        if (player.pos.x > lastEnemySpawn + 300) {
            spawnEnemy();
            lastEnemySpawn = player.pos.x;
        }
        
        // Clean up enemies that are too far behind
        enemies = enemies.filter(enemy => {
            if (enemy.pos.x < player.pos.x - 1200) {
                destroy(enemy);
                return false;
            }
            return true;
        });
    });

    // Game over on collision with enemy
    player.onCollide("enemy", () => {
        go("gameOver", { finalScore: score, deathReason: "Törmäsit haamuun!" });
    });
    
    // Goal collision - next level
    player.onCollide("goal", () => {
        console.log("Player reached goal!");
        
        // When reaching goal, friend automatically thanks
        let friends = get("waiting_friend");
        console.log("Found friends:", friends.length);
        
        if (friends.length > 0) {
            let friend = friends[0];
            console.log("Friend found, isWaiting:", friend.isWaiting);
            
            if (friend.isWaiting) {
                console.log("Friend is thanking!");
                // Friend thanks
                add([
                    text("Kiitos että pelastit minut!", {
                        size: 24,
                    }),
                    pos(friend.pos.x, friend.pos.y - 60),
                    color(0, 150, 200),
                    lifespan(3),
                    fixed(),
                ]);
                
                // Make friend walk away
                friend.isWaiting = false;
                friend.onUpdate(() => {
                    friend.move(100, 0); // Walk to the right
                    if (friend.pos.x > player.pos.x + 1000) {
                        destroy(friend); // Remove when far away
                    }
                });
            }
        } else {
            console.log("No friends found at goal");
        }
        
        // Small delay before going to next level so player can see the thanks
        wait(1, () => {
            go("nextLevel", { finalScore: score, level: level, playerName: playerName });
        });
    });

    // Spawn new cake function
    function spawnCake() {
        return add([
            text("🎂", {
                size: 40,
            }),
            pos(player.pos.x + rand(300, 600), rand(100, 300)),
            area(),
            "cake"
        ]);
    }

    // Initial cake
    let currentCake = spawnCake();

    // Cake collection
    player.onCollide("cake", (cake) => {
        destroy(cake);
        updateScore();
        
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
        } catch (e) {
            // Sound failed, text effect is enough
        }
        
        // Spawn new cake after short delay
        wait(0.5, () => {
            currentCake = spawnCake();
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
scene("gameOver", (data) => {
    add([
        text("Peli päättyi!", {
            size: 48,
        }),
        pos(width() / 2, height() / 2 - 100),
        anchor("center"),
        color(255, 0, 0),
    ]);
    
    add([
        text(data.deathReason || "Kuolit!", {
            size: 28,
        }),
        pos(width() / 2, height() / 2 - 50),
        anchor("center"),
        color(255, 100, 0),
    ]);
    
    add([
        text("Lopulliset pisteet: " + (data.finalScore || 0), {
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
        go("nameInput");
    });
});

// Next level scene
scene("nextLevel", (data) => {
    add([
        text("Taso läpäisty!", {
            size: 48,
        }),
        pos(width() / 2, height() / 2 - 80),
        anchor("center"),
        color(0, 200, 0),
    ]);
    
    add([
        text("Pisteet: " + (data.finalScore || 0), {
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
            level: (data.level || 1) + 1, 
            carryScore: data.finalScore || 0,
            playerName: data.playerName || "Pelaaja"
        });
    });
});

// Load last used name from localStorage
let lastPlayerName = localStorage.getItem("saaranPeliPlayerName") || "";

// Name input scene
scene("nameInput", () => {
    let playerName = lastPlayerName; // Start with last used name
    
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
        text(playerName || "_", {
            size: 32,
        }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        color(0, 150, 0),
    ]);
    
    add([
        text(lastPlayerName ? "Paina ENTER/VÄLILYÖNTI aloittaaksesi tai muokkaa nimeä" : "Paina ENTER/VÄLILYÖNTI aloittaaksesi", {
            size: 16,
        }),
        pos(width() / 2, height() / 2 + 60),
        anchor("center"),
        color(100, 100, 100),
    ]);
    
    // Handle text input
    onCharInput((ch) => {
        if (playerName.length < 12) { // Max 12 characters
            playerName += ch;
            nameDisplay.text = playerName || "_";
        }
    });
    
    // Handle backspace
    onKeyPress("backspace", () => {
        if (playerName.length > 0) {
            playerName = playerName.slice(0, -1);
            nameDisplay.text = playerName || "_";
        }
    });
    
    // Start game
    function startGame() {
        if (playerName.trim() === "") {
            playerName = "Pelaaja";
        }
        lastPlayerName = playerName; // Remember this name for next time
        localStorage.setItem("saaranPeliPlayerName", playerName); // Save to localStorage
        go("game", { playerName: playerName });
    }
    
    onKeyPress("enter", () => {
        startGame();
    });
    
    onKeyPress("space", () => {
        startGame();
    });
});

// Start with name input
go("nameInput");