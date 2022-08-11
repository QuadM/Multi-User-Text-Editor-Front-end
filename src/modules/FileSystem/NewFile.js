import React from "react";
import img from "./Add.svg";

const NewFile = () => {
  // const docURI = `/document/new`;
  return (
    <div className="fileContainer filebox" style={{ cursor: "pointer" }}>
      <div className="fileimg">
        <img src={img} alt="fileimg" />
      </div>
      <p>New File</p>
    </div>
  );
};

export default NewFile;
