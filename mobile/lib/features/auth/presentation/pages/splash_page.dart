import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../viewmodels/auth_viewmodel.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});
  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  @override
  void initState() {
    super.initState();
    _decidirRota();
  }

  /// Após um breve splash, decide: se há token salvo vai ao dashboard, senão ao login.
  Future<void> _decidirRota() async {
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    String? token;
    try {
      token = await ref.read(secureStorageProvider).readAccessToken();
    } catch (_) {
      token = null; // em web, storage pode não estar disponível
    }
    if (!mounted) return;
    context.go(token != null ? '/dashboard' : '/login');
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('◆ Finlytics', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            SizedBox(height: 24),
            CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
