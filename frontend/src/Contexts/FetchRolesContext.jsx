import React, { createContext, useState } from "react";
import newRequest from "../utils/userRequest.jsx";

export const RolesContext = createContext();

const RolesProvider = ({ children }) => {
  const [userRoles, setUserRoles] = useState([]);

  const fetchRoles = (userID) => {
    console.log(userID)
    newRequest.post("/roles/v1/get-roles", {
        userLoginID: userID,
    },
    ).then((response) => {
        setUserRoles(response.data.data);
        console.log(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching permissions:", error);
      });
  };

  return (
    <RolesContext.Provider
      value={{
        userRoles,
        fetchRoles,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
};

export default RolesProvider;