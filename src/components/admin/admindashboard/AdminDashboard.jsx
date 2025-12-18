import React, { useEffect, useRef } from "react";
import { Chart, PieChart, CardStats, AdminTable } from "./dashboardParts.jsx";
import { useSpring, animated } from '@react-spring/web'; // For simple fade/slide

export default function AdminDashboard() {
  // Animation for top-level dashboard
  const mainAnim = useSpring({
    from: { opacity: 0, transform: "translateY(-24px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    config: { tension: 280, friction: 35 }
  });

  // Scroll animation with IntersectionObserver (for table/cards)
  const sectionRefs = useRef([]);
  useEffect(() => {
    if (!sectionRefs.current) return;
    sectionRefs.current.forEach((ref) => {
      if (ref) {
        const io = new window.IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting)
              ref.classList.add('animate-fadeInUp');
          },
          { threshold: 0.15 }
        );
        io.observe(ref);
      }
    });
  }, []);

  return (
    <animated.div style={mainAnim} className="w-full min-h-screen bg-linear-to-b from-black/60 to-gray-500 p-6 overflow-auto">
      <h1 className="text-3xl font-extrabold text-amber-400 mb-4 tracking-tight">Restauron Admin Dashboard</h1>
      <CardStats />
      <div
        ref={el => (sectionRefs.current[0] = el)}
        className="mt-6 mb-10 rounded-2xl overflow-hidden shadow-lg bg-black/50 border-2 border-amber-900 p-6"
      >
        <h2 className="text-xl font-bold text-amber-300 mb-2">Reservations Over Time</h2>
        <Chart /> 
      </div>
      <div
        ref={el => (sectionRefs.current[1] = el)}
        className="mb-10 rounded-2xl overflow-hidden shadow-lg bg-black/50 border-2 border-amber-900 p-6"
      >
        <h2 className="text-xl font-bold text-amber-300 mb-2">Reservation Status Split</h2>
        <PieChart /> 
      </div>
      <div
        ref={el => (sectionRefs.current[2] = el)}
        className="rounded-2xl overflow-hidden shadow-lg bg-black/50 border-2 border-amber-900 p-6"
      >
        <AdminTable /> 
      </div>
    </animated.div>
  );
}
