import React, { useState, useEffect } from "react";
import "./style.css";
import FileBox from "./FileBox.js";
import NewFile from "./NewFile.js";
import { io } from "socket.io-client";

const MyFileSystem = () => {
  const [files, setFiles] = useState([]);
  const [socket, setSocket] = useState();
  const handleDelete = (file) => {
    if (window.confirm(`Are you sure to delete ${file.name} document?`)) {
      console.log("successfully deleted document, id: ", file.id);
      socket.emit("delete-doc", file._id);
    } else return;
  };

  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);
    s.emit("get-all-docs");
  }, []);

  useEffect(() => {
    socket &&
      socket.on("recieve-all-docs", (files) => {
        setFiles(files);
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