import 'package:flutter/material.dart';

/// Tokens de cor do Design System Finlytics.
abstract class AppColors {
  static const primary = Color(0xFF1F6FEB);
  static const secondary = Color(0xFF00B37E); // receitas / sucesso
  static const danger = Color(0xFFE5484D);    // despesas / erro
  static const warning = Color(0xFFF5A623);

  // Light
  static const bgLight = Color(0xFFF7F8FA);
  static const surfaceLight = Color(0xFFFFFFFF);
  static const onSurfaceLight = Color(0xFF1A1D23);
  static const mutedLight = Color(0xFF6B7280);

  // Dark
  static const bgDark = Color(0xFF0E1116);
  static const surfaceDark = Color(0xFF171B22);
  static const onSurfaceDark = Color(0xFFE6E8EB);
  static const mutedDark = Color(0xFF9BA1A8);
}
