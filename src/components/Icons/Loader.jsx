import * as React from "react";
const Loader = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1.5em"
    height="1.5em"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={0}
    className="animate-spin"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="none"
      d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"
    />
  </svg>
);
export default Loader;
