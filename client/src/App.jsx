import { useState } from 'react';
import QRCode from 'react-qr-code';
import './App.css';

function App() {
  // 👇 Change URL if backend host differs
 // client/src/App.jsx
const apiHost = import.meta.env.VITE_API_BASE_URL;   // set in .env.production
const [url] = useState(`${apiHost}/scan`);

  return (
    <main style={{display:'grid',placeItems:'center',minHeight:'100vh'}}>
      <h1>Scan me 👇</h1>
      <QRCode value={url} size={256} />
      <p style={{maxWidth:300,textAlign:'center',fontSize:14}}>
        Point your phone’s camera or any QR reader.  
        You’ll see a welcome message the first time – second attempts are blocked.
      </p>
    </main>
  );
}

export default App;
