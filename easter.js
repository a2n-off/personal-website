document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".easterEgg").forEach((element) => {
        element.addEventListener("click", (event) => {
            const emoji = event.currentTarget.getAttribute("emoji");
            const rect = event.currentTarget.getBoundingClientRect();
            startEmojiFountain(emoji, rect);
        });
    });

    function startEmojiFountain(emoji, rect) {
        // Create and style the container dynamically
        const container = document.createElement("div");
        container.id = "emoji-container";
        container.style.position = "fixed";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.top = "0px";
        container.style.left = "0px";
        container.style.zIndex = "9999";
        document.body.appendChild(container);

        // Three.js setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const emojis = [];
        const emojiTexture = createEmojiTexture(emoji);
        const emojiGeometry = new THREE.PlaneGeometry(1, 1);
        const emojiMaterial = new THREE.MeshBasicMaterial({
            map: emojiTexture,
            transparent: true,
        });

        // Calculate the initial position
        const initialX = (rect.left + rect.right) / 2 - window.innerWidth / 2;
        const initialY = -(window.innerHeight - rect.top);

        for (let i = 0; i < 100; i++) {
            const emojiMesh = new THREE.Mesh(emojiGeometry, emojiMaterial);
            emojiMesh.position.set(initialX / 50, initialY / 50, 0);
            emojiMesh.userData.velocityX = Math.random() * 0.4 - 0.2;
            emojiMesh.userData.velocityY = Math.random() * 0.8 + 0.4;
            scene.add(emojiMesh);
            emojis.push(emojiMesh);
        }

        camera.position.z = 10;

        let functionExecutionId = 0;
        let animId = 0;

        function animate() {
            const executionId = ++functionExecutionId;
            console.log(`animate ${executionId}`)
            let stillAnimating = false;
            emojis.forEach((emoji) => {
                emoji.position.y += emoji.userData.velocityY;
                emoji.position.x += emoji.userData.velocityX;
                emoji.userData.velocityY -= 0.01; // gravity effect

                if (emoji.position.y > -window.innerHeight / 50) {
                    stillAnimating = true;
                }
            });

            renderer.render(scene, camera);

            if (stillAnimating) {
                animId = requestAnimationFrame(animate);
                console.log(animId)
            } else {
                setTimeout(() => {
                    container.remove();
                    window.cancelAnimationFrame(animId);
                }, 10000);
            }
        }

        animate();
    }

    function createEmojiTexture(emoji) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 64;
        canvas.height = 64;
        context.font = "48px serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(emoji, 32, 32);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
});
