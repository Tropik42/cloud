import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createDir, getFiles } from '../../actions/file';
import './Disk.css'
import FileList from "./FileList/FileList"

const Disk = () => {
    const dispatch = useDispatch()
    const currentDir = useSelector(state => state.files.currentDir)

    useEffect(() => {
        dispatch(getFiles(currentDir))
    }, [currentDir])

    function createDirHandler() {
        dispatch(createDir(currentDir, 'uhweqe6'))
    }
    return (
        <div className="disk">
            <div className="disk_btns">
                <button className="disk__back">Назад</button> 
                <button 
                    className="disk__create"
                    onClick={() => createDirHandler()}
                >Создать папку</button>
            </div>
            <FileList/>
        </div>
    );
};

export default Disk;