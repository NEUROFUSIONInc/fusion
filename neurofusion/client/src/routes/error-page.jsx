import React from "react";
import { useRouteError } from "react-router-dom";
import SideNavBar from "../components/sidenavbar";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <>
      <SideNavBar></SideNavBar>
      <div id="error-page" style={{marginLeft: '10%'}}>
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error.statusText || error.message}</i>
        </p>
      </div>
    </>
    
  );
}