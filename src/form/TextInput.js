import React, { useEffect } from 'react';
import M from 'materialize-css';

const TextInput = ({ label, name, value, onChange, placeholder }) => {
  useEffect(() => {
    // Initialize Materialize CSS input fields
    M.updateTextFields();
  }, []);

  return (
    <div className="input-field col s12">
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
      />
      <label htmlFor={name} >{label}</label>
    </div>
  );
}

export default TextInput;
