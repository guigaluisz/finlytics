import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';

// --- DI providers ---
final secureStorageProvider = Provider((_) => SecureStorage());
final dioClientProvider = Provider((ref) => DioClient(ref.watch(secureStorageProvider)));
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(dioClientProvider).dio;
  return AuthRepositoryImpl(AuthRemoteDataSource(dio), ref.watch(secureStorageProvider));
});
final loginUseCaseProvider = Provider((ref) => LoginUseCase(ref.watch(authRepositoryProvider)));

/// Estado da tela de autenticação.
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
  final String message;
  const AuthError(this.message);
}

/// ViewModel (MVVM): expõe estado imutável à View, sem regra de negócio.
class AuthViewModel extends StateNotifier<AuthState> {
  final LoginUseCase _login;
  final AuthRepository _repo;
  AuthViewModel(this._login, this._repo) : super(const AuthInitial());

  Future<void> login(String email, String password) async {
    state = const AuthLoading();
    final result = await _login(LoginParams(email, password));
    state = result.fold((f) => AuthError(f.message), (s) => AuthSuccess(s));
  }

  Future<void> register({
    required String name,
    String? lastName,
    required String email,
    String? phone,
    required String password,
  }) async {
    state = const AuthLoading();
    final result = await _repo.register(
      name: name, lastName: lastName, email: email, phone: phone, password: password,
    );
    state = result.fold((f) => AuthError(f.message), (s) => AuthSuccess(s));
  }
}

final authViewModelProvider =
    StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  return AuthViewModel(ref.watch(loginUseCaseProvider), ref.watch(authRepositoryProvider));
});
