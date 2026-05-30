import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String nome;
  final String email;
  final String plano;

  const User({required this.id, required this.nome, required this.email, required this.plano});

  bool get isPremium => plano != 'gratuito';

  @override
  List<Object?> get props => [id, nome, email, plano];
}
