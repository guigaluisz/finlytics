export interface UserProps {
  id: string;
  name: string;
  lastName?: string | null;
  email: string;
  passwordHash: string;
  phone?: string | null;
  plan: string;
}

export class UserEntity {
  constructor(private readonly props: UserProps) {}

  get id() { return this.props.id; }
  get email() { return this.props.email; }
  get name() { return this.props.name; }
  get plan() { return this.props.plan; }
  get passwordHash() { return this.props.passwordHash; }

  toPublic() {
    return { id: this.props.id, name: this.props.name, email: this.props.email, plan: this.props.plan };
  }
}
