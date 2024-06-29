import React, { useEffect, useRef } from 'react';
import M from 'materialize-css';

const DatePicker = ({ label, name, value, onChange, placeholder }) => {
  const datePickerRef = useRef(null);

  useEffect(() => {
    const options = {
      format: 'dd/mm/yyyy',
      autoClose: true,
      setDefaultDate: true,
      defaultDate: value ? new Date(value) : null,
      onSelect: (date) => {
        const event = {
          target: {
            name: name,
            value: date.toISOString().split('T')[0]
          }
        };
        onChange(event);
      }
    };

    const instance = M.Datepicker.init(datePickerRef.current, options);

    return () => {
      instance.destroy();
    };
  }, [name, onChange, value]);

  return (
    <div className="input-field col s12">
      <input 
        type="text" 
        name={name} 
        ref={datePickerRef} 
        className="datepicker" 
        placeholder={placeholder}
      />
      <label htmlFor={name}>{label}</label>
    </div>
  );
}

export default DatePicker;
