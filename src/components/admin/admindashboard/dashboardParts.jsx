import { use, useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, Pie, PieChart as RPieChart,  BarChart, Bar } from "recharts";
import { useAxios } from "../../../axios/instances/axiosInstances";
import { to } from "@react-spring/web";



export function CardStats() {
  const [totalData, setTotalData] = useState({
    totalRestaurants: 0,
    totalCustomers: 0,
    activeReservations: 0
  });
  const { axiosAdminInstance } = useAxios();

  useEffect(() => {
    async function fetchStats() {
      try {
        const [resRestaurants, resCustomers, resReservations] = await Promise.all([
          axiosAdminInstance.get("/stats/total-restaurants"),
          axiosAdminInstance.get("/stats/total-customers"),
          axiosAdminInstance.get("/stats/active-reservations")  
        ]);
        setTotalData({
          totalRestaurants: resRestaurants.data.total || 0, 
          totalCustomers: resCustomers.data.total || 0,
          activeReservations: resReservations.data.total || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, [axiosAdminInstance]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[
        { label: "Total Restaurants", value: totalData.totalRestaurants },
        { label: "Total Customers", value: totalData.totalCustomers },
        { label: "Active Reservations", value: totalData.activeReservations }
      ].map((stat, idx) => (
        <div key={stat.label} className="rounded-xl p-6 border-2 border-amber-800 bg-black/60 shadow-md animate-fadeInUp">
          <div className="text-xs text-amber-300 uppercase tracking-widest mb-2">{stat.label}</div>
          <div className="text-3xl font-bold text-amber-200">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

export function AdminTable() {

  const [restaurantData, setRestaurantData] = useState([]);

  const { axiosAdminInstance } = useAxios();
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await axiosAdminInstance.get("/stats/restaurants/list");
        setRestaurantData(response.data || []);
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      }
    }
    fetchRestaurants();
  }, [axiosAdminInstance]);


  const statusColors= (colorStatus) => {
    if(colorStatus === "ACTIVE") return "text-green-400";
    else if(colorStatus === "INACTIVE") return "text-red-400";
    else if(colorStatus === "PENDING") return "text-yellow-400";
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm rounded-xl">
        <thead>
          <tr className="bg-zinc-900 text-amber-200">
            <th>Created At</th><th>Restaurant</th><th>Status</th><th>Customer No</th>
          </tr>
        </thead>
        <tbody>
          {restaurantData.map((res, idx) => (
            <tr key={idx} className="border-b border-amber-800 hover:bg-black/30">
              <td className="text-white px-4 py-2">{res.createdAt}</td>
              <td className="text-white px-4 py-2">{res.name}</td>
              <td className={`text-white px-4 py-2 ${statusColors(res.status)}`}>{res.status}</td>
              <td className="text-white px-4 py-2">{res.customerCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Example data (replace with actual API data/fetch logic)

export function Chart() {
  const [chartData, setChartData] = useState([]);
  const { axiosAdminInstance } = useAxios();
  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await axiosAdminInstance.get("/stats/reservations-over-time");
        setChartData(response.data || []);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }
    fetchChartData();
  }, [axiosAdminInstance]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" tick={{ fill: "#fde68a" }} />
        <YAxis tick={{ fill: "#fde68a" }} />
        <Tooltip contentStyle={{ background: "#181e25", border: "1px solid #fbbf24", color: "#fde68a" }} />
        <Legend />
        <Line
          type="monotone"
          dataKey="reservations"
          stroke="#fbbf24"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 7 }}
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}





const STATUS_COLORS = {
  "CONFIRMED": "#47ff90",   // green
  "PENDING": "#ffd43b",        // yellow
  "CANCELLED": "#ff364e",    // red
  "REJECTED": "#ff9800",      // orange
  "COMPLETED": "#5496ff",     // blue
};

export function PieChart() {
  const [pieData, setPieData] = useState([]);
  const { axiosAdminInstance } = useAxios();
  useEffect(() => {
    async function fetchPieData() {
      try {
        const response = await axiosAdminInstance.get("/stats/reservation-status-split");
        setPieData(response.data || []);
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    }
    fetchPieData();
  }, [axiosAdminInstance]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RPieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#fbbf24"
          label={({ name, percent }) =>
            `${name} (${(percent * 100).toFixed(1)}%)`
          }
          animationDuration={900}
        >
          {pieData.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={STATUS_COLORS[entry.name] || "#bdbdbd"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #fbbf24"

          }}
        />
        <Legend />
      </RPieChart>
    </ResponsiveContainer>
  );
}