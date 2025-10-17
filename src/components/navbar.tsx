import LoginButton from "./login-button";

export default function Navbar() {
  return (
    <nav className="w-full bg-white/20 backdrop-blur-lg shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-semibold">MyApp</div>
        <div className="space-x-4">
          <a href="/home" className="text-gray-600 hover:text-gray-900">
            Home
          </a>
          <a href="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </a>
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}
