import 'package:dartz/dartz.dart';
import '../../../../core/error/failure.dart';
import '../entities/auth_session.dart';

abstract class AuthRepository {
  Future<Either<Failure, AuthSession>> login(String email, String password);
  Future<Either<Failure, AuthSession>> register({
    required String name,
    String? lastName,
    required String email,
    String? phone,
    required String password,
  });
  Future<Either<Failure, Unit>> logout();
}
