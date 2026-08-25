import { useNavigate } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-24 h-24 gradient-teal rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
          <AlertCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-6xl font-heading font-800 text-gray-900 mb-3">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 gradient-teal text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-glow mx-auto">
          <Home className="w-4 h-4" /> Go to Dashboard
        </button>
      </div>
    </div>
  );
}
