import { ToastProvider } from "rc-toastr";
import "rc-toastr/dist/index.css"; // import the css file
import MyApp from "../pages/_app";

import { createRoot } from "react-dom/client";
const container = document.getElementById("app");
const root = createRoot(container);

//review that I added this properly

root.render(
  <ToastProvider
    config={{
      position: "top-right",
      duration: 3000,
    }}
  >
    <MyApp Component={undefined} pageProps={undefined} />
  </ToastProvider>,
);
