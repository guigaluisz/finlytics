import 'package:flutter_test/flutter_test.dart';
import 'package:finlytics/core/utils/validators.dart';

void main() {
  group('Validators.email', () {
    test('aceita e-mail válido', () => expect(Validators.email('a@b.com'), isNull));
    test('rejeita inválido', () => expect(Validators.email('abc'), isNotNull));
  });
  group('Validators.password', () {
    test('aceita senha forte', () => expect(Validators.password('Senha@123'), isNull));
    test('rejeita fraca', () => expect(Validators.password('12345678'), isNotNull));
  });
}
