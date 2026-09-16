import "./globals.css";

export const metadata = { title: "SparkAgent", description: "Build and run specialized AI agents." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}