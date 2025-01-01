import React, { useState } from 'react'
import {Link} from 'react-router-dom'

import { Button } from "@material-tailwind/react";

import { MdVideoCameraFront } from "react-icons/md";
import { MdKeyboard } from "react-icons/md";
import { nanoid } from "nanoid";

import { useNavigate } from "react-router-dom";



function CreateMeetingScreen() {

    const navigate = useNavigate();

    const generateMeetingCode = () => {
        navigate("meeting/"+nanoid(10))
    };

    const [joinCode, setJoinCode] = useState('');

    return (
        <div>
            <div className="container m-auto py-10">
                <img src="https://i.ibb.co/XsSzmLB/ing.png" className="w-[120px]" alt="" />
                <div className="flex">
                    <div className="w-[50%] pt-[200px]">
                        <h1 className="text-4xl font-bold font-myfont-bold">Interview Calls and meetings for everyone</h1>
                        <p className="text-xl py-6 font-myfont-normal">Connect, collobrate and Learn from anyone frm the world online using Collax</p>

                        <div className="flex gap-4">
                            <div>
                                <Button onClick={generateMeetingCode} className="font-myfont-normal flex items-center gap-3 capitalize rounded bg-[#065cbd] text-md">
                                    <MdVideoCameraFront className="text-lg" />
                                    Create Meeting
                                </Button>
                            </div>

                            <div>
                                <div className="relative w-full ">
                                    <input
                                        type="text"
                                        placeholder="Meeting Code"
                                        className="font-myfont-normal w-full pl-10 pr-4 py-2 pt-3 pb-3 border border-[#cccccc] rounded-md focus:outline-none"
                                        onChange={(e) => setJoinCode(e.target.value)}

                                    />
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        <MdKeyboard />
                                    </span>
                                </div>
                            </div>
                            <Link to={`meeting/${joinCode}`}><Button variant="text" className="font-myfont-normal capitalize rounded text-[#065cbd] text-md">Join</Button></Link>
                        </div>

                    </div>
                    <div className="w-[50%]">
                        <img src="https://img.freepik.com/free-vector/remote-meeting-concept-illustration_114360-4614.jpg?t=st=1726824801~exp=1726828401~hmac=8bc94968d42715cb2cc4e4604c703d00bd420b58b36ee60564212a60b808d9c6&w=740" alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateMeetingScreen