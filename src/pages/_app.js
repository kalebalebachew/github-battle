import { ThemeProvider } from "next-themes"
import { Inter as FontSans } from "next/font/google"
import '@/styles/globals.css'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className={`font-sans ${fontSans.variable}`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  )
}

export default MyApp