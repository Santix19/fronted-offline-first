import { Trout } from './Trout';

/**
 * Un banco de truchas cruzando el fondo de la app.
 *
 * Cada una lleva su propia altura, tamaño, velocidad y retraso, porque un banco donde todas nadan
 * igual se ve como una calcomanía repetida. Va detrás de todo y no recibe toques: encima de esto
 * se leen los datos de la finca, así que es agua, no interfaz.
 */
const SCHOOL = [
  { top: '12%', width: 150, seconds: 42, delay: 0 },
  { top: '28%', width: 92, seconds: 61, delay: -14 },
  { top: '44%', width: 190, seconds: 35, delay: -26 },
  { top: '58%', width: 70, seconds: 74, delay: -6 },
  { top: '72%', width: 130, seconds: 50, delay: -38 },
  { top: '86%', width: 104, seconds: 66, delay: -20 },
];

export function TroutSchool() {
  return (
    <div className="trout-school" aria-hidden="true">
      {SCHOOL.map((fish) => (
        <Trout
          key={fish.top}
          width={fish.width}
          // El retraso negativo arranca la animación a mitad de camino: al abrir la app ya hay
          // truchas en la pantalla en vez de un fondo vacío esperando a que entren
          style={{ top: fish.top, animationDuration: `${fish.seconds}s`, animationDelay: `${fish.delay}s` }}
        />
      ))}
    </div>
  );
}
