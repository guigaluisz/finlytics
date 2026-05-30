import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String name;
  final String email;
  final String plan;

  const User({required this.id, required this.name, required this.email, required this.plan});

  bool get isPremium => plan != 'free';

  @override
  List<Object?> get props => [id, name, email, plan];
}
