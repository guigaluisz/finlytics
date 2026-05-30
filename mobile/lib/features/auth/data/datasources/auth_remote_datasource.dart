import 'package:dio/dio.dart';
import '../models/auth_session_model.dart';
import '../../domain/entities/auth_session.dart';

class AuthRemoteDataSource {
  final Dio dio;
  AuthRemoteDataSource(this.dio);

  Future<AuthSession> login(String email, String senha) async {
    final res = await dio.post('/autenticacao/login', data: {'email': email, 'senha': senha});
    return AuthSessionModel.fromJson(res.data as Map<String, dynamic>);
  }

  Future<AuthSession> register(Map<String, dynamic> body) async {
    final res = await dio.post('/autenticacao/registrar', data: body);
    return AuthSessionModel.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> logout(String tokenAtualizacao) async {
    await dio.post('/autenticacao/sair', data: {'tokenAtualizacao': tokenAtualizacao});
  }
}
