import React, { useState } from 'react'
import { loginUser } from '../redux/slices/authSlice'
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeClosedIcon } from 'lucide-react';

const Login = () => {


    const dispatch = useDispatch()

    const [form, setForm] = useState({})
    const [eyeOpen, setEyeOpen] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(loginUser(form))
        console.log(form)
    }

    const handleChange = (e) => {
        const name = e.target.name
        const value = e.target.value

        setForm({
            ...form,
            [name]: value
        })
    }

    return (
        <div>

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    placeholder="example@gmail.com"
                    name="email"
                    onChange={handleChange}
                />
                <div className='flex'>

                    <input
                        type={!eyeOpen ? "password" : "text"}
                        placeholder="Password"
                        name="password"
                        onChange={handleChange}
                    />

                    {!eyeOpen ? <Eye onClick={() => setEyeOpen(!eyeOpen)} /> :
                        <EyeClosedIcon onClick={() => setEyeOpen(!eyeOpen)} />}
                </div>

                <button type="submit">
                    Submit
                </button>

            </form>

        </div>
    )
}

export default Login