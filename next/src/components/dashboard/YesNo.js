"use client";
import BIcon from "@/components/BIcon";

export const YesNo = ({ onYes, onNo, dark }) => {
  return (
    <div className={`text-2xl flex gap-1 ${dark ? "text-white" : "text-gray-600"}`}>
      <button className={dark ? "hover:text-primary-200" : "hover:text-primary"} onClick={onYes}><BIcon name={"check-circle"} /></button>
      <button className={dark ? "hover:text-gray-200" : "hover:text-gray-700"} onClick={onNo}><BIcon name={"x-circle"} /></button>
    </div>
  );
};
