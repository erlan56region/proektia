/** Small CSV reader for Google Sheets exports (comma or semicolon separated). */
export function parseCsv(input = '') {
  const text = input.replace(/^\uFEFF/, '');
  const delimiter = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

export function rowsToObjects(rows) {
  const [header = [], ...data] = rows;
  const cleanHeader = header.map((cell) => cell.trim().toLowerCase());
  return data.map((cells, index) => {
    const object = { __row: index + 2 };
    cleanHeader.forEach((key, column) => {
      if (key) object[key] = cells[column] ?? '';
    });
    return object;
  });
}

export function columnLetter(index) {
  let n = index + 1;
  let result = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}
