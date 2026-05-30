import 'package:dartz/dartz.dart';
import '../../../../core/error/failure.dart';
import '../entities/auth_session.dart';

abstract class AuthRepository {
  Future<Either<Failure, AuthSession>> login(String email, String senha);
  Future<Either<Failure, AuthSession>> register({
    required String nome,
    String? sobrenome,
    required String email,
    String? telefone,
    required String senha,
  });
  Future<Either<Failure, Unit>> logout();
}
