import React, { Fragment } from 'react';
import { UserEnums } from '../../../Data/Enums/UserEnums';
import { menuData } from './data/menuData';
import PropTypes from 'prop-types';

const Menu = (props) => {
  return (
    <Fragment>
      {menuData.map((menuItem) => {
        if (menuItem.protected) {
          if (props.user.type === UserEnums.USER) {
            return (
              <div
                key={menuItem.title}
                onClick={(e) => props.menuClick(e, menuItem)}
                className="front-menu-item"
              >
                {menuItem.title}
              </div>
            );
          } else {return null;}
        } else {
          return (
            <div
              key={menuItem.title}
              onClick={(e) => props.menuClick(e, menuItem)}
              className="front-menu-item"
            >
              {menuItem.title}
            </div>
          );
        }
      })}
    </Fragment>
  );
};

Menu.propTypes = {
  menuClick: PropTypes.func,
  user: PropTypes.object
};

export default Menu;
