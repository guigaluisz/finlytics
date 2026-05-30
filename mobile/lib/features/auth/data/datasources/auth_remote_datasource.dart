import 'package:dio/dio.dart';
import '../models/auth_session_model.dart';
import '../../domain/entities/auth_session.dart';

class AuthRemoteDataSource {
  final Dio dio;
  AuthRemoteDataSource(this.dio);

  Future<AuthSession> login(String email, String password) async {
    final res = await dio.post('/auth/login', data: {'email': email, 'password': password});
    return AuthSessionModel.fromJson(res.data as Map<String, dynamic>);
  }

  Future<AuthSession> register(Map<String, dynamic> body) async {
    final res = await dio.post('/auth/register', data: body);
    return AuthSessionModel.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> logout(String refreshToken) async {
    await dio.post('/auth/logout', data: {'refreshToken': refreshToken});
  }
}
