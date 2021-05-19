import axios from 'axios'
import { addFile, setFiles } from '../reducers/fileReducer'

export function getFiles(dirId) {
    return async dispatch => {
        try {
            const response = await axios.get(`http://localhost:7000/files${dirId ? '?parent=' + dirId : ''}`, {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            })
            dispatch(setFiles(response.data))
        } catch (e) {
            alert(e.response.data.message)
        }
    }
}

export function createDir(dirId, name) {
    return async dispatch => {
        try {
            const response = await axios.post(`http://localhost:7000/files`, {
                name,
                parent: dirId,
                type: 'dir'
            },
            {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            })
            console.log('response с клиента', response.data);
            dispatch(addFile(response.data))

        } catch (e) {
            alert(e.message)
        }
    }
}