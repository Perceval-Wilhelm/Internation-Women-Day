// Shrinks the bouquet just enough to clear the text above it, for any screen and message length.
// Its top petal sits 0.89 × scale × vmin above the .flowers anchor (measured from the art).
export function fitBouquet(hero: HTMLElement) {
  hero.style.removeProperty("--fit");
  const flowers = hero.querySelector(".flowers");
  const copy = Array.from(hero.querySelectorAll(".hero__copy > :not([hidden])")).filter(
    (el) => getComputedStyle(el).position !== "absolute",
  );
  if (!flowers || !copy.length) return;
  const textBottom = Math.max(...copy.map((el) => el.getBoundingClientRect().bottom));
  const vmin = Math.min(innerWidth, innerHeight) / 100;
  const fit = (flowers.getBoundingClientRect().bottom - textBottom - 24) / (89 * vmin);
  if (fit < parseFloat(getComputedStyle(hero).getPropertyValue("--bouquet-scale"))) {
    hero.style.setProperty("--fit", Math.max(fit, 0.45).toFixed(3));
  }
}
