// src/lib/funFacts.js
// Collection of light, encouraging fun facts for students.
// We rotate randomly per render; can extend later with categories.

export const FUN_FACTS = [
  "Creierul tău consumă ~20% din energia corpului, deși cântărește doar ~2%. Hidratează-te!",
  "O pauză scurtă de 5 minute la fiecare 25 de minute de învățare poate crește retenția (tehnica Pomodoro).",
  "Râsul activează zone ale creierului ce reduc stresul și cresc atenția pentru următoarea activitate.",
  "Dormitul suficient (8-9h pentru copii) consolidează memoria și ajută la învățare mai rapidă azi.",
  "Plantele din cameră pot îmbunătăți concentrarea și nivelul de oxigen – îngrijește una!",
  "Învățarea prin predare: explică unui coleg ce ai învățat și vei reține dublu.",
  "Mișcarea ușoară (10 genuflexiuni) înainte de un quiz poate crește fluxul de sânge spre creier.",
  "Culorile vii în notițe cresc recunoașterea vizuală și viteza de recapitulare.",
  "Ascultarea activă a altora te ajută să îți îmbunătățești propriile idei – empatia accelerează creativitatea.",
  "Economisirea regulată, chiar și a unor sume mici, creează obiceiuri puternice pe termen lung."
];

export function getRandomFunFact() {
  if (!FUN_FACTS.length) return null;
  const idx = Math.floor(Math.random() * FUN_FACTS.length);
  return FUN_FACTS[idx];
}

export default FUN_FACTS;
