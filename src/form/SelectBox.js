import React, { useEffect, useRef } from 'react';
import M from 'materialize-css';

const SelectBox = ({ label, name, value, onChange, options }) => {
  const selectRef = useRef(null);

  useEffect(() => {
    // Initialize Materialize CSS select boxes
    M.FormSelect.init(selectRef.current);
  }, [value]);

  useEffect(() => {
    // Re-initialize Materialize CSS select boxes when options change
    M.FormSelect.init(selectRef.current);
  }, [options]);

  return (
    <div className="input-field col s12">
      <select ref={selectRef} name={name} value={value} onChange={onChange}>
        <option value="" disabled>Select {label}</option>
        {options.map(option => (
          <option key={option.key} value={option.key}>{option.value}</option>
        ))}
      </select>
      <label className={value ? 'active' : ''}>{label}</label>
    </div>
  );
}

export default SelectBox;
