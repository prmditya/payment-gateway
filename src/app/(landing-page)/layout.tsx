import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"] });

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
