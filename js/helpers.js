export const setToday = datePicker => {
  if (!datePicker.value) {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = ("0" + (d.getMonth() + 1)).slice(-2);
    const dd = ("0" + d.getDate()).slice(-2);
    datePicker.value = `${yyyy}-${mm}-${dd}`;
  }
};

export const parseYear = str => {
  if (str.includes("BC")) {
    return -parseInt(str.replace("BC", "").trim(), 10);
  }
  const n = parseInt(str, 10);
  return isNaN(n) ? 0 : n;
};