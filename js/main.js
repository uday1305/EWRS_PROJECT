class FieldVisualizer {
    constructor() {
        console.log('Initializing FieldVisualizer');
        
        // Initialize 2D
        this.canvas = document.getElementById('fieldCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Initialize 3D
        try {
            this.visualizer3D = new FieldVisualizer3D();
            document.getElementById('canvas3D').appendChild(this.visualizer3D.renderer.domElement);
            this.visualizer3D.renderer.domElement.style.display = 'none';
        } catch (error) {
            console.error('Error initializing 3D visualizer:', error);
        }

        // Set initial view (2D)
        this.canvas.style.display = 'block';
        document.getElementById('canvas3D').style.display = 'none';
        
        this.addEventListeners();
        this.draw();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.centerX = this.canvas.width / 2;
    }

    addEventListeners() {
        // View toggle listener
        const viewToggle = document.getElementById('viewToggle');
        console.log('View toggle element:', viewToggle);
        viewToggle.addEventListener('change', (e) => {
            console.log('Toggle changed:', e.target.checked);
            this.toggleView(e.target.checked);
        });

        // Other listeners...
        ['electricField', 'magneticField'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateLabels();
                this.updateVisualization();
            });
        });

        document.getElementById('resultantField').addEventListener('change', () => {
            this.updateVisualization();
        });

        ['medium1', 'medium2'].forEach(id => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(id + 'Value');
            
            slider.addEventListener('input', () => {
                valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
                this.updateVisualization();
            });
        });
    }

    toggleView(is3D) {
        console.log('Toggling view to:', is3D ? '3D' : '2D');
        
        // Toggle 2D canvas
        this.canvas.style.display = is3D ? 'none' : 'block';
        
        // Toggle 3D canvas
        const canvas3D = document.getElementById('canvas3D');
        canvas3D.style.display = is3D ? 'block' : 'none';
        
        if (is3D && this.visualizer3D) {
            this.visualizer3D.updateField();
        } else {
            this.draw();
        }
    }

    updateVisualization() {
        // Update both 2D and 3D views
        this.draw();
        if (this.visualizer3D) {
            this.visualizer3D.updateField();
        }
    }

    updateLabels() {
        const showMagnetic = document.getElementById('magneticField').checked;
        const showElectric = document.getElementById('electricField').checked;
        
        const medium1Label = document.getElementById('medium1Label');
        const medium2Label = document.getElementById('medium2Label');
        
        if (showMagnetic) {
            medium1Label.innerHTML = 'μ₁ (Permeability):';
            medium2Label.innerHTML = 'μ₂ (Permeability):';
        } else if (showElectric) {
            medium1Label.innerHTML = 'ε₁ (Permittivity):';
            medium2Label.innerHTML = 'ε₂ (Permittivity):';
        }

        const medium1Value = document.getElementById('medium1Value');
        const medium2Value = document.getElementById('medium2Value');
        const medium1Slider = document.getElementById('medium1');
        const medium2Slider = document.getElementById('medium2');

        medium1Value.textContent = parseFloat(medium1Slider.value).toFixed(1);
        medium2Value.textContent = parseFloat(medium2Slider.value).toFixed(1);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw boundary line
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, 0);
        this.ctx.lineTo(this.centerX, this.canvas.height);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        const showElectric = document.getElementById('electricField').checked;
        const showMagnetic = document.getElementById('magneticField').checked;
        const showResultant = document.getElementById('resultantField').checked;

        this.updateLabels();

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

    drawMagneticField() {
        const mu1 = parseFloat(document.getElementById('medium1').value);
        const mu2 = parseFloat(document.getElementById('medium2').value);

        const spacing = 40;
        const offset = 150;  // Increased offset from boundary
        const blueLength = 80;
        const redLength = 40;

        // Draw blue horizontal arrows (fixed length)
        for (let y = spacing; y < this.canvas.height - spacing; y += spacing) {
            // Medium 1
            this.drawHorizontalArrow(this.centerX - offset - blueLength, y, blueLength, 'blue');
            // Medium 2
            this.drawHorizontalArrow(this.centerX + offset, y, blueLength, 'blue');
        }

        // Calculate positions for 3 evenly spaced red arrows
        const totalHeight = this.canvas.height - 2 * spacing;
        const redSpacing = totalHeight / 4;  // Divide into 4 parts to get 3 spaces

        // Draw 3 red arrows in each medium
        for (let i = 0; i < 3; i++) {
            const y = spacing + redSpacing * (i + 1);
            
            // Medium 1
            this.drawVerticalArrow(this.centerX - offset, y, redLength, 'red');
            
            // Medium 2 (scaled length)
            this.drawVerticalArrow(this.centerX + offset, y, redLength * (mu1/mu2), 'red');
        }
    }

    drawElectricField() {
        const e1 = parseFloat(document.getElementById('medium1').value);
        const e2 = parseFloat(document.getElementById('medium2').value);

        const spacing = 40;
        const offset = 100;
        const blueLength = 40;  // Fixed length for blue arrows
        const redBaseLength = 80;  // Base length for red arrows

        for (let y = spacing; y < this.canvas.offsetHeight - spacing; y += spacing) {
            // Blue vertical arrows (fixed length)
            this.drawVerticalArrow(this.centerX - offset, y, blueLength, 'blue');
            this.drawVerticalArrow(this.centerX + offset, y, blueLength, 'blue');

            // Red horizontal arrows
            this.drawHorizontalArrow(this.centerX - offset, y, redBaseLength, 'red');  // Medium 1
            this.drawHorizontalArrow(this.centerX + offset, y, redBaseLength * (e1/e2), 'red');  // Medium 2
        }
    }

    drawElectricResultant() {
        const e1 = parseFloat(document.getElementById('medium1').value);
        const e2 = parseFloat(document.getElementById('medium2').value);

        const spacing = 40;
        const offset = 100;
        const normalLength = 40;  // Blue component length
        const tangentialLength = 80;  // Base red component length

        // Calculate positions for 3 arrows
        const totalHeight = this.canvas.height - 2 * spacing;
        const arrowSpacing = totalHeight / 4;

        for (let i = 0; i < 3; i++) {
            const y = spacing + arrowSpacing * (i + 1);

            // Medium 1 - Fixed magnitude
            const angle1 = Math.atan2(normalLength, tangentialLength);
            const magnitude1 = Math.sqrt(normalLength * normalLength + tangentialLength * tangentialLength);
            this.drawAngleArrow(this.centerX - offset, y, magnitude1, angle1, 'purple');

            // Medium 2 - Scaled magnitude
            const scaledTangential = tangentialLength * (e1/e2);
            const angle2 = Math.atan2(normalLength, scaledTangential);
            const magnitude2 = Math.sqrt(normalLength * normalLength + scaledTangential * scaledTangential);
            this.drawAngleArrow(this.centerX + offset, y, magnitude2, angle2, 'purple');
        }
    }

    drawMagneticResultant() {
        const mu1 = parseFloat(document.getElementById('medium1').value);
        const mu2 = parseFloat(document.getElementById('medium2').value);

        const spacing = 40;
        const offset = 100;
        const normalLength = 80;  // Blue component length
        const tangentialLength = 40;  // Base red component length

        // Calculate positions for 3 arrows
        const totalHeight = this.canvas.height - 2 * spacing;
        const arrowSpacing = totalHeight / 4;

        for (let i = 0; i < 3; i++) {
            const y = spacing + arrowSpacing * (i + 1);

            // Medium 1 - Fixed magnitude
            const angle1 = Math.atan2(tangentialLength, normalLength);
            const magnitude1 = Math.sqrt(normalLength * normalLength + tangentialLength * tangentialLength);
            this.drawAngleArrow(this.centerX - offset, y, magnitude1, angle1, 'purple');

            // Medium 2 - Scaled magnitude
            const scaledTangential = tangentialLength * (mu1/mu2);
            const angle2 = Math.atan2(scaledTangential, normalLength);
            const magnitude2 = Math.sqrt(normalLength * normalLength + scaledTangential * scaledTangential);
            this.drawAngleArrow(this.centerX + offset, y, magnitude2, angle2, 'purple');
        }
    }

    drawAngleArrow(x, y, length, angle, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        // Calculate end point
        const endX = x + length * Math.cos(angle);
        const endY = y + length * Math.sin(angle);
        
        this.ctx.lineTo(endX, endY);

        // Draw arrowhead
        const headLength = 10;
        const headAngle = Math.PI / 6;
        
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headLength * Math.cos(angle - headAngle),
            endY - headLength * Math.sin(angle - headAngle)
        );
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headLength * Math.cos(angle + headAngle),
            endY - headLength * Math.sin(angle + headAngle)
        );

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawHorizontalArrow(x, y, length, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + length, y);
        
        // Arrowhead
        const headLength = 10;
        const headAngle = Math.PI / 6;
        this.ctx.moveTo(x + length, y);
        this.ctx.lineTo(x + length - headLength * Math.cos(headAngle), y - headLength * Math.sin(headAngle));
        this.ctx.moveTo(x + length, y);
        this.ctx.lineTo(x + length - headLength * Math.cos(headAngle), y + headLength * Math.sin(headAngle));
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawVerticalArrow(x, y, length, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + length);
        
        // Arrowhead
        const headLength = 10;
        this.ctx.moveTo(x, y + length);
        this.ctx.lineTo(x - 5, y + length - headLength);
        this.ctx.moveTo(x, y + length);
        this.ctx.lineTo(x + 5, y + length - headLength);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, initializing FieldVisualizer');
        window.fieldVisualizer = new FieldVisualizer();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});