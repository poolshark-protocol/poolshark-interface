import { ToastProvider } from 'rc-toastr'
import "rc-toastr/dist/index.css" // import the css file

ReactDOM.render((
    <ToastProvider config={{
        position: "top-right",
        duration: 3000
    }} >
        <App />
    </ToastProvider>
), document.getElementById('root'))