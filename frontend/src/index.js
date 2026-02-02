import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Opciono: Možeš dodati globalni CSS import za ikonice ili fontove ako ih koristiš
 //import '@fortawesome/fontawesome-free/css/all.min.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode je super za razvoj jer hvata greške, 
  // ali imaj na umu da on pokreće useEffect dva puta u dev modu!
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Izmenjeno: Sada će ti performanse (poput TTFB - brzine odziva backenda) 
// ispisivati direktno u konzoli browsera (F12 -> Console)
reportWebVitals(console.log);