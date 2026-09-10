import "./globals.css";
import { ThemeProvider } from "../lib/ThemeProvider";

export const metadata = {
  title: "مسارات أزل",
  description: "نظام إدارة أعمالك — عرض ومعاينة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
