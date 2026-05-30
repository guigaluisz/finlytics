import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';

final secureStorageProvider = Provider((_) => SecureStorage());
final dioClientProvider = Provider((ref) => DioClient(ref.watch(secureStorageProvider)));
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(dioClientProvider).dio;
  return AuthRepositoryImpl(AuthRemoteDataSource(dio), ref.watch(secureStorageProvider));
});
final loginUseCaseProvider = Provider((ref) => LoginUseCase(ref.watch(authRepositoryProvider)));

sealed class AuthState {
  const AuthState();
}
class AuthInitial extends AuthState { const AuthInitial(); }
class AuthLoading extends AuthState { const AuthLoading(); }
class AuthSuccess extends AuthState {
  final AuthSession session;
  const AuthSuccess(this.session);
}
class AuthError extends AuthState {
  final String mensagem;
  const AuthError(this.mensagem);
}

/// ViewModel (MVVM): expõe estado imutável à View, sem regra de negócio.
class AuthViewModel extends StateNotifier<AuthState> {
  final LoginUseCase _login;
  final AuthRepository _repo;
  AuthViewModel(this._login, this._repo) : super(const AuthInitial());

  Future<void> login(String email, String senha) async {
    state = const AuthLoading();
    final result = await _login(LoginParams(email, senha));
    state = result.fold((f) => AuthError(f.message), (s) => AuthSuccess(s));
  }

  Future<void> register({
    required String nome,
    String? sobrenome,
    required String email,
    String? telefone,
    required String senha,
  }) async {
    state = const AuthLoading();
    final result = await _repo.register(
      nome: nome, sobrenome: sobrenome, email: email, telefone: telefone, senha: senha,
    );
    state = result.fold((f) => AuthError(f.message), (s) => AuthSuccess(s));
  }
}

final authViewModelProvider =
    StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  return AuthViewModel(ref.watch(loginUseCaseProvider), ref.watch(authRepositoryProvider));
});
