import { ToastProvider } from 'rc-toastr'
import * as ReactDOM from 'react-dom';
import "rc-toastr/dist/index.css" // import the css file
import MyApp from '../pages/_app';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');

const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render((
    <ToastProvider config={{
        position: "top-right",
        duration: 3000
    }} >
        <MyApp Component={undefined} pageProps={undefined} />
    </ToastProvider>
))

