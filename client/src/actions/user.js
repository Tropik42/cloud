import axios from 'axios'
import { setUser } from '../reducers/userReducer'

export const registration = async (email, password) => {
    try {
        const response = await axios.post(`http://localhost:7000/auth/registration`, {
            email,
            password
        })
        alert(response.data.message)
    } catch (e) {
        alert(e.response.data.message)
    }

}

export const login = (email, password) => {
    return async dispatch => {
        try {
            const response = await axios.post(`http://localhost:7000/auth/login`, {
                email,
                password
            })
            dispatch(setUser(response.data.user))
            localStorage.setItem('token', response.data.token)
            console.log(response.data);
        } catch (e) {
            alert(e.response.data.message)
        }
    }  
}

export const auth = () => {
    return async dispatch => {
        try {
            const response = await axios.get(`http://localhost:7000/auth/auth`,
                {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}
            )
            dispatch(setUser(response.data.user))
            localStorage.setItem('token', response.data.token)
        } catch (e) {
            alert(e.response.data.message)
            localStorage.removeItem('token')
        }
    }
}