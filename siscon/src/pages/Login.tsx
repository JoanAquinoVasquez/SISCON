// src/pages/Login.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import "./Login.css"; // <--- IMPORTANTE: Importamos los estilos aquí

export const Login = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error login", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <span className="logo-icon">📊</span>
        
        <h2 className="title">SisCon</h2>
        <p className="subtitle">Tu contabilidad, simplificada.</p>
        
        <button onClick={handleLogin} className="google-btn">
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google logo" 
            width="20"
            height="20"
          />
          <span>Continuar con Google</span>
        </button>

        <p className="footer-text">
          Hecho con ❤️ por Joan Aquino Vasquez
        </p>
      </div>
    </div>
  );
};