import 'package:flutter/material.dart';

void main() {
  runApp(const DonationApp());
}

class DonationApp extends StatelessWidget {
  const DonationApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'منظومة التبرعات السحابية',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF10B981)),
        useMaterial3: true,
        fontFamily: 'Cairo',
      ),
      home: const Scaffold(
        body: Center(
          child: Text(
            'منظومة إدارة وتتبع التبرعات - تطبيق الهاتف (Flutter-Ready)',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
