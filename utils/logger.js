/**
 * Helpers de logging pour analyse en prod.
 * Chaque erreur loguée inclut timestamp ISO, message, contexte optionnel et stack si disponible.
 */

/**
 * Log une erreur avec timestamp, contexte et stack.
 * @param {string} label - Ex: "OpenRouter", "MessageCreate", "Interaction"
 * @param {string} message - Message d'erreur
 * @param {Object} [context] - Contexte additionnel (sera sérialisé en JSON)
 * @param {Error} [error] - Objet Error pour name + stack
 */
export function logError(label, message, context = {}, error = null) {
  const ts = new Date().toISOString();
  const ctxStr = Object.keys(context).length ? ` | ${JSON.stringify(context)}` : '';
  console.error(`[${ts}] ❌ ${label}: ${message}${ctxStr}`);
  if (error) {
    if (error.name) console.error(`[${ts}]   → type: ${error.name}`);
    if (error.stack) console.error(`[${ts}]   → stack: ${error.stack}`);
  }
}
