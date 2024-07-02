import React, { useEffect, useRef } from 'react';
import M from 'materialize-css';

const DatePicker = ({ label, name, value, onChange, placeholder }) => {
  const datePickerRef = useRef(null);

  useEffect(() => {
    const options = {
      format: 'dd/mm/yyyy',
      autoClose: true,
      setDefaultDate: !!value,
      defaultDate: value ? new Date(value + 'T12:00:00') : null,
      onSelect: (date) => {
        // Correct the date to avoid time zone issues
        const correctedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const event = {
          target: {
            name: name,
            value: correctedDate.toISOString().split('T')[0],
          },
        };
        onChange(event);
      },
    };

    const instance = M.Datepicker.init(datePickerRef.current, options);

    // Set the initial value of the date picker input
    if (value) {
      const formattedDate = new Date(value + 'T12:00:00').toLocaleDateString('en-GB');
      instance.el.value = formattedDate;
    }

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
        defaultValue={value ? new Date(value + 'T12:00:00').toLocaleDateString('en-GB') : ''}
      />
      <label htmlFor={name} className={value ? 'active' : ''}>{label}</label>
    </div>
  );
};

export default DatePicker;
