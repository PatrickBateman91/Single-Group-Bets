import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDrop } from 'react-dnd';
import PropTypes from 'prop-types';
import './index.scss';

const UploadPicture = (props) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: NativeTypes.FILE,
    canDrop: () => true,
    drop: (item) => props.handleImageFile(item),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  return (
    <div
      onDrop={props.handleImageFile}
      ref={drop}
      className={`upload-picture-form  ${isOver && canDrop ? 'onDropAllowed' : ''}`}
    >
      <label className="upload-icon-container" htmlFor={props.id}>{props.labelText}
        <div><FontAwesomeIcon icon={faUpload} /></div>
        <div className="selected-file">{props.selectedFile}</div>
      </label>
      <input
        type="file"
        accept="image/x-png,image/jpg,image/jpeg"
        onChange={e => props.handleImageFile(e.target)}
        name={props.id} id={props.id}
      />
    </div>
  );
};

UploadPicture.propTypes = {
  handleImageFile: PropTypes.func,
  id: PropTypes.string,
  labelText: PropTypes.string,
  selectedFile: PropTypes.string
};

export default UploadPicture;
