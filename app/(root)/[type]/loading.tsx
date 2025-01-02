import { Loader } from "lucide-react";
import React from "react";

const loading = () => {
  return (
    <div className="mx-auto flex justify-center items-center h-auto">
      <Loader className="animate-spin w-[50px] h-[50px] " />
    </div>
  );
};

export default loading;
