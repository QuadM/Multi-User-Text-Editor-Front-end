import "quill/dist/quill.snow.css";
import "./App.css";
import React from "react";
// import { gapi } from "gapi-script";
// import GoogleLogin , GoogleLogout from "react-google-login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TextEditor from "./modules/TextEditor/index";
import MyFileSystem from "./modules/FileSystem";
import LoadingNew from "./modules/loading/LoadingNew";
// import { GoogleLogout, GoogleLogin } from "react-google-login";

// const clientId =
//   "745989885530-ijpjtu3p5g3j24h8vhihu9mdp1buqajc.apps.googleusercontent.com";

function App() {
  // const handleSucess = (res) => console.log("sucess:", res);
  // const handleFailure = (res) => console.error("failure:", res);
  // useEffect(() => {
  //   function start() {
  //     gapi.client.init({
  //       clientId: clientId,
  //       scope: "",
  //     });
  //   }
  //   gapi.load("client:auth2", start);
  // }, []);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MyFileSystem />} />
          <Route path="/document/new" element={<LoadingNew />} exact></Route>
          <Route path="/document/:id" element={<TextEditor />}></Route>
        </Routes>
      </Router>
      {/* <span
        style={{
          borderRaduis: "20px",
          width: "2em",
          height: "20px",
          backgroundColor: "red",
          overflow: "hidden",
        }}
      >
        <GoogleLogin
          clientId={clientId}
          onSuccess={handleSucess}
          onFailure={handleFailure}
          cookiePolicy="single_host_origin"
        />
      </span>
      <GoogleLogout /> */}
    </div>
  );
}

export default App;
