import { createContext, useState } from "react";

export const AdminDataContext = createContext();

const AdminContext = ({ children }) => {
  const [adminProfile, setAdminProfile] = useState({
    fullName: "",
    email: "",
    examPreference: "",
    phoneNumber: "",
    testsUploaded: [],
    role: "admin"
  });
  return (
    <AdminDataContext.Provider value={{ adminProfile, setAdminProfile }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export default AdminContext;
