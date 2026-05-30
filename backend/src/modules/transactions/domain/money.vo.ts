import { BusinessRuleError } from '../../../common/errors/domain.error';

// Value Object: garante invariantes de valor monetário.
export class Money {
  private constructor(private readonly cents: number) {}

  static fromNumber(value: number): Money {
    if (!Number.isFinite(value) || value <= 0) {
      throw new BusinessRuleError('Valor deve ser maior que zero');
    }
    return new Money(Math.round(value * 100));
  }

  get amount(): number {
    return this.cents / 100;
  }
}
