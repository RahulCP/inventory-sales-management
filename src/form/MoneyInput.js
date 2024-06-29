import React, { useEffect, useState } from 'react';
import M from 'materialize-css';

const MoneyInput = ({ label, name, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    // Initialize Materialize CSS input fields
    M.updateTextFields();
  }, []);

  // Sync inputValue with the value prop when the value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (event) => {
    const { value } = event.target;
    // Allow only numbers and one decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value)) {
      setInputValue(value);
      onChange(event);
    }
  };

  return (
    <div className="input-field col s12">
      <input 
        type="text" 
        name={name} 
        value={inputValue} 
        onChange={handleInputChange} 
        placeholder={placeholder} 
      />
      <label className={inputValue ? 'active' : ''}>{label}</label>
    </div>
  );
}

export default MoneyInput;
