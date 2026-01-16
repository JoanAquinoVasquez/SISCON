// src/pages/Login.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./Login.css"; // <--- IMPORTANTE: Importamos los estilos aquí
import fondo01 from "../assets/fondo01.webp";
import fondo02 from "../assets/fondo02.webp";

export const Login = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentBg, setCurrentBg] = useState(0);

  // Array de fondos (imágenes)
  const backgrounds = [fondo01, fondo02];

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error === "unregistered_user") {
      toast.error("El usuario no está registrado en el sistema. Contacte al administrador.");
      // Limpiar el parámetro de la URL para que no aparezca el error al recargar
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

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
      // La redirección ocurre en el backend o AuthCallback, pero por si acaso
      // navigate("/dashboard"); 
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