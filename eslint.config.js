import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                // Kaboom.js globals
                kaboom: "readonly",
                loadSprite: "readonly",
                loadSound: "readonly",
                scene: "readonly",
                go: "readonly",
                add: "readonly",
                text: "readonly",
                pos: "readonly",
                area: "readonly",
                body: "readonly",
                sprite: "readonly",
                rect: "readonly",
                color: "readonly",
                fixed: "readonly",
                anchor: "readonly",
                lifespan: "readonly",
                onKeyPress: "readonly",
                onKeyDown: "readonly",
                onCharInput: "readonly",
                onClick: "readonly",
                onUpdate: "readonly",
                onCollide: "readonly",
                get: "readonly",
                destroy: "readonly",
                play: "readonly",
                wait: "readonly",
                camPos: "readonly",
                width: "readonly",
                height: "readonly",
                rand: "readonly",
                choose: "readonly",
                opacity: "readonly",
                z: "readonly",
                circle: "readonly",
                scale: "readonly",
                isKeyDown: "readonly",
                // Browser globals
                localStorage: "readonly",
                console: "readonly"
            }
        }
    }
];