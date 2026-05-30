import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:finlytics/core/error/failure.dart';
import 'package:finlytics/features/auth/domain/entities/auth_session.dart';
import 'package:finlytics/features/auth/domain/entities/user.dart';
import 'package:finlytics/features/auth/domain/repositories/auth_repository.dart';
import 'package:finlytics/features/auth/domain/usecases/login_usecase.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repo;
  late LoginUseCase usecase;

  setUp(() {
    repo = MockAuthRepository();
    usecase = LoginUseCase(repo);
  });

  const session = AuthSession(
    accessToken: 'a',
    refreshToken: 'r',
    user: User(id: '1', name: 'Lucas', email: 'l@e.com', plan: 'free'),
  );

  test('retorna AuthSession em sucesso', () async {
    when(() => repo.login(any(), any())).thenAnswer((_) async => const Right(session));
    final result = await usecase(const LoginParams('l@e.com', 'Senha@123'));
    expect(result, const Right(session));
    verify(() => repo.login('l@e.com', 'Senha@123')).called(1);
  });

  test('retorna Failure quando credenciais inválidas', () async {
    when(() => repo.login(any(), any())).thenAnswer((_) async => const Left(AuthFailure()));
    final result = await usecase(const LoginParams('x', 'y'));
    expect(result.isLeft(), true);
  });
}
