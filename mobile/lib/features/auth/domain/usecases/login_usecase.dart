import 'package:dartz/dartz.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/auth_session.dart';
import '../repositories/auth_repository.dart';

class LoginParams {
  final String email;
  final String senha;
  const LoginParams(this.email, this.senha);
}

class LoginUseCase implements UseCase<AuthSession, LoginParams> {
  final AuthRepository repository;
  LoginUseCase(this.repository);

  @override
  Future<Either<Failure, AuthSession>> call(LoginParams params) {
    return repository.login(params.email, params.senha);
  }
}
