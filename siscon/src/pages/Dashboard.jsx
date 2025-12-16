// src/pages/Dashboard.tsx
import { useAuth } from "../context/AuthContext";

export const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1>Panel de Contabilidad</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{fontWeight: "bold"}}>{user?.displayName}</span>
          <img src={user?.photoURL || ""} alt="user" style={{width: 35, borderRadius: "50%"}} />
          <button 
            onClick={logout}
            style={{ padding: "8px 16px", background: "#ff4d4f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Mockup de datos financieros */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <div style={cardStyle}>
          <h3>Ingresos Totales</h3>
          <p style={{ fontSize: "24px", color: "#2ecc71" }}>$12,450.00</p>
        </div>
        <div style={cardStyle}>
          <h3>Gastos del Mes</h3>
          <p style={{ fontSize: "24px", color: "#e74c3c" }}>$3,200.00</p>
        </div>
        <div style={cardStyle}>
          <h3>Balance Neto</h3>
          <p style={{ fontSize: "24px", color: "#3498db" }}>$9,250.00</p>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  border: "1px solid #eee"
};