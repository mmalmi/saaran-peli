import kaboom from 'kaboom'

// Alusta Kaboom
kaboom({
    width: 800,
    height: 600,
    background: [50, 50, 50], // Tumma tausta
    gravity: 0, // Ei gravitya tässä pelissä
});

// Ihmissimulaattori peli - tulossa pian!
scene("main", () => {
    add([
        text("Ihmissimulaattori", {
            size: 48,
        }),
        pos(width() / 2, height() / 2 - 50),
        anchor("center"),
        color(255, 255, 255),
    ]);
    
    add([
        text("Tulossa pian...", {
            size: 24,
        }),
        pos(width() / 2, height() / 2 + 20),
        anchor("center"),
        color(200, 200, 200),
    ]);
});

// Aloita peli
go("main");