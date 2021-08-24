import React from 'react';
import { useDrop } from 'react-dnd';
import { BetTypeEnum } from '../../../../Data/Enums/BetEnums';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import { ItemTypes } from '../DnD-Utilities/Utilities';
import PropTypes from 'prop-types';
import './index.scss';

const JointDroppable = (props) => {

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.CARD,
    canDrop: () => true,
    drop: (item) =>props.itemOnDrop(item, BetTypeEnum.JOINT_BET, props.searchIndex),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  return (
    <div
      ref={drop}
      className={`joint-side ${isOver && canDrop ? 'onDropAllowed' : ''}`}>
      {props.jointSelected.length > 0 ? null :
        <div className="legend-dnd basic-fx justify-center-fx align-center-fx">
          {InterfaceTexts.dragAndDropLegend}
        </div>}
      {props.jointSelected.map(item => {
        return (
          <div key={item} className="joint-not-chosen">
            {item}
            <span className="delete-joint-participant" onClick={() => props.removeJointParticipant(item, props.searchIndex)}>x</span>
          </div>);
      })}
    </div>
  );
};

JointDroppable.propTypes = {
  itemOnDrop: PropTypes.func,
  jointSelected: PropTypes.array,
  removeJointParticipant: PropTypes.array,
  searchIndex: PropTypes.string
};

export default JointDroppable;
