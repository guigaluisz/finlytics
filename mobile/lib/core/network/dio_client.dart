import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

/// Cliente HTTP com interceptors de auth e refresh transparente.
class DioClient {
  final Dio dio;
  final SecureStorage storage;

  DioClient(this.storage, {String baseUrl = 'https://api.finlytics.app/v1'})
      : dio = Dio(BaseOptions(
          baseUrl: baseUrl,
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
      onError: (e, handler) async {
        // 401 -> tentar refresh (omitido por brevidade no scaffold).
        handler.next(e);
      },
    ));
  }
}
