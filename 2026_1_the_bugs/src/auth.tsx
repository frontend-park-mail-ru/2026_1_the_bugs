import { useState } from "./MyReact/hooks";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Имитация запроса к серверу
    setTimeout(() => {
      if (email === "test@example.com" && password === "123456") {
        alert("Вход выполнен успешно!");
      } else {
        setError("Неверный email или пароль");
      }
      setIsLoading(false);
    }, 1500);
  };

  // Базовые стили (строки)
  const containerStyle = "min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family:sans-serif; padding:20px;";
  const cardStyle = "background:white; border-radius:20px; box-shadow:0 10px 40px rgba(0,0,0,0.1); padding:40px; width:100%; max-width:400px;";
  const titleStyle = "font-size:28px; font-weight:600; color:#333; margin-bottom:30px; text-align:center;";
  const inputGroupStyle = "margin-bottom:20px;";
  const labelStyle = "display:block; font-size:14px; font-weight:500; color:#555; margin-bottom:8px;";
  const inputBaseStyle = "width:100%; padding:12px 16px; font-size:16px; border:2px solid #e0e0e0; border-radius:12px; outline:none; transition:border-color 0.3s; box-sizing:border-box;";
  const inputDisabledStyle = "background-color:#f5f5f5; cursor:not-allowed; opacity:0.7;";
  const checkboxContainerStyle = "display:flex; align-items:center; margin-bottom:20px; cursor:pointer; font-size:14px; color:#555;";
  const checkboxStyle = "margin-right:8px; width:16px; height:16px; cursor:pointer;";
  const buttonBaseStyle = "width:100%; padding:14px; font-size:16px; font-weight:600; color:white; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border:none; border-radius:12px; cursor:pointer; transition:opacity 0.3s, transform 0.2s; box-shadow:0 4px 15px rgba(102, 126, 234, 0.4);";
  const buttonDisabledStyle = "opacity:0.6; cursor:not-allowed;";
  const errorStyle = "background:#fee; color:#c33; padding:12px; border-radius:10px; font-size:14px; text-align:center; margin-bottom:20px; border:1px solid #fcc;";

  // Функция для комбинирования стилей с учётом состояния
  const combineStyles = (base, condition, extra) => condition ? base + extra : base;

  return (
    <div>
        <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Добро пожаловать</h2>

        
        {error && <div style={errorStyle}>{error}</div>}
        <form on_submit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              on_input={(e: any) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              style={combineStyles(inputBaseStyle, isLoading, inputDisabledStyle)}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Пароль</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              on_input={(e: any) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={combineStyles(inputBaseStyle, isLoading, inputDisabledStyle)}
            />
          </div>
          
          <label style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={showPassword}
              on_input={(e: any) => setShowPassword(e.target.checked)}
              style={checkboxStyle}
            />
            Показать пароль
          </label>

          <button
            type="submit"
            style={combineStyles(buttonBaseStyle, isLoading, buttonDisabledStyle)}
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