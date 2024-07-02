// TextAreaField.js
import React from 'react';

const TextAreaField = ({ id, value, onChange, label, maxLength }) => {
    return (
        <div className="row">
            <div className="input-field col s12">
                <textarea
                    id={id}
                    className="materialize-textarea"
                    data-length={maxLength}
                    value={value}
                    onChange={onChange}
                ></textarea>
                <label htmlFor={id}>{label}</label>
            </div>
        </div>
    );
};

export default TextAreaField;
