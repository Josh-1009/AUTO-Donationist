/// Models for Architecture v2 (Google OAuth, cycles, campaigns, one-time donations)

class DonorModel {
  final String id;
  final String donorCode;
  final String fullName;
  final String? email;
  final String? phone;
  final String status;
  final String? academicYear;
  final String? dept;
  final double committedAmount;
  final List<DonationCycleModel>? cycles;

  DonorModel({
    required this.id,
    required this.donorCode,
    required this.fullName,
    this.email,
    this.phone,
    required this.status,
    this.academicYear,
    this.dept,
    required this.committedAmount,
    this.cycles,
  });

  factory DonorModel.fromJson(Map<String, dynamic> json) {
    return DonorModel(
      id: json['id'] ?? '',
      donorCode: json['donorCode'] ?? '',
      fullName: json['fullName'] ?? '',
      email: json['email'],
      phone: json['phone'],
      status: json['status'] ?? 'active',
      academicYear: json['academicYear'],
      dept: json['dept'],
      committedAmount: (json['committedAmount'] ?? 500).toDouble(),
      cycles: json['cycles'] != null
          ? (json['cycles'] as List).map((c) => DonationCycleModel.fromJson(c)).toList()
          : null,
    );
  }
}

class CampaignModel {
  final String id;
  final String title;
  final String slug;
  final String? description;
  final double campaignTotalTarget;
  final double currentAmount;
  final String donationType; // recurring, one_time
  final String? whatsappTemplate;
  final bool isActive;

  CampaignModel({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    required this.campaignTotalTarget,
    required this.currentAmount,
    required this.donationType,
    this.whatsappTemplate,
    required this.isActive,
  });

  factory CampaignModel.fromJson(Map<String, dynamic> json) {
    return CampaignModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      campaignTotalTarget: (json['campaignTotalTarget'] ?? 0).toDouble(),
      currentAmount: (json['currentAmount'] ?? 0).toDouble(),
      donationType: json['donationType'] ?? 'recurring',
      whatsappTemplate: json['whatsappTemplate'],
      isActive: json['isActive'] ?? true,
    );
  }
}

class DonationCycleModel {
  final String id;
  final String donorId;
  final String campaignId;
  final String cycleMonth;
  final double cycleExpectedAmount;
  final double paidAmount;
  final String status; // pending, partially_paid, paid, postponed, skipped, overdue, failed
  final int postponeCount;
  final int skipCount;
  final String? notes;
  final CampaignModel? campaign;

  DonationCycleModel({
    required this.id,
    required this.donorId,
    required this.campaignId,
    required this.cycleMonth,
    required this.cycleExpectedAmount,
    required this.paidAmount,
    required this.status,
    required this.postponeCount,
    required this.skipCount,
    this.notes,
    this.campaign,
  });

  factory DonationCycleModel.fromJson(Map<String, dynamic> json) {
    return DonationCycleModel(
      id: json['id'] ?? '',
      donorId: json['donorId'] ?? '',
      campaignId: json['campaignId'] ?? '',
      cycleMonth: json['cycleMonth'] ?? '',
      cycleExpectedAmount: (json['cycleExpectedAmount'] ?? 0).toDouble(),
      paidAmount: (json['paidAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      postponeCount: json['postponeCount'] ?? 0,
      skipCount: json['skipCount'] ?? 0,
      notes: json['notes'],
      campaign: json['campaign'] != null ? CampaignModel.fromJson(json['campaign']) : null,
    );
  }
}
