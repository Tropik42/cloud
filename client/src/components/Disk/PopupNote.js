import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createDir } from '../../actions/file';
import { setPopupNoteDisplay } from '../../reducers/fileReducer';
import Input from '../../utils/input/Input';

const PopupNote = () => {
    const [noteName, setNoteName] = useState('')
    const popupNoteDisplay = useSelector(state => state.files.popupNoteDisplay)
    const currentDir = useSelector(state => state.files.currentDir)
    const dispatch = useDispatch()

    function createNoteHandler() {
        dispatch(createDir(currentDir, noteName))
    }

    return (
        <div className="popup" onClick = {() => dispatch(setPopupNoteDisplay('none'))} style={{display: popupNoteDisplay}}>
            <div className="popup__content" onClick = {(event => event.stopPropagation())}> 
            {/* //перехват события */}
                <div className="popup__header">
                    <div className="popup__title">Создать новую запись</div>
                    <button className="popup__close" onClick = {() => dispatch(setPopupNoteDisplay('none'))}>X</button>
                </div>
                <Input type = "text" placeholder = "Введите название записи" value = {noteName} setValue = {setNoteName}/>
                <button className = "popup__create" onClick={() => createNoteHandler()}>Создать</button>
            </div>
        </div>
    );
};

export default PopupNote;