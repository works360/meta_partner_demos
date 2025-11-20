"use client";

import { useEffect } from "react";

import { Footer } from "../Components/footer";
import HeadsetSelection from "../Components/headset-selection";
// import {Header} from "../Components/navbar";


export default function HeadsetPage() {
  useEffect(() => {
    // Clear previous kit selection when starting a new kit
    localStorage.removeItem("selectedHeadsets");
    localStorage.removeItem("selectedOfflineApps");
    localStorage.removeItem("selectedOnlineApps");
  }, []);
  return (
    <div>
        {/* <Header/> */}
        <HeadsetSelection />
        {/* <Footer/> */}
      
    </div>
  );
}
