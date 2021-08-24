import React from 'react';
import { useDrop } from 'react-dnd';
import { BetTypeEnum } from '../../../../Data/Enums/BetEnums';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import { ItemTypes } from './Utilities';
import PropTypes from 'prop-types';
import './index.scss';

const DropInput = (props) => {

  const [{isOver, canDrop}, drop] = useDrop({
    accept: ItemTypes.CARD,
    canDrop: () => true,
    drop: (item) => props.itemOnDrop(item, BetTypeEnum.REGULAR_BET, props.index),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  return (
    <input
      ref={drop}
      className={`${props.classNameToDisplay} ${isOver && canDrop ? 'onDropAllowed' : ''} `}
      onChange={e => props.itemOnChange(e, 'name', props.index)}
      type="text"
      value={props.itemName}
      placeholder={InterfaceTexts.name}/>
  );
};

DropInput.propTypes = {
  classNameToDisplay: PropTypes.string,
  index: PropTypes.number,
  itemOnDrop: PropTypes.func,
  itemOnChange: PropTypes.func,
  itemName: PropTypes.string
};

export default DropInput;
