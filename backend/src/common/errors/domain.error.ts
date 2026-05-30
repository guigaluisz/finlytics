export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(`${entity} não encontrado`);
    this.name = 'NotFoundError';
  }
}
