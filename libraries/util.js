/** Convert a number to a string in the modifier format
 * @param {number} number
 * @returns {string}
 */
function numberToModifier(number) {
  if (Number.isNaN(number)) {
    return "";
  }
  if (!Number.isInteger(number) || (!number && number !== 0)) {
    console.error("numberToModifier received an invalid number: ", number);
    return "";
  }

  return number >= 0 ? `+${number}` : number.toString();
}
