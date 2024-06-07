import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import './App.css';
import { js2xml, xml2js } from 'xml-js';

const SecureForm = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [encData, setEncData] = useState('');
  const [decData, setDecData] = useState('');
  const [msg, setMsg] = useState('');

  // Función para validar la contraseña
  const checkPassword = (pass) => {
    const minLen = 8;
    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;
    const specialChar = /[.\-_!$@?%#&]/;
    const seqPattern = /(.)\1\1|012|123|234|345|456|567|678|789|890|098|987|876|765|654|543|432|321|210/;

    // Verificaciones de la contraseña
    if (pass.length < minLen) return "La contraseña debe tener mínimo 8 caracteres.";
    if (!upperCase.test(pass)) return "La contraseña debe contener una letra mayúscula.";
    if (!lowerCase.test(pass)) return "La contraseña debe contener una letra minúscula.";
    if (!specialChar.test(pass)) return "La contraseña debe contener un carácter especial.";
    if (seqPattern.test(pass)) return "La contraseña no debe contener secuencias o series repetitivas.";

    return "";
  };

   // Función para encriptar los datos
  const encryptData = () => {
    const errorMsg = checkPassword(pass);
    if (errorMsg) {
      setMsg(errorMsg);
      return;
    }
    setMsg('');

    // Encriptar usuario y contraseña
    const encryptedUser = CryptoJS.AES.encrypt(user, 'secretKey').toString();
    const encryptedPass = CryptoJS.AES.encrypt(pass, 'secretKey').toString();

     // Crear objeto XML con los datos encriptados
    const xmlData = {
      user: {
        username: encryptedUser,
        password: encryptedPass
      }
    };
    
     // Convertir objeto a cadena XML
    const xmlString = js2xml(xmlData, { compact: true, ignoreComment: true, spaces: 4 });
    setEncData(xmlString);
    saveXML(xmlString);
  };

  // Función para descargar el archivo XML
  const saveXML = (xml) => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'encryptedData.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para cargar un archivo XML
  const uploadFile = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setEncData(content);
    };
    reader.readAsText(file);
  };

   // Función para desencriptar los datos
  const decryptData = () => {
    try {
      const parsedXml = xml2js(encData, { compact: true });
      const decryptedUser = CryptoJS.AES.decrypt(parsedXml.user.username._text, 'secretKey').toString(CryptoJS.enc.Utf8);
      const decryptedPass = CryptoJS.AES.decrypt(parsedXml.user.password._text, 'secretKey').toString(CryptoJS.enc.Utf8);

      setDecData(`Usuario: ${decryptedUser}, Contraseña: ${decryptedPass}`);
    } catch (err) {
      setMsg('Error al descifrar los datos.');
    }
  };

  return (
    <div>
      <h1>ENCRIPTADOR:</h1>
      <div>
        <label>Usuario:</label>
        <input type="text" value={user} onChange={(e) => setUser(e.target.value)} />
      </div>
      <div>
        <label>Contraseña:</label>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
      </div>
      {msg && <p style={{ color: 'white' }}>{msg}</p>}
      <button onClick={encryptData}>Encriptar</button>
      <div>
        <div>
          <h2>Desencriptación:</h2>
          <p>{decData}</p>
        </div>
        <input type="file" accept=".xml" onChange={uploadFile} /> 
        <br></br>
      <button onClick={decryptData}>Desencriptar</button> 
        <h2>Datos encriptados:</h2>
        <textarea value={encData} readOnly rows="8" cols="70" />
      </div>   
    </div>
  );
};

export default SecureForm;
