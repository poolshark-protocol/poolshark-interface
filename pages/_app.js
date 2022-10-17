import '../styles/globals.css'
import Navbar from "../components/navbar"

function MyApp({ Component, pageProps }) {
  return (
    <div className="flex flex-col max-w-screen-xl min-h-screen p-1 m-auto sm:p-2 ">
      <Navbar   />
  <Component {...pageProps} />
  </div>
  );
}

export default MyApp
