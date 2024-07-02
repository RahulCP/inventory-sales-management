// FormCheckbox.js
import React from 'react';

const FormCheckbox = ({ name, checked, onChange, label }) => {
    return (
        <p>
            <label>
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="filled-in"
            />
            <span>{label}</span>
            </label>
        </p>
    );
};

export default FormCheckbox;
