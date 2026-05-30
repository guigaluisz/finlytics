import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remote;
  final SecureStorage storage;
  AuthRepositoryImpl(this.remote, this.storage);

  @override
  Future<Either<Failure, AuthSession>> login(String email, String password) async {
    try {
      final session = await remote.login(email, password);
      await storage.saveTokens(session.accessToken, session.refreshToken);
      return Right(session);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) return const Left(AuthFailure());
      if (e.type == DioExceptionType.connectionError) return const Left(NetworkFailure());
      return Left(ServerFailure(e.message ?? 'Erro no servidor'));
    }
  }

  @override
  Future<Either<Failure, AuthSession>> register({
    required String name,
    String? lastName,
    required String email,
    String? phone,
    required String password,
  }) async {
    try {
      final session = await remote.register({
        'name': name,
        'lastName': lastName,
        'email': email,
        'phone': phone,
        'password': password,
      });
      await storage.saveTokens(session.accessToken, session.refreshToken);
      return Right(session);
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        return const Left(ServerFailure('E-mail já cadastrado'));
      }
      return Left(ServerFailure(e.message ?? 'Erro no servidor'));
    }
  }

  @override
  Future<Either<Failure, Unit>> logout() async {
    final refresh = await storage.readRefreshToken();
    if (refresh != null) {
      try { await remote.logout(refresh); } catch (_) {}
    }
    await storage.clear();
    return const Right(unit);
  }
}
