import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import { io } from "socket.io-client";
import "./style.css";
import img from "./Loading_icon.gif";

const HOST_URL = "https://quadm-text-editor-backend.herokuapp.com/";
const PASIV_HOST_URL = "https://quadm-text-editor-backend-1.herokuapp.com/";
// const HOST_URL = "http://localhost:3001";
// const PASIV_HOST_URL = "http://localhost:4000";

const SAVE_INTERVEL = 3000;
let INTERVAL_IS_ON = false;

const TextEditor = () => {
  const [title, setTitle] = useState("");
  const [quill, setQuill] = useState(null);
  const [socket, setSocket] = useState(null);
  const [socketPasiv, setSocketPasiv] = useState(null);
  const [clientCount, setClientCount] = useState(0);
  const [savedClass, setClass] = useState("");
  const { id: docID } = useParams();

  //------------------------------------------------------------------------------------------//
  //------------------------------------------------------------------------------------------//

  const htmlElement = document.querySelector("html");

  useEffect(() => {
    htmlElement.scrollTop = 0;
    const onScroll = () => {
      const stky = document.querySelector(".stky");
      let r = htmlElement.scrollTop / htmlElement.scrollHeight;
      let w = r * (window.innerWidth + window.innerHeight) + "px";
      stky.style.minWidth = w;
      stky.style.backgroundColor = `rgba(221,121,192,${r + 0.5})`;
      console.log(
        "lol",
        htmlElement.style.backgroundColor,
        htmlElement.scrollTop,
        htmlElement.scrollHeight,
        w,
        stky
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [htmlElement]);

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
        socketPasiv.emit("save-doc", obj);
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
  useEffect(() => {
    socketPasiv &&
      socketPasiv.on("client-number", (clientNo) => {
        setClientCount(clientNo);
      });
  }, [socketPasiv]);
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //                making a quill object and append it to a div using ref                    //
  const wrapperRef = useCallback((wrapper) => {
    const progrss = document.createElement("div");

    const editor = document.createElement("div");
    if (wrapper) {
      wrapper.appendChild(editor);
      document.querySelector("body").style.overflow = "visible";
      document.querySelector("body").appendChild(progrss);

      progrss.style.position = "fixed";
      progrss.className = "stky";
      progrss.style.zIndex = 3;
      progrss.style.top = "0px";
      progrss.style.left = "0px";
      progrss.style.height = "5px";

      const q = new Quill(editor, { theme: "snow" });
      const qEditor = document.getElementsByClassName("ql-editor")[0];
      const loadingImg = document.createElement("img");
      loadingImg.setAttribute("src", img);

      loadingImg.style = `width:100%;`;
      qEditor.append(loadingImg);
      q.disable();
      setQuill(q);
    }
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
        socketPasiv.emit("make-text-changes", {
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
    socketPasiv.emit("make-title-changes", val);
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
    socketPasiv.on("receive-text-changes", (delta) => {
      quill.updateContents(delta);
    });

    return () => {
      socket.off("receive-text-changes");
      socketPasiv.off("receive-text-changes");
    };
  }, [socket, quill]);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive-title-changes", (delta) => {
      setTitle(delta);
      console.log("receive title changes delta :", delta);
    });
    socketPasiv.on("receive-title-changes", (delta) => {
      setTitle(delta);
      console.log("receive title changes delta :", delta);
    });

    return () => {
      socket.off("receive-title-changes");
      socketPasiv.off("receive-title-changes");
    };
  }, [socket, title]);
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //                            opening new socket on HOST_URL                                //
  useEffect(() => {
    const s = io(HOST_URL);
    setSocket(s);
    const psv = io(PASIV_HOST_URL);
    setSocketPasiv(psv);
    return () => {
      s.disconnect();
      psv.disconnect();
    };
  }, []);
  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //                          Auto save after interval (2000 ms)                              //

  //------------------------------------------------------------------------------------------//

  //------------------------------------------------------------------------------------------//
  //                    Opening a room for a single document using its ID                     //
  let count;
  useEffect(() => {
    if (!socket || !quill || clientCount || count) return;
    !clientCount &&
      socket.once("load-doc", ({ doc, clientno }) => {
        count = clientno;
        console.log(doc);
        setTitle(doc.title);
        setClientCount(clientno);
        quill.setContents(doc.quillContents);
        quill.enable();
      });

    socket.emit("get-doc", docID);
  }, [socket, quill, docID, clientCount]);

  useEffect(() => {
    setInterval(() => {
      if (!socketPasiv || !quill || clientCount || count) return;
      socketPasiv.once("load-doc", ({ doc, clientno }) => {
        count = clientno;
        console.log(doc);
        setTitle(doc.title);
        setClientCount(clientno);
        quill.setContents(doc.quillContents);
        quill.enable();
      });
      socketPasiv.emit("get-doc", docID);
    }, 2000);
  }, [socketPasiv, quill, docID, clientCount]);
  //------------------------------------------------------------------------------------------//

  return (
    <div style={{ overflow: "visible" }}>
      <span
        style={{
          color: "white",
          backgroundColor: "rgba(100,100,255,0.8)",
          padding: "1px 0.5em 4px",
          borderRadius: "20px",
          float: "left",
          position: "sticky",
          top: "20px",
        }}
        className={savedClass}
      >
        Saved
      </span>
      <span
        style={{
          position: "sticky",
          float: "right",
          color: "white",
          backgroundColor: "rgba(255,100,100,0.8)",
          padding: "1px 0.5em 4px",
          borderRadius: "20px",
          top: "20px",
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
    </div>
  );
};

export default TextEditor;
