// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

import fondo03 from "../../assets/fondo03.jpeg";

export function MainLayout() {
  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{
        backgroundImage: `url(${fondo03})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 15%',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay para el efecto de difuminado y legibilidad */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0" />

      {/* Contenido principal con z-index para estar sobre el fondo */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
