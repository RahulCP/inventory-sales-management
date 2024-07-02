import React, { useEffect, useState } from 'react';
import M from 'materialize-css';

const NumberInput = ({ label, name, value, onChange, placeholder, icon }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    // Initialize Materialize CSS input fields
    M.updateTextFields();
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (event) => {
    const { value } = event.target;
    // Allow only whole numbers
    const regex = /^\d*$/;
    if (regex.test(value)) {
      setInputValue(value);
      onChange(event);
    }
  };

  return (
    <div className="input-field col s12">
      {label && <label className={inputValue ? 'active' : ''}>{label}</label>}
      {!label && icon && <i className="material-icons prefix">{icon}</i>}
      <input 
        type="text" 
        name={name} 
        value={inputValue} 
        onChange={handleInputChange} 
        placeholder={placeholder} 
      />
    </div>
  );
}

export default NumberInput;
