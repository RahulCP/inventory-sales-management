import React from 'react';
import './MaterializeCard.css'; // Import the CSS file
import IconHyperlink from './IconHyperlink';

const MaterializeCard = ({ title, image, description, quantity, editClick, deleteClick, editIcon, deleteIcon }) => {
  return (
    <div className=" small-card-row">
      <div className="col s12">
        <div className="card small-card">
          <div className="card-image small-card-image">
            <img src={image} alt={title} className="card-image-fixed" />
            <span className="card-title small-card-title">{title}</span>
          </div>
                        
          <div className=" small-card-row">
    
              <div className="col s7">   

                <a href="#!"  onClick={editClick}  class="collection-item">{description}</a>
              
              </div>
              <div className="col s2">   


{quantity}


</div>
              <div className="col s3">    
              <IconHyperlink
                href="#"
                onClick={deleteClick}
                icon={deleteIcon}
                iconSize="small"
                additionalClasses=""
              />
              </div>
   
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterializeCard;
