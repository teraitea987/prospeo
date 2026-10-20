import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prospeo — Espace de prospection",
  description: "Votre futur espace de recherche et de qualification d’entreprises B2B.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><a className="skip-link" href="#contenu">Aller au contenu</a>{children}</body></html>;
}
