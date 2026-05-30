import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

/// URL base da API. Sobrescreva com --dart-define=API_BASE=...
/// - Web / iOS Simulator: http://localhost:3000/v1
/// - Emulador Android:    http://10.0.2.2:3000/v1  (10.0.2.2 = localhost do host)
/// - Dispositivo físico:  http://SEU_IP_LAN:3000/v1
const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://localhost:3000/v1',
);

/// Cliente HTTP com interceptors de autenticação.
class DioClient {
  final Dio dio;
  final SecureStorage storage;

  DioClient(this.storage, {String? baseUrl})
      : dio = Dio(BaseOptions(
          baseUrl: baseUrl ?? kApiBase,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
        )) {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.readAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }
}
