import React, { useState, useEffect } from "react";
import "./style.css";
import FileBox from "./FileBox.js";
import NewFile from "./NewFile.js";
import { io } from "socket.io-client";

 const HOST_URL = "https://quadm-text-editor-backend.herokuapp.com/";
// const HOST_URL = "https://quadm-text-editor-backend-1.herokuapp.com/";
//const HOST_URL = "http://localhost:3001";
//const PASIV_HOST_URL = "http://localhost:4000";

const MyFileSystem = () => {
  const [files, setFiles] = useState([]);
  const [socket, setSocket] = useState();
  const handleDelete = (file) => {
    if (window.confirm(`Are you sure to delete ${file.name} document?`)) {
      console.log("successfully deleted document, id: ", file._id);
      setFiles(files.filter((f) => f._id !== file._id));
      socket.emit("delete-doc", file._id);
    } else return;
  };

  useEffect(() => {
    const s = io(HOST_URL);
    setSocket(s);
    s.emit("get-all-docs");
  }, []);

  useEffect(() => {
    socket &&
      socket.on("recieve-all-docs", (f) => {
        setFiles(f);
        console.log(f);
      });
  }, [socket, files]);

  return (
    <div className="fileSystem">
      {files &&
        files.map((f) => (
          <FileBox file={f} key={f._id} handleDelete={() => handleDelete(f)} />
        ))}
      {<NewFile />}
    </div>
  );
};

export default MyFileSystem;
