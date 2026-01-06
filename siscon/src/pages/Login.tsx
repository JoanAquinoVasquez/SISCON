// src/pages/Login.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import "./Login.css"; // <--- IMPORTANTE: Importamos los estilos aquí
import fondo01 from "../assets/fondo01.webp";
import fondo02 from "../assets/fondo02.webp";

export const Login = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [currentBg, setCurrentBg] = useState(0);

  // Array de fondos (imágenes)
  const backgrounds = [fondo01, fondo02];

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Cambiar fondo automáticamente cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Fondos animados */}
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className="login-background"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 15%', // Encuadre más abajo
            filter: 'blur(3px)', // Siempre difuminado
            transform: 'scale(1.1)', // Escala ligera para evitar bordes blancos
            opacity: currentBg === index ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
          }}
        />
      ))}

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