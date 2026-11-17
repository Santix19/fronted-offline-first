/**
 * Las aletas, dibujadas antes que el cuerpo para que este les tape el nacimiento y parezcan
 * salir de dentro. La adiposa, la pequeña que va entre la dorsal y la cola, es de las cosas que
 * distinguen a una trucha de cualquier otro pez.
 */
export function TroutFins() {
  return (
    <g stroke="var(--trout-edge)" strokeWidth="4" strokeLinejoin="round" fill="var(--trout-fin)">
      {/* Cola, poco ahorquillada como la de una trucha */}
      <path d="M84 80 L24 36 L46 80 L24 124 Z" />
      {/* Dorsal en la mitad del lomo y la adiposa antes del pedúnculo */}
      <path d="M186 42 L212 6 L252 50 Z" />
      <path d="M112 58 L126 36 L140 54 Z" />
      {/* Las de abajo: pélvica en el medio y anal cerca de la cola */}
      <path d="M196 116 L206 150 L246 120 Z" />
      <path d="M124 104 L120 132 L158 112 Z" />
    </g>
  );
}

/** La pectoral va encima del cuerpo: es la del costado que mira a quien ve el dibujo. */
export function TroutPectoralFin() {
  return (
    <g stroke="var(--trout-edge)" strokeLinejoin="round" strokeLinecap="round">
      <path d="M292 96 L286 132 L330 106 Z" fill="var(--trout-fin)" strokeWidth="4" />
      {/* Agalla */}
      <path d="M330 54 C 318 68, 318 94, 330 108" fill="none" strokeWidth="3.5" />
    </g>
  );
}
