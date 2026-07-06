import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata = {
  title: "ActionDesk",
  description:
    "An intelligent workspace that transforms scattered business communication into organized actions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex h-screen overflow-hidden bg-bg">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
