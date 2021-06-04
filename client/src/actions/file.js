import axios from 'axios'
import { hideLoader, showLoader } from '../reducers/appReducer'
import { addFile, deleteFileAction, setFiles } from '../reducers/fileReducer'
import { addUploadfile, changeUploadFile, showUploader } from '../reducers/uploadReducer'

export function getFiles(dirId, sort) {
    return async dispatch => {
        try {
            dispatch(showLoader())
            let url = `http://localhost:7000/files`
            if (dirId) {
                url = `http://localhost:7000/files?parent=${dirId}`
            }
            if (sort) {
                url = `http://localhost:7000/files?sort=${sort}`
            }
            if (dirId && sort) {
                url = `http://localhost:7000/files?parent=${dirId}&sort=${sort}`
            }
            const response = await axios.get(url, {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            })
            dispatch(setFiles(response.data))
        } catch (e) {
            alert(e.response.data.message)
        } finally {
            dispatch(hideLoader())
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

export function uploadFile(file, dirId) {
    return async dispatch => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            if (dirId) {
                formData.append('parent', dirId)
            }
            const uploadFile = {name: file.name, progress: 0, id: Date.now()}
            dispatch(showUploader())
            dispatch(addUploadfile(uploadFile))
            const response = await axios.post(`http://localhost:7000/files/upload`, formData, 
            {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
                onUploadProgress: progressEvent => {
                    const totalLength = progressEvent.lengthComputable ? progressEvent.total : progressEvent.target.getResponseHeader('content-length') || progressEvent.target.getResponseHeader('x-decompressed-content-length');
                    console.log('total', totalLength)
                    if (totalLength) {
                        uploadFile.progress = Math.round((progressEvent.loaded * 100) / totalLength)
                        dispatch(changeUploadFile(uploadFile))
                    }
                }
            });
            console.log('response с клиента', response.data);
            dispatch(addFile(response.data))

        } catch (e) {
            alert(e.message)
        }
    }
}

export async function downloadFile(file) {
    try {
            const response = await fetch(`http://localhost:7000/files/download?id=${file.file_id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        console.log('В функцию downloadFile на фронте передаётся: ', file);
        console.log('Response из фетч: ', response);
        if(response.status === 200) {
            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = file.name
            document.body.appendChild(link)
            link.click()
            link.remove()
        }
    } catch (e) {
        console.log(e);
    }
    
}

export function deleteFile(file) {
    return async dispatch => {
        try {
            const response = await axios.delete(`http://localhost:7000/files?id=${file.file_id}`,
            {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            })
            dispatch(deleteFileAction(file.file_id))
            alert(response.data.message)
        } catch (e) {
            alert(e?.response?.data?.message)
        }
    }
}

export function searchFile(search) {
    return async dispatch => {
        try {
            const response = await axios.get(`http://localhost:7000/files/search?search=${search}`,
            {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            })
            dispatch(setFiles(response.data))
            // alert(response.data.message)
        } catch (e) {
            alert(e?.response?.data?.message)
        } finally {
            dispatch(hideLoader())
        }
    }
}