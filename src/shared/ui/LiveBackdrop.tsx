import { Component, lazy, Suspense, type ReactNode } from 'react';
import { useReducedMotion } from '../motion/reducedMotion';
import { Backdrop } from './Backdrop';
import { useDarkPalette } from './theme';

// three.js only downloads on the screens that use the lagoon, never in the main bundle
const LagoonScene = lazy(() => import('../three/LagoonScene'));

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** If the 3D scene throws (lost context, old GPU), the flat backdrop takes its place. */
class Fallback extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The loud background for the story and the sign-in: the live 3D lagoon where the phone can
 * draw it, the CSS backdrop otherwise (reduced motion, no WebGL, still loading, or a crash).
 */
export function LiveBackdrop({ mode = 'story' }: { mode?: 'story' | 'app' }) {
  const reduced = useReducedMotion();
  const dark = useDarkPalette();
  // The flat fallback follows the same rule: blue and lime when signed in, the violet set in the story
  const flat = <Backdrop fixed sky={mode === 'app'} />;
  if (reduced || !hasWebGL()) return flat;
  return (
    <div className="lagoon" aria-hidden="true">
      <Fallback fallback={flat}>
        <Suspense fallback={flat}>
          <LagoonScene mode={mode} dark={dark} />
        </Suspense>
      </Fallback>
    </div>
  );
}
