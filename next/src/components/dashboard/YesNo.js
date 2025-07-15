"use client";
import BIcon from "@/components/BIcon";

export const YesNo = ({ onYes, onNo }) => {
  return (
    <div className="text-2xl text-gray-600 flex gap-1">
      <button className="hover:text-primary" onClick={onYes}><BIcon name={"check-circle"} /></button>
      <button className="hover:text-gray-700" onClick={onNo}><BIcon name={"x-circle"} /></button>
    </div>
  );
};
