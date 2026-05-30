import { Money } from './money.vo';
import { BusinessRuleError } from '../../../common/errors/domain.error';

describe('Money', () => {
  it('cria valor positivo', () => {
    expect(Money.fromNumber(10.5).amount).toBe(10.5);
  });
  it('rejeita zero ou negativo', () => {
    expect(() => Money.fromNumber(0)).toThrow(BusinessRuleError);
    expect(() => Money.fromNumber(-3)).toThrow(BusinessRuleError);
  });
  it('arredonda centavos corretamente', () => {
    expect(Money.fromNumber(10.005).amount).toBeCloseTo(10.01, 2);
  });
});
