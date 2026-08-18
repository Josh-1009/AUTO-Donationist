export interface MessageContext {
  donorName: string;
  donorCode?: string;
  campaignTitle: string;
  targetAmount: number;
  postponeCount?: number;
  payLink?: string;
  cycleMonth?: string;
}

export class TemplatesHelper {
  static getPostponeReminderMessage(ctx: MessageContext): string {
    return (
      `السلام عليكم ورحمة الله وبركاته، أهلاً بك يا ${ctx.donorName} 🌸\n\n` +
      `نذكرك بمساهمتك المباركة في حملة: *${ctx.campaignTitle}* بمبلغ *${ctx.targetAmount} ج.م* لشهر ${ctx.cycleMonth || 'الحالي'}.\n\n` +
      `«وما تنفقوا من شيء فإن الله يخلفه وهو خير الرازقين» 🤍\n` +
      `لقد طلبت تأجيل الموعد ونود الاطمئنان عليك وتجديد النية الطيبة في هذا العمل المبارك.\n\n` +
      `رابط السداد والمتابعة: ${ctx.payLink || 'عبر المنصة'}\n` +
      `كود المتبرع الخاص بك: *${ctx.donorCode || ''}*\n` +
      `جزاكم الله خير الجزاء ونفع بكم 🤲`
    );
  }

  static getEscalationMessage(ctx: MessageContext): string {
    return (
      `السلام عليكم ورحمة الله وبركاته، الأخ الفاضل / الأخت الفاضلة ${ctx.donorName} 🌿\n\n` +
      `نتواصل معك بخصوص مساهمتك الطيبة في حملة: *${ctx.campaignTitle}* (كود: ${ctx.donorCode || ''}).\n` +
      `نظراً لمرور فترة التأجيل المقررة (5 أيام)، نود تذكيرك بفضل الاستمرار في الصدقة وأثرها العظيم في تفريج الكربات.\n\n` +
      `إذا واجهتك أي صعوبة في الدفع أو رغبت في ترتيب الموعد، نحن في خدمتك دائماً عبر هذه المحادثة.\n\n` +
      `رابط صفحة السداد المباشر: ${ctx.payLink || ''}\n\n` +
      `«أحب الأعمال إلى الله أدومها وإن قل» 🌟`
    );
  }

  static getPaymentConfirmationMessage(ctx: MessageContext): string {
    return (
      `السلام عليكم ورحمة الله وبركاته، ${ctx.donorName} 💐\n\n` +
      `تم استلام مساهمتك الكريمة بمبلغ *${ctx.targetAmount} ج.م* في حملة: *${ctx.campaignTitle}* بنجاح.\n` +
      `تقبل الله منكم صالح الأعمال وبارك في رزقكم وأهليكم 🤲`
    );
  }
}
