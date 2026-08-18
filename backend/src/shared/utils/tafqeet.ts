/**
 * Arabic number to words (Tafqeet) helper for Official Charity Receipt Vouchers
 */
export function tafqeet(amount: number): string {
  if (amount === 0) return 'صفر جنيه مصري';

  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  const thousands = ['', 'ألف', 'ألفان', 'آلاف', 'ألفاً'];

  function convertChunk(num: number): string {
    let text = '';
    const h = Math.floor(num / 100);
    const remainder = num % 100;

    if (h > 0) {
      text += hundreds[h];
    }

    if (remainder > 0) {
      if (h > 0) text += ' و ';

      if (remainder <= 10) {
        text += units[remainder];
      } else if (remainder < 20) {
        text += teens[remainder - 10];
      } else {
        const u = remainder % 10;
        const t = Math.floor(remainder / 10);
        if (u > 0) {
          text += units[u] + ' و ' + tens[t];
        } else {
          text += tens[t];
        }
      }
    }
    return text;
  }

  const intPart = Math.floor(amount);
  let result = '';

  if (intPart < 1000) {
    result = convertChunk(intPart);
  } else if (intPart < 1000000) {
    const k = Math.floor(intPart / 1000);
    const rest = intPart % 1000;

    if (k === 1) {
      result = 'ألف';
    } else if (k === 2) {
      result = 'ألفان';
    } else if (k >= 3 && k <= 10) {
      result = convertChunk(k) + ' آلاف';
    } else {
      result = convertChunk(k) + ' ألفاً';
    }

    if (rest > 0) {
      result += ' و ' + convertChunk(rest);
    }
  } else {
    result = intPart.toLocaleString('ar-EG');
  }

  return `فقط ${result} جنيهاً مصرياً لا غير`;
}
