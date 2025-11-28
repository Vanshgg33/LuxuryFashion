import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mb-8">
          <span className="text-[150px] font-display font-bold text-muted/30 leading-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-float">🍔</span>
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          Looks like this dish got lost on its way to your table. Let's get you
          back to something delicious!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-outline inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
