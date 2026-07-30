import { RegisterForm } from '../components/RegisterForm';
import '../register.css';

export function RegisterPage() {
  return (
    <main className="register-page">
      <div className="register-page__decoration" aria-hidden="true">
        <span>NEW PROJECT</span>
        <strong>01</strong>
      </div>
      <RegisterForm />
    </main>
  );
}
