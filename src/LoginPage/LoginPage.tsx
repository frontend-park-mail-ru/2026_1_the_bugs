import { useState } from "@my-react/hooks";
import "./LoginPags.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (email === "test@example.com" && password === "123456") {
        alert("Вход выполнен успешно!");
      } else {
        setError("Неверный email или пароль");
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div>
      <div className="container">
        <div className="card">
          <h2 className="title">Добро пожаловать</h2>
          
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="inputGroup">
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onInput={(e: any) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                className={`inputBase ${isLoading ? 'inputDisabled' : ''}`}
              />
            </div>

            <div className="inputGroup">
              <label className="label">Пароль</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onInput={(e: any) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className={`inputBase ${isLoading ? 'inputDisabled' : ''}`}
              />
            </div>
            
            <label className="checkboxContainer">
              <input
                type="checkbox"
                checked={showPassword}
                onInput={(e: any) => setShowPassword(e.target.checked)}
                className="checkbox"
              />
              Показать пароль
            </label>

            <button
              type="submit"
              className={`buttonBase ${isLoading ? 'buttonDisabled' : ''}`}
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
