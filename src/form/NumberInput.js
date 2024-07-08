import React, { useEffect, useState } from 'react';
import M from 'materialize-css';

const NumberInput = ({ label, name, value, onChange, placeholder, icon, range }) => {
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
    // Allow only whole numbers and numbers within the range
    const regex = /^\d*$/;
    if (regex.test(value) && (range == null || range <= 0 || parseInt(value, 10) <= range || value === '')) {
      setInputValue(value);
      onChange(event);
    }
  };

  const hasRedBorder = range !== null && range <= 0;

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
        style={hasRedBorder ? { border: '1px solid red' } : {}}
      />
    </div>
  );
}

export default NumberInput;
