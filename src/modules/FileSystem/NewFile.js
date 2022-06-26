import React from "react";

const NewFile = () => {
  const docURI = `/document/new`;
  return (
    <a href={docURI}>
      <div className="fileContainer filebox">
        <div className="fileimg">
          <img src="add.svg" alt="fileimg" />
        </div>
        <p>New File</p>
      </div>
    </a>
  );
};

export default NewFile;
