import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Navigate } from "react-router-dom";
import img from "./Loading_icon.gif";

const LoadingNew = () => {
  const [socket, setSocket] = useState();
  const [URI, setURI] = useState();

  useEffect(() => {
    let s = io("http://localhost:3001");
    setSocket(s);
    s &&
      s.on("created-new-doc", (d) => {
        setURI("/document/" + d._id);
      });
  }, []);

  useEffect(() => {
    if (!socket)
      return () => {
        console.log("socket connection is off on creating new document ...");
      };
    else {
      socket && socket.emit("create-new-doc");
    }
  }, [socket]);

  return (
    <>
      <div style={{ background: "white", padding: "2em", margin: "auto" }}>
        <h1> Creating File </h1>
        <img src={img} alt="loading img" />
      </div>
      {URI && <Navigate to={URI} />}
    </>
  );
};

export default LoadingNew;
