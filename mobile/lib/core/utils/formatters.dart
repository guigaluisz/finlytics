import 'package:intl/intl.dart';

abstract class Formatters {
  static final _currency = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
  static final _date = DateFormat('dd/MM/yyyy', 'pt_BR');

  static String money(num value) => _currency.format(value);
  static String date(DateTime value) => _date.format(value);
}
