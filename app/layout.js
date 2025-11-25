import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import FloatingBackButton from "@/components/FloatingBackButton";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta"
});

export const metadata = {
  title: "Lumina Careers | Discover Magical Opportunities",
  description:
    "A premium job portal connecting visionary talent with forward-thinking companies. Built with Next.js, Tailwind CSS, and delightful animations."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-gray-950 text-white antialiased min-h-screen">
        {children}
        <FloatingBackButton />
      </body>
    </html>
  );
}
