export interface UserProps {
  id: string;
  nome: string;
  sobrenome?: string | null;
  email: string;
  senhaHash: string;
  telefone?: string | null;
  plano: string;
}

export class UserEntity {
  constructor(private readonly props: UserProps) {}

  get id() { return this.props.id; }
  get email() { return this.props.email; }
  get nome() { return this.props.nome; }
  get plano() { return this.props.plano; }
  get senhaHash() { return this.props.senhaHash; }

  toPublic() {
    return { id: this.props.id, nome: this.props.nome, email: this.props.email, plano: this.props.plano };
  }
}
