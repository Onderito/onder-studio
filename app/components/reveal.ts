/**
 * Signal « la page peut apparaître », partagé entre le Loader et le contenu.
 *
 * Le Loader le déclenche au moment où il commence à dévoiler la page
 * (ou tout de suite s'il ne se joue pas : déjà vu, reduced motion).
 * Si le signal est déjà parti quand on s'abonne, le rappel s'exécute immédiatement.
 */
let revealed = false;
const listeners = new Set<() => void>();

export function triggerReveal() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onReveal(cb: () => void) {
  if (revealed) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
