import { createContext, useState } from "react";

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    examType: "",
    phoneNumber: "",
    testsAttempted: [],
    role: "user"
  });

  return (
    <UserDataContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;
