export class WhatsAppService {
  static formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('01') && cleaned.length === 11) {
      cleaned = '20' + cleaned.substring(1);
    } else if (cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '20' + cleaned;
    }
    return cleaned;
  }

  static generateDirectWhatsAppUrl(phone: string, text: string): string {
    const formattedPhone = this.formatPhoneNumber(phone);
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${formattedPhone}?text=${encodedText}`;
  }

  /**
   * Receipt Thank You Message
   */
  static getReceiptThankYouUrl(
    phone: string,
    donorName: string,
    donorCode: string,
    amount: number,
    voucherNumber: string,
    campaignTitle: string
  ): string {
    const text = `السلام عليكم ورحمة الله وبركاته، أستاذنا الفاضل / ${donorName} 🤍

نود إبلاغكم باستلام مساهمتكم الكريمة بمبلغ (${amount} ج.م) لحساب: [${campaignTitle}].
سند قبض رقم: ${voucherNumber}
كود المتبرع: ${donorCode}

جزاكم الله خيراً وبارك لكم في مالكم وأهليكم وتقبل منكم صالح الأعمال 🤲
— الجمعية الخيرية`;

    return this.generateDirectWhatsAppUrl(phone, text);
  }

  /**
   * Reminder & Intention Renewal Message
   */
  static getReminderWhatsAppUrl(
    phone: string,
    donorName: string,
    donorCode: string,
    campaignTitle: string,
    expectedAmount: number,
    cycleMonth?: string
  ): string {
    const text = `السلام عليكم ورحمة الله وبركاته، أستاذنا الفاضل / ${donorName} 🤍

تذكيراً وتجديداً للنية في صدقة هذا الشهر (${cycleMonth || 'الحالي'}) لمشروع: [${campaignTitle}].
قيمة المساهمة الشهرية: (${expectedAmount} ج.م)
كود المتبرع: ${donorCode}

قال رسول الله ﷺ: "ما نقص مال من صدقة"..
يسعدنا التنسيق معكم لاستلام المساهمة (بالمقر / عبر المندوب / أو بالتحويل).

تقبل الله طاعتكم 🤍
— الجمعية الخيرية`;

    return this.generateDirectWhatsAppUrl(phone, text);
  }

  /**
   * Overdue / Follow-up Message
   */
  static getFollowupWhatsAppUrl(
    phone: string,
    donorName: string,
    donorCode: string,
    campaignTitle: string,
    expectedAmount: number
  ): string {
    const text = `السلام عليكم ورحمة الله وبركاته، أخي الفاضل / ${donorName} 🤍

نأمل أن تكونوا في أتم صحة وعافية.
نود الاطمئنان عليكم بخصوص مساهمتكم الكريمة في [${campaignTitle}] بقيمة (${expectedAmount} ج.م).

إذا كنتم ترغبون في تأجيل الموعد أو التنسيق مع المندوب نتشرف بالتواصل معكم دائماً في أي وقت يناسبكم.

حفظكم الله وبارك فيكم 🤍
— الجمعية الخيرية`;

    return this.generateDirectWhatsAppUrl(phone, text);
  }
}
