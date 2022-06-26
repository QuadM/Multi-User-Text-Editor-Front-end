import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import { io } from "socket.io-client";
import "./style.css";

const HOST_URL = "https://quadm-text-editor-backend.herokuapp.com/";
// const HOST_URL = "http://localhost:3001";

const SAVE_INTERVEL = 3000;
let INTERVAL_IS_ON = false;

const TextEditor = () => {
  const [title, setTitle] = useState();
  const [quill, setQuill] = useState(null);
  const [socket, setSocket] = useState(null);
  const [clientCount, setClientCount] = useState();
  const [savedClass, setClass] = useState();
  const { id: docID } = useParams();

  //------------------------------------------------------------------------------------------//
  // //------------------------------------------------------------------------------------------//

  const getT = () => document.querySelector("#title").value;
  const getQuillContent = () => {
    return quill.getContents();
  };

  const saveDocIntervalHandler = () => {
    if (!INTERVAL_IS_ON) {
      INTERVAL_IS_ON = true;
      setClass("hidden");
      let saveInterval = setInterval(() => {
        const obj = {
          title: getT(),
          quillContents: getQuillContent(),
        };
        INTERVAL_IS_ON = false;
        socket.emit("save-doc", obj);
        console.log(obj);
        setClass("");
        clearInterval(saveInterval);
      }, SAVE_INTERVEL);
    }
  };
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  useEffect(() => {
    socket &&
      socket.on("client-number", (clientNo) => {
        setClientCount(clientNo);
      });
  }, [socket]);
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //                making a quill object and append it to a div using ref                    //
  const wrapperRef = useCallback((wrapper) => {
    const editor = document.createElement("div");
    wrapper.appendChild(editor);
    const q = new Quill(editor, { theme: "snow" });
    const qEditor = document.getElementsByClassName("ql-editor")[0];
    const loadingImg = document.createElement("img");
    loadingImg.setAttribute("src", "/Loading_icon.gif");
    qEditor.append(loadingImg);
    q.disable();
    setQuill(q);
  }, []);
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //          Sending changes of quill editor & title to server throught the socket           //
  useEffect(() => {
    if (socket === null || quill === null) return;
    else {
      const changeHandler = (delta, oldDelta, source) => {
        if (source !== "user") return;

        socket.emit("make-text-changes", {
          docID,
          quillContents: quill.getContents(),
          delta,
        });
        saveDocIntervalHandler();
      };

      quill.on("text-change", changeHandler);
      return () => {
        quill.off("text-change", changeHandler);
      };
    }
  }, [quill, socket, docID]);

  //-----------------------//

  const handleTitleChange = (val) => {
    console.log("handle title change val :", val);
    socket.emit("make-title-changes", val);
    saveDocIntervalHandler();
  };
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //            receiving changes of quill & Title from server throught the socket            //
  useEffect(() => {
    if (!quill || !socket) return;
    socket.on("receive-text-changes", (delta) => {
      quill.updateContents(delta);
    });

    return () => {
      socket.off("receive-text-changes");
    };
  }, [socket, quill]);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive-title-changes", (delta) => {
      setTitle(delta);
      console.log("receive title changes delta :", delta);
    });

    return () => {
      socket.off("receive-title-changes");
    };
  }, [socket, title]);
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //                            opening new socket on HOST_URL                                //
  useEffect(() => {
    const s = io(HOST_URL);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //                          Auto save after interval (2000 ms)                              //

  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //                    Opening a room for a single document using its ID                     //
  useEffect(() => {
    if (!socket || !quill) return;
    socket.once("load-doc", ({ doc, clientno }) => {
      console.log(doc);
      setTitle(doc.title);
      setClientCount(clientno);
      quill.setContents(doc.quillContents);
      quill.enable();
    });

    socket.emit("get-doc", docID);
  }, [socket, quill, docID]);
  //------------------------------------------------------------------------------------------//

  return (
    <>
      <span
        style={{
          color: "white",
          backgroundColor: "rgba(100,100,255,0.8)",
          padding: "1px 0.5em 4px",
          borderRadius: "20px",
          float: "left",
        }}
        className={savedClass}
      >
        Saved
      </span>
      <span
        style={{
          float: "right",
          color: "white",
          backgroundColor: "rgba(255,100,100,0.8)",
          padding: "1px 0.5em 4px",
          borderRadius: "20px",
        }}
      >
        {clientCount} Online
      </span>
      <input
        type="text"
        className="title"
        value={title}
        id="title"
        onChange={(e) => {
          handleTitleChange(e.target.value);
          setTitle(e.target.value);
        }}
      />
      <div ref={wrapperRef}></div>
    </>
  );
};

export default TextEditor;
