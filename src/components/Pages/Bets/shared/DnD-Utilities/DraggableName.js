import React from 'react';
import {ItemTypes} from './Utilities';
import {useDrag} from 'react-dnd';
import PropTypes from 'prop-types';
import './index.scss';

const DraggableName = (props) => {

  const [{isDragging}, drag] = useDrag({
    item: {
      type: ItemTypes.CARD,
      name: props.person,
      id: props.id
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });


  return (
    <>
      <div
        ref={drag}
        className={`${props.classNameToDisplay} ${isDragging ? 'onDrag' : ''}`}
        key={props.person}
        onClick={(e) => props.itemOnClick(e, props.person, props.index)}>
        {props.person}
      </div>
    </>
  );
};

DraggableName.propTypes = {
  classNameToDisplay: PropTypes.string,
  id: PropTypes.string,
  index: PropTypes.number,
  itemOnClick: PropTypes.func,
  person: PropTypes.string,
};

export default DraggableName;
