let canvas, ctx;
let sliders = {};
let valueDisplays = {};
let checkboxes = {};

function setup() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // Setup sliders and their value displays
    const sliderIds = ['outerSides', 'innerSides', 'outerRadius', 'innerRadius', 'pointsPerSide', 'curveStrength', 'innerRotation', 'noiseScale', 'noiseStrength'];
    
    sliderIds.forEach(id => {
        sliders[id] = document.getElementById(id);
        valueDisplays[id] = document.getElementById(id + 'Value');
        
        // Add listener to update value display
        sliders[id].addEventListener('input', function() {
            valueDisplays[id].textContent = this.value;
        });
        
        // Generate pattern when slider is released
        sliders[id].addEventListener('change', generateAndDraw);
    });

    // Setup checkboxes
    ['showOuter', 'showInner'].forEach(id => {
        checkboxes[id] = document.getElementById(id);
        checkboxes[id].addEventListener('change', generateAndDraw);
    });
    
    generateAndDraw();
}

function generateAndDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.5;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = parseInt(sliders.outerRadius.value);
    const innerRadius = parseInt(sliders.innerRadius.value);
    const outerSides = parseInt(sliders.outerSides.value);
    const innerSides = parseInt(sliders.innerSides.value);
    const totalPoints = parseInt(sliders.pointsPerSide.value) * outerSides;
    const curveStrength = parseInt(sliders.curveStrength.value);
    const innerRotation = parseInt(sliders.innerRotation.value) * (Math.PI / 180); // Convert to radians
    const noiseScale = parseFloat(sliders.noiseScale.value);
    const noiseStrength = parseFloat(sliders.noiseStrength.value);

    const outerPoints = [];
    const innerPoints = [];

    // Generate points for outer shape
    for (let i = 0; i < totalPoints; i++) {
        const t = i / totalPoints;
        const angle = t * Math.PI * 2;
        
        // Find which side of the polygon we're on
        const sideIndex = Math.floor(t * outerSides);
        const nextSideIndex = (sideIndex + 1) % outerSides;
        
        // Get the angles for this side
        const angle1 = (sideIndex / outerSides) * Math.PI * 2;
        const angle2 = (nextSideIndex / outerSides) * Math.PI * 2;
        
        // Get the endpoints of this side
        const x1 = centerX + Math.cos(angle1) * outerRadius;
        const y1 = centerY + Math.sin(angle1) * outerRadius;
        const x2 = centerX + Math.cos(angle2) * outerRadius;
        const y2 = centerY + Math.sin(angle2) * outerRadius;
        
        // Calculate position along this side
        const sideT = (t * outerSides) % 1;
        const x = x1 + (x2 - x1) * sideT;
        const y = y1 + (y2 - y1) * sideT;
        
        outerPoints.push({ x, y });
    }

    // Generate points for inner shape
    for (let i = 0; i < totalPoints; i++) {
        const t = i / totalPoints;
        const angle = t * Math.PI * 2 + innerRotation;
        
        // Find which side of the inner polygon we're on
        const sideIndex = Math.floor(t * innerSides);
        const nextSideIndex = (sideIndex + 1) % innerSides;
        
        // Get the angles for this side
        const angle1 = (sideIndex / innerSides) * Math.PI * 2 + innerRotation;
        const angle2 = (nextSideIndex / innerSides) * Math.PI * 2 + innerRotation;
        
        // Get the endpoints of this side
        const x1 = centerX + Math.cos(angle1) * innerRadius;
        const y1 = centerY + Math.sin(angle1) * innerRadius;
        const x2 = centerX + Math.cos(angle2) * innerRadius;
        const y2 = centerY + Math.sin(angle2) * innerRadius;
        
        // Calculate position along this side
        const sideT = (t * innerSides) % 1;
        const x = x1 + (x2 - x1) * sideT;
        const y = y1 + (y2 - y1) * sideT;
        
        innerPoints.push({ x, y });
    }

    // Draw curved lines between corresponding points
    for (let i = 0; i < totalPoints; i++) {
        const outer = outerPoints[i];
        const inner = innerPoints[i];
        
        const { cp1, cp2 } = getCurveControlPoints(
            inner, outer, curveStrength, noiseScale, noiseStrength, i, totalPoints
        );
        
        ctx.beginPath();
        ctx.moveTo(inner.x, inner.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, outer.x, outer.y);
        ctx.stroke();
    }

    // Draw shape outlines
    if (checkboxes.showOuter.checked) {
        drawPolygon(outerSides, outerRadius, centerX, centerY);
    }
    if (checkboxes.showInner.checked) {
        drawPolygon(innerSides, innerRadius, centerX, centerY, innerRotation);
    }
}

function drawPolygon(sides, radius, centerX, centerY, rotation = 0) {
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

function downloadSVG() {
    const outerSides = parseInt(sliders.outerSides.value);
    const innerSides = parseInt(sliders.innerSides.value);
    const rotation = parseInt(sliders.innerRotation.value);
    
    // Create SVG content
    let svgContent = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
        <g stroke="black" stroke-width="0.5" fill="none">`;

    // Generate all the points and paths (reusing logic from generateAndDraw)
    const centerX = 400;
    const centerY = 400;
    const outerRadius = parseInt(sliders.outerRadius.value);
    const innerRadius = parseInt(sliders.innerRadius.value);
    const totalPoints = parseInt(sliders.pointsPerSide.value) * outerSides;
    const curveStrength = parseInt(sliders.curveStrength.value);
    const innerRotation = rotation * (Math.PI / 180);
    const noiseScale = parseFloat(sliders.noiseScale.value);
    const noiseStrength = parseFloat(sliders.noiseStrength.value);

    const outerPoints = [];
    const innerPoints = [];

    // Generate outer points
    for (let i = 0; i < totalPoints; i++) {
        const t = i / totalPoints;
        const sideIndex = Math.floor(t * outerSides);
        const nextSideIndex = (sideIndex + 1) % outerSides;
        
        const angle1 = (sideIndex / outerSides) * Math.PI * 2;
        const angle2 = (nextSideIndex / outerSides) * Math.PI * 2;
        
        const x1 = centerX + Math.cos(angle1) * outerRadius;
        const y1 = centerY + Math.sin(angle1) * outerRadius;
        const x2 = centerX + Math.cos(angle2) * outerRadius;
        const y2 = centerY + Math.sin(angle2) * outerRadius;
        
        const sideT = (t * outerSides) % 1;
        const x = x1 + (x2 - x1) * sideT;
        const y = y1 + (y2 - y1) * sideT;
        
        outerPoints.push({ x, y });
    }

    // Generate inner points
    for (let i = 0; i < totalPoints; i++) {
        const t = i / totalPoints;
        const angle = t * Math.PI * 2 + innerRotation;
        
        // Find which side of the inner polygon we're on
        const sideIndex = Math.floor(t * innerSides);
        const nextSideIndex = (sideIndex + 1) % innerSides;
        
        // Get the angles for this side
        const angle1 = (sideIndex / innerSides) * Math.PI * 2 + innerRotation;
        const angle2 = (nextSideIndex / innerSides) * Math.PI * 2 + innerRotation;
        
        // Get the endpoints of this side
        const x1 = centerX + Math.cos(angle1) * innerRadius;
        const y1 = centerY + Math.sin(angle1) * innerRadius;
        const x2 = centerX + Math.cos(angle2) * innerRadius;
        const y2 = centerY + Math.sin(angle2) * innerRadius;
        
        // Calculate position along this side
        const sideT = (t * innerSides) % 1;
        const x = x1 + (x2 - x1) * sideT;
        const y = y1 + (y2 - y1) * sideT;
        
        innerPoints.push({ x, y });
    }

    // Add curved paths
    for (let i = 0; i < totalPoints; i++) {
        const outer = outerPoints[i];
        const inner = innerPoints[i];
        
        const { cp1, cp2 } = getCurveControlPoints(
            inner, outer, curveStrength, noiseScale, noiseStrength, i, totalPoints
        );
        
        svgContent += `
            <path d="M ${inner.x} ${inner.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${outer.x} ${outer.y}"/>`;
    }

    // Add shape outlines if enabled
    if (checkboxes.showOuter.checked) {
        svgContent += `
            <path d="M ${getPolygonPath(outerSides, outerRadius, centerX, centerY)}"/>`;
    }
    if (checkboxes.showInner.checked) {
        svgContent += `
            <path d="M ${getPolygonPath(innerSides, innerRadius, centerX, centerY, innerRotation)}"/>`;
    }

    svgContent += `</g></svg>`;
    
    // Generate filename based on parameters
    const filename = `pattern_o${outerSides}i${innerSides}_r${rotation}_c${curveStrength}.svg`;
    
    // Create download link
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper function to generate SVG path data for polygons
function getPolygonPath(sides, radius, centerX, centerY, rotation = 0) {
    let path = '';
    for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        path += `${i === 0 ? '' : 'L'} ${x} ${y} `;
    }
    return path;
}

function getCurveControlPoints(inner, outer, curveStrength, noiseScale, noiseStrength, index, totalPoints) {
    const dx = outer.x - inner.x;
    const dy = outer.y - inner.y;
    
    const perpX = -dy;
    const perpY = dx;
    
    const length = Math.sqrt(perpX * perpX + perpY * perpY);
    const normPerpX = perpX / length;
    const normPerpY = perpY / length;

    // Add noise influence with more coherent flow
    // Use angle-based noise sampling for circular bands
    const angle = (index / totalPoints) * Math.PI * 2;
    const radius = Math.sqrt((inner.x - 400) * (inner.x - 400) + (inner.y - 400) * (inner.y - 400));
    const noiseX = Math.cos(angle) * radius * noiseScale;
    const noiseY = Math.sin(angle) * radius * noiseScale;
    const noiseVal = (noise.perlin2(noiseX, noiseY) + 1) / 2;
    const curveOffset = curveStrength * (1 + noiseVal * noiseStrength);
    
    // Adjust control points to create smoother transitions
    const t = index / totalPoints;
    const cp1Dist = 0.33 + noiseVal * 0.1;
    const cp2Dist = 0.67 + noiseVal * 0.1;
    
    return {
        cp1: {
            x: inner.x + dx * cp1Dist + normPerpX * curveOffset,
            y: inner.y + dy * cp1Dist + normPerpY * curveOffset
        },
        cp2: {
            x: inner.x + dx * cp2Dist + normPerpX * curveOffset,
            y: inner.y + dy * cp2Dist + normPerpY * curveOffset
        }
    };
}

// Initialize when page loads
window.onload = setup; 