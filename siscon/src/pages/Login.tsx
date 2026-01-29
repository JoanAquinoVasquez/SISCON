// src/pages/Login.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
    } catch (error) {
      console.error("Error login", error);
      toast.error("Error al iniciar sesión");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50">
      {/* Fondos animados */}
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className="absolute inset-0 z-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)', // Más desenfoque para que sea más sutil
            opacity: currentBg === index ? 0.4 : 0, // Menos opacidad para que sea más claro
          }}
        />
      ))}

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-4 overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <span className="mb-4 inline-block text-5xl drop-shadow-sm">📊</span>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-800">
              SisCon
            </h2>
            <p className="text-slate-600 font-medium">
              Tu contabilidad, simplificada.
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleLogin}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-md ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="h-5 w-5"
              />
              <span>Continuar con Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-slate-400 font-medium">
                  Acceso seguro
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Hecho con ❤️ por Joan Aquino Vasquez
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};