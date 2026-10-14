declare module 'sweetalert2/dist/sweetalert2.js' {
  import Swal from 'sweetalert2';
  export default Swal;
}

// Attributes read by the CSS tooltip in app/styles/app.css (see components/tooltip-host)
interface GlobalHTMLAttributes {
  ['tooltip']: string | undefined;
  ['tooltip-position']: string | undefined;
}
