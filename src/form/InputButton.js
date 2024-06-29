import React from 'react';

const InputButton = ({ type, onClick, label, icon, additionalClasses }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn waves-light ${additionalClasses}`}
    >
      {label}
      {icon && <i className="material-icons right">{icon}</i>}
    </button>
  );
};

export default InputButton;
