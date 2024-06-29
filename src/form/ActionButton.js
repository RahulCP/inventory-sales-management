import React from 'react';

const ActionButton = ({ onClick, icon, color = 'red', size = 'large', additionalClasses = '' }) => {
  return (
    <a
      className={`btn-floating btn-${size} waves-effect waves-light ${color} ${additionalClasses}`}
      onClick={onClick}
    >
      <i className="material-icons">{icon}</i>
    </a>
  );
};

export default ActionButton;
