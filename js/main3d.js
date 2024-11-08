class FieldVisualizer3D {
    constructor() {
        this.setupScene();
        this.setupControls();
        this.addEventListeners();
        this.updateField();  // Initial draw
        this.animate();

        // Update initial parameter ranges
        this.epsilon1 = 1.0;
        this.epsilon2 = 2.0;
        this.mu1 = 1.0;
        this.mu2 = 2.0;
        this.maxValue = 10.0;  // New maximum value
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);  // Light gray background

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            800 / 600,  // Fixed aspect ratio
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(800, 600);
        const container = document.getElementById('canvas-container');
        container.innerHTML = '';  // Clear container
        container.appendChild(this.renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        // Add boundary plane
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x808080,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        this.boundaryPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.boundaryPlane.rotation.y = Math.PI / 2;
        this.scene.add(this.boundaryPlane);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x000000, 0x404040);
        this.scene.add(gridHelper);

        // Initialize arrow group
        this.arrowGroup = new THREE.Group();
        this.scene.add(this.arrowGroup);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    createArrow(origin, direction, length, color) {
        const headLength = length * 0.2;
        const headWidth = length * 0.08;
        
        const arrowHelper = new THREE.ArrowHelper(
            direction,
            origin,
            length,
            color,
            headLength,
            headWidth
        );
        return arrowHelper;
    }

    drawMagneticField() {
        this.arrowGroup.clear();
        
        const mu1 = Math.min(parseFloat(document.getElementById('medium1').value), this.maxValue);
        const mu2 = Math.min(parseFloat(document.getElementById('medium2').value), this.maxValue);

        // Parameters for arrow placement
        const spacing = 1;
        const offset = 2;
        const blueLength = 1;
        const redLength = 0.5;

        // Create blue arrows in a 3D grid
        for (let z = -4; z <= 4; z += spacing) {
            for (let y = -4; y <= 4; y += spacing) {
                // Medium 1
                const blueOrigin1 = new THREE.Vector3(-offset - blueLength, y, z);
                const blueDirection1 = new THREE.Vector3(1, 0, 0);
                const blueArrow1 = this.createArrow(blueOrigin1, blueDirection1, blueLength, 0x0000ff);
                this.arrowGroup.add(blueArrow1);

                // Medium 2
                const blueOrigin2 = new THREE.Vector3(offset, y, z);
                const blueDirection2 = new THREE.Vector3(1, 0, 0);
                const blueArrow2 = this.createArrow(blueOrigin2, blueDirection2, blueLength, 0x0000ff);
                this.arrowGroup.add(blueArrow2);

                // Add red arrows only on every other row
                if (Math.abs(y) % 2 === 0) {  // This creates the alternating pattern
                    // Medium 1
                    const redOrigin1 = new THREE.Vector3(-offset, y, z);
                    const redDirection1 = new THREE.Vector3(0, -1, 0);
                    const redArrow1 = this.createArrow(redOrigin1, redDirection1, redLength, 0xff0000);
                    this.arrowGroup.add(redArrow1);

                    // Medium 2 (scaled by mu1/mu2)
                    const redOrigin2 = new THREE.Vector3(offset, y, z);
                    const redDirection2 = new THREE.Vector3(0, -1, 0);
                    const redArrow2 = this.createArrow(redOrigin2, redDirection2, redLength * (mu1/mu2), 0xff0000);
                    this.arrowGroup.add(redArrow2);
                }
            }
        }
    }

    drawElectricField() {
        this.arrowGroup.clear();
        
        const e1 = Math.min(parseFloat(document.getElementById('medium1').value), this.maxValue);
        const e2 = Math.min(parseFloat(document.getElementById('medium2').value), this.maxValue);

        // Parameters for arrow placement
        const spacing = 1;
        const offset = 2;
        const blueLength = 0.5;
        const redLength = 1;

        // Create blue arrows in a 3D grid
        for (let z = -4; z <= 4; z += spacing) {
            for (let y = -4; y <= 4; y += spacing) {
                // Medium 1
                const blueOrigin1 = new THREE.Vector3(-offset, y, z);
                const blueDirection1 = new THREE.Vector3(0, 1, 0);
                const blueArrow1 = this.createArrow(blueOrigin1, blueDirection1, blueLength, 0x0000ff);
                this.arrowGroup.add(blueArrow1);

                // Medium 2
                const blueOrigin2 = new THREE.Vector3(offset, y, z);
                const blueDirection2 = new THREE.Vector3(0, 1, 0);
                const blueArrow2 = this.createArrow(blueOrigin2, blueDirection2, blueLength, 0x0000ff);
                this.arrowGroup.add(blueArrow2);
            }
        }

        // Add more red arrows with smaller spacing
        const redSpacing = 1;  // Reduced spacing for red arrows
        for (let z = -4; z <= 4; z += redSpacing) {
            for (let y = -2; y <= 2; y += redSpacing) {
                // Medium 1
                const redOrigin1 = new THREE.Vector3(-offset, y, z);
                const redDirection1 = new THREE.Vector3(1, 0, 0);
                const redArrow1 = this.createArrow(redOrigin1, redDirection1, redLength, 0xff0000);
                this.arrowGroup.add(redArrow1);

                // Medium 2 (scaled by e1/e2)
                const redOrigin2 = new THREE.Vector3(offset, y, z);
                const redDirection2 = new THREE.Vector3(1, 0, 0);
                const redArrow2 = this.createArrow(redOrigin2, redDirection2, redLength * (e1/e2), 0xff0000);
                this.arrowGroup.add(redArrow2);
            }
        }
    }

    drawElectricResultant() {
        this.arrowGroup.clear();
        
        const e1 = parseFloat(document.getElementById('medium1').value);
        const e2 = parseFloat(document.getElementById('medium2').value);

        const spacing = 1;
        const offset = 2;
        const normalLength = 0.5;    // Vertical (blue) component
        const tangentialLength = 1.0; // Horizontal (red) component

        // Create resultant arrows in a grid pattern
        for (let z = -4; z <= 4; z += spacing) {
            for (let y = -4; y <= 4; y += spacing * 2) { // Increased spacing for clarity
                // Medium 1
                const origin1 = new THREE.Vector3(-offset, y, z);
                // Combine normal and tangential components
                const direction1 = new THREE.Vector3(tangentialLength, normalLength, 0).normalize();
                const magnitude1 = Math.sqrt(normalLength * normalLength + tangentialLength * tangentialLength);
                const arrow1 = this.createArrow(origin1, direction1, magnitude1, 0x800080); // Purple color
                this.arrowGroup.add(arrow1);

                // Medium 2
                const origin2 = new THREE.Vector3(offset, y, z);
                // Scale tangential component by e1/e2
                const scaledTangential = tangentialLength * (e1/e2);
                const direction2 = new THREE.Vector3(scaledTangential, normalLength, 0).normalize();
                const magnitude2 = Math.sqrt(normalLength * normalLength + scaledTangential * scaledTangential);
                const arrow2 = this.createArrow(origin2, direction2, magnitude2, 0x800080);
                this.arrowGroup.add(arrow2);
            }
        }

        // Add additional arrows at intermediate positions for better visualization
        for (let z = -3.5; z <= 3.5; z += spacing) {
            for (let y = -3.5; y <= 3.5; y += spacing * 2) {
                // Medium 1
                const origin1 = new THREE.Vector3(-offset, y, z);
                const direction1 = new THREE.Vector3(tangentialLength, normalLength, 0).normalize();
                const magnitude1 = Math.sqrt(normalLength * normalLength + tangentialLength * tangentialLength);
                const arrow1 = this.createArrow(origin1, direction1, magnitude1, 0x800080);
                this.arrowGroup.add(arrow1);

                // Medium 2
                const origin2 = new THREE.Vector3(offset, y, z);
                const scaledTangential = tangentialLength * (e1/e2);
                const direction2 = new THREE.Vector3(scaledTangential, normalLength, 0).normalize();
                const magnitude2 = Math.sqrt(normalLength * normalLength + scaledTangential * scaledTangential);
                const arrow2 = this.createArrow(origin2, direction2, magnitude2, 0x800080);
                this.arrowGroup.add(arrow2);
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.controls) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
    }

    addEventListeners() {
        // For checkboxes - update labels when magnetic/electric field changes
        ['electricField', 'magneticField'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateLabels();  // Update labels when field type changes
                this.updateField();
            });
        });

        document.getElementById('resultantField').addEventListener('change', () => {
            this.updateField();
        });

        // For sliders
        ['medium1', 'medium2'].forEach(id => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(id + 'Value');
            
            slider.addEventListener('input', () => {
                valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
                this.updateField();
            });
        });

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    updateLabels() {
        const showMagnetic = document.getElementById('magneticField').checked;
        const showElectric = document.getElementById('electricField').checked;
        
        const medium1Label = document.getElementById('medium1Label');
        const medium2Label = document.getElementById('medium2Label');
        
        // Update the main labels
        if (showMagnetic) {
            medium1Label.innerHTML = 'μ₁ (Permeability):';
            medium2Label.innerHTML = 'μ₂ (Permeability):';
        } else if (showElectric) {
            medium1Label.innerHTML = 'ε₁ (Permittivity):';
            medium2Label.innerHTML = 'ε₂ (Permittivity):';
        }
    }

    drawMagneticResultant() {
        this.arrowGroup.clear();
        
        const mu1 = parseFloat(document.getElementById('medium1').value);
        const mu2 = parseFloat(document.getElementById('medium2').value);

        const spacing = 1;
        const offset = 2;
        const normalLength = 1;    // Blue component length
        const tangentialLength = 0.5;  // Red component length

        // Create resultant arrows
        for (let z = -4; z <= 4; z += spacing) {
            for (let y = -4; y <= 4; y += spacing) {
                if (Math.abs(y) % 2 === 0) {  // Keep the alternating pattern
                    // Medium 1
                    const origin1 = new THREE.Vector3(-offset, y, z);
                    const direction1 = new THREE.Vector3(normalLength, -tangentialLength, 0).normalize();
                    const magnitude1 = Math.sqrt(normalLength * normalLength + tangentialLength * tangentialLength);
                    const arrow1 = this.createArrow(origin1, direction1, magnitude1, 0x800080);  // Purple color
                    this.arrowGroup.add(arrow1);

                    // Medium 2
                    const origin2 = new THREE.Vector3(offset, y, z);
                    const scaledTangential = tangentialLength * (mu1/mu2);
                    const direction2 = new THREE.Vector3(normalLength, -scaledTangential, 0).normalize();
                    const magnitude2 = Math.sqrt(normalLength * normalLength + scaledTangential * scaledTangential);
                    const arrow2 = this.createArrow(origin2, direction2, magnitude2, 0x800080);
                    this.arrowGroup.add(arrow2);
                }
            }
        }
    }

    updateField() {
        const showMagnetic = document.getElementById('magneticField').checked;
        const showElectric = document.getElementById('electricField').checked;
        const showResultant = document.getElementById('resultantField').checked;

        // Clear existing arrows
        this.arrowGroup.clear();

        if (!showResultant) {
            if (showElectric) {
                this.drawElectricField();
            }
            if (showMagnetic) {
                this.drawMagneticField();
            }
        } else {
            if (showElectric) {
                this.drawElectricResultant();
            }
            if (showMagnetic) {
                this.drawMagneticResultant();
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(800, 600);
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new FieldVisualizer3D();
}); 