/// Unified API Response model matching the backend JSON output:
/// `{ "success": true, "data": { ... }, "message": "..." }`
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String message;
  final dynamic error;

  ApiResponse({
    required this.success,
    this.data,
    required this.message,
    this.error,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json) fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      message: json['message'] ?? '',
      error: json['error'],
    );
  }
}
