import '../styles/globals.css'
import Navbar from "../components/navbar"

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-DMSans">
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp
