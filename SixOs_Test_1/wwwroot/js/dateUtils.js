// Format date input as the user types (dd-mm-yyyy)
function formatDateInput(value) {
  // Remove all non-numeric characters
  const numbers = value.replace(/[^\d]/g, '');
  // Insert hyphens
  let formatted = '';
  for (let i = 0; i < numbers.length && i < 8; i++) {
    if (i === 2 || i === 4) {
      formatted += '-';
    }
    formatted += numbers[i];
  }
  return formatted;
}
// Format date for display (dd-mm-yyyy)
function formatDateForDisplay(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
// Parse date string (dd-mm-yyyy) to Date object
function parseDate(dateString) {
  if (!dateString || dateString.length !== 10) {
    return null;
  }
  const [day, month, year] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}