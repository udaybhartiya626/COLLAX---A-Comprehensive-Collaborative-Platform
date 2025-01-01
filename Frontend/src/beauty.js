import React from 'react'

import { Button } from "@material-tailwind/react";

import { MdVideoCameraFront } from "react-icons/md";
import { MdKeyboard } from "react-icons/md";

function CreateMeetingScreen() {
    return (
        <div>
            <div className="container m-auto py-10">
                <img src="https://i.ibb.co/XsSzmLB/ing.png" className="w-[120px]" alt="" />
                <div className="flex">
                    <div className="w-[50%]">
                        <h1 className="text-3xl font-bold">Interview Calls and meetings for everyone</h1>
                        <p className="text-xl">Connect, collobrate and Learn from anyone frm the world online using Collax</p>

                        <div className="flex gap-4">
                            <div>
                                <Button className="flex items-center gap-3 capitalize rounded bg-[#065cbd] text-md">

                                    <MdVideoCameraFront className="text-lg" />
                                    Create Meeting
                                </Button>
                            </div>

                            <div>
                                <div className="relative w-full ">
                                    <input
                                        type="text"
                                        placeholder="Meeting Code"
                                        className="w-full pl-10 pr-4 py-2 pt-3 pb-3 border border-[#cccccc] rounded-md focus:outline-none"

                                    />
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        <MdKeyboard />
                                    </span>
                                </div>
                            </div>

                            <Button variant="text" className="capitalize rounded text-[#065cbd] text-md">Join</Button>
                        </div>

                    </div>
                    <div className="w-[50%]">

                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateMeetingScreen