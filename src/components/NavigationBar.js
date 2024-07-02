import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
         <nav class="nav-extended">
         <div class="nav-wrapper">
           <ul class="right hide-on-med-and-down ">
            <li>  <Link className="nav-link black-text" to="/">Inventory Management</Link></li>
             <li><Link className="nav-link black-text" to="/sales">Sales Record</Link></li>
             <li><Link className="nav-link black-text" to="/shipment">Shipment Details</Link></li>
             <li><Link className="nav-link black-text" to="/analytics">Sales Analytics</Link></li>
           </ul>
         </div>
       </nav>
    );
};

export default NavBar;
