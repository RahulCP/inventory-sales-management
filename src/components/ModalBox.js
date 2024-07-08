import React, { useEffect } from 'react';
import M from 'materialize-css';
import InputButton from './../form/InputButton';

const Modal = ({ id, title, content, onConfirm, onCancel }) => {
  useEffect(() => {
    const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
  }, []);

  return (
    <div id={id} className="modal">
      <div className="modal-content">
        <h4>{title}</h4>
        <p>{content}</p>
      </div>
      <div className="modal-footer">
        <div className="row">
          <div className="col s6 left-align">
            <InputButton 
                                type="button"
                                onClick={onCancel}
                                label={'Cancel'}
                                icon="send"
                                additionalClasses="btn-large modal-close"
                            />
          </div>
          <div className="col s6 right-align">
          <InputButton 
                                type="button"
                                onClick={onConfirm}
                                label={'Confirm'}
                                icon="send"
                                additionalClasses="btn-large  modal-close"
                            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
