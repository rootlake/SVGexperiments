let canvas, ctx;
let pointsSlider;
let pointsValue;

function setup() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // Setup slider
    pointsSlider = document.getElementById('pointsPerSide');
    pointsValue = document.getElementById('pointsValue');
    
    // Update display value while sliding
    pointsSlider.addEventListener('input', function() {
        pointsValue.textContent = this.value;
    });
    
    // Generate pattern when slider is released
    pointsSlider.addEventListener('change', generateAndDraw);
    
    generateAndDraw();
}

function generateAndDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.5;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 300;
    const innerRadius = outerRadius * 0.4;
    const totalPoints = parseInt(document.getElementById('pointsPerSide').value);
    const pointsPerEdge = Math.floor(totalPoints / 6);

    const outerPoints = [];
    const innerPoints = [];

    // Generate points for both hexagons, edge by edge
    for (let i = 0; i < 6; i++) {
        const angle1 = (i / 6) * Math.PI * 2;
        const angle2 = ((i + 1) / 6) * Math.PI * 2;
        
        // Outer hexagon edge points
        const x1Outer = centerX + Math.cos(angle1) * outerRadius;
        const y1Outer = centerY + Math.sin(angle1) * outerRadius;
        const x2Outer = centerX + Math.cos(angle2) * outerRadius;
        const y2Outer = centerY + Math.sin(angle2) * outerRadius;
        
        // Inner hexagon edge points
        const x1Inner = centerX + Math.cos(angle1) * innerRadius;
        const y1Inner = centerY + Math.sin(angle1) * innerRadius;
        const x2Inner = centerX + Math.cos(angle2) * innerRadius;
        const y2Inner = centerY + Math.sin(angle2) * innerRadius;
        
        // Generate points along each edge (excluding end point for all edges)
        for (let j = 0; j < pointsPerEdge - 1; j++) {
            const t = j / (pointsPerEdge - 1);
            
            // Outer point
            const xOuter = x1Outer + (x2Outer - x1Outer) * t;
            const yOuter = y1Outer + (y2Outer - y1Outer) * t;
            outerPoints.push({ x: xOuter, y: yOuter });
            
            // Inner point
            const xInner = x1Inner + (x2Inner - x1Inner) * t;
            const yInner = y1Inner + (y2Inner - y1Inner) * t;
            innerPoints.push({ x: xInner, y: yInner });
        }
    }

    // Draw straight lines between corresponding points
    for (let i = 0; i < outerPoints.length; i++) {
        const outer = outerPoints[i];
        const inner = innerPoints[i];
        
        ctx.beginPath();
        ctx.moveTo(outer.x, outer.y);
        ctx.lineTo(inner.x, inner.y);
        ctx.stroke();
    }
}

function downloadSVG() {
    // Create SVG content
    let svgContent = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
        <g stroke="black" stroke-width="0.5" fill="none">`;
    
    // Add all the paths (this will need to replicate the drawing logic)
    // ... (similar logic to the canvas drawing, but outputting SVG path commands)
    
    svgContent += `</g></svg>`;
    
    // Create download link
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simple-pattern.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize when page loads
window.onload = setup; 