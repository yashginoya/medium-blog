import { SignupInput } from "@yashginoya/medium-common"
import axios from "axios"
import { ChangeEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BACKEND_URL } from "../config"

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState<SignupInput>({
        email: "",
        password: "",
        name: ""
    })

    async function sendRequest() {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type==="signup" ? "signup" : "signin"}`, postInputs);
            const jwt = response.data.jwt;
            localStorage.setItem("token" , jwt);
            navigate("/blogs"); 
        } catch (e) {
            console.log('request failed');
        }
    }

    return <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div>
                <div className="px-16">
                    <div className="text-3xl font-extrabold text-center">
                        {type === "signup" ? "Create an Account" : "Login to account"}
                    </div>
                    <div className="text-slate-400 pt-1 text-center">
                        {type === "signup" ? "Already have an account?" : "Don't Have an account?"}
                        <Link className="pl-2 underline" to={type === "signup" ? "/signin" : "/signup"}>
                            {type === "signup" ? "Sign in" : "Sign up"}
                        </Link>
                    </div>
                </div>
                <div className="pt-4">

                    {type === "signup" ? <LabelledInput lable="Name" placeholder="Enter Your Name" onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            name: e.target.value
                        })
                    }} /> : null}
                    <LabelledInput lable="Email" placeholder="Enter Your Email" onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            email: e.target.value
                        })
                    }} />
                    <LabelledInput lable="password" type={"password"} placeholder="Create a Password" onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            password: e.target.value
                        })
                    }} />
                    <button type="button" onClick={sendRequest} className=" w-full mt-8 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">{type == "signup" ? "Sign up" : "Sign in"}</button>

                </div>
            </div>
        </div>
    </div>

}

interface LabelledInputType {
    lable: string,
    placeholder: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    type?: string
}

function LabelledInput({ lable, placeholder, onChange, type }: LabelledInputType) {
    return <div>
        <label className="block mb-2 text-sm text-black font-semibold pt-4">{lable}</label>
        <input onChange={onChange} type={type || "text"} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 block w-full p-2.5" placeholder={placeholder} required />
    </div>
}