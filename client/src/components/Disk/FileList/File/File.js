import React from 'react';
import './File.css'
import dir from '../../../../assets/img/dir.svg'
import fileLogo from '../../../../assets/img/fileLogo.svg'
import { useDispatch, useSelector } from 'react-redux';
import { pushToStack, setCurrentDir } from '../../../../reducers/fileReducer';

const File = ({file}) => {

    const dispatch = useDispatch()
    const currentDir = useSelector(state => state.files.currentDir)

    function openDirHandler() {
        dispatch(pushToStack(currentDir))
        dispatch(setCurrentDir(file.file_id))
    }

    return (
        <div className='file' onClick={file.type === 'dir' ? () => openDirHandler() : ''}>
            <img src={file.type === 'dir' ? dir : fileLogo} alt="" className="file__img"/>
            <div className="file__name">{file.name}</div>
            <div className="file__date">{file.date.slice(0,10)}</div>
            <div className="file__size">{file.size}</div>
        </div>
    );
};

export default File;