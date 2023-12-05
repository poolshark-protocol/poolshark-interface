export default function Blocked() {
    return (
      <div className="bg-black h-screen w-screen flex items-center justify-center text-white">
        <div className="bg-dark border border-grey p-4 max-w-lg rounded-[4px]">
          <h1>Access Restricted</h1>
          <p className="text-white/60 text-sm mt-2 mb-4">Unfortunately, the country you are connecting from is not supported.</p>
          <span className="text-xs text-white/60">Read our <a className="underline hover:text-white">terms of service</a> for more information</span>
        </div>
      </div>
    );
  }
  
  // This function gets called at build time
  export async function getStaticProps() {
    // Fetch data here. This is just an example, replace it with your actual data fetching code
    // const res = await fetch('https://api.example.com/data')
    // const data = await res.json()
  
    // By returning { props: { data } }, the Blocked component
    // will receive `data` as a prop at build time
    return {
      props: {
        // data,
      },
    }
  }