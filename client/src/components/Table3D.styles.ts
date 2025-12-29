// client/src/components/Table3D.styles.ts
import styled, { keyframes, css } from 'styled-components'

/** Paleta rápida */
const woodDark = '#5a381b'
const woodLight = '#99693a'
const feltMid = '#166a36'
const feltDark = '#0f3f20'
const metalEdge = '#c8b37a'

/** Texturas realistas del fieltro con múltiples capas */
export const FeltNoise = styled.div<{ skin?: 'green' | 'blue' | 'purple' | 'gold' | 'crystal' | 'red' | 'black' | 'rainbow' | 'neon' | 'sunset' | 'ocean' | 'lava' | 'ice' | 'forest' | 'royal' | 'galaxy' | 'diamond' | 'platinum' | 'emerald' }>`
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.12;

  /* Patrón base de fieltro */
  background-image: ${props => {
    const skin = props.skin || 'green';

    switch (skin) {
      case 'gold':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(255,215,0,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(139,69,19,0.08) 0%, transparent 45%),
          radial-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
          radial-gradient(rgba(139,69,19,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(139,69,19,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(255,215,0,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(139,69,19,0.06) 0%, transparent 25%)
        `;
      case 'crystal':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(135,206,235,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(70,130,180,0.08) 0%, transparent 45%),
          radial-gradient(rgba(176,196,222,0.03) 1px, transparent 1px),
          radial-gradient(rgba(70,130,180,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(70,130,180,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(135,206,235,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(70,130,180,0.06) 0%, transparent 25%)
        `;
      case 'red':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(255,99,71,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(139,0,0,0.08) 0%, transparent 45%),
          radial-gradient(rgba(255,160,122,0.03) 1px, transparent 1px),
          radial-gradient(rgba(139,0,0,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(139,0,0,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(255,99,71,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(139,0,0,0.06) 0%, transparent 25%)
        `;
      case 'black':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(255,255,255,0.05) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(105,105,105,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(47,79,79,0.08) 0%, transparent 45%),
          radial-gradient(rgba(169,169,169,0.03) 1px, transparent 1px),
          radial-gradient(rgba(47,79,79,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(47,79,79,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(105,105,105,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(47,79,79,0.06) 0%, transparent 25%)
        `;
      case 'rainbow':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(255,0,150,0.06) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(0,150,255,0.08) 0%, transparent 45%),
          radial-gradient(rgba(255,255,0,0.02) 1px, transparent 1px),
          radial-gradient(rgba(255,0,150,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(0,150,255,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(255,0,150,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(255,255,0,0.06) 0%, transparent 25%)
        `;
      case 'neon':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(0,255,255,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(255,0,255,0.08) 0%, transparent 45%),
          radial-gradient(rgba(0,255,0,0.03) 1px, transparent 1px),
          radial-gradient(rgba(255,0,255,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(255,0,255,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(0,255,255,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(0,255,0,0.06) 0%, transparent 25%)
        `;
      case 'sunset':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(255,140,0,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(255,69,0,0.08) 0%, transparent 45%),
          radial-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
          radial-gradient(rgba(255,69,0,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(255,69,0,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(255,140,0,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(255,69,0,0.06) 0%, transparent 25%)
        `;
      case 'ocean':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(0,191,255,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(0,0,139,0.08) 0%, transparent 45%),
          radial-gradient(rgba(135,206,250,0.03) 1px, transparent 1px),
          radial-gradient(rgba(0,0,139,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(0,0,139,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(0,191,255,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(0,0,139,0.06) 0%, transparent 25%)
        `;
      case 'lava':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(255,69,0,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(139,0,0,0.08) 0%, transparent 45%),
          radial-gradient(rgba(255,140,0,0.03) 1px, transparent 1px),
          radial-gradient(rgba(139,0,0,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(139,0,0,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(255,69,0,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(139,0,0,0.06) 0%, transparent 25%)
        `;
      case 'ice':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(173,216,230,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(70,130,180,0.08) 0%, transparent 45%),
          radial-gradient(rgba(240,248,255,0.03) 1px, transparent 1px),
          radial-gradient(rgba(70,130,180,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(70,130,180,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(173,216,230,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(70,130,180,0.06) 0%, transparent 25%)
        `;
      case 'forest':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(34,139,34,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(0,100,0,0.08) 0%, transparent 45%),
          radial-gradient(rgba(144,238,144,0.03) 1px, transparent 1px),
          radial-gradient(rgba(0,100,0,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(0,100,0,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(34,139,34,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(0,100,0,0.06) 0%, transparent 25%)
        `;
      case 'royal':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(128,0,128,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(75,0,130,0.08) 0%, transparent 45%),
          radial-gradient(rgba(216,191,216,0.03) 1px, transparent 1px),
          radial-gradient(rgba(75,0,130,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(75,0,130,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(128,0,128,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(75,0,130,0.06) 0%, transparent 25%)
        `;
      case 'galaxy':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(138,43,226,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(25,25,112,0.08) 0%, transparent 45%),
          radial-gradient(rgba(186,85,211,0.03) 1px, transparent 1px),
          radial-gradient(rgba(25,25,112,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(25,25,112,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(138,43,226,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(25,25,112,0.06) 0%, transparent 25%)
        `;
      case 'diamond':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(185,242,255,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(70,130,180,0.08) 0%, transparent 45%),
          radial-gradient(rgba(240,248,255,0.03) 1px, transparent 1px),
          radial-gradient(rgba(70,130,180,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(70,130,180,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(185,242,255,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(70,130,180,0.06) 0%, transparent 25%)
        `;
      case 'platinum':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(229,228,226,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(192,192,192,0.08) 0%, transparent 45%),
          radial-gradient(rgba(248,248,255,0.03) 1px, transparent 1px),
          radial-gradient(rgba(192,192,192,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(192,192,192,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(229,228,226,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(192,192,192,0.06) 0%, transparent 25%)
        `;
      case 'emerald':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(80,200,120,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(0,128,0,0.08) 0%, transparent 45%),
          radial-gradient(rgba(144,238,144,0.03) 1px, transparent 1px),
          radial-gradient(rgba(0,128,0,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(0,128,0,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(80,200,120,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(0,128,0,0.06) 0%, transparent 25%)
        `;
      case 'blue':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(100,150,255,0.06) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(0,50,100,0.08) 0%, transparent 45%),
          radial-gradient(rgba(150,200,255,0.02) 1px, transparent 1px),
          radial-gradient(rgba(0,50,100,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(0,50,100,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(100,150,255,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(0,50,100,0.06) 0%, transparent 25%)
        `;
      case 'purple':
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(200,100,255,0.06) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(50,0,100,0.08) 0%, transparent 45%),
          radial-gradient(rgba(200,150,255,0.02) 1px, transparent 1px),
          radial-gradient(rgba(50,0,100,0.05) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(50,0,100,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(200,100,255,0.04) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(50,0,100,0.06) 0%, transparent 25%)
        `;
      case 'green':
      default:
        return `
          radial-gradient(ellipse 120% 80% at 20% 40%, rgba(0,0,0,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 100% 60% at 80% 70%, rgba(255,255,255,0.08) 0%, transparent 40%),
          radial-gradient(ellipse 90% 70% at 60% 20%, rgba(0,0,0,0.06) 0%, transparent 45%),
          radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          radial-gradient(rgba(0,0,0,0.04) 2px, transparent 2px),
          radial-gradient(circle at 30% 60%, rgba(0,0,0,0.08) 0%, transparent 20%),
          radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05) 0%, transparent 15%),
          radial-gradient(circle at 45% 80%, rgba(0,0,0,0.06) 0%, transparent 25%)
        `;
    }
  }};

  background-size:
    150% 120%,  /* Grandes pliegues */
    120% 90%,   /* Variaciones de tono */
    100% 110%,  /* Textura base */
    8px 8px,    /* Tejido fino */
    12px 12px,  /* Desgaste */
    25% 25%,    /* Mancha 1 */
    20% 20%,    /* Mancha 2 */
    30% 30%;    /* Mancha 3 */

  background-position:
    0% 0%, 20% 30%, 40% 10%,
    0% 0%, 3px 3px, 7px 7px,
    30% 60%, 70% 30%, 45% 80%;

  mix-blend-mode: overlay;
`

/** Contenedor con perspectiva avanzada */
export const TableWrap = styled.div`
  position: relative;
  width: min(1100px, 95vw);
  height: min(650px, 80vh);
  margin: 0 auto;
  perspective: 1200px;
  filter:
    drop-shadow(0 20px 60px rgba(0,0,0,0.4))
    drop-shadow(0 8px 20px rgba(0,0,0,0.2))
    drop-shadow(0 4px 8px rgba(0,0,0,0.1));

  /* ↓ Permite bajar/subir toda la mesa desde React con --tableOffset */
  transform: translateY(var(--tableOffset, 0px));
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
`

/** Inclinación ligera para 3D */
export const TableTilt = styled.div`
  position: absolute;
  inset: 0;
  transform: rotateX(12deg);
  transform-style: preserve-3d;
`

/** Aro de madera premium con texturas realistas */
export const TableRail = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;               /* debajo de la superficie */
  pointer-events: none;     /* no bloquea clics/overlays */
  border-radius: 50% / 34%;

  /* Texturas de madera complejas */
  background:
    /* Patrón base de madera */
    radial-gradient(140% 120% at 50% 20%,
      ${woodLight} 0%,
      ${woodDark} 50%,
      #3a2410 80%,
      #2a1810 100%),

    /* Veta de madera principal */
    radial-gradient(ellipse 200% 50% at 30% 70%,
      rgba(150, 80, 30, 0.3) 0%,
      transparent 60%),

    /* Vetas secundarias */
    radial-gradient(ellipse 180% 40% at 70% 40%,
      rgba(120, 60, 20, 0.2) 0%,
      transparent 50%),

    /* Nudos de madera */
    radial-gradient(circle at 60% 80%, rgba(80, 40, 10, 0.4) 0%, transparent 20%),
    radial-gradient(circle at 40% 30%, rgba(100, 50, 15, 0.3) 0%, transparent 15%);

  /* Sombras realistas */
  box-shadow:
    inset 0 12px 24px rgba(255,255,255,0.08),
    inset 0 -16px 32px rgba(0,0,0,0.6),
    inset 0 0 0 2px rgba(140, 80, 30, 0.2),
    0 4px 12px rgba(0,0,0,0.3);

  /* Borde metálico interior */
  &::before{
    content:'';
    position: absolute;
    inset: 12px;
    border-radius: 50% / 34%;
    box-shadow:
      inset 0 0 0 4px ${metalEdge}66,
      inset 0 0 0 8px rgba(0,0,0,0.4),
      inset 0 2px 4px rgba(0,0,0,0.3);
  }

  /* Textura de madera detallada */
  &::after{
    content:'';
    position: absolute;
    inset: 16px;
    border-radius: 50% / 34%;
    background:
      radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 8%),
      radial-gradient(circle at 75% 75%, rgba(0,0,0,0.1) 0%, transparent 6%),
      radial-gradient(ellipse 150% 100% at 50% 50%, rgba(120, 60, 20, 0.05) 0%, transparent 70%);
    mix-blend-mode: overlay;
  }
`

/** Superficie de fieltro premium con múltiples capas */
export const TableSurface = styled.div<{ skin?: 'green' | 'blue' | 'purple' | 'gold' | 'crystal' | 'red' | 'black' | 'rainbow' | 'neon' | 'sunset' | 'ocean' | 'lava' | 'ice' | 'forest' | 'royal' | 'galaxy' | 'diamond' | 'platinum' | 'emerald' }>`
  position: absolute;
  inset: 34px;
  z-index: 2;               /* por encima del aro */
  border-radius: 50% / 34%;

  background: ${props => {
    const skin = props.skin || 'green';

    switch (skin) {
      case 'gold':
        return `
          radial-gradient(220% 160% at 50% 10%, #8b4513 0%, #654321 70%, #3d2817 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(255,215,0,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(255,140,0,0.1) 0%, transparent 50%)
        `;
      case 'crystal':
        return `
          radial-gradient(220% 160% at 50% 10%, #87ceeb 0%, #4682b4 70%, #2f4f4f 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(135,206,235,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(70,130,180,0.1) 0%, transparent 50%)
        `;
      case 'red':
        return `
          radial-gradient(220% 160% at 50% 10%, #8b0000 0%, #660000 70%, #330000 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(255,69,0,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(139,0,0,0.1) 0%, transparent 50%)
        `;
      case 'black':
        return `
          radial-gradient(220% 160% at 50% 10%, #2f2f2f 0%, #1a1a1a 70%, #0d0d0d 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(169,169,169,0.1) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(105,105,105,0.08) 0%, transparent 50%)
        `;
      case 'rainbow':
        return `
          radial-gradient(220% 160% at 50% 10%, #ff1493 0%, #00ff00 35%, #0080ff 70%, #800080 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(255,0,255,0.12) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(0,255,255,0.1) 0%, transparent 50%)
        `;
      case 'neon':
        return `
          radial-gradient(220% 160% at 50% 10%, #ff00ff 0%, #00ffff 50%, #00ff00 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(255,0,255,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(0,255,255,0.12) 0%, transparent 50%)
        `;
      case 'sunset':
        return `
          radial-gradient(220% 160% at 50% 10%, #ff4500 0%, #ff6347 35%, #ffa500 70%, #ffd700 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(255,140,0,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(255,69,0,0.12) 0%, transparent 50%)
        `;
      case 'ocean':
        return `
          radial-gradient(220% 160% at 50% 10%, #000080 0%, #0000cd 35%, #1e90ff 70%, #87ceeb 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(0,191,255,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(0,0,139,0.12) 0%, transparent 50%)
        `;
      case 'lava':
        return `
          radial-gradient(220% 160% at 50% 10%, #ff4500 0%, #dc143c 50%, #b22222 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(255,69,0,0.18) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(139,0,0,0.15) 0%, transparent 50%)
        `;
      case 'ice':
        return `
          radial-gradient(220% 160% at 50% 10%, #f0f8ff 0%, #add8e6 35%, #4682b4 70%, #4169e1 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(173,216,230,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(70,130,180,0.12) 0%, transparent 50%)
        `;
      case 'forest':
        return `
          radial-gradient(220% 160% at 50% 10%, #228b22 0%, #32cd32 35%, #006400 70%, #8fbc8f 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(34,139,34,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(0,100,0,0.12) 0%, transparent 50%)
        `;
      case 'royal':
        return `
          radial-gradient(220% 160% at 50% 10%, #4b0082 0%, #8a2be2 35%, #9932cc 70%, #ba55d3 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(128,0,128,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(75,0,130,0.12) 0%, transparent 50%)
        `;
      case 'galaxy':
        return `
          radial-gradient(220% 160% at 50% 10%, #191970 0%, #4b0082 35%, #8a2be2 70%, #9370db 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(138,43,226,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(25,25,112,0.12) 0%, transparent 50%)
        `;
      case 'diamond':
        return `
          radial-gradient(220% 160% at 50% 10%, #b0e0e6 0%, #87ceeb 35%, #4682b4 70%, #2f4f4f 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(185,242,255,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(70,130,180,0.12) 0%, transparent 50%)
        `;
      case 'platinum':
        return `
          radial-gradient(220% 160% at 50% 10%, #f5f5f5 0%, #e5e4e2 35%, #c0c0c0 70%, #a8a8a8 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(229,228,226,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(192,192,192,0.12) 0%, transparent 50%)
        `;
      case 'emerald':
        return `
          radial-gradient(220% 160% at 50% 10%, #006400 0%, #228b22 35%, #32cd32 70%, #90ee90 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(80,200,120,0.15) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(0,128,0,0.12) 0%, transparent 50%)
        `;
      case 'blue':
        return `
          radial-gradient(220% 160% at 50% 10%, #1e3a5f 0%, #0f1a2e 70%, #0a0f1a 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(0,100,200,0.1) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(50,100,255,0.08) 0%, transparent 50%)
        `;
      case 'purple':
        return `
          radial-gradient(220% 160% at 50% 10%, #4a1a5f 0%, #2a0f3e 70%, #1a0a1f 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(150,0,200,0.1) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(200,50,255,0.08) 0%, transparent 50%)
        `;
      case 'green':
      default:
        return `
          radial-gradient(220% 160% at 50% 10%, ${feltMid} 0%, ${feltDark} 70%, #082313 100%),
          radial-gradient(180% 120% at 30% 40%, rgba(0,100,0,0.1) 0%, transparent 60%),
          radial-gradient(160% 100% at 70% 60%, rgba(50,150,50,0.08) 0%, transparent 50%)
        `;
    }
  }};
  box-shadow: ${props => {
    const skin = props.skin || 'green';

    switch (skin) {
      case 'gold':
        return `
          inset 0 12px 24px rgba(0,0,0,0.6),
          inset 0 -8px 20px rgba(0,0,0,0.4),
          inset 0 0 0 1px rgba(255,215,0,0.2),
          0 2px 8px rgba(0,0,0,0.3)
        `;
      case 'crystal':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(135,206,235,0.15),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'red':
        return `
          inset 0 12px 24px rgba(0,0,0,0.6),
          inset 0 -8px 20px rgba(0,0,0,0.4),
          inset 0 0 0 1px rgba(255,69,0,0.2),
          0 2px 8px rgba(0,0,0,0.3)
        `;
      case 'black':
        return `
          inset 0 12px 24px rgba(255,255,255,0.1),
          inset 0 -8px 20px rgba(0,0,0,0.5),
          inset 0 0 0 1px rgba(169,169,169,0.1),
          0 2px 8px rgba(0,0,0,0.4)
        `;
      case 'rainbow':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(255,0,255,0.15),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'neon':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(255,0,255,0.2),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'sunset':
        return `
          inset 0 12px 24px rgba(0,0,0,0.6),
          inset 0 -8px 20px rgba(0,0,0,0.4),
          inset 0 0 0 1px rgba(255,140,0,0.2),
          0 2px 8px rgba(0,0,0,0.3)
        `;
      case 'ocean':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(0,191,255,0.15),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'lava':
        return `
          inset 0 12px 24px rgba(0,0,0,0.7),
          inset 0 -8px 20px rgba(0,0,0,0.5),
          inset 0 0 0 1px rgba(255,69,0,0.25),
          0 2px 8px rgba(0,0,0,0.4)
        `;
      case 'ice':
        return `
          inset 0 12px 24px rgba(255,255,255,0.2),
          inset 0 -8px 20px rgba(0,0,0,0.4),
          inset 0 0 0 1px rgba(173,216,230,0.15),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'forest':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(34,139,34,0.15),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'royal':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(128,0,128,0.2),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'galaxy':
        return `
          inset 0 12px 24px rgba(0,0,0,0.6),
          inset 0 -8px 20px rgba(0,0,0,0.4),
          inset 0 0 0 1px rgba(138,43,226,0.2),
          0 2px 8px rgba(0,0,0,0.3)
        `;
      case 'diamond':
        return `
          inset 0 12px 24px rgba(255,255,255,0.1),
          inset 0 -8px 20px rgba(0,0,0,0.4),
          inset 0 0 0 1px rgba(185,242,255,0.15),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'platinum':
        return `
          inset 0 12px 24px rgba(255,255,255,0.15),
          inset 0 -8px 20px rgba(0,0,0,0.5),
          inset 0 0 0 1px rgba(229,228,226,0.2),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'emerald':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(80,200,120,0.15),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'blue':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(50,100,200,0.1),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'purple':
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(150,50,200,0.1),
          0 2px 8px rgba(0,0,0,0.2)
        `;
      case 'green':
      default:
        return `
          inset 0 12px 24px rgba(0,0,0,0.5),
          inset 0 -8px 20px rgba(0,0,0,0.3),
          inset 0 0 0 1px rgba(100,200,100,0.1),
          0 2px 8px rgba(0,0,0,0.2)
        `;
    }
  }};
  overflow: visible;        /* <<< permite que la dealer salga por arriba */

  /* Brillo especular en la parte superior */
  &::before{
    content:'';
    position:absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30%;
    border-radius: inherit;
    background: linear-gradient(
      180deg,
      rgba(255,255,255,0.25) 0%,
      rgba(255,255,255,0.1) 30%,
      transparent 100%
    );
    pointer-events: none;
  }

  /* Variaciones de textura */
  &::after{
    content:'';
    position:absolute;
    inset: 0;
    border-radius: inherit;
    background:
      radial-gradient(ellipse 150% 100% at 50% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0,0,0,0.1) 0%, transparent 30%);
    pointer-events: none;
    mix-blend-mode: overlay;
  }
`

/** Glow de turno (si lo usas) */
const glow = keyframes`
  0%,100% { box-shadow: 0 0 0 rgba(0,0,0,0), 0 0 16px rgba(84,255,138,0.0); }
  50%    { box-shadow: 0 0 0 rgba(0,0,0,0), 0 0 22px rgba(84,255,138,0.9); }
`
export const SeatGlow = styled.div<{ $active?: boolean }>`
  position: absolute;
  width: 120px;
  height: 60px;
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(12deg);
  pointer-events: none;
  z-index: 3;

  ${({ $active }) =>
    $active &&
    css`
      animation: ${glow} 1.8s ease-in-out infinite;
      outline: 2px solid rgba(84, 255, 138, 0.45);
      outline-offset: 6px;
    `}
`

/** (Versión antigua) PotArea plano – puedes mantenerla si la usas en otro lugar */
export const PotArea = styled.div`
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%) rotateX(12deg);
  min-width: 160px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(3px);
  text-align: center;
  color: #f1f1f1;
  font-weight: 600;
  letter-spacing: 0.4px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.15),
    0 6px 14px rgba(0,0,0,0.35);
  pointer-events: none;
  z-index: 3;
`

/** Chips volando */
const fly = keyframes`
  0% { transform: translate(var(--fromX,0), var(--fromY,0)) rotateX(12deg) scale(0.9); opacity: 0; }
  100%{ transform: translate(0,0) rotateX(12deg) scale(1); opacity: 1; }
`
export const ChipStack = styled.div`
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%,-50%) rotateX(12deg);
  display: flex;
  gap: 4px;
  pointer-events: none;
  z-index: 3;

  > div {
    width: 18px; height: 18px; border-radius: 50%;
    background:
      radial-gradient(circle at 30% 30%, #ffffffaa, #ffffff00 45%),
      linear-gradient(#d33, #a11);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.4);
    animation: ${fly} 380ms ease-out both;
  }
`

/* =========================
   Dealer y cartas voladoras
   ========================= */

export const DealerBadge = styled.div`
  position: absolute;
  width: 44px; height: 44px;
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(12deg);
  display: grid; place-items: center;
  font-size: 22px;
  background:
    radial-gradient(circle at 30% 30%, #ffffff, #f1d27a 55%, #d8b54d);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.8),
    0 6px 14px rgba(0,0,0,0.35);
  z-index: 4;
  pointer-events: none;
`

const dealFly = keyframes`
  0%   {
    transform: translate(var(--fromX, 0), var(--fromY, 0)) rotateX(12deg) rotateY(-15deg) scale(0.8);
    opacity: 0;
    filter: blur(2px);
  }
  30%  {
    transform: translate(calc(var(--fromX, 0) * 0.6), calc(var(--fromY, 0) * 0.6)) rotateX(12deg) rotateY(-8deg) scale(0.9);
    opacity: 0.8;
    filter: blur(1px);
  }
  70%  {
    transform: translate(calc(var(--fromX, 0) * 0.2), calc(var(--fromY, 0) * 0.2)) rotateX(12deg) rotateY(2deg) scale(1.02);
    opacity: 1;
    filter: blur(0px);
  }
  100% { transform: translate(0, 0) rotateX(12deg) rotateY(0deg) scale(1); opacity: 1; filter: blur(0px); }
`
export const FlyCard = styled.div`
  position: absolute;
  left: 50%; top: 50%;
  width: 28px; height: 38px;
  border-radius: 4px;
  background:
    linear-gradient(135deg, #ffffff 0%, #f8f8f8 30%, #f0f0f0 70%, #e8e8e8 100%),
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 0%, transparent 40%);
  box-shadow:
    0 8px 16px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.9),
    inset 0 -1px 0 rgba(200,200,200,0.5),
    inset 1px 0 0 rgba(200,200,200,0.3),
    inset -1px 0 0 rgba(200,200,200,0.3);
  transform: translate(-50%,-50%) rotateX(12deg);
  animation: ${dealFly} 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  z-index: 4;
  pointer-events: none;

  /* Borde sutil de la carta */
  &::before {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 2px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  }
`

/* ===== Dealer humano (figura + brazo con swing) ===== */
const armDeal = keyframes`
  0%   { transform: translate(-50%, -50%) rotateX(12deg) rotate(0deg); }
  45%  { transform: translate(-50%, -50%) rotateX(12deg) rotate(-22deg); }
  100% { transform: translate(-50%, -50%) rotateX(12deg) rotate(0deg); }
`

export const DealerFigure = styled.img`
  position: absolute;
  left: 50%;
  top: var(--dealerTop, -78px);  /* ajustable; sobresale del fieltro */
  transform: translateX(-50%) rotateX(8deg);
  width: var(--dealerW, 120px);  /* ← ahora escalable desde React */
  height: auto;
  z-index: 6;                   /* por encima del fieltro */
  pointer-events: none;
  border-radius: 50% 50% 40% 40%; /* borde sutil para que encaje mejor */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* sombra muy sutil */
`

export const DealerArm = styled.div<{ $swing?: boolean }>`
  position: absolute;
  left: 50%;
  top: var(--dealerArmTop, 8%);
  width: 68px;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(#d0a27a, #a4764f);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4);
  transform-origin: 0% 50%;
  transform: translate(-50%, -50%) rotateX(12deg);
  z-index: 6;
  pointer-events: none;

  ${({ $swing }) => $swing && css`animation: ${armDeal} 360ms ease-out 1;`}
`

export const DealerAvatarFallback = styled.div`
  position: absolute;
  left: 50%;
  top: -44px;
  transform: translateX(-50%) rotateX(8deg);
  width: 84px; height: 84px;
  border-radius: 50%;
  display: grid; place-items: center;
  font-size: 40px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(233,238,246,0.7) 55%, rgba(200,212,229,0.5));
  box-shadow: 0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
  z-index: 6;
  pointer-events: none;
`

/* =========================
   POT HUD (fichas + monto)
   ========================= */
const potPulse = keyframes`
  0%   { box-shadow: inset 0 0 0 0 rgba(84,255,138,0), 0 0 0 0 rgba(84,255,138,0); }
  40%  { box-shadow: inset 0 0 0 1px rgba(84,255,138,.45), 0 0 22px 6px rgba(84,255,138,.25); }
  100% { box-shadow: inset 0 0 0 0 rgba(84,255,138,0), 0 0 0 0 rgba(84,255,138,0); }
`
export const PotHud = styled.div<{ $pulse?: boolean }>`
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%) rotateX(12deg);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 16px;
  background: rgba(0,0,0,0.28);
  backdrop-filter: blur(4px);
  color: #eaf5ea;
  font-weight: 700;
  letter-spacing: .3px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 3px 8px rgba(0,0,0,0.2);
  pointer-events: none;
  z-index: 8; /* por encima de comunitarias */

  ${({ $pulse }) => $pulse && css`animation: ${potPulse} 900ms ease-out;`}
`
export const PotLabel = styled.span`
  opacity: .9;
  font-size: 13px;
  text-transform: uppercase;
  margin-right: 2px;
`
export const PotAmount = styled.span`
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(0,0,0,0.35);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;  /* Evitar saltos de línea */
  display: inline-block; /* Mantener en línea */

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 4px 8px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 3px 6px;
  }
`

/** Contenedor de la(s) columna(s) de fichas dentro del HUD */
export const PotStackWrap = styled.div`
  position: relative;
  width: 88px;    /* espacio para varias columnas */
  height: 38px;   /* altura de la pila */
  pointer-events: none;
  overflow: hidden;

  /* sombra elíptica sutil bajo la pila */
  &::before{
    content:'';
    position:absolute;
    left:8px; right:8px; bottom:2px;
    height: 6px;
    border-radius: 999px;
    background: radial-gradient(ellipse at center, rgba(0,0,0,.15), rgba(0,0,0,0));
    filter: blur(1px);
  }
`

type Denom = 5|10|25|50|100|500|1000

/** Ficha premium con texturas realistas */
export const PotChipToken = styled.div<{ $denom: Denom }>`
  position: absolute;
  width: 20px; height: 20px;
  border-radius: 50%;
  left: calc(6px + var(--col, 0) * 12px);
  bottom: calc(var(--row, 0) * 3px);
  z-index: calc(10 + var(--row, 0) + var(--col, 0) * 12);
  transform: rotate(var(--twist, 0deg)) rotateX(12deg);

  ${({ $denom }) => {
    switch ($denom) {
      case 5:    return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #ffebee 40%, #ff6b6b 55%, #b71c1c 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 10:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #e3f2fd 40%, #6bb0ff 55%, #1c43b7 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 25:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #e8f5e8 40%, #59c46b 55%, #197a2c 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 50:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #fff8e1 40%, #ffe066 55%, #b38a00 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 100:  return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #fafafa 40%, #4a4a4a 55%, #121212 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 500:  return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #f3e5f5 40%, #9a88ff 55%, #4f3fb3 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 1000: return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #fff3e0 40%, #ffa83a 55%, #c26a00 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
    }
  }}

  /* Sombras y texturas premium */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.8),
    inset 0 -1px 0 rgba(0,0,0,0.2),
    0 2px 6px rgba(0,0,0,0.4),
    0 1px 2px rgba(0,0,0,0.2);

  /* Centro con borde metálico */
  &::before{
    content:'';
    position:absolute; inset:3px; border-radius:50%;
    box-shadow:
      inset 0 0 0 2px rgba(255,255,255,0.9),
      inset 0 0 0 3px rgba(0,0,0,0.15),
      inset 1px 1px 0 rgba(255,255,255,0.5);
    opacity: 0.95;
  }

  /* Resalte superior */
  &::after{
    content:'';
    position:absolute; top:2px; left:2px; right:2px; bottom:2px; border-radius:50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 70%);
    mix-blend-mode: overlay;
  }
`

/** Chip “+N” cuando hay demasiadas fichas */
export const PotMore = styled.div`
  position: absolute;
  width: 20px; height: 20px;
  border-radius: 50%;
  left: calc(6px + var(--col, 0) * 12px);
  bottom: calc(var(--row, 0) * 3px);
  display: grid; place-items: center;
  background: rgba(0,0,0,.55);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  box-shadow: 0 2px 4px rgba(0,0,0,.35);
  z-index: 99;
`


